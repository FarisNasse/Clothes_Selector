-- Clothes Selector / Wardrobe Intelligence initial production schema.
-- Principle: every user-owned row carries a user_id and is protected with RLS.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.style_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_fits text[] not null default '{}',
  style_weights jsonb not null default '{}'::jsonb,
  disliked_colors text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('top', 'bottom', 'outerwear', 'footwear', 'accessory', 'suit')),
  subcategory text not null check (char_length(subcategory) between 1 and 80),
  name text not null check (char_length(name) between 1 and 120),
  brand text,
  primary_color text not null,
  secondary_colors text[] not null default '{}',
  pattern text not null default 'solid',
  materials text[] not null default '{}',
  fit text not null check (fit in ('slim', 'tailored', 'regular', 'relaxed', 'oversized')),
  formality smallint not null check (formality between 1 and 10),
  warmth smallint not null check (warmth between 1 and 10),
  waterproof boolean not null default false,
  seasons text[] not null default '{all-season}',
  style_tags text[] not null default '{}',
  storage_path text,
  purchase_price numeric(12,2) check (purchase_price is null or purchase_price >= 0),
  purchase_date date,
  condition text not null default 'good',
  wear_count integer not null default 0 check (wear_count >= 0),
  last_worn_at timestamptz,
  ai_confidence numeric(4,3) check (ai_confidence is null or ai_confidence between 0 and 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, storage_path)
);

create index garments_user_category_idx on public.garments(user_id, category);
create index garments_user_last_worn_idx on public.garments(user_id, last_worn_at);
create index garments_style_tags_idx on public.garments using gin(style_tags);

create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  occasion text,
  recommendation_score smallint check (recommendation_score is null or recommendation_score between 0 and 100),
  explanation text,
  source text not null default 'recommendation' check (source in ('recommendation', 'manual', 'saved')),
  created_at timestamptz not null default now()
);

create index outfits_user_created_idx on public.outfits(user_id, created_at desc);

create table public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  garment_id uuid not null references public.garments(id) on delete cascade,
  position smallint not null default 0,
  primary key (outfit_id, garment_id)
);

create table public.recommendation_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  occasion text not null,
  context jsonb not null default '{}'::jsonb,
  candidate_count integer not null default 0 check (candidate_count >= 0),
  created_at timestamptz not null default now()
);

create index recommendation_sessions_user_created_idx
  on public.recommendation_sessions(user_id, created_at desc);

create table public.recommendation_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_session_id uuid references public.recommendation_sessions(id) on delete cascade,
  outfit_id uuid references public.outfits(id) on delete set null,
  signal text not null check (signal in ('love', 'like', 'not_for_me', 'swap', 'save', 'wear')),
  reason text,
  created_at timestamptz not null default now()
);

create index recommendation_feedback_user_created_idx
  on public.recommendation_feedback(user_id, created_at desc);

create table public.wear_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  outfit_id uuid references public.outfits(id) on delete set null,
  worn_at timestamptz not null default now(),
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index wear_events_user_worn_idx on public.wear_events(user_id, worn_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger style_profiles_set_updated_at
before update on public.style_profiles
for each row execute procedure public.set_updated_at();

create trigger garments_set_updated_at
before update on public.garments
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.style_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.style_profiles enable row level security;
alter table public.garments enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.recommendation_sessions enable row level security;
alter table public.recommendation_feedback enable row level security;
alter table public.wear_events enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "style_profiles_select_own" on public.style_profiles for select using (auth.uid() = user_id);
create policy "style_profiles_insert_own" on public.style_profiles for insert with check (auth.uid() = user_id);
create policy "style_profiles_update_own" on public.style_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "garments_select_own" on public.garments for select using (auth.uid() = user_id);
create policy "garments_insert_own" on public.garments for insert with check (auth.uid() = user_id);
create policy "garments_update_own" on public.garments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "garments_delete_own" on public.garments for delete using (auth.uid() = user_id);

create policy "outfits_select_own" on public.outfits for select using (auth.uid() = user_id);
create policy "outfits_insert_own" on public.outfits for insert with check (auth.uid() = user_id);
create policy "outfits_update_own" on public.outfits for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "outfits_delete_own" on public.outfits for delete using (auth.uid() = user_id);

create policy "outfit_items_select_own" on public.outfit_items for select
using (exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid()));
create policy "outfit_items_insert_own" on public.outfit_items for insert
with check (
  exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid())
  and exists (select 1 from public.garments g where g.id = garment_id and g.user_id = auth.uid())
);
create policy "outfit_items_delete_own" on public.outfit_items for delete
using (exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid()));

create policy "recommendation_sessions_select_own" on public.recommendation_sessions for select using (auth.uid() = user_id);
create policy "recommendation_sessions_insert_own" on public.recommendation_sessions for insert with check (auth.uid() = user_id);
create policy "recommendation_sessions_delete_own" on public.recommendation_sessions for delete using (auth.uid() = user_id);

create policy "recommendation_feedback_select_own" on public.recommendation_feedback for select using (auth.uid() = user_id);
create policy "recommendation_feedback_insert_own" on public.recommendation_feedback for insert with check (auth.uid() = user_id);
create policy "recommendation_feedback_delete_own" on public.recommendation_feedback for delete using (auth.uid() = user_id);

create policy "wear_events_select_own" on public.wear_events for select using (auth.uid() = user_id);
create policy "wear_events_insert_own" on public.wear_events for insert with check (auth.uid() = user_id);
create policy "wear_events_delete_own" on public.wear_events for delete using (auth.uid() = user_id);
