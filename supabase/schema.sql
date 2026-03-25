-- ============================================================
-- RoastMyCode — Supabase Schema
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
create type plan_id as enum ('free', 'pro', 'team');
create type review_status as enum ('pending', 'processing', 'complete', 'failed');
create type severity_level as enum ('critical', 'high', 'medium', 'low', 'info');
create type language_type as enum (
  'javascript', 'typescript', 'python', 'rust',
  'go', 'java', 'cpp', 'c', 'csharp',
  'html', 'css', 'sql', 'bash', 'other'
);

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id                          uuid primary key references auth.users(id) on delete cascade,
  email                       text not null unique,
  full_name                   text,
  avatar_url                  text,
  plan                        plan_id not null default 'free',
  stripe_customer_id          text unique,
  stripe_subscription_id      text unique,
  reviews_used_this_month     integer not null default 0,
  reviews_limit               integer not null default 3,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

alter table public.users enable row level security;
create policy "Users can view own profile"   on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- ============================================================
-- CODE REVIEWS
-- ============================================================
create table public.reviews (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.users(id) on delete cascade,
  title             text not null default 'Untitled Review',
  language          language_type not null default 'other',
  original_code     text not null,
  refactored_code   text,
  status            review_status not null default 'pending',
  model_used        text not null default 'openai/gpt-4o',
  -- parsed output stored as jsonb for flexibility
  overall_score     integer check (overall_score between 0 and 100),
  summary           text,
  issues            jsonb not null default '[]',
  suggestions       jsonb not null default '[]',
  security_findings jsonb not null default '[]',
  performance_notes jsonb not null default '[]',
  -- metadata
  lines_of_code     integer not null default 0,
  tokens_used       integer not null default 0,
  credits_charged   integer not null default 1,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.reviews enable row level security;
create policy "Users view own reviews"   on public.reviews for select using (auth.uid() = user_id);
create policy "Users insert own reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users update own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Users delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- Index for fast user review queries
create index idx_reviews_user_id     on public.reviews(user_id);
create index idx_reviews_created_at  on public.reviews(created_at desc);
create index idx_reviews_status      on public.reviews(status);
create index idx_reviews_language    on public.reviews(language);

-- ============================================================
-- CREDIT TRANSACTIONS
-- ============================================================
create table public.credit_transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  amount      integer not null,   -- positive = credit, negative = debit
  description text not null,
  review_id   uuid references public.reviews(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.credit_transactions enable row level security;
create policy "Users view own transactions" on public.credit_transactions for select using (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at   before update on public.users   for each row execute procedure public.handle_updated_at();
create trigger reviews_updated_at before update on public.reviews for each row execute procedure public.handle_updated_at();

-- Monthly review counter reset (call via pg_cron or Supabase Edge Function)
create or replace function public.reset_monthly_review_counts()
returns void language plpgsql security definer as $$
begin
  update public.users set reviews_used_this_month = 0;
end;
$$;

-- Increment review usage atomically
create or replace function public.increment_review_usage(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.users
  set reviews_used_this_month = reviews_used_this_month + 1
  where id = p_user_id;
end;
$$;

-- ============================================================
-- VIEWS
-- ============================================================

-- Dashboard stats view
create or replace view public.user_review_stats as
select
  u.id as user_id,
  count(r.id) as total_reviews,
  count(r.id) filter (where r.created_at >= date_trunc('month', now())) as reviews_this_month,
  round(avg(r.overall_score)) as avg_score,
  sum(jsonb_array_length(r.issues)) as total_issues,
  sum(jsonb_array_length(r.security_findings)) as total_security_findings,
  u.reviews_used_this_month,
  u.reviews_limit
from public.users u
left join public.reviews r on r.user_id = u.id and r.status = 'complete'
group by u.id, u.reviews_used_this_month, u.reviews_limit;