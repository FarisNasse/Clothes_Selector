-- Persist the product's north-star event atomically.
-- One RPC creates the accepted outfit, records its items, logs the wear event,
-- captures feedback, and increments garment utilization.

create or replace function public.record_outfit_wear(
  p_garment_ids uuid[],
  p_occasion text,
  p_recommendation_score smallint,
  p_explanation text,
  p_context jsonb default '{}'::jsonb
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
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  v_requested_count := coalesce(cardinality(p_garment_ids), 0);
  if v_requested_count < 2 then
    raise exception 'An outfit must contain at least two garments';
  end if;

  if p_recommendation_score < 0 or p_recommendation_score > 100 then
    raise exception 'Recommendation score must be between 0 and 100';
  end if;

  select count(*)
    into v_owned_count
  from public.garments
  where user_id = v_user_id
    and id = any(p_garment_ids);

  if v_owned_count <> v_requested_count then
    raise exception 'Outfit contains a garment not owned by the current user';
  end if;

  insert into public.outfits (
    user_id,
    occasion,
    recommendation_score,
    explanation,
    source
  ) values (
    v_user_id,
    p_occasion,
    p_recommendation_score,
    p_explanation,
    'recommendation'
  )
  returning id into v_outfit_id;

  insert into public.outfit_items (outfit_id, garment_id, position)
  select v_outfit_id, garment_id, ordinality::smallint
  from unnest(p_garment_ids) with ordinality as selected(garment_id, ordinality);

  insert into public.wear_events (user_id, outfit_id, context)
  values (v_user_id, v_outfit_id, coalesce(p_context, '{}'::jsonb));

  insert into public.recommendation_feedback (user_id, outfit_id, signal)
  values (v_user_id, v_outfit_id, 'wear');

  update public.garments
  set
    wear_count = wear_count + 1,
    last_worn_at = now()
  where user_id = v_user_id
    and id = any(p_garment_ids);

  return v_outfit_id;
end;
$$;

revoke all on function public.record_outfit_wear(uuid[], text, smallint, text, jsonb) from public;
revoke all on function public.record_outfit_wear(uuid[], text, smallint, text, jsonb) from anon;
grant execute on function public.record_outfit_wear(uuid[], text, smallint, text, jsonb) to authenticated;
