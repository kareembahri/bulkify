-- ═══════════════════════════════════════════════════════════════════════════
-- Bulkify · 001 · tables, constraints, indexes
-- Safe to run more than once. Creates ONLY objects whose names start with
-- bulkify_. Never drops, renames or alters anything else in your project.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- Profile: a user is a "Bulkify user" only if they have a row here.
create table if not exists public.bulkify_profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  display_name     text    not null default '' check (char_length(display_name) <= 40),
  language         text    not null default 'en' check (language in ('en','ar')),
  theme            text    not null default 'dark' check (theme in ('dark','light')),
  kcal_goal        integer not null default 2500 check (kcal_goal between 800 and 8000),
  protein_goal     integer not null default 150  check (protein_goal between 0 and 400),
  carbs_goal       integer check (carbs_goal between 0 and 1200),
  fat_goal         integer check (fat_goal between 0 and 400),
  sugar_goal       integer check (sugar_goal between 0 and 400),
  treat_kcal_limit integer not null default 300 check (treat_kcal_limit between 0 and 5000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Exercise library. owner_id null = built-in (shared, read-only); otherwise a user's custom exercise.
create table if not exists public.bulkify_exercises (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid references auth.users(id) on delete cascade,
  slug              text,
  name_en           text not null check (char_length(name_en) between 1 and 80),
  name_ar           text not null default '' check (char_length(name_ar) <= 80),
  primary_muscle    text not null check (primary_muscle in ('chest','back','shoulders','biceps','triceps',
                      'forearms','quads','hamstrings','glutes','calves','abs','traps','full_body','cardio')),
  secondary_muscles text[] not null default '{}',
  equipment         text not null check (equipment in ('barbell','dumbbell','machine','cable','smith',
                      'kettlebell','bodyweight','bands','other')),
  created_at        timestamptz not null default now()
);
create unique index if not exists bulkify_exercises_slug_uq on public.bulkify_exercises (slug) where owner_id is null;
create index if not exists bulkify_exercises_owner_idx on public.bulkify_exercises (owner_id);

-- Weekly program: one row per weekday (0 = Monday … 6 = Sunday).
create table if not exists public.bulkify_program_days (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null default auth.uid() references auth.users(id) on delete cascade,
  weekday  smallint not null check (weekday between 0 and 6),
  day_name text not null default '' check (char_length(day_name) <= 20),
  is_rest  boolean not null default false,
  unique (user_id, weekday)
);

-- Planned exercises (the template that pre-fills a workout).
create table if not exists public.bulkify_program_exercises (
  id             uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references public.bulkify_program_days(id) on delete cascade,
  exercise_id    uuid not null references public.bulkify_exercises(id) on delete cascade,
  position       integer not null default 0,
  unique (program_day_id, exercise_id)
);
create index if not exists bulkify_program_exercises_day_idx on public.bulkify_program_exercises (program_day_id);

-- Logged workouts. day_name is copied at log time, so editing the program never rewrites history.
create table if not exists public.bulkify_workouts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date       date not null,
  day_name   text not null default '' check (char_length(day_name) <= 20),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists bulkify_workouts_user_date_idx on public.bulkify_workouts (user_id, date);

create table if not exists public.bulkify_workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references public.bulkify_workouts(id) on delete cascade,
  exercise_id uuid not null references public.bulkify_exercises(id) on delete restrict,
  note        text not null default '' check (char_length(note) <= 300),
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists bulkify_wex_workout_idx  on public.bulkify_workout_exercises (workout_id);
create index if not exists bulkify_wex_exercise_idx on public.bulkify_workout_exercises (exercise_id);

create table if not exists public.bulkify_sets (
  id                  uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references public.bulkify_workout_exercises(id) on delete cascade,
  set_number          smallint not null check (set_number between 1 and 5),
  reps                integer not null check (reps > 0 and reps <= 500),
  weight_kg           numeric(5,2) not null check (weight_kg >= 0 and weight_kg <= 120),
  unique (workout_exercise_id, set_number)
);
create index if not exists bulkify_sets_wex_idx on public.bulkify_sets (workout_exercise_id);

-- Food catalog. owner_id null = imported CSV (shared, read-only); otherwise a user's "My Food".
create table if not exists public.bulkify_foods (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users(id) on delete cascade,
  category_no   integer not null default 0,
  category      text not null default 'My foods',
  name_en       text not null check (char_length(name_en) between 1 and 120),
  name_ar       text not null default '' check (char_length(name_ar) <= 120),
  basis_amount  numeric(8,2) not null default 100 check (basis_amount > 0),
  basis_unit    text not null default 'g' check (basis_unit in ('g','ml')),
  kcal          numeric(8,2) not null check (kcal >= 0),
  protein_g     numeric(8,2) not null default 0 check (protein_g >= 0),
  carbs_g       numeric(8,2) not null default 0 check (carbs_g >= 0),
  fat_g         numeric(8,2) not null default 0 check (fat_g >= 0),
  sugar_g       numeric(8,2) check (sugar_g is null or sugar_g >= 0),
  kcal_per_100  numeric(8,2),
  suggested_tag text not null default 'Everyday' check (suggested_tag in ('Everyday','Treat')),
  note          text not null default '',
  created_at    timestamptz not null default now()
);
create unique index if not exists bulkify_foods_builtin_uq on public.bulkify_foods (category_no, name_en) where owner_id is null;
create index if not exists bulkify_foods_owner_idx on public.bulkify_foods (owner_id);

create table if not exists public.bulkify_meals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date       date not null,
  name       text not null default 'Meal' check (char_length(name) between 1 and 30),
  position   integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists bulkify_meals_user_date_idx on public.bulkify_meals (user_id, date);

create table if not exists public.bulkify_meal_items (
  id         uuid primary key default gen_random_uuid(),
  meal_id    uuid not null references public.bulkify_meals(id) on delete cascade,
  food_id    uuid references public.bulkify_foods(id) on delete set null,
  amount     numeric(8,2) check (amount is null or (amount > 0 and amount <= 10000)),
  kcal       numeric(8,2) not null default 0 check (kcal >= 0 and kcal <= 20000),
  protein_g  numeric(8,2) not null default 0 check (protein_g >= 0),
  carbs_g    numeric(8,2) not null default 0 check (carbs_g >= 0),
  fat_g      numeric(8,2) not null default 0 check (fat_g >= 0),
  sugar_g    numeric(8,2) check (sugar_g is null or sugar_g >= 0),
  is_treat   boolean not null default false,
  label      text not null default '' check (char_length(label) <= 60),
  created_at timestamptz not null default now()
);
create index if not exists bulkify_meal_items_meal_idx on public.bulkify_meal_items (meal_id);

create table if not exists public.bulkify_day_notes (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date    date not null,
  note    text not null default '' check (char_length(note) <= 250),
  unique (user_id, date)
);
create index if not exists bulkify_day_notes_user_date_idx on public.bulkify_day_notes (user_id, date);
