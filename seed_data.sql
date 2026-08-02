-- seed_data.sql

DO $$ 
DECLARE
  target_shop_id uuid;
  target_category_id uuid;
  admin_user_id uuid := '53bc1d8d-785f-4f96-98df-e54ad5a51b99';
  demo_customer_id uuid;
  demo_order_id uuid;
  demo_sale_id uuid;
BEGIN
  
  -- Insert Super Admin Profile if it doesn't exist
  INSERT INTO public.user_profiles (id, shop_id, name, email, role)
  VALUES (admin_user_id, null, 'Super Admin', 'admin@udane.com', 'super_admin')
  ON CONFLICT (id) DO NOTHING;

  -- Create a Demo Shop
  INSERT INTO public.shops (name, phone, address, owner_email)
  VALUES ('Udane SuperMart', '+91-9876543210', '123 Market Road, Mumbai', 'admin@udane.com')
  RETURNING id INTO target_shop_id;

  -- Create Shop Settings
  INSERT INTO public.shop_settings (shop_id, tax_rate, store_hours, is_accepting_orders)
  VALUES (target_shop_id, 5, '08:00 AM - 10:00 PM', true);

  -- Create a Demo Category
  INSERT INTO public.categories (shop_id, name, description)
  VALUES (target_shop_id, 'Groceries', 'Daily grocery essentials')
  RETURNING id INTO target_category_id;

  -- Insert 10 Demo Products
  INSERT INTO public.products (shop_id, category_id, name, selling_price, cost_price, tax_percentage, stock_quantity, sku, barcode)
  VALUES 
  (target_shop_id, target_category_id, 'Aashirvaad Whole Wheat Atta 5kg', 240, 210, 0, 100, 'GRO-001', '8901001'),
  (target_shop_id, target_category_id, 'India Gate Basmati Rice 1kg', 120, 95, 5, 50, 'GRO-002', '8901002'),
  (target_shop_id, target_category_id, 'Tata Salt 1kg (Iodized)', 25, 20, 0, 150, 'GRO-003', '8901003'),
  (target_shop_id, target_category_id, 'Fortune Sunflower Oil 1L', 145, 120, 5, 60, 'GRO-004', '8901004'),
  (target_shop_id, target_category_id, 'Madhur Pure Sugar 1kg', 55, 48, 5, 200, 'GRO-005', '8901005'),
  (target_shop_id, target_category_id, 'Amul Butter 500g', 260, 240, 12, 30, 'DAI-001', '8902001'),
  (target_shop_id, target_category_id, 'Amul Taaza Milk 1L', 68, 65, 0, 40, 'DAI-002', '8902002'),
  (target_shop_id, target_category_id, 'Britannia Good Day Cashew 600g', 120, 100, 18, 70, 'SNA-001', '8903001'),
  (target_shop_id, target_category_id, 'Parle-G Gold Biscuits 1kg', 140, 120, 18, 100, 'SNA-002', '8903002'),
  (target_shop_id, target_category_id, 'Maggi 2-Minute Noodles 140g', 30, 25, 18, 250, 'SNA-003', '8903003');

  -- Create a Demo Customer
  INSERT INTO public.customers (shop_id, name, phone, email, loyalty_points)
  VALUES (target_shop_id, 'Rahul Kumar', '+91-9988776655', 'rahul@example.com', 150)
  RETURNING id INTO demo_customer_id;

  -- Create a Demo Order
  INSERT INTO public.orders (shop_id, customer_id, order_number, status, total_amount, payment_status)
  VALUES (target_shop_id, demo_customer_id, 'ORD-1001', 'pending', 360, 'pending')
  RETURNING id INTO demo_order_id;

  -- Create a Demo Sale
  INSERT INTO public.sales (shop_id, invoice_number, total_amount, payment_method, customer_id)
  VALUES (target_shop_id, 'INV-2001', 145, 'UPI', demo_customer_id)
  RETURNING id INTO demo_sale_id;

  -- Create a Payment
  INSERT INTO public.payments (order_id, sale_id, amount, payment_method, status)
  VALUES (null, demo_sale_id, 145, 'UPI', 'successful');

  -- Add Activity Log
  INSERT INTO public.activity_logs (shop_id, actor_id, action, details)
  VALUES (target_shop_id, admin_user_id, 'seeded_database', '{"message": "Initial seed data loaded successfully"}');

END $$;
