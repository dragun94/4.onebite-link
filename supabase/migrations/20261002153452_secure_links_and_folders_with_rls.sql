alter table public.folders enable row level security;
alter table public.links enable row level security;

-- Only signed-in users need API access to these tables.
revoke all on table public.folders, public.links from anon, authenticated;
grant select, insert, delete on table public.folders, public.links to authenticated;

-- Grant updates only to editable fields; user_id cannot be reassigned.
grant update (name) on table public.folders to authenticated;
grant update (url, title, description, thumbnail1_url, folder_id)
  on table public.links to authenticated;

create policy folders_select_own on public.folders
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy folders_insert_own on public.folders
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy folders_update_own on public.folders
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy folders_delete_own on public.folders
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy links_select_own on public.links
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy links_insert_own on public.links
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy links_update_own on public.links
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy links_delete_own on public.links
  for delete to authenticated
  using (user_id = (select auth.uid()));
