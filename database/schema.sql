create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text default '',
  price integer not null default 0,
  stock integer not null default 0,
  image_url text default '',
  description text default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy if not exists "Public can read published products"
on public.products
for select
using (is_published = true);
