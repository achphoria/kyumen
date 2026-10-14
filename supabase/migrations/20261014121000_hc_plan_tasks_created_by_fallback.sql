-- Kyumen: tugas dari Edge Function (service role, tanpa auth.uid) -> pembuat diambil dari updated_by,
-- supaya tugas yang dibuat lewat Ruang Kerja muncul di Portal saya.
create or replace function public.hc_plan_tasks_people()
returns trigger language plpgsql security definer set search_path to '' as $$
begin
  if tg_op = 'INSERT' and new.created_by is null then
    new.created_by := coalesce(auth.uid(), new.updated_by);
  end if;
  if new.kind = 'human' and (new.assignee is null or (tg_op = 'UPDATE' and new.who is distinct from old.who and new.assignee is not distinct from old.assignee)) then
    select p.id into new.assignee from public.hc_profiles p where lower(trim(p.name)) = lower(trim(new.who)) limit 1;
  end if;
  return new;
end $$;
