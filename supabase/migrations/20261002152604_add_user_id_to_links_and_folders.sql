-- Existing rows have no owner, so remove them before requiring user_id.
delete from public.links;
delete from public.folders;

alter table public.folders
  add column user_id uuid not null default auth.uid()
  references auth.users (id) on delete cascade;

alter table public.links
  add column user_id uuid not null default auth.uid()
  references auth.users (id) on delete cascade;

create index folders_user_id_idx on public.folders (user_id);
create index links_user_id_idx on public.links (user_id);
