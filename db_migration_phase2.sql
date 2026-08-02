-- 9. Create Orders Table (Customer Pickup Orders)
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null,
    customer_id uuid references public.customers(id) on delete cascade,
    order_number text not null,
    status text check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')) default 'pending',
    total_amount numeric not null,
    payment_status text check (payment_status in ('pending', 'paid')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Create Order Items Table
create table if not exists public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete set null,
    quantity numeric not null,
    unit_price numeric not null,
    total_price numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Create Shop Settings Table
create table if not exists public.shop_settings (
    id uuid default uuid_generate_v4() primary key,
    shop_id uuid references public.shops(id) on delete cascade not null unique,
    tax_rate numeric default 0,
    store_hours text,
    is_accepting_orders boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shop_settings enable row level security;

create policy "Enable all access for authenticated users" on public.orders for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.order_items for all to authenticated using (true);
create policy "Enable all access for authenticated users" on public.shop_settings for all to authenticated using (true);

-- Enable public read access for orders so customers can check their status
create policy "Enable public read access for orders" on public.orders for select using (true);
create policy "Enable public insert for orders" on public.orders for insert with check (true);
create policy "Enable public insert for order items" on public.order_items for insert with check (true);
create policy "Enable public read access for order items" on public.order_items for select using (true);
