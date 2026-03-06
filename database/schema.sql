create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  price integer not null,
  stock integer not null default 0,
  category text not null default 'Umum',
  image text,
  description text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
