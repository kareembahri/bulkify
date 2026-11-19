-- ═══════════════════════════════════════════════════════════════════════════
-- Bulkify · 002 · functions & triggers (all prefixed bulkify_, re-runnable)
-- ═══════════════════════════════════════════════════════════════════════════

-- True when the signed-in user has a Bulkify profile. Used by RLS so that users
-- of other apps in the same Supabase project cannot write Bulkify data.
create or replace function public.bulkify_is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.bulkify_profiles where id = auth.uid());
$$;

-- Block a 6th set per exercise (an upsert of an existing set is allowed).
create or replace function public.bulkify_limit_sets()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (select 1 from public.bulkify_sets where id = new.id) then
    return new;
  end if;
  perform 1 from public.bulkify_workout_exercises where id = new.workout_exercise_id for update;
  if (select count(*) from public.bulkify_sets where workout_exercise_id = new.workout_exercise_id) >= 5 then
    raise exception 'bulkify: an exercise can have at most 5 sets' using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists bulkify_sets_limit on public.bulkify_sets;
create trigger bulkify_sets_limit before insert on public.bulkify_sets
  for each row execute function public.bulkify_limit_sets();

-- Keep profiles.updated_at fresh.
create or replace function public.bulkify_touch_profile()
returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
drop trigger if exists bulkify_profiles_touch on public.bulkify_profiles;
create trigger bulkify_profiles_touch before update on public.bulkify_profiles
  for each row execute function public.bulkify_touch_profile();

-- Called by the app right after sign-in: creates the profile and a default
-- 7-day program the first time. Only ever touches the caller's own rows.
create or replace function public.bulkify_ensure_profile(p_language text default 'en', p_name text default '')
returns public.bulkify_profiles
language plpgsql security definer set search_path = public as $$
declare
  uid   uuid := auth.uid();
  prof  public.bulkify_profiles;
  names text[] := array['Push','Pull','Legs','Rest','Upper','Lower','Rest'];
begin
  if uid is null then raise exception 'not authenticated'; end if;

  insert into public.bulkify_profiles (id, language, display_name)
  values (uid, case when p_language = 'ar' then 'ar' else 'en' end, left(coalesce(p_name, ''), 40))
  on conflict (id) do nothing;

  if not exists (select 1 from public.bulkify_program_days where user_id = uid) then
    for i in 0..6 loop
      insert into public.bulkify_program_days (user_id, weekday, day_name, is_rest)
      values (uid, i, names[i + 1], names[i + 1] = 'Rest')
      on conflict (user_id, weekday) do nothing;
    end loop;
  end if;

  select * into prof from public.bulkify_profiles where id = uid;
  return prof;
end $$;

-- Per-day nutrition totals (incl. the treat share) for charts and the calendar.
-- security invoker → RLS applies, so a user only ever sums their own rows.
create or replace function public.bulkify_daily_nutrition(p_from date, p_to date)
returns table (
  date date, kcal numeric, protein_g numeric, carbs_g numeric, fat_g numeric, sugar_g numeric,
  treat_kcal numeric, treat_carbs numeric, treat_fat numeric, treat_sugar numeric, items integer
)
language sql stable security invoker set search_path = public as $$
  select m.date,
         coalesce(sum(i.kcal), 0), coalesce(sum(i.protein_g), 0), coalesce(sum(i.carbs_g), 0),
         coalesce(sum(i.fat_g), 0), coalesce(sum(i.sugar_g), 0),
         coalesce(sum(i.kcal)    filter (where i.is_treat), 0),
         coalesce(sum(i.carbs_g) filter (where i.is_treat), 0),
         coalesce(sum(i.fat_g)   filter (where i.is_treat), 0),
         coalesce(sum(i.sugar_g) filter (where i.is_treat), 0),
         count(i.id)::int
  from public.bulkify_meals m
  join public.bulkify_meal_items i on i.meal_id = m.id
  where m.user_id = auth.uid() and m.date between p_from and p_to
  group by m.date
  order by m.date;
$$;

-- Replace all sets of one logged exercise in a single transaction (used by auto-save).
-- security invoker → RLS decides whether the caller owns the exercise.
create or replace function public.bulkify_save_sets(p_workout_exercise uuid, p_sets jsonb)
returns void language plpgsql security invoker set search_path = public as $$
begin
  if jsonb_typeof(p_sets) <> 'array' then raise exception 'sets must be an array'; end if;
  if jsonb_array_length(p_sets) > 5 then
    raise exception 'bulkify: an exercise can have at most 5 sets' using errcode = 'check_violation';
  end if;
  if not exists (select 1 from public.bulkify_workout_exercises where id = p_workout_exercise) then
    raise exception 'not found' using errcode = 'no_data_found';
  end if;
  delete from public.bulkify_sets where workout_exercise_id = p_workout_exercise;
  insert into public.bulkify_sets (workout_exercise_id, set_number, reps, weight_kg)
  select p_workout_exercise, (ord)::smallint, (e ->> 'reps')::int, (e ->> 'weight_kg')::numeric
  from jsonb_array_elements(p_sets) with ordinality as x(e, ord);
end $$;

revoke all on function public.bulkify_save_sets(uuid, jsonb) from public, anon;
grant execute on function public.bulkify_save_sets(uuid, jsonb) to authenticated;

revoke all on function public.bulkify_ensure_profile(text, text) from public, anon;
revoke all on function public.bulkify_daily_nutrition(date, date) from public, anon;
revoke all on function public.bulkify_is_member() from public, anon;
grant execute on function public.bulkify_ensure_profile(text, text)  to authenticated;
grant execute on function public.bulkify_daily_nutrition(date, date) to authenticated;
grant execute on function public.bulkify_is_member()                 to authenticated;
