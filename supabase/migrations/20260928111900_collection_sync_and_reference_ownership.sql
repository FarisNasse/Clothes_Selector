-- Record which optional/defaulted details the wearer actually confirmed.
alter table public.garments add column confirmed_fields text[] not null default '{}';
-- Existing non-default values were necessarily selected or imported deliberately.
update public.garments set confirmed_fields = array_remove(array[
  case when fit <> 'regular' then 'fit' end,
  case when formality <> 5 then 'formality' end,
  case when warmth <> 5 then 'warmth' end,
  case when waterproof then 'waterproof' end,
  case when seasons <> array['all-season']::text[] then 'seasons' end
], null);

-- Collections sync per item so a change on one device never overwrites an
-- unrelated favorite or look saved on another device.
create table public.favorite_garments (
  user_id uuid not null references auth.users(id) on delete cascade,
  garment_id uuid not null references public.garments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, garment_id)
);
create table public.saved_looks (
  user_id uuid not null references auth.users(id) on delete cascade,
  look_key text not null check (char_length(look_key) between 1 and 500),
  garment_ids uuid[] not null check (cardinality(garment_ids) between 3 and 5),
  occasion text not null check (occasion in ('everyday', 'work', 'dinner', 'date', 'going_out', 'formal')),
  weather jsonb not null check (jsonb_typeof(weather) = 'object'),
  created_at timestamptz not null default now(),
  primary key (user_id, look_key)
);
create index saved_looks_user_created_idx on public.saved_looks(user_id, created_at desc);
alter table public.favorite_garments enable row level security;
alter table public.saved_looks enable row level security;
revoke all on public.favorite_garments, public.saved_looks from anon, authenticated;
grant select, insert, delete on public.favorite_garments, public.saved_looks to authenticated;

create policy "favorite_select_own" on public.favorite_garments for select to authenticated
using ((select auth.uid()) = user_id);
create policy "favorite_insert_own" on public.favorite_garments for insert to authenticated
with check (
  (select auth.uid()) = user_id and exists (
    select 1 from public.garments g where g.id = garment_id and g.user_id = (select auth.uid())
  )
);
create policy "favorite_delete_own" on public.favorite_garments for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "saved_looks_select_own" on public.saved_looks for select to authenticated
using ((select auth.uid()) = user_id);
create policy "saved_looks_insert_own" on public.saved_looks for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and look_key = array_to_string((select array_agg(item_id order by item_id) from unnest(garment_ids) as items(item_id)), ':')
  and cardinality(garment_ids) = (select count(distinct item_id) from unnest(garment_ids) as items(item_id))
  and not exists (
    select 1 from unnest(garment_ids) selected(id)
    where not exists (
      select 1 from public.garments g
      where g.id = selected.id and g.user_id = (select auth.uid())
    )
  )
);
create policy "saved_looks_delete_own" on public.saved_looks for delete to authenticated
using ((select auth.uid()) = user_id);

-- The original policies checked only the new row's user_id. A supplied
-- outfit/session ID must also belong to the current account.
drop policy "recommendation_feedback_insert_own" on public.recommendation_feedback;
create policy "recommendation_feedback_insert_own" on public.recommendation_feedback
for insert to authenticated with check (
  (select auth.uid()) = user_id
  and (recommendation_session_id is null or exists (
    select 1 from public.recommendation_sessions s
    where s.id = recommendation_session_id and s.user_id = (select auth.uid())
  ))
  and (outfit_id is null or exists (
    select 1 from public.outfits o
    where o.id = outfit_id and o.user_id = (select auth.uid())
  ))
);
drop policy "wear_events_insert_own" on public.wear_events;
create policy "wear_events_insert_own" on public.wear_events
for insert to authenticated with check (
  (select auth.uid()) = user_id
  and (outfit_id is null or exists (
    select 1 from public.outfits o
    where o.id = outfit_id and o.user_id = (select auth.uid())
  ))
);
