-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Shops Table
create table if not exists public.shops (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    phone text,
    address text,
    status text check (status in ('active', 'suspended', 'pending')) default 'active',
    owner_email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create User Profiles Table (Linked to Supabase Auth)
create table if not exists public.user_profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    shop_id uuid references public.shops(id) on delete set null,
    name text not null,
    email text not null,
    role text check (role in ('super_admin', 'shop_owner', 'shop_staff')) default 'shop_staff',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Products Table
create table if not exists public.products (
    id uuid default uuid_generate_v4() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    name text not null,
    selling_price numeric not null,
    cost_price numeric default 0,
    tax_percentage numeric default 0,
    stock_quantity numeric default 0,
    image_url text,
    sku text,
    barcode text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Customers Table
create table if not exists public.customers (
    id uuid default uuid_generate_v4() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    name text not null,
    phone text,
    email text,
    loyalty_points integer default 0,
    credit_balance numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Suppliers Table
create table if not exists public.suppliers (
    id uuid default uuid_generate_v4() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    name text not null,
    contact_person text,
    phone text,
    email text,
    address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Sales Table
create table if not exists public.sales (
    id uuid default uuid_generate_v4() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    invoice_number text not null,
    total_amount numeric not null,
    payment_method text not null,
    customer_id uuid references public.customers(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Sale Items Table
create table if not exists public.sale_items (
    id uuid default uuid_generate_v4() primary key,
    sale_id uuid references public.sales(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    quantity numeric not null,
    unit_price numeric not null,
    total_price numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Expenses Table
create table if not exists public.expenses (
    id uuid default uuid_generate_v4() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    category text not null,
    amount numeric not null,
    description text,
    date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- GRANT PRIVILEGES (Fixes 403 Forbidden errors)
-- ==========================================
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

alter table public.shops enable row level security;
alter table public.user_profiles enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.suppliers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.expenses enable row level security;

-- Drop existing policies if they exist so we can run this script multiple times safely
drop policy if exists "Enable all access for authenticated users" on public.shops;
drop policy if exists "Enable all access for authenticated users" on public.user_profiles;
drop policy if exists "Enable all access for authenticated users" on public.products;
drop policy if exists "Enable all access for authenticated users" on public.customers;
drop policy if exists "Enable all access for authenticated users" on public.suppliers;
drop policy if exists "Enable all access for authenticated users" on public.sales;
drop policy if exists "Enable all access for authenticated users" on public.sale_items;
drop policy if exists "Enable all access for authenticated users" on public.expenses;

-- Create policies allowing ALL actions for authenticated users
create policy "Enable all access for authenticated users" on public.shops for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.user_profiles for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.products for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.customers for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.suppliers for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.sales for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.sale_items for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.expenses for all to authenticated using (true);

-- Trigger to automatically create a user_profile when a new Auth User signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'New User'), new.email, 'super_admin');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
