-- ============================================================
-- Dukaan — core schema
-- Run this once in Supabase SQL Editor on a fresh project.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- STORES
-- ------------------------------------------------------------
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  storename text not null unique,
  display_name text not null,
  category text,
  theme_id text not null default 'bazaar',
  whatsapp_number text,
  whatsapp_message_template text default
    'Hi {store_name}! I''d like to order:
{items}

Total: {total}

Deliver to: {customer_name}, {customer_phone}
{customer_address}, {customer_zip}',
  meta_pixel_id text,
  banner_images text[] not null default '{}',
  logo_url text,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'expired')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index stores_storename_idx on public.stores (storename);
create index stores_owner_id_idx on public.stores (owner_id);

-- ------------------------------------------------------------
-- PRODUCTS
-- ------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null,
  discount_price numeric(10, 2),
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock', 'out_of_stock')),
  image_url text,
  created_at timestamptz not null default now(),
  constraint discount_lower_than_price
    check (discount_price is null or discount_price < price)
);

create index products_store_id_idx on public.products (store_id);

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  customer_zip text,
  total numeric(10, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create index orders_store_id_idx on public.orders (store_id);

-- ------------------------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------------------------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price numeric(10, 2) not null,
  quantity int not null default 1
);

create index order_items_order_id_idx on public.order_items (order_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- STORES: owners see + edit only their own row
create policy "Owners can view their own store"
  on public.stores for select
  using (auth.uid() = owner_id);

create policy "Owners can update their own store"
  on public.stores for update
  using (auth.uid() = owner_id);

-- STORES: anyone (including anonymous storefront visitors) can view active stores
create policy "Anyone can view active stores"
  on public.stores for select
  using (status = 'active');

-- PRODUCTS: owners manage their own store's products
create policy "Owners can manage their products"
  on public.products for all
  using (
    exists (
      select 1 from public.stores
      where stores.id = products.store_id
      and stores.owner_id = auth.uid()
    )
  );

-- PRODUCTS: anyone can view products belonging to an active store
create policy "Anyone can view products of active stores"
  on public.products for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = products.store_id
      and stores.status = 'active'
    )
  );

-- ORDERS: owners can view orders placed on their store
create policy "Owners can view their orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.stores
      where stores.id = orders.store_id
      and stores.owner_id = auth.uid()
    )
  );

-- ORDERS: anyone can place an order on an active store (anonymous checkout)
create policy "Anyone can create an order on an active store"
  on public.orders for insert
  with check (
    exists (
      select 1 from public.stores
      where stores.id = orders.store_id
      and stores.status = 'active'
    )
  );

-- ORDER ITEMS: owners can view items belonging to their store's orders
create policy "Owners can view their order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      join public.stores on stores.id = orders.store_id
      where orders.id = order_items.order_id
      and stores.owner_id = auth.uid()
    )
  );

-- ORDER ITEMS: anyone can attach items to an order they just created
create policy "Anyone can create order items for a valid order"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders where orders.id = order_items.order_id)
  );

-- ============================================================
-- AUTO-CREATE A STORE ROW WHEN A NEW USER SIGNS UP
-- ============================================================
-- Reserved words that can never become a storename, since they'd
-- collide with the platform's own routes (e.g. yoursaas.com/admin).
create table public.reserved_slugs (
  slug text primary key
);

insert into public.reserved_slugs (slug) values
  ('admin'), ('api'), ('dashboard'), ('login'), ('signup'),
  ('static'), ('www'), ('app'), ('store'), ('settings'), ('billing');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_slug text;
  final_slug text;
  suffix int := 0;
begin
  base_slug := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'store_name', split_part(new.email, '@', 1)),
    '[^a-z0-9]+', '-', 'g'
  ));
  base_slug := trim(both '-' from base_slug);

  if base_slug = '' or exists (select 1 from public.reserved_slugs where slug = base_slug) then
    base_slug := 'store';
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.stores where storename = final_slug) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix;
  end loop;

  insert into public.stores (owner_id, storename, display_name)
  values (
    new.id,
    final_slug,
    coalesce(new.raw_user_meta_data->>'store_name', 'My Store')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- DAILY EXPIRY CHECK (requires pg_cron extension enabled)
-- ============================================================
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'expire-overdue-stores',
--   '0 3 * * *', -- daily at 3am
--   $$ update public.stores set status = 'expired'
--      where status = 'active' and expires_at < now(); $$
-- );
