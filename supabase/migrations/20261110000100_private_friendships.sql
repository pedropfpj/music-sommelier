-- Private mutual friendships are independent of public follows and profile visibility.
begin;
create table if not exists public.friend_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check(char_length(display_name) between 1 and 80 and position('@' in display_name)=0),
  username text not null default '' check(username='' or username ~ '^[a-z0-9][a-z0-9_]{2,29}$'),
  updated_at timestamptz not null default now()
);
create table if not exists public.friend_edges (
  id uuid primary key default gen_random_uuid(),
  user_low uuid not null references auth.users(id) on delete cascade,
  user_high uuid not null references auth.users(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  status text not null check(status in ('pending','accepted')),
  via_invite boolean not null default false,
  created_at timestamptz not null default now(), accepted_at timestamptz,
  unique(user_low,user_high), check(user_low < user_high),
  check(requester_id in (user_low,user_high)),
  check((status='pending' and accepted_at is null) or (status='accepted' and accepted_at is not null))
);
create index if not exists friend_edges_high_idx on public.friend_edges(user_high,status);
create table if not exists public.friend_invites (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
  client_request_id uuid not null, created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '7 days'), revoked_at timestamptz,
  unique(user_id,client_request_id)
);
create table if not exists public.friend_posts (
  id uuid primary key default gen_random_uuid(), author_id uuid not null references auth.users(id) on delete cascade,
  client_request_id uuid not null, track jsonb not null check(jsonb_typeof(track)='object'),
  body text not null default '' check(char_length(body)<=280),
  created_at timestamptz not null default now(), deleted_at timestamptz,
  unique(author_id,client_request_id)
);
create index if not exists friend_posts_feed_idx on public.friend_posts(author_id,created_at desc) where deleted_at is null;
create table if not exists public.friend_operations (
  user_id uuid not null references auth.users(id) on delete cascade, request_id uuid not null,
  action text not null, input jsonb not null, result jsonb not null, created_at timestamptz not null default now(),
  primary key(user_id,request_id)
);
-- Versioned mirrors of the existing private moderation block files. Older reads
-- cannot undo a newer block, and a block transaction removes accepted/pending edges.
create table if not exists public.friend_block_states (
  user_id uuid primary key references auth.users(id) on delete cascade,
  blocked_ids uuid[] not null default '{}', source_updated_at timestamptz not null
);
create table if not exists public.friend_request_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null, request_count integer not null check(request_count>0), primary key(user_id,usage_day)
);
do $$ declare t text; begin
  foreach t in array array['friend_settings','friend_edges','friend_invites','friend_posts','friend_operations','friend_block_states','friend_request_usage'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from public,anon,authenticated',t);
    execute format('grant select,insert,update,delete on public.%I to service_role',t);
    execute format('drop policy if exists friends_backend_only on public.%I',t);
    execute format('create policy friends_backend_only on public.%I as restrictive for all to anon,authenticated using(false) with check(false)',t);
  end loop;
end $$;

create or replace function public.sonic_friend_consume_request_budget(p_user_id uuid,p_daily_limit integer)
returns jsonb language plpgsql set search_path=pg_catalog,public as $$
declare day_key date:=(clock_timestamp() at time zone 'UTC')::date; used integer;
begin
 if p_user_id is null or p_daily_limit is null or p_daily_limit<1 or p_daily_limit>10000 then raise exception 'invalid_friends_budget'; end if;
 delete from public.friend_request_usage where user_id=p_user_id and usage_day<day_key-30;
 insert into public.friend_request_usage as u(user_id,usage_day,request_count) values(p_user_id,day_key,1)
 on conflict(user_id,usage_day) do update set request_count=u.request_count+1 where u.request_count<p_daily_limit returning request_count into used;
 return jsonb_build_object('allowed',used is not null,'remaining',case when used is null then 0 else greatest(0,p_daily_limit-used) end);
end $$;

create or replace function public.sonic_friend_blocked(a uuid,b uuid) returns boolean
language sql stable set search_path=pg_catalog,public as $$
  select exists(select 1 from public.friend_block_states where (user_id=a and b=any(blocked_ids)) or (user_id=b and a=any(blocked_ids)));
$$;
create or replace function public.sonic_friend_pair_lock(a uuid,b uuid) returns void
language sql set search_path=pg_catalog,public as $$
  select pg_advisory_xact_lock(hashtextextended('sonic-friend-pair:'||least(a,b)::text||':'||greatest(a,b)::text,0));
$$;
create or replace function public.sonic_friend_sync_blocks(p_user_id uuid,p_blocked_ids uuid[],p_updated_at timestamptz)
returns jsonb language plpgsql set search_path=pg_catalog,public as $$
declare other uuid;
begin
  if p_user_id is null or p_updated_at is null or cardinality(p_blocked_ids)>500 then raise exception 'invalid_block_state'; end if;
  insert into public.friend_block_states as s(user_id,blocked_ids,source_updated_at)
  values(p_user_id,coalesce(p_blocked_ids,'{}'),p_updated_at)
  on conflict(user_id) do update set blocked_ids=case when s.source_updated_at=excluded.source_updated_at
      then array(select distinct unnest(s.blocked_ids||excluded.blocked_ids)) else excluded.blocked_ids end,
    source_updated_at=excluded.source_updated_at
    where s.source_updated_at<=excluded.source_updated_at;
  for other in select distinct target from (
    select unnest(coalesce(p_blocked_ids,'{}'::uuid[])) target
    union select case when user_low=p_user_id then user_high else user_low end
    from public.friend_edges where (user_low=p_user_id or user_high=p_user_id)) targets
    where target<>p_user_id order by target loop
    perform public.sonic_friend_pair_lock(p_user_id,other);
  end loop;
  delete from public.friend_edges where (user_low=p_user_id or user_high=p_user_id)
    and public.sonic_friend_blocked(user_low,user_high);
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.sonic_friend_person(p_user_id uuid,p_friends_identity boolean default false)
returns jsonb language sql stable set search_path=pg_catalog,public as $$
  select jsonb_build_object('id',p_user_id,'displayName',coalesce(
    (select display_name from public.friend_settings where user_id=p_user_id and p_friends_identity),
    (select case when position('@' in display_name)=0 then display_name end from public.profiles where id=p_user_id and profile_public and profile_link_public),
    'Sonic listener'),'username',coalesce(
    (select case when s.username=p.username then s.username else '' end from public.friend_settings s left join public.profiles p on p.id=s.user_id where s.user_id=p_user_id and p_friends_identity),
    (select case when username ~ '^[a-z0-9][a-z0-9_]{2,29}$' then username end from public.profiles where id=p_user_id and profile_public and profile_link_public),''),'avatarUrl','');
$$;
create or replace function public.sonic_friend_relation(p_actor_id uuid,p_other_id uuid)
returns jsonb language sql stable set search_path=pg_catalog,public as $$
 select coalesce((select jsonb_build_object('relationship',case when status='accepted' then 'accepted' when requester_id=p_actor_id then 'outgoing' else 'incoming' end,'relationshipId',id)
 from public.friend_edges where user_low=least(p_actor_id,p_other_id) and user_high=greatest(p_actor_id,p_other_id)),jsonb_build_object('relationship','none'));
$$;
create or replace function public.sonic_friend_post_json(p_post public.friend_posts,p_actor_id uuid)
returns jsonb language sql stable set search_path=pg_catalog,public as $$
 select jsonb_build_object('id',p_post.id,'author',public.sonic_friend_person(p_post.author_id,true),'track',p_post.track,
 'text',p_post.body,'createdAt',p_post.created_at,'mine',p_post.author_id=p_actor_id,'audience','friends');
$$;

create or replace function public.sonic_friends_view(p_actor_id uuid,p_action text,p_query text default '',p_token_hash text default '')
returns jsonb language plpgsql set search_path=pg_catalog,public as $$
declare owner_id uuid; result jsonb;
begin
 if p_actor_id is null then raise exception 'login_required'; end if;
 if p_action='candidates' then
   return coalesce((select jsonb_agg(other) from (select distinct case when user_low=p_actor_id then user_high else user_low end other from public.friend_edges where user_low=p_actor_id or user_high=p_actor_id) s),'[]');
 elsif p_action='search-candidates' or p_action='search' then
   if char_length(trim(p_query))<2 then return '[]'; end if;
   select coalesce(jsonb_agg(value),'[]') into result from (
     select case when p_action='search-candidates' then to_jsonb(id) else public.sonic_friend_person(id,false)||public.sonic_friend_relation(p_actor_id,id) end value
     from public.profiles where id<>p_actor_id and profile_public and profile_link_public
       and (strpos(lower(username),lower(trim(p_query)))>0 or (position('@' in display_name)=0 and strpos(lower(display_name),lower(trim(p_query)))>0))
       and not public.sonic_friend_blocked(p_actor_id,id) order by username limit 20) s;
   return result;
 elsif p_action='request-candidate' then
   select id into owner_id from public.profiles where id::text=p_query and profile_public and profile_link_public;
   if owner_id is null then select user_id into owner_id from public.friend_invites where user_id::text=p_query and token_hash=p_token_hash and revoked_at is null and expires_at>now(); end if;
   if owner_id is null or owner_id=p_actor_id or public.sonic_friend_blocked(p_actor_id,owner_id) then raise exception 'person_not_found'; end if;
   return to_jsonb(owner_id);
 elsif p_action='invite-candidate' or p_action='invite' then
   select user_id into owner_id from public.friend_invites where token_hash=p_token_hash and revoked_at is null and expires_at>now();
   if owner_id is null or owner_id=p_actor_id or public.sonic_friend_blocked(p_actor_id,owner_id) then raise exception 'invite_not_found'; end if;
   if p_action='invite-candidate' then return to_jsonb(owner_id); end if;
   return jsonb_build_object('person',public.sonic_friend_person(owner_id,true))||public.sonic_friend_relation(p_actor_id,owner_id);
 elsif p_action='overview' then
   return jsonb_build_object('me',jsonb_build_object('enabled',exists(select 1 from public.friend_settings where user_id=p_actor_id),'identity',
     coalesce((select public.sonic_friend_person(p_actor_id,true) from public.friend_settings where user_id=p_actor_id),
       (select jsonb_build_object('id',p_actor_id,'displayName',case when position('@' in display_name)=0 and display_name<>'Sonic listener' then display_name else '' end,
       'username',case when username ~ '^[a-z0-9][a-z0-9_]{2,29}$' and username<>'sonic_user' then username else '' end,'avatarUrl','') from public.profiles where id=p_actor_id),
       jsonb_build_object('id',p_actor_id,'displayName','','username','','avatarUrl',''))),
   'friends',coalesce((select jsonb_agg(public.sonic_friend_person(case when user_low=p_actor_id then user_high else user_low end,true)||jsonb_build_object('relationshipId',id)) from public.friend_edges where (user_low=p_actor_id or user_high=p_actor_id) and status='accepted' and not public.sonic_friend_blocked(user_low,user_high)),'[]'),
   'incoming',coalesce((select jsonb_agg(jsonb_build_object('id',id,'person',public.sonic_friend_person(requester_id,true),'createdAt',created_at)) from public.friend_edges where (user_low=p_actor_id or user_high=p_actor_id) and status='pending' and requester_id<>p_actor_id and not public.sonic_friend_blocked(user_low,user_high)),'[]'),
   'outgoing',coalesce((select jsonb_agg(jsonb_build_object('id',id,'person',public.sonic_friend_person(case when user_low=p_actor_id then user_high else user_low end,via_invite),'createdAt',created_at)) from public.friend_edges where (user_low=p_actor_id or user_high=p_actor_id) and status='pending' and requester_id=p_actor_id and not public.sonic_friend_blocked(user_low,user_high)),'[]'),
   'invites',coalesce((select jsonb_agg(jsonb_build_object('id',id,'createdAt',created_at,'expiresAt',expires_at)) from public.friend_invites where user_id=p_actor_id and revoked_at is null and expires_at>now()),'[]'));
 elsif p_action='feed' or p_action='post' then
   select coalesce(jsonb_agg(value),'[]') into result from (
    select public.sonic_friend_post_json(p,p_actor_id) value from public.friend_posts p
    where deleted_at is null and (p_action='feed' or p.id::text=p_query)
      and (author_id=p_actor_id or (not public.sonic_friend_blocked(p_actor_id,author_id) and exists(
        select 1 from public.friend_edges where user_low=least(p_actor_id,author_id) and user_high=greatest(p_actor_id,author_id) and status='accepted')))
    order by created_at desc,id desc limit 40) s;
   if p_action='post' then
     if jsonb_array_length(result)=0 then raise exception 'post_not_found'; end if;
     return result->0;
   end if;
   return result;
 end if;
 raise exception 'invalid_action';
end $$;

create or replace function public.sonic_friends_mutate(p_actor_id uuid,p_action text,p_other_id uuid default null,p_payload jsonb default '{}')
returns jsonb language plpgsql set search_path=pg_catalog,public as $$
declare edge public.friend_edges; op public.friend_operations; post public.friend_posts; inv public.friend_invites;
 v_request_id uuid; result jsonb; input jsonb; invite_ok boolean:=false; candidate_username text;
begin
 if p_actor_id is null then raise exception 'login_required'; end if;
 -- Lock participating accounts in one order, including crossed requests and
 -- quota checks. Pair locks also synchronize with the moderation block hook.
 perform pg_advisory_xact_lock(hashtextextended('sonic-friend-account:'||least(p_actor_id,coalesce(p_other_id,p_actor_id))::text,0));
 if p_other_id is not null and p_other_id<>p_actor_id then
   perform pg_advisory_xact_lock(hashtextextended('sonic-friend-account:'||greatest(p_actor_id,p_other_id)::text,0));
 end if;
 if p_action in ('request','create-invite') then
   v_request_id:=(p_payload->>'clientRequestId')::uuid;
   if v_request_id is null then raise exception 'invalid_request_id'; end if;
   perform pg_advisory_xact_lock(hashtextextended('sonic-friend-op:'||p_actor_id::text||':'||v_request_id::text,0));
   input:=jsonb_build_object('other',p_other_id,'payload',p_payload);
   select * into op from public.friend_operations where user_id=p_actor_id and request_id=v_request_id;
   if found then
     if op.action<>p_action or op.input<>input then raise exception 'request_conflict'; end if;
     if p_action='request' then return public.sonic_friend_relation(p_actor_id,p_other_id); end if;
     if p_action='create-invite' and not exists(select 1 from public.friend_invites where user_id=p_actor_id and client_request_id=v_request_id and revoked_at is null and expires_at>now()) then raise exception 'invite_not_found'; end if;
     return op.result;
   end if;
 end if;
 if p_other_id is not null then
   if p_actor_id=p_other_id then raise exception 'person_not_found'; end if;
   perform public.sonic_friend_pair_lock(p_actor_id,p_other_id);
   if public.sonic_friend_blocked(p_actor_id,p_other_id) then raise exception 'person_not_found'; end if;
   select * into edge from public.friend_edges where user_low=least(p_actor_id,p_other_id) and user_high=greatest(p_actor_id,p_other_id) for update;
 end if;
 if p_action='settings' then
   select case when username ~ '^[a-z0-9][a-z0-9_]{2,29}$' then username else '' end into candidate_username from public.profiles where id=p_actor_id;
   if coalesce(p_payload->>'username','')<>'' and coalesce(p_payload->>'username','')<>coalesce(candidate_username,'') then raise exception 'invalid_settings'; end if;
   insert into public.friend_settings(user_id,display_name,username) values(p_actor_id,p_payload->>'displayName',coalesce(p_payload->>'username',''))
    on conflict(user_id) do update set display_name=excluded.display_name,username=excluded.username,updated_at=now();
   return jsonb_build_object('me',jsonb_build_object('enabled',true,'identity',public.sonic_friend_person(p_actor_id,true)));
 elsif p_action='request' then
   if not exists(select 1 from public.friend_settings where user_id=p_actor_id) then raise exception 'friends_identity_required'; end if;
   invite_ok:=exists(select 1 from public.friend_invites where user_id=p_other_id and token_hash=p_payload->>'inviteHash' and revoked_at is null and expires_at>now());
   if p_other_id is null or (not invite_ok and not exists(select 1 from public.profiles where id=p_other_id and profile_public and profile_link_public)) then raise exception 'person_not_found'; end if;
   if edge.id is null then
     if (select count(*) from public.friend_edges where requester_id=p_actor_id and status='pending')>=40 then raise exception 'friends_limit_reached'; end if;
     if (select count(*) from public.friend_edges where (user_low=p_other_id or user_high=p_other_id) and requester_id<>p_other_id and status='pending')>=50 then raise exception 'friends_limit_reached'; end if;
     insert into public.friend_edges(user_low,user_high,requester_id,status,via_invite) values(least(p_actor_id,p_other_id),greatest(p_actor_id,p_other_id),p_actor_id,'pending',invite_ok) returning * into edge;
   end if;
   result:=public.sonic_friend_relation(p_actor_id,p_other_id);
 elsif p_action in ('cancel','respond','remove') then
   if edge.id is null or edge.id::text<>p_payload->>'relationshipId' then raise exception 'relationship_not_found'; end if;
   if p_action='cancel' then
     if edge.status='pending' and edge.requester_id=p_actor_id then delete from public.friend_edges where id=edge.id; end if;
   elsif p_action='remove' then
     delete from public.friend_edges where id=edge.id;
   elsif p_payload->>'decision'='accept' then
     if edge.requester_id=p_actor_id then raise exception 'relationship_not_found'; end if;
     if not exists(select 1 from public.friend_settings where user_id=p_actor_id) then raise exception 'friends_identity_required'; end if;
     if edge.status='pending' and ((select count(*) from public.friend_edges where (user_low=p_actor_id or user_high=p_actor_id) and status='accepted')>=100
       or (select count(*) from public.friend_edges where (user_low=p_other_id or user_high=p_other_id) and status='accepted')>=100) then raise exception 'friends_limit_reached'; end if;
     update public.friend_edges set status='accepted',accepted_at=coalesce(accepted_at,now()) where id=edge.id;
   elsif p_payload->>'decision'='decline' and edge.status='pending' and edge.requester_id<>p_actor_id then
     delete from public.friend_edges where id=edge.id;
   else raise exception 'relationship_changed'; end if;
   return public.sonic_friend_relation(p_actor_id,p_other_id);
 elsif p_action='create-invite' then
   if not exists(select 1 from public.friend_settings where user_id=p_actor_id) then raise exception 'friends_identity_required'; end if;
   if (select count(*) from public.friend_invites where user_id=p_actor_id and revoked_at is null and expires_at>now())>=5 then raise exception 'friends_limit_reached'; end if;
   insert into public.friend_invites(user_id,token_hash,client_request_id) values(p_actor_id,p_payload->>'tokenHash',v_request_id) returning * into inv;
   result:=jsonb_build_object('invite',jsonb_build_object('id',inv.id,'createdAt',inv.created_at,'expiresAt',inv.expires_at));
 elsif p_action='revoke-invite' then
   update public.friend_invites set revoked_at=coalesce(revoked_at,now()) where user_id=p_actor_id and id::text=p_payload->>'inviteId';
   return '{}'::jsonb;
 elsif p_action='share-track' then
   if not exists(select 1 from public.friend_settings where user_id=p_actor_id) then raise exception 'friends_identity_required'; end if;
   v_request_id:=(p_payload->>'clientRequestId')::uuid;
   if v_request_id is null then raise exception 'invalid_request_id'; end if;
   perform pg_advisory_xact_lock(hashtextextended('sonic-friend-op:'||p_actor_id::text||':'||v_request_id::text,0));
   select * into post from public.friend_posts where author_id=p_actor_id and client_request_id=v_request_id;
   if found then
     if post.track<>p_payload->'track' or post.body<>coalesce(p_payload->>'text','') or post.deleted_at is not null then raise exception 'request_conflict'; end if;
   else
     insert into public.friend_posts(author_id,client_request_id,track,body) values(p_actor_id,v_request_id,p_payload->'track',coalesce(p_payload->>'text','')) returning * into post;
   end if;
   return jsonb_build_object('post',public.sonic_friend_post_json(post,p_actor_id));
 elsif p_action='delete-post' then
   update public.friend_posts set deleted_at=coalesce(deleted_at,now()) where author_id=p_actor_id and id::text=p_payload->>'postId' returning * into post;
   if not found then raise exception 'post_not_found'; end if;
   return '{}'::jsonb;
 else raise exception 'invalid_action'; end if;
 insert into public.friend_operations(user_id,request_id,action,input,result) values(p_actor_id,v_request_id,p_action,input,result);
 return result;
end $$;

-- Helpers are also service-only; no RPC can be used as an enumeration side door.
do $$ declare r record; begin
 for r in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'sonic_friend%' loop
  execute format('revoke all on function %s from public,anon,authenticated',r.signature);
  execute format('grant execute on function %s to service_role',r.signature);
 end loop;
end $$;
notify pgrst,'reload schema';
commit;
