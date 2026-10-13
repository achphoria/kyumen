-- Kyumen: skema dasar (staff, undangan, Ruang Tatami, papan rencana, aktivitas, rapat).
-- Disusun ulang dari pemakaian di kode karena skema dasar Hive Colony dulu dibuat langsung di database.
-- Semua tabel berawalan hc_ dan dijaga RLS; tidak menyentuh tabel lain di database.

create extension if not exists pg_net;

-- ---------- staff ----------
create table if not exists public.hc_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text,
  role text not null default 'staff' check (role in ('owner', 'lead', 'staff', 'viewer')),
  primary_dept text,
  depts text[] not null default '{}',
  avatar jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.hc_profiles enable row level security;

-- peran staff yang sedang login (null = bukan staff Kyumen)
create or replace function public.hc_my_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.hc_profiles where id = auth.uid()
$$;
revoke all on function public.hc_my_role() from public, anon;
grant execute on function public.hc_my_role() to authenticated, service_role;

create policy hc_profiles_select on public.hc_profiles for select to authenticated
  using ((select public.hc_my_role()) is not null);
create policy hc_profiles_update on public.hc_profiles for update to authenticated
  using (id = (select auth.uid()) or (select public.hc_my_role()) = 'owner')
  with check (id = (select auth.uid()) or (select public.hc_my_role()) = 'owner');

-- staff biasa hanya boleh mengubah nama & avatar sendiri, bukan peran atau divisi
create or replace function public.hc_profiles_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and coalesce(public.hc_my_role(), '') <> 'owner'
     and (new.role is distinct from old.role or new.primary_dept is distinct from old.primary_dept or new.depts is distinct from old.depts) then
    raise exception 'Hanya owner yang bisa mengubah peran atau divisi.';
  end if;
  return new;
end $$;
revoke all on function public.hc_profiles_guard() from public, anon, authenticated;
create trigger hc_profiles_guard before update on public.hc_profiles for each row execute function public.hc_profiles_guard();

-- ---------- undangan ----------
create table if not exists public.hc_invites (
  code text primary key default encode(extensions.gen_random_bytes(6), 'hex'),
  role text not null default 'staff' check (role in ('owner', 'lead', 'staff', 'viewer')),
  primary_dept text not null,
  depts text[] not null default '{}',
  email text,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days',
  used_by uuid references auth.users (id) on delete set null,
  used_at timestamptz
);
alter table public.hc_invites enable row level security;
create policy hc_invites_select on public.hc_invites for select to authenticated
  using ((select public.hc_my_role()) = 'owner' or ((select public.hc_my_role()) = 'lead' and created_by = (select auth.uid())));
create policy hc_invites_delete on public.hc_invites for delete to authenticated
  using (used_by is null and ((select public.hc_my_role()) = 'owner' or ((select public.hc_my_role()) = 'lead' and created_by = (select auth.uid()))));

-- owner: semua peran; kepala divisi: staff/viewer di divisinya sendiri
create or replace function public.hc_create_invite(p_primary_dept text, p_depts text[], p_role text, p_email text)
returns public.hc_invites language plpgsql security definer set search_path = '' as $$
declare
  me public.hc_profiles;
  inv public.hc_invites;
begin
  select * into me from public.hc_profiles where id = auth.uid();
  if me.id is null or me.role not in ('owner', 'lead') then
    raise exception 'Hanya owner atau kepala divisi yang bisa membuat undangan.';
  end if;
  if p_role not in ('owner', 'lead', 'staff', 'viewer') then
    raise exception 'Peran tidak dikenal.';
  end if;
  if me.role = 'lead' and (p_role not in ('staff', 'viewer') or not (p_primary_dept = me.primary_dept or p_primary_dept = any (me.depts))) then
    raise exception 'Kepala divisi hanya bisa mengundang staff atau viewer ke divisinya sendiri.';
  end if;
  insert into public.hc_invites (role, primary_dept, depts, email, created_by)
  values (p_role, p_primary_dept, coalesce(p_depts, '{}'), nullif(lower(trim(p_email)), ''), me.id)
  returning * into inv;
  return inv;
end $$;
revoke all on function public.hc_create_invite(text, text[], text, text) from public, anon;
grant execute on function public.hc_create_invite(text, text[], text, text) to authenticated;

-- dipakai staff baru setelah daftar/masuk: membuat profil sesuai undangan (sekali pakai)
create or replace function public.hc_accept_invite(p_code text, p_name text)
returns public.hc_profiles language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  my_email text;
  inv public.hc_invites;
  prof public.hc_profiles;
begin
  if uid is null then
    raise exception 'Masuk dulu sebelum memakai kode undangan.';
  end if;
  select * into prof from public.hc_profiles where id = uid;
  if prof.id is not null then
    return prof;
  end if;
  select * into inv from public.hc_invites where code = trim(p_code) for update;
  if inv.code is null or inv.used_by is not null or inv.expires_at < now() then
    raise exception 'Kode undangan tidak valid atau sudah dipakai.';
  end if;
  select lower(email) into my_email from auth.users where id = uid;
  if inv.email is not null and inv.email <> my_email then
    raise exception 'Undangan ini dikunci untuk email lain.';
  end if;
  insert into public.hc_profiles (id, name, email, role, primary_dept, depts)
  values (uid, coalesce(nullif(trim(p_name), ''), split_part(my_email, '@', 1)), my_email, inv.role, inv.primary_dept, inv.depts)
  returning * into prof;
  update public.hc_invites set used_by = uid, used_at = now() where code = inv.code;
  insert into public.hc_activity (kind, dept, text) values ('join', inv.primary_dept, prof.name || ' bergabung ke Kyuka Ramen');
  return prof;
end $$;
revoke all on function public.hc_accept_invite(text, text) from public, anon;
grant execute on function public.hc_accept_invite(text, text) to authenticated;

-- ---------- aktivitas ----------
create table if not exists public.hc_activity (
  id bigint generated always as identity primary key,
  kind text not null default 'info',
  dept text,
  text text not null,
  actor uuid default auth.uid(),
  created_at timestamptz not null default now()
);
alter table public.hc_activity enable row level security;
create policy hc_activity_select on public.hc_activity for select to authenticated
  using ((select public.hc_my_role()) is not null);
create policy hc_activity_insert on public.hc_activity for insert to authenticated
  with check ((select public.hc_my_role()) in ('owner', 'lead', 'staff'));
create index if not exists hc_activity_created_idx on public.hc_activity (created_at desc);

-- ---------- persetujuan ----------
create table if not exists public.hc_approvals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text,
  requested_by text,
  dept text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'revise', 'rejected')),
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.hc_approvals enable row level security;
create policy hc_approvals_select on public.hc_approvals for select to authenticated
  using ((select public.hc_my_role()) is not null);
create policy hc_approvals_insert on public.hc_approvals for insert to authenticated
  with check ((select public.hc_my_role()) in ('owner', 'lead', 'staff'));
create policy hc_approvals_update on public.hc_approvals for update to authenticated
  using ((select public.hc_my_role()) in ('owner', 'lead'))
  with check ((select public.hc_my_role()) in ('owner', 'lead'));

-- ---------- papan rencana ----------
create table if not exists public.hc_plan_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  who text,
  kind text not null default 'human' check (kind in ('ai', 'human')),
  col text not null default 'todo' check (col in ('todo', 'doing', 'done')),
  sort double precision not null default extract(epoch from now()),
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.hc_plan_tasks enable row level security;
create policy hc_plan_tasks_select on public.hc_plan_tasks for select to authenticated
  using ((select public.hc_my_role()) is not null);
create policy hc_plan_tasks_insert on public.hc_plan_tasks for insert to authenticated
  with check ((select public.hc_my_role()) in ('owner', 'lead', 'staff'));
create policy hc_plan_tasks_update on public.hc_plan_tasks for update to authenticated
  using ((select public.hc_my_role()) in ('owner', 'lead', 'staff'))
  with check ((select public.hc_my_role()) in ('owner', 'lead', 'staff'));
create policy hc_plan_tasks_delete on public.hc_plan_tasks for delete to authenticated
  using ((select public.hc_my_role()) in ('owner', 'lead'));

-- ---------- rapat (Ruang Tatami) ----------
create table if not exists public.hc_meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Rapat kedai',
  status text not null default 'live' check (status in ('live', 'summarizing', 'done', 'failed')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  participants text[] not null default '{}',
  mom jsonb,
  report text,
  error text
);
alter table public.hc_meetings enable row level security;
-- hanya satu rapat berjalan pada satu waktu
create unique index if not exists hc_meetings_one_live on public.hc_meetings ((true)) where status = 'live';
create policy hc_meetings_select on public.hc_meetings for select to authenticated
  using ((select public.hc_my_role()) is not null);
create policy hc_meetings_insert on public.hc_meetings for insert to authenticated
  with check ((select public.hc_my_role()) = 'owner');
create policy hc_meetings_update on public.hc_meetings for update to authenticated
  using ((select public.hc_my_role()) = 'owner') with check ((select public.hc_my_role()) = 'owner');

create table if not exists public.hc_meeting_lines (
  id bigint generated always as identity primary key,
  meeting_id uuid not null references public.hc_meetings (id) on delete cascade,
  speaker_id uuid default auth.uid() references auth.users (id) on delete set null,
  speaker_name text not null default '',
  kind text not null default 'speech',
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.hc_meeting_lines enable row level security;
create index if not exists hc_meeting_lines_meeting_idx on public.hc_meeting_lines (meeting_id, created_at);
create policy hc_meeting_lines_select on public.hc_meeting_lines for select to authenticated
  using ((select public.hc_my_role()) is not null);
create policy hc_meeting_lines_insert on public.hc_meeting_lines for insert to authenticated
  with check ((select public.hc_my_role()) is not null and speaker_id = (select auth.uid()));

-- realtime untuk Ruang Tatami & papan rencana
alter publication supabase_realtime add table public.hc_approvals, public.hc_plan_tasks, public.hc_activity, public.hc_meetings;
