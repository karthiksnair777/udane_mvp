-- 1. Create Shops Table
create table if not exists public.shops (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    phone text,
    address text,
    status text check (status in ('active', 'suspended', 'pending')) default 'active',
    owner_email text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create User Profiles Table (Linked to Supabase Auth)
create table if not exists public.user_profiles (
    id uuid primary key,
    shop_id uuid references public.shops(id) on delete set null,
    name text not null,
    email text not null,
    role text check (role in ('super_admin', 'shop_owner', 'shop_staff')) default 'shop_staff',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Categories Table
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Products Table
create table if not exists public.products (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    category_id uuid references public.categories(id) on delete set null,
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

-- 5. Create Inventory Table (Stock Movements)
create table if not exists public.inventory (
    id uuid default gen_random_uuid() primary key,
    product_id uuid references public.products(id) on delete cascade not null,
    quantity_change numeric not null,
    reason text not null check (reason in ('sale', 'restock', 'damage', 'correction')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Customers Table
create table if not exists public.customers (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    name text not null,
    phone text,
    email text,
    loyalty_points integer default 0,
    credit_balance numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Create Orders Table
create table if not exists public.orders (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    customer_id uuid references public.customers(id) on delete cascade,
    order_number text not null,
    status text check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')) default 'pending',
    total_amount numeric not null,
    payment_status text check (payment_status in ('pending', 'paid')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create Order Items Table
create table if not exists public.order_items (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    quantity numeric not null,
    unit_price numeric not null,
    total_price numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Create Sales Table
create table if not exists public.sales (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    invoice_number text not null,
    total_amount numeric not null,
    payment_method text not null,
    customer_id uuid references public.customers(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Create Sale Items Table
create table if not exists public.sale_items (
    id uuid default gen_random_uuid() primary key,
    sale_id uuid references public.sales(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    quantity numeric not null,
    unit_price numeric not null,
    total_price numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Create Payments Table
create table if not exists public.payments (
    id uuid default gen_random_uuid() primary key,
    order_id uuid references public.orders(id) on delete cascade,
    sale_id uuid references public.sales(id) on delete cascade,
    amount numeric not null,
    payment_method text not null,
    status text check (status in ('pending', 'successful', 'failed')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Create Refunds Table
create table if not exists public.refunds (
    id uuid default gen_random_uuid() primary key,
    payment_id uuid references public.payments(id) on delete cascade not null,
    amount numeric not null,
    reason text not null,
    status text check (status in ('pending', 'completed', 'failed')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Create Notifications Table
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    user_id uuid references public.user_profiles(id) on delete cascade,
    message text not null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Create Activity Logs Table
create table if not exists public.activity_logs (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    actor_id uuid references public.user_profiles(id) on delete set null,
    action text not null,
    details jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. Create Shop Settings Table
create table if not exists public.shop_settings (
    id uuid default gen_random_uuid() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null unique,
    tax_rate numeric default 0,
    store_hours text,
    is_accepting_orders boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- GRANT PRIVILEGES
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
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.payments enable row level security;
alter table public.refunds enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;
alter table public.shop_settings enable row level security;

-- Create policies allowing ALL actions for authenticated users (we manage isolation in the API layer for MVP)
create policy "Enable all access for authenticated users" on public.shops for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.user_profiles for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.categories for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.products for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.inventory for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.customers for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.orders for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.order_items for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.sales for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.sale_items for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.payments for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.refunds for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.notifications for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.activity_logs for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.shop_settings for all to authenticated using (true);

-- Enable public read and insert for customer-facing tables (PWA Checkout)
create policy "Enable public read access for shops" on public.shops for select using (true);
create policy "Enable public read access for categories" on public.categories for select using (true);
create policy "Enable public read access for products" on public.products for select using (true);
create policy "Enable public read access for orders" on public.orders for select using (true);
create policy "Enable public insert for orders" on public.orders for insert with check (true);
create policy "Enable public read access for order items" on public.order_items for select using (true);
create policy "Enable public insert for order items" on public.order_items for insert with check (true);
create policy "Enable public insert for customers" on public.customers for insert with check (true);
