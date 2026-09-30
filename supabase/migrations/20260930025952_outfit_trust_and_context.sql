-- A saved combination can belong to several occasions. Upgrade existing keys
-- in place so cached legacy IDs can be imported into the new format.
-- New Supabase projects can opt out of default Data API grants. Keep access
-- explicit; existing row level security policies still determine ownership.
revoke all on public.profiles, public.style_profiles, public.garments,
  public.outfits, public.outfit_items, public.recommendation_sessions,
  public.recommendation_feedback, public.wear_events from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.style_profiles to authenticated;
grant select, insert, update, delete on public.garments, public.outfits to authenticated;
grant select, insert, delete on public.outfit_items, public.recommendation_sessions,
  public.recommendation_feedback, public.wear_events to authenticated;
drop policy "saved_looks_insert_own" on public.saved_looks;
alter table public.saved_looks drop constraint if exists saved_looks_garment_ids_check;
alter table public.saved_looks drop constraint if exists saved_looks_look_key_check;
alter table public.saved_looks add constraint saved_looks_garment_ids_check
  check (cardinality(garment_ids) between 3 and 6);
alter table public.saved_looks add constraint saved_looks_look_key_check
  check (char_length(look_key) between 1 and 500);
alter table public.saved_looks add column requirements jsonb not null default '{}'::jsonb
  check (jsonb_typeof(requirements) = 'object');
update public.saved_looks set look_key = look_key || '@' || occasion
  where look_key not like '%@%';
create policy "saved_looks_insert_own" on public.saved_looks for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and look_key = array_to_string(
    (select array_agg(item_id order by item_id) from unnest(garment_ids) as items(item_id)), ':'
  ) || '@' || occasion
  and cardinality(garment_ids) = (select count(distinct item_id) from unnest(garment_ids) as items(item_id))
  and not exists (
    select 1 from unnest(garment_ids) selected(id)
    where not exists (select 1 from public.garments g
      where g.id = selected.id and g.user_id = (select auth.uid()))
  )
);

-- One request ID survives an ambiguous network result. Serialize identical
-- requests before checking the receipt, so retrying never increments twice.
alter table public.wear_events add column request_id uuid;
create unique index wear_events_user_request_unique on public.wear_events(user_id, request_id)
  where request_id is not null;
drop function public.record_outfit_wear(uuid[], text, smallint, text, jsonb);
create function public.record_outfit_wear(
  p_garment_ids uuid[],
  p_occasion text,
  p_recommendation_score smallint,
  p_explanation text,
  p_context jsonb,
  p_request_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_outfit_id uuid;
  v_owned_count integer;
  v_requested_count integer;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_request_id is null then raise exception 'Request ID required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || p_request_id::text, 0));
  select outfit_id into v_outfit_id from public.wear_events
  where user_id = v_user_id and request_id = p_request_id;
  if found then return v_outfit_id; end if;

  v_requested_count := coalesce(cardinality(p_garment_ids), 0);
  if v_requested_count < 3 or v_requested_count > 6 then
    raise exception 'An outfit must contain three to six garments';
  end if;
  if p_recommendation_score is null or p_recommendation_score < 0 or p_recommendation_score > 100 then
    raise exception 'Recommendation score must be between 0 and 100';
  end if;
  select count(*) into v_owned_count from public.garments
  where user_id = v_user_id and id = any(p_garment_ids);
  if v_owned_count <> v_requested_count then
    raise exception 'Outfit contains an unowned or duplicate garment';
  end if;

  insert into public.outfits (user_id, occasion, recommendation_score, explanation, source)
  values (v_user_id, p_occasion, p_recommendation_score, p_explanation, 'recommendation')
  returning id into v_outfit_id;
  insert into public.outfit_items (outfit_id, garment_id, position)
  select v_outfit_id, garment_id, ordinality::smallint
  from unnest(p_garment_ids) with ordinality as selected(garment_id, ordinality);
  insert into public.wear_events (user_id, outfit_id, context, request_id)
  values (v_user_id, v_outfit_id, coalesce(p_context, '{}'::jsonb), p_request_id);
  insert into public.recommendation_feedback (user_id, outfit_id, signal)
  values (v_user_id, v_outfit_id, 'wear');
  update public.garments set wear_count = wear_count + 1, last_worn_at = now()
  where user_id = v_user_id and id = any(p_garment_ids);
  return v_outfit_id;
end;
$$;
revoke all on function public.record_outfit_wear(uuid[], text, smallint, text, jsonb, uuid) from public, anon;
grant execute on function public.record_outfit_wear(uuid[], text, smallint, text, jsonb, uuid) to authenticated;
