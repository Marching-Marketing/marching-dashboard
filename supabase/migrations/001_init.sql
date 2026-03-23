-- Enable UUID extension
create extension if not exists "pgcrypto";

-- clients table
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- meta_tokens table (one token per client)
create table if not exists meta_tokens (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  encrypted_token text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(client_id)
);

-- daily_metrics table
create table if not exists daily_metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  date date not null,
  impressions bigint not null default 0,
  clicks bigint not null default 0,
  spend numeric(12,2) not null default 0,
  leads bigint,
  conversions bigint,
  created_at timestamptz not null default now(),
  unique(client_id, date)
);

-- Indexes for common queries
create index if not exists daily_metrics_client_date on daily_metrics(client_id, date desc);
