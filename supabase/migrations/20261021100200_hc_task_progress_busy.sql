-- Papan misi & kunci sibuk agent (dari Hive Colony, tanpa jalur Grok Bot).
-- Progres tugas, hasil (termasuk file), thread asal, dan status gagal kalau tidak ada keluaran.
-- Kunci sibuk lepas sendiri setelah 30 menit tanpa kabar.

alter table public.hc_plan_tasks add column if not exists progress real;
alter table public.hc_plan_tasks add column if not exists progress_note text;
alter table public.hc_plan_tasks add column if not exists result_files jsonb not null default '[]'::jsonb;
alter table public.hc_plan_tasks add column if not exists source_thread_id uuid references public.hc_agent_threads (id) on delete set null;

alter table public.hc_plan_tasks drop constraint if exists hc_plan_tasks_col_check;
alter table public.hc_plan_tasks add constraint hc_plan_tasks_col_check check (col in ('todo', 'doing', 'done', 'failed'));
alter table public.hc_plan_tasks drop constraint if exists hc_plan_tasks_progress_check;
alter table public.hc_plan_tasks add constraint hc_plan_tasks_progress_check check (progress is null or (progress >= 0 and progress <= 1));

create index if not exists hc_plan_tasks_busy_idx on public.hc_plan_tasks (who, updated_at desc) where kind = 'ai' and col = 'doing';

-- selesai tanpa isi.
-- Worker n8n Kyumen menandai 'done' tanpa kolom result; hasilnya ditulis agent-chat sesaat kemudian.
-- Jadi tugas yang sedang berjalan tetap 'doing' sampai agent-chat menutupnya (atau kunci 30 menit lepas);
-- selain itu 'done' tanpa isi menjadi 'failed'.
create or replace function public.hc_plan_tasks_guard_done()
returns trigger
language plpgsql
set search_path to ''
as $$
begin
  if new.col = 'done' and coalesce(btrim(new.result), '') = '' then
    if old.col = 'doing' and new.kind = 'ai' then
      new.col := 'doing';
    else
      new.col := 'failed';
      new.result := 'Tidak ada hasil. Tugas tidak ditandai selesai.';
      new.result_at := coalesce(new.result_at, now());
    end if;
  end if;
  return new;
end $$;
revoke all on function public.hc_plan_tasks_guard_done() from public, anon, authenticated;
drop trigger if exists hc_plan_tasks_guard_done on public.hc_plan_tasks;
create trigger hc_plan_tasks_guard_done before update on public.hc_plan_tasks
  for each row execute function public.hc_plan_tasks_guard_done();

-- tugas AI yang sudah selesai tanpa hasil
update public.hc_plan_tasks
set col = 'failed',
    result = 'Tidak ada hasil. Tugas tidak ditandai selesai.',
    result_at = coalesce(result_at, updated_at, now()),
    updated_at = now()
where kind = 'ai' and col = 'done' and coalesce(btrim(result), '') = '';

-- lepas kunci yang menggantung
create or replace function public.hc_release_stale_agent_tasks(p_minutes int default 30)
returns int
language plpgsql
security definer
set search_path to ''
as $$
declare
  n int := 0;
  r record;
  msg text;
begin
  msg := 'Waktu habis (' || greatest(coalesce(p_minutes, 30), 5) || ' menit tanpa kabar). Tugas dibatalkan supaya agent bisa menerima pekerjaan baru.';
  for r in
    update public.hc_plan_tasks
    set col = 'failed', result = msg, result_at = now(), updated_at = now()
    where kind = 'ai' and col = 'doing' and updated_at < now() - make_interval(mins => greatest(coalesce(p_minutes, 30), 5))
    returning id, title, who, source_thread_id, created_by
  loop
    n := n + 1;
    insert into public.hc_agent_messages (thread_id, role, content, meta)
    select t.id, 'system', left(r.title || ': ' || msg, 2000),
           jsonb_build_object('skip', true, 'kind', 'failed', 'task_id', r.id)
    from public.hc_agent_threads t
    where t.task_id = r.id or t.id = r.source_thread_id;
  end loop;
  return n;
end $$;
revoke all on function public.hc_release_stale_agent_tasks(int) from public, anon, authenticated;
grant execute on function public.hc_release_stale_agent_tasks(int) to service_role;

-- hasil yang sudah tersimpan tapi tidak pernah masuk chat: buat/lengkapi thread tugas
do $$
declare
  r record;
  tid uuid;
  uid uuid;
begin
  for r in
    select * from public.hc_plan_tasks
    where kind = 'ai' and col = 'done' and coalesce(btrim(result), '') <> ''
  loop
    select id into tid from public.hc_agent_threads where task_id = r.id limit 1;
    if tid is null then
      uid := coalesce(r.created_by, r.updated_by);
      if uid is null then continue; end if;
      insert into public.hc_agent_threads (agent_id, user_id, title, task_id)
      values (r.who, uid, left('Hasil: ' || r.title, 120), r.id)
      returning id into tid;
    end if;
    if exists (
      select 1 from public.hc_agent_messages m
      where m.thread_id = tid and m.role = 'agent'
        and (m.meta ->> 'kind' = 'result' or left(m.content, 80) = left(r.result, 80))
    ) then
      continue;
    end if;
    insert into public.hc_agent_messages (thread_id, role, content, meta)
    values (
      tid, 'agent', left(r.result, 20000),
      jsonb_build_object('skip', true, 'kind', 'result', 'task_id', r.id, 'backfill', true)
    );
    update public.hc_agent_threads set updated_at = now() where id = tid;
  end loop;
end $$;
