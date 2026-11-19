-- ═══════════════════════════════════════════════════════════════════════════
-- Bulkify · 004 · body & goals, weight log, meal types, limits, permissions
-- Run after 001–003. Safe to run more than once. Only touches bulkify_ objects.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Profile: body data for the calories & macros calculator ────────────────
alter table public.bulkify_profiles
  add column if not exists sex            text     check (sex in ('male','female')),
  add column if not exists age            smallint check (age between 14 and 80),
  add column if not exists height_cm      numeric(5,1) check (height_cm between 120 and 230),
  add column if not exists weight_kg      numeric(5,1) check (weight_kg between 30 and 250),
  add column if not exists activity       text     check (activity in ('sedentary','light','moderate','active','veryActive')),
  add column if not exists goal           text     check (goal in ('cut','bulk','maintain')),
  add column if not exists aggressiveness text     not null default 'normal' check (aggressiveness in ('mild','normal')),
  add column if not exists gym_start_date date     check (gym_start_date >= '1950-01-01');

-- Targets now come from the calculator: allow its full output range.
alter table public.bulkify_profiles drop constraint if exists bulkify_profiles_kcal_goal_check;
alter table public.bulkify_profiles add  constraint bulkify_profiles_kcal_goal_check    check (kcal_goal between 800 and 10000);
alter table public.bulkify_profiles drop constraint if exists bulkify_profiles_protein_goal_check;
alter table public.bulkify_profiles add  constraint bulkify_profiles_protein_goal_check check (protein_goal between 0 and 700);
alter table public.bulkify_profiles drop constraint if exists bulkify_profiles_carbs_goal_check;
alter table public.bulkify_profiles add  constraint bulkify_profiles_carbs_goal_check   check (carbs_goal between 0 and 1500);
alter table public.bulkify_profiles drop constraint if exists bulkify_profiles_fat_goal_check;
alter table public.bulkify_profiles add  constraint bulkify_profiles_fat_goal_check     check (fat_goal between 0 and 400);

-- ── Weight log (one entry per day; the monthly check-in writes here) ───────
create table if not exists public.bulkify_weights (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date       date not null,
  weight_kg  numeric(5,1) not null check (weight_kg between 30 and 250),
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists bulkify_weights_user_date_idx on public.bulkify_weights (user_id, date);

alter table public.bulkify_weights enable row level security;
revoke all on public.bulkify_weights from anon;
drop policy if exists bulkify_weights_own on public.bulkify_weights;
create policy bulkify_weights_own on public.bulkify_weights for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and (select public.bulkify_is_member()));

-- ── Meal types: at most one breakfast, one lunch and one dinner per day ────
alter table public.bulkify_meals
  add column if not exists kind text not null default 'custom'
  check (kind in ('breakfast','lunch','dinner','snack','custom'));

-- Existing meals named like a preset get that type (only the first one per day
-- for breakfast/lunch/dinner; any extra stays a custom meal).
with guessed as (
  select id, user_id, date,
    case lower(btrim(name))
      when 'breakfast' then 'breakfast' when 'فطور' then 'breakfast'
      when 'lunch'     then 'lunch'     when 'غداء' then 'lunch'
      when 'dinner'    then 'dinner'    when 'عشاء' then 'dinner'
      when 'snack'     then 'snack'     when 'سناك' then 'snack'
    end as k,
    created_at
  from public.bulkify_meals
  where kind = 'custom'
), ranked as (
  select g.*, row_number() over (partition by user_id, date, k order by created_at) as rn
  from guessed g where k is not null
)
update public.bulkify_meals m set kind = r.k
from ranked r
where m.id = r.id
  and (r.k = 'snack' or (r.rn = 1 and not exists (
        select 1 from public.bulkify_meals o where o.user_id = r.user_id and o.date = r.date and o.kind = r.k)));

create unique index if not exists bulkify_meals_one_main_uq
  on public.bulkify_meals (user_id, date, kind) where kind in ('breakfast','lunch','dinner');

-- ── At most 9 exercises in one workout ─────────────────────────────────────
create or replace function public.bulkify_limit_workout_exercises()
returns trigger language plpgsql set search_path = public as $$
begin
  perform 1 from public.bulkify_workouts where id = new.workout_id for update;
  if (select count(*) from public.bulkify_workout_exercises where workout_id = new.workout_id) >= 9 then
    raise exception 'bulkify: a workout can have at most 9 exercises' using errcode = 'check_violation';
  end if;
  return new;
end $$;

drop trigger if exists bulkify_workout_exercises_limit on public.bulkify_workout_exercises;
create trigger bulkify_workout_exercises_limit before insert on public.bulkify_workout_exercises
  for each row execute function public.bulkify_limit_workout_exercises();

-- ── Permissions: signed-in users may use the bulkify_ tables (RLS still ────
--    limits every user to their own rows). Fixes "403 Forbidden".
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename like 'bulkify\_%' loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
