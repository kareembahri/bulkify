-- ═══════════════════════════════════════════════════════════════════════════
-- Bulkify · 003 · Row Level Security
-- Every bulkify_ table: a user reads/writes only their own rows. The built-in
-- exercise library and food catalog are read-only and shared.
-- Policies are Bulkify's own, so drop-if-exists + create keeps this re-runnable.
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare t text;
begin
  foreach t in array array['bulkify_profiles','bulkify_exercises','bulkify_program_days','bulkify_program_exercises',
    'bulkify_workouts','bulkify_workout_exercises','bulkify_sets','bulkify_foods','bulkify_meals',
    'bulkify_meal_items','bulkify_day_notes'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    -- RLS decides which rows; this grant lets signed-in users reach the table at all.
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

-- profiles: own row only (the row itself is created by bulkify_ensure_profile)
drop policy if exists bulkify_profiles_select on public.bulkify_profiles;
create policy bulkify_profiles_select on public.bulkify_profiles for select to authenticated
  using (id = (select auth.uid()));
drop policy if exists bulkify_profiles_update on public.bulkify_profiles;
create policy bulkify_profiles_update on public.bulkify_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
drop policy if exists bulkify_profiles_all on public.bulkify_profiles;

-- library tables (exercises, foods): built-in rows readable by members, custom rows by their owner
do $$
declare t text;
begin
  foreach t in array array['bulkify_exercises','bulkify_foods'] loop
    execute format('drop policy if exists %I on public.%I', t || '_select', t);
    execute format('create policy %I on public.%I for select to authenticated
      using ((owner_id is null and (select public.bulkify_is_member())) or owner_id = (select auth.uid()))', t || '_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert', t);
    execute format('create policy %I on public.%I for insert to authenticated
      with check (owner_id = (select auth.uid()) and (select public.bulkify_is_member()))', t || '_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_update', t);
    execute format('create policy %I on public.%I for update to authenticated
      using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()))', t || '_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete', t);
    execute format('create policy %I on public.%I for delete to authenticated
      using (owner_id = (select auth.uid()))', t || '_delete', t);
  end loop;
end $$;

-- tables with a user_id column
do $$
declare t text;
begin
  foreach t in array array['bulkify_program_days','bulkify_workouts','bulkify_meals','bulkify_day_notes'] loop
    execute format('drop policy if exists %I on public.%I', t || '_own', t);
    execute format('create policy %I on public.%I for all to authenticated
      using (user_id = (select auth.uid()))
      with check (user_id = (select auth.uid()) and (select public.bulkify_is_member()))', t || '_own', t);
  end loop;
end $$;

-- child tables: ownership flows from the parent row
drop policy if exists bulkify_program_exercises_own on public.bulkify_program_exercises;
create policy bulkify_program_exercises_own on public.bulkify_program_exercises for all to authenticated
  using (exists (select 1 from public.bulkify_program_days d where d.id = program_day_id and d.user_id = (select auth.uid())))
  with check (exists (select 1 from public.bulkify_program_days d where d.id = program_day_id and d.user_id = (select auth.uid())));

drop policy if exists bulkify_workout_exercises_own on public.bulkify_workout_exercises;
create policy bulkify_workout_exercises_own on public.bulkify_workout_exercises for all to authenticated
  using (exists (select 1 from public.bulkify_workouts w where w.id = workout_id and w.user_id = (select auth.uid())))
  with check (exists (select 1 from public.bulkify_workouts w where w.id = workout_id and w.user_id = (select auth.uid())));

drop policy if exists bulkify_sets_own on public.bulkify_sets;
create policy bulkify_sets_own on public.bulkify_sets for all to authenticated
  using (exists (select 1 from public.bulkify_workout_exercises we join public.bulkify_workouts w on w.id = we.workout_id
                 where we.id = workout_exercise_id and w.user_id = (select auth.uid())))
  with check (exists (select 1 from public.bulkify_workout_exercises we join public.bulkify_workouts w on w.id = we.workout_id
                 where we.id = workout_exercise_id and w.user_id = (select auth.uid())));

drop policy if exists bulkify_meal_items_own on public.bulkify_meal_items;
create policy bulkify_meal_items_own on public.bulkify_meal_items for all to authenticated
  using (exists (select 1 from public.bulkify_meals m where m.id = meal_id and m.user_id = (select auth.uid())))
  with check (exists (select 1 from public.bulkify_meals m where m.id = meal_id and m.user_id = (select auth.uid())));
