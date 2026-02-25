-- UeiDo initial schema (profiles, plans, workout_logs, reminders) with RLS

-- Utility: updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  age int,
  gender text,
  height_cm int,
  weight_kg numeric,
  experience_level text, -- beginner | intermediate | pro
  goal text, -- lose | maintain | gain (and later: recomposition)
  activity_level text,
  dietary_prefs jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  last_seen_route text not null default '/',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = user_id);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = user_id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(user_id, name)
  values (new.id, '')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Plans (single active plan per user)
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_week int not null default 1,
  workout_plan jsonb not null,
  diet_plan jsonb not null,
  calorie_targets jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists plans_one_per_user on public.plans(user_id);

create trigger plans_set_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

alter table public.plans enable row level security;

create policy "plans_select_own"
on public.plans
for select
using (auth.uid() = user_id);

create policy "plans_insert_own"
on public.plans
for insert
with check (auth.uid() = user_id);

create policy "plans_update_own"
on public.plans
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "plans_delete_own"
on public.plans
for delete
using (auth.uid() = user_id);

-- Workout logs (one per day)
create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  workout_id text,
  completed boolean not null default false,
  notes text,
  perceived_exertion int,
  created_at timestamptz not null default now()
);

create unique index if not exists workout_logs_user_date on public.workout_logs(user_id, date);

alter table public.workout_logs enable row level security;

create policy "workout_logs_select_own"
on public.workout_logs
for select
using (auth.uid() = user_id);

create policy "workout_logs_insert_own"
on public.workout_logs
for insert
with check (auth.uid() = user_id);

create policy "workout_logs_update_own"
on public.workout_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "workout_logs_delete_own"
on public.workout_logs
for delete
using (auth.uid() = user_id);

-- Reminders
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  time text not null, -- HH:MM (client local time)
  type text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.reminders enable row level security;

create policy "reminders_select_own"
on public.reminders
for select
using (auth.uid() = user_id);

create policy "reminders_insert_own"
on public.reminders
for insert
with check (auth.uid() = user_id);

create policy "reminders_update_own"
on public.reminders
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "reminders_delete_own"
on public.reminders
for delete
using (auth.uid() = user_id);

