-- ═══════════════════════════════════════════════════════════════════════════
-- Bulkify · 005 · cardio log, friends (6-digit IDs, leaderboard) and account deletion
-- Run after 001–004. Safe to run more than once. Only touches bulkify_ objects.
-- The owner account always gets the ID 000000. Its email is NOT in this file: it is
-- read from bulkify_settings, which you fill in once in the SQL editor (see README).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Cardio log (calories are worked out in the app from the user's body) ──
create table if not exists public.bulkify_cardio (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date        date not null,
  kind        text not null,
  intensity   text check (intensity in ('easy','moderate','hard')),
  minutes     smallint not null check (minutes between 1 and 600),
  distance_km numeric(5,2) check (distance_km is null or (distance_km > 0 and distance_km <= 100)),
  kcal        integer not null check (kcal between 0 and 6000),
  created_at  timestamptz not null default now(),
  check (kind <> 'run_outside' or distance_km is not null)
);
create index if not exists bulkify_cardio_user_date_idx on public.bulkify_cardio (user_id, date);

-- Cardio types offered in the app (older types stay valid so earlier entries keep working).
alter table public.bulkify_cardio drop constraint if exists bulkify_cardio_kind_check;
alter table public.bulkify_cardio add constraint bulkify_cardio_kind_check check (kind in (
  'run_outside','treadmill','incline_walk','bike','jump_rope',
  'elliptical','rower','stairs','air_bike','ski_erg','swim','walk_outside','cycle_outside','hiit','boxing'));

alter table public.bulkify_cardio enable row level security;
revoke all on public.bulkify_cardio from anon;
grant select, insert, update, delete on public.bulkify_cardio to authenticated;
drop policy if exists bulkify_cardio_own on public.bulkify_cardio;
create policy bulkify_cardio_own on public.bulkify_cardio for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and (select public.bulkify_is_member()));

-- At most 10 cardio entries per day.
create or replace function public.bulkify_limit_cardio()
returns trigger language plpgsql set search_path = public as $$
begin
  if (select count(*) from public.bulkify_cardio where user_id = new.user_id and date = new.date) >= 10 then
    raise exception 'bulkify: at most 10 cardio entries per day' using errcode = 'check_violation';
  end if;
  return new;
end $$;
drop trigger if exists bulkify_cardio_limit on public.bulkify_cardio;
create trigger bulkify_cardio_limit before insert on public.bulkify_cardio
  for each row execute function public.bulkify_limit_cardio();

-- ── Friend ID: 6 digits, given automatically, never changes ────────────────
alter table public.bulkify_profiles add column if not exists friend_code text;
alter table public.bulkify_profiles drop constraint if exists bulkify_profiles_friend_code_check;
alter table public.bulkify_profiles add  constraint bulkify_profiles_friend_code_check check (friend_code ~ '^[0-9]{6}$');
create unique index if not exists bulkify_profiles_friend_code_uq on public.bulkify_profiles (friend_code);

-- Private settings (no API access). Holds the owner email so it stays out of the code.
create table if not exists public.bulkify_settings (
  key   text primary key,
  value text not null
);
alter table public.bulkify_settings enable row level security;
revoke all on public.bulkify_settings from anon, authenticated;

create or replace function public.bulkify_owner_email()
returns text language sql stable security definer set search_path = public as $$
  select lower(value) from public.bulkify_settings where key = 'owner_email'
$$;

-- Random free ID from 100000 to 999999 (000000 is reserved for the owner).
create or replace function public.bulkify_new_friend_code()
returns text language plpgsql volatile security definer set search_path = public as $$
declare c text;
begin
  loop
    c := (100000 + floor(random() * 900000))::int::text;
    exit when not exists (select 1 from public.bulkify_profiles where friend_code = c);
  end loop;
  return c;
end $$;

create or replace function public.bulkify_profile_friend_code()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    -- Nobody can change their ID (or take someone else's).
    if old.friend_code is not null then new.friend_code := old.friend_code; end if;
    return new;
  end if;
  if exists (select 1 from auth.users u where u.id = new.id and lower(u.email) = public.bulkify_owner_email()) then
    new.friend_code := '000000';
  else
    new.friend_code := public.bulkify_new_friend_code();
  end if;
  return new;
end $$;

drop trigger if exists bulkify_profiles_friend_code on public.bulkify_profiles;
create trigger bulkify_profiles_friend_code before insert or update on public.bulkify_profiles
  for each row execute function public.bulkify_profile_friend_code();

-- Give every existing profile its ID.
do $$
declare r record;
begin
  for r in select p.id, lower(u.email) as email from public.bulkify_profiles p join auth.users u on u.id = p.id
           where p.friend_code is null loop
    update public.bulkify_profiles
       set friend_code = case when r.email = public.bulkify_owner_email() then '000000' else public.bulkify_new_friend_code() end
     where id = r.id;
  end loop;
end $$;
alter table public.bulkify_profiles alter column friend_code set not null;

-- ── Friendships: a request becomes a friendship once the other person accepts ──
create table if not exists public.bulkify_friendships (
  id         uuid primary key default gen_random_uuid(),
  requester  uuid not null references auth.users(id) on delete cascade,
  addressee  uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  check (requester <> addressee)
);
create unique index if not exists bulkify_friendships_pair_uq
  on public.bulkify_friendships (least(requester, addressee), greatest(requester, addressee));
create index if not exists bulkify_friendships_addressee_idx on public.bulkify_friendships (addressee);

-- Only reachable through the functions below.
alter table public.bulkify_friendships enable row level security;
revoke all on public.bulkify_friendships from anon, authenticated;

create or replace function public.bulkify_are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.bulkify_friendships f
                 where f.status = 'accepted'
                   and ((f.requester = a and f.addressee = b) or (f.requester = b and f.addressee = a)));
$$;

-- Last 7 days (p_today and the 6 days before) for the leaderboard.
--   score = 20 per training day + 10 per day with calories and protein in range + 1 per set
--   (in range = 90–110 % of the target; on a bulk, anything from 90 % up counts)
create or replace function public.bulkify_week_stats(p_user uuid, p_today date)
returns jsonb language sql stable security definer set search_path = public as $$
  with tr as (
    select w.date, count(s.id) as sets, coalesce(sum(s.reps), 0) as reps
    from public.bulkify_workouts w
    join public.bulkify_workout_exercises we on we.workout_id = w.id
    join public.bulkify_sets s on s.workout_exercise_id = we.id
    where w.user_id = p_user and w.date between p_today - 6 and p_today
    group by w.date
  ), fd as (
    select m.date, sum(i.kcal) as k, sum(i.protein_g) as p
    from public.bulkify_meals m
    join public.bulkify_meal_items i on i.meal_id = m.id
    where m.user_id = p_user and m.date between p_today - 6 and p_today
    group by m.date
  ), g as (
    select kcal_goal, protein_goal, goal from public.bulkify_profiles where id = p_user
  ), agg as (
    select (select count(*) from tr)::int                     as training_days,
           (select coalesce(sum(sets), 0) from tr)::int       as sets,
           (select coalesce(sum(reps), 0) from tr)::int       as reps,
           (select count(*) from fd, g
             where g.kcal_goal > 0 and g.protein_goal > 0
               and fd.k >= 0.9 * g.kcal_goal and (g.goal = 'bulk' or fd.k <= 1.1 * g.kcal_goal)
               and fd.p >= 0.9 * g.protein_goal and (g.goal = 'bulk' or fd.p <= 1.1 * g.protein_goal))::int as food_days
  )
  select jsonb_build_object('training_days', training_days, 'sets', sets, 'reps', reps, 'food_days', food_days,
                            'score', training_days * 20 + food_days * 10 + sets)
  from agg;
$$;

-- Send a request to a 6-digit ID. If that person already asked you, you become friends.
create or replace function public.bulkify_friend_request(p_code text)
returns text language plpgsql security definer set search_path = public as $$
declare
  me    uuid := auth.uid();
  other uuid;
  f     public.bulkify_friendships;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if not exists (select 1 from public.bulkify_profiles where id = me) then return 'notFound'; end if;
  if coalesce(p_code, '') !~ '^[0-9]{6}$' then return 'notFound'; end if;
  select id into other from public.bulkify_profiles where friend_code = p_code;
  if other is null then return 'notFound'; end if;
  if other = me then return 'self'; end if;

  select * into f from public.bulkify_friendships
   where least(requester, addressee) = least(me, other) and greatest(requester, addressee) = greatest(me, other);
  if found then
    if f.status = 'accepted' then return 'already'; end if;
    if f.addressee = me then
      update public.bulkify_friendships set status = 'accepted' where id = f.id;
      return 'accepted';
    end if;
    return 'pending';
  end if;

  if (select count(*) from public.bulkify_friendships where requester = me and status = 'pending') >= 20
     or (select count(*) from public.bulkify_friendships where (requester = me or addressee = me) and status = 'accepted') >= 100 then
    return 'limit';
  end if;
  insert into public.bulkify_friendships (requester, addressee) values (me, other);
  return 'sent';
end $$;

create or replace function public.bulkify_friend_respond(p_id uuid, p_accept boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_accept then
    update public.bulkify_friendships set status = 'accepted'
     where id = p_id and addressee = auth.uid() and status = 'pending';
  else
    delete from public.bulkify_friendships where id = p_id and addressee = auth.uid() and status = 'pending';
  end if;
end $$;

-- Remove a friend, or cancel a request you sent.
create or replace function public.bulkify_friend_remove(p_other uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from public.bulkify_friendships
   where (requester = auth.uid() and addressee = p_other) or (requester = p_other and addressee = auth.uid());
end $$;

-- Leaderboard (you + accepted friends) and pending requests.
create or replace function public.bulkify_friends(p_today date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'not authenticated'; end if;
  return jsonb_build_object(
    'board', (
      select coalesce(jsonb_agg(x order by (x -> 'stats' ->> 'score')::int desc, x ->> 'name'), '[]'::jsonb)
      from (
        select jsonb_build_object('id', p.id, 'name', p.display_name, 'code', p.friend_code, 'me', p.id = me,
                                  'stats', public.bulkify_week_stats(p.id, p_today)) as x
        from public.bulkify_profiles p
        where p.id = me or public.bulkify_are_friends(me, p.id)
      ) s),
    'incoming', (
      select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'user_id', p.id, 'name', p.display_name, 'code', p.friend_code)
                                order by f.created_at desc), '[]'::jsonb)
      from public.bulkify_friendships f join public.bulkify_profiles p on p.id = f.requester
      where f.addressee = me and f.status = 'pending'),
    'outgoing', (
      select coalesce(jsonb_agg(jsonb_build_object('id', f.id, 'user_id', p.id, 'name', p.display_name, 'code', p.friend_code)
                                order by f.created_at desc), '[]'::jsonb)
      from public.bulkify_friendships f join public.bulkify_profiles p on p.id = f.addressee
      where f.requester = me and f.status = 'pending')
  );
end $$;

-- One friend's day: % of targets eaten, latest workout, top 3 PRs, weekly stats.
-- Only for yourself or an accepted friend.
create or replace function public.bulkify_friend_detail(p_friend uuid, p_today date)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  me   uuid := auth.uid();
  prof public.bulkify_profiles;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if p_friend <> me and not public.bulkify_are_friends(me, p_friend) then
    raise exception 'not friends' using errcode = '42501';
  end if;
  select * into prof from public.bulkify_profiles where id = p_friend;
  if not found then raise exception 'not found' using errcode = 'no_data_found'; end if;

  return jsonb_build_object(
    'id', prof.id, 'name', prof.display_name, 'code', prof.friend_code, 'goal', prof.goal, 'me', prof.id = me,
    'targets', jsonb_build_object('kcal', prof.kcal_goal, 'protein', prof.protein_goal, 'carbs', prof.carbs_goal, 'fat', prof.fat_goal),
    'eaten', (
      select jsonb_build_object('kcal', coalesce(sum(i.kcal), 0), 'protein', coalesce(sum(i.protein_g), 0),
                                'carbs', coalesce(sum(i.carbs_g), 0), 'fat', coalesce(sum(i.fat_g), 0))
      from public.bulkify_meals m join public.bulkify_meal_items i on i.meal_id = m.id
      where m.user_id = p_friend and m.date = p_today),
    'workout', (
      with lw as (
        select w.id, w.date, w.day_name from public.bulkify_workouts w
        where w.user_id = p_friend and w.date <= p_today
          and exists (select 1 from public.bulkify_workout_exercises we
                      join public.bulkify_sets s on s.workout_exercise_id = we.id where we.workout_id = w.id)
        order by w.date desc limit 1
      ), ex as (
        select we.position, e.name_en, e.name_ar, count(s.id)::int as sets, sum(s.reps)::int as reps, max(s.weight_kg) as top_kg
        from lw
        join public.bulkify_workout_exercises we on we.workout_id = lw.id
        join public.bulkify_exercises e on e.id = we.exercise_id
        join public.bulkify_sets s on s.workout_exercise_id = we.id
        group by we.id, we.position, e.name_en, e.name_ar
      )
      select jsonb_build_object('date', lw.date, 'day_name', lw.day_name,
        'exercises', (select coalesce(jsonb_agg(jsonb_build_object('name_en', name_en, 'name_ar', name_ar, 'sets', sets,
                                                                   'reps', reps, 'top_kg', top_kg) order by position), '[]'::jsonb) from ex))
      from lw),
    'prs', (
      select coalesce(jsonb_agg(jsonb_build_object('name_en', name_en, 'name_ar', name_ar, 'weight_kg', weight_kg,
                                                   'reps', reps, 'date', date) order by weight_kg desc, reps desc), '[]'::jsonb)
      from (
        select * from (
          select distinct on (we.exercise_id) e.name_en, e.name_ar, s.weight_kg, s.reps, w.date
          from public.bulkify_workouts w
          join public.bulkify_workout_exercises we on we.workout_id = w.id
          join public.bulkify_sets s on s.workout_exercise_id = we.id
          join public.bulkify_exercises e on e.id = we.exercise_id
          where w.user_id = p_friend and s.weight_kg > 0
          order by we.exercise_id, s.weight_kg desc, s.reps desc, w.date
        ) best
        order by weight_kg desc, reps desc
        limit 3
      ) top3),
    'stats', public.bulkify_week_stats(p_friend, p_today)
  );
end $$;

-- ── Account deletion ───────────────────────────────────────────────────────
-- Wrong-password attempts (max 5 per 15 minutes). No API access.
create table if not exists public.bulkify_delete_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  at      timestamptz not null default now()
);
create index if not exists bulkify_delete_attempts_user_idx on public.bulkify_delete_attempts (user_id, at);
alter table public.bulkify_delete_attempts enable row level security;
revoke all on public.bulkify_delete_attempts from anon, authenticated;

-- Removes every Bulkify row of one user. Internal: not callable from the app.
-- The login itself (auth.users) is kept because other apps share this project.
create or replace function public.bulkify_purge_user(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.bulkify_friendships     where requester = p_user or addressee = p_user;
  delete from public.bulkify_workouts        where user_id = p_user;   -- + exercises and sets
  delete from public.bulkify_program_days    where user_id = p_user;   -- + program exercises
  delete from public.bulkify_meals           where user_id = p_user;   -- + meal items
  delete from public.bulkify_day_notes       where user_id = p_user;
  delete from public.bulkify_weights         where user_id = p_user;
  delete from public.bulkify_cardio          where user_id = p_user;
  delete from public.bulkify_exercises       where owner_id = p_user;
  delete from public.bulkify_foods           where owner_id = p_user;
  delete from public.bulkify_delete_attempts where user_id = p_user;
  delete from public.bulkify_profiles        where id = p_user;
end $$;

-- Delete with the account password. Returns ok | wrong | locked | noPassword.
create or replace function public.bulkify_delete_account(p_password text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare
  me   uuid := auth.uid();
  hash text;
begin
  if me is null then raise exception 'not authenticated'; end if;
  if (select count(*) from public.bulkify_delete_attempts where user_id = me and at > now() - interval '15 minutes') >= 5 then
    return 'locked';
  end if;
  select encrypted_password into hash from auth.users where id = me;
  if hash is null or hash = '' then return 'noPassword'; end if;
  if crypt(coalesce(p_password, ''), hash) <> hash then
    insert into public.bulkify_delete_attempts (user_id) values (me);
    return 'wrong';
  end if;
  perform public.bulkify_purge_user(me);
  return 'ok';
end $$;

-- Delete after opening the emailed link. The link signs the user in by email
-- (method "otp" / "magiclink" in the token), which proves they own the inbox.
-- Must be used within 15 minutes. Returns ok | expired.
create or replace function public.bulkify_delete_account_by_email()
returns text language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'not authenticated'; end if;
  if not exists (
    select 1 from jsonb_array_elements(coalesce(auth.jwt() -> 'amr', '[]'::jsonb)) a
    where a ->> 'method' in ('otp', 'magiclink')
      and to_timestamp((a ->> 'timestamp')::bigint) > now() - interval '15 minutes'
  ) then
    return 'expired';
  end if;
  perform public.bulkify_purge_user(me);
  return 'ok';
end $$;

-- ── Permissions ────────────────────────────────────────────────────────────
revoke all on function public.bulkify_new_friend_code()              from public, anon, authenticated;
revoke all on function public.bulkify_owner_email()                  from public, anon, authenticated;
revoke all on function public.bulkify_are_friends(uuid, uuid)        from public, anon, authenticated;
revoke all on function public.bulkify_week_stats(uuid, date)         from public, anon, authenticated;
revoke all on function public.bulkify_purge_user(uuid)               from public, anon, authenticated;
revoke all on function public.bulkify_friend_request(text)           from public, anon;
revoke all on function public.bulkify_friend_respond(uuid, boolean)  from public, anon;
revoke all on function public.bulkify_friend_remove(uuid)            from public, anon;
revoke all on function public.bulkify_friends(date)                  from public, anon;
revoke all on function public.bulkify_friend_detail(uuid, date)      from public, anon;
revoke all on function public.bulkify_delete_account(text)           from public, anon;
revoke all on function public.bulkify_delete_account_by_email()      from public, anon;
grant execute on function public.bulkify_friend_request(text)          to authenticated;
grant execute on function public.bulkify_friend_respond(uuid, boolean) to authenticated;
grant execute on function public.bulkify_friend_remove(uuid)           to authenticated;
grant execute on function public.bulkify_friends(date)                 to authenticated;
grant execute on function public.bulkify_friend_detail(uuid, date)     to authenticated;
grant execute on function public.bulkify_delete_account(text)          to authenticated;
grant execute on function public.bulkify_delete_account_by_email()     to authenticated;
