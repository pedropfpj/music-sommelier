-- A retry after a lost HTTP response must not post the same comment twice.
begin;
alter table public.comments add column if not exists client_request_id uuid;
create unique index if not exists comments_client_request_unique
  on public.comments(user_id, client_request_id);
notify pgrst, 'reload schema';
commit;
