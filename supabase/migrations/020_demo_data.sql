-- ═══════════════════════════════════════════════════════════════════════════
-- Bulkify · 020 · OPTIONAL demo data (2 months of realistic workouts + meals)
--
-- 1. Supabase → Authentication → Users → "Add user" → e.g. demo@bulkify.app
--    (tick "Auto confirm"). Copy the new user's UUID.
-- 2. Run this whole file once (it only creates two functions).
-- 3. Create the data:   select public.bulkify_seed_demo('PASTE-UUID-HERE');
-- 4. Remove it later:   select public.bulkify_remove_demo('PASTE-UUID-HERE');
--    then delete the demo user in Authentication → Users.
--
-- Neither function can be called from the app (no grants to anon/authenticated).
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function public.bulkify_seed_demo(p_user uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  d date; wd int; i int; s int; k int; r int; pos int;
  wid uuid; weid uuid; mid uuid; ex_id uuid; f record;
  sg text; base numeric; w numeric; reps int; nsets int; weeks numeric; amt numeric; tr jsonb; item jsonb;
  day_names text[] := array['Push','Pull','Legs','Rest','Upper','Lower','Rest'];
  plan jsonb := '[
    ["barbell-bench-press","incline-dumbbell-press","barbell-overhead-press","dumbbell-lateral-raise","triceps-rope-pushdown","cable-crossover"],
    ["deadlift","barbell-row","lat-pulldown","seated-cable-row","barbell-curl","hammer-curl"],
    ["barbell-back-squat","romanian-deadlift","leg-press","leg-extension","lying-leg-curl","standing-calf-raise-machine"],
    [],
    ["dumbbell-bench-press","pull-up","dumbbell-shoulder-press","single-arm-dumbbell-row","ez-bar-curl","skull-crusher"],
    ["barbell-front-squat","barbell-hip-thrust","bulgarian-split-squat","seated-leg-curl","hanging-leg-raise","standing-calf-raise-machine"],
    []]'::jsonb;
  base_w jsonb := '{"barbell-bench-press":60,"incline-dumbbell-press":22,"barbell-overhead-press":40,"dumbbell-lateral-raise":8,
    "triceps-rope-pushdown":25,"cable-crossover":15,"deadlift":90,"barbell-row":60,"lat-pulldown":55,"seated-cable-row":50,
    "barbell-curl":30,"hammer-curl":14,"barbell-back-squat":80,"romanian-deadlift":70,"leg-press":100,"leg-extension":45,
    "lying-leg-curl":35,"standing-calf-raise-machine":60,"dumbbell-bench-press":26,"pull-up":0,"dumbbell-shoulder-press":18,
    "single-arm-dumbbell-row":28,"ez-bar-curl":28,"skull-crusher":25,"barbell-front-squat":60,"barbell-hip-thrust":80,
    "bulgarian-split-squat":16,"seated-leg-curl":40,"hanging-leg-raise":0}'::jsonb;
  meal_names text[] := array['Breakfast','Lunch','Dinner','Snack'];
  meal_kinds text[] := array['breakfast','lunch','dinner','snack'];
  meals jsonb := '[
    [["Oats, dry",80],["Milk, whole",250],["Banana",120],["Boiled eggs",100]],
    [["Chicken breast, skinless (grilled / boiled / roasted)",200],["White rice, cooked",250],["Tabbouleh",150]],
    [["Shish tawook",180],["Lebanese pita bread",60],["Hummus",80],["Cucumber",100]],
    [["Greek yogurt, plain",200],["Almonds",30],["Honey",15]]]'::jsonb;
  treats jsonb := '[["Snickers",50],["Lay''s Classic",56],["Coca-Cola",330],["Kinder Bueno",43],["Oreo Original, 3 cookies",34],["Baklava",80],["Beef burger",250],["Knefeh",150]]'::jsonb;
begin
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'No auth user with id %', p_user;
  end if;

  -- Body data + targets from the calculator (male, 27 y, 78 kg, 178 cm, moderate, maintain).
  -- On an existing profile only empty fields are filled in.
  insert into bulkify_profiles (id, display_name, language, sex, age, height_cm, weight_kg, activity, goal, aggressiveness,
                                gym_start_date, kcal_goal, protein_goal, carbs_goal, fat_goal)
  values (p_user, 'Demo', 'en', 'male', 27, 178, 78, 'moderate', 'maintain', 'normal',
          current_date - 400, 2730, 140, 385, 70)
  on conflict (id) do update set
    display_name   = 'Demo',
    sex            = coalesce(bulkify_profiles.sex, excluded.sex),
    age            = coalesce(bulkify_profiles.age, excluded.age),
    height_cm      = coalesce(bulkify_profiles.height_cm, excluded.height_cm),
    weight_kg      = coalesce(bulkify_profiles.weight_kg, excluded.weight_kg),
    activity       = coalesce(bulkify_profiles.activity, excluded.activity),
    goal           = coalesce(bulkify_profiles.goal, excluded.goal),
    gym_start_date = coalesce(bulkify_profiles.gym_start_date, excluded.gym_start_date),
    kcal_goal      = case when bulkify_profiles.goal is null then excluded.kcal_goal    else bulkify_profiles.kcal_goal end,
    protein_goal   = case when bulkify_profiles.goal is null then excluded.protein_goal else bulkify_profiles.protein_goal end,
    carbs_goal     = case when bulkify_profiles.goal is null then excluded.carbs_goal   else bulkify_profiles.carbs_goal end,
    fat_goal       = case when bulkify_profiles.goal is null then excluded.fat_goal     else bulkify_profiles.fat_goal end;

  -- weigh-ins every 2 weeks plus today (so the monthly check-in is satisfied)
  for i in 0..4 loop
    insert into bulkify_weights (user_id, date, weight_kg)
    values (p_user, current_date - 56 + i * 14, 76.5 + i * 0.4)
    on conflict (user_id, date) do nothing;
  end loop;

  -- weekly program with planned exercises
  for i in 0..6 loop
    insert into bulkify_program_days (user_id, weekday, day_name, is_rest)
    values (p_user, i, day_names[i + 1], day_names[i + 1] = 'Rest')
    on conflict (user_id, weekday) do update set day_name = excluded.day_name, is_rest = excluded.is_rest;
    pos := 0;
    for sg in select jsonb_array_elements_text(plan -> i) loop
      select id into ex_id from bulkify_exercises where slug = sg and owner_id is null;
      if ex_id is not null then
        insert into bulkify_program_exercises (program_day_id, exercise_id, position)
        select pd.id, ex_id, pos from bulkify_program_days pd where pd.user_id = p_user and pd.weekday = i
        on conflict do nothing;
        pos := pos + 1;
      end if;
    end loop;
  end loop;

  for d in select g::date from generate_series(current_date - 60, current_date - 1, interval '1 day') g loop
    wd := extract(isodow from d)::int - 1;
    weeks := (d - (current_date - 60)) / 7.0;

    -- workouts: skip rest days and ~12% of training days
    if day_names[wd + 1] <> 'Rest' and abs(hashtext(p_user::text || d::text)) % 100 >= 12 then
      insert into bulkify_workouts (user_id, date, day_name) values (p_user, d, day_names[wd + 1])
      on conflict (user_id, date) do nothing returning id into wid;
      if wid is not null then
        pos := 0;
        for sg in select jsonb_array_elements_text(plan -> wd) loop
          select id into ex_id from bulkify_exercises where slug = sg and owner_id is null;
          continue when ex_id is null;
          insert into bulkify_workout_exercises (workout_id, exercise_id, position, note)
          values (wid, ex_id, pos, case when pos = 0 and abs(hashtext(d::text)) % 5 = 0 then 'Felt strong today' else '' end)
          returning id into weid;
          base := coalesce((base_w ->> sg)::numeric, 20);
          nsets := 3 + abs(hashtext(sg || d::text)) % 3;                    -- 3–5 sets
          for s in 1..nsets loop
            reps := greatest(5, 12 - s - abs(hashtext(sg || d::text || s)) % 2);
            w := base + floor(weeks) * (case when base >= 40 then 2.5 when base > 0 then 1 else 0 end)
                 + (case when s > 1 and base >= 40 then 2.5 else 0 end);
            w := least(120, greatest(0, round(w / 2.5) * 2.5));
            insert into bulkify_sets (workout_exercise_id, set_number, reps, weight_kg) values (weid, s, reps, w);
          end loop;
          pos := pos + 1;
        end loop;
      end if;
    end if;

    -- meals: ~94% of days logged
    if abs(hashtext('m' || p_user::text || d::text)) % 100 >= 6
       and not exists (select 1 from bulkify_meals where user_id = p_user and date = d) then
      for k in 0..3 loop
        mid := null;
        insert into bulkify_meals (user_id, date, name, position, kind) values (p_user, d, meal_names[k + 1], k, meal_kinds[k + 1])
        on conflict do nothing returning id into mid;
        continue when mid is null;
        for r in 0..jsonb_array_length(meals -> k) - 1 loop
          item := (meals -> k) -> r;
          select * into f from bulkify_foods where name_en = item ->> 0 and owner_id is null limit 1;
          continue when f.id is null;
          amt := round((item ->> 1)::numeric * (0.85 + (abs(hashtext(d::text || k || r)) % 31) / 100.0));
          insert into bulkify_meal_items (meal_id, food_id, amount, kcal, protein_g, carbs_g, fat_g, is_treat)
          values (mid, f.id, amt, round(f.kcal * amt / f.basis_amount, 1), round(f.protein_g * amt / f.basis_amount, 1),
                  round(f.carbs_g * amt / f.basis_amount, 1), round(f.fat_g * amt / f.basis_amount, 1), f.suggested_tag = 'Treat');
        end loop;
        -- an extra snack on ~45% of days, sometimes a big one
        if k = 3 and abs(hashtext('t' || d::text)) % 100 < 45 then
          tr := treats -> (abs(hashtext('p' || d::text)) % jsonb_array_length(treats));
          select * into f from bulkify_foods where name_en = tr ->> 0 and owner_id is null limit 1;
          if f.id is not null then
            amt := (tr ->> 1)::numeric * (case when abs(hashtext('x' || d::text)) % 4 = 0 then 2 else 1 end);
            insert into bulkify_meal_items (meal_id, food_id, amount, kcal, protein_g, carbs_g, fat_g, sugar_g, is_treat)
            values (mid, f.id, amt, round(f.kcal * amt / f.basis_amount, 1), round(f.protein_g * amt / f.basis_amount, 1),
                    round(f.carbs_g * amt / f.basis_amount, 1), round(f.fat_g * amt / f.basis_amount, 1),
                    round(f.carbs_g * amt / f.basis_amount * 0.65, 1), true);
          end if;
        end if;
      end loop;
      if abs(hashtext('n' || d::text)) % 8 = 0 then
        insert into bulkify_day_notes (user_id, date, note) values (p_user, d, 'Slept well, good energy.')
        on conflict (user_id, date) do nothing;
      end if;
    end if;
  end loop;
  return 'Bulkify demo data created for ' || p_user;
end $$;

create or replace function public.bulkify_remove_demo(p_user uuid)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from bulkify_profiles where id = p_user and display_name = 'Demo') then
    raise exception 'Refusing: % is not the Bulkify demo profile (display_name must be "Demo").', p_user;
  end if;
  delete from bulkify_workouts     where user_id = p_user;   -- cascades to exercises + sets
  delete from bulkify_meals        where user_id = p_user;   -- cascades to items
  delete from bulkify_day_notes    where user_id = p_user;
  delete from bulkify_weights      where user_id = p_user;
  delete from bulkify_program_days where user_id = p_user;   -- cascades to planned exercises
  delete from bulkify_exercises    where owner_id = p_user;
  delete from bulkify_foods        where owner_id = p_user;
  delete from bulkify_profiles     where id = p_user;
  return 'Bulkify demo data removed for ' || p_user || '. Now delete the user in Authentication → Users.';
end $$;

revoke all on function public.bulkify_seed_demo(uuid)   from public, anon, authenticated;
revoke all on function public.bulkify_remove_demo(uuid) from public, anon, authenticated;
