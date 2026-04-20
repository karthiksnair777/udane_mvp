DO $$ 
DECLARE
  target_shop_id uuid;
BEGIN
  -- Grab the first shop available in your database
  SELECT id INTO target_shop_id FROM public.shops ORDER BY created_at DESC LIMIT 1;
  
  IF target_shop_id IS NULL THEN
    RAISE EXCEPTION 'No shops found! Please create a shop in the Admin Dashboard first.';
  END IF;

  -- Insert 50 typical Indian supermarket grocery items
  INSERT INTO public.products (shop_id, name, selling_price, cost_price, tax_percentage, stock_quantity, sku, barcode)
  VALUES 
  (target_shop_id, 'Aashirvaad Whole Wheat Atta 5kg', 240, 210, 0, 100, 'GRO-001', '8901001'),
  (target_shop_id, 'India Gate Basmati Rice 1kg', 120, 95, 5, 50, 'GRO-002', '8901002'),
  (target_shop_id, 'Tata Salt 1kg (Iodized)', 25, 20, 0, 150, 'GRO-003', '8901003'),
  (target_shop_id, 'Fortune Sunflower Oil 1L', 145, 120, 5, 60, 'GRO-004', '8901004'),
  (target_shop_id, 'Madhur Pure Sugar 1kg', 55, 48, 5, 200, 'GRO-005', '8901005'),
  (target_shop_id, 'Amul Butter 500g', 260, 240, 12, 30, 'DAI-001', '8902001'),
  (target_shop_id, 'Amul Taaza Milk 1L', 68, 65, 0, 40, 'DAI-002', '8902002'),
  (target_shop_id, 'Britannia Good Day Cashew 600g', 120, 100, 18, 70, 'SNA-001', '8903001'),
  (target_shop_id, 'Parle-G Gold Biscuits 1kg', 140, 120, 18, 100, 'SNA-002', '8903002'),
  (target_shop_id, 'Maggi 2-Minute Noodles 140g', 30, 25, 18, 250, 'SNA-003', '8903003'),
  (target_shop_id, 'Lays Classic Salted 50g', 20, 16, 12, 100, 'SNA-004', '8903004'),
  (target_shop_id, 'Kurkure Masala Munch 90g', 20, 16, 12, 100, 'SNA-005', '8903005'),
  (target_shop_id, 'Haldirams Bhujia Sev 200g', 55, 45, 12, 50, 'SNA-006', '8903006'),
  (target_shop_id, 'Cadbury Dairy Milk Silk 60g', 85, 70, 18, 40, 'CHO-001', '8904001'),
  (target_shop_id, 'Nestle KitKat 4 Fingers 38g', 25, 20, 18, 80, 'CHO-002', '8904002'),
  (target_shop_id, 'Taj Mahal Tea 250g', 160, 140, 5, 60, 'BEV-001', '8905001'),
  (target_shop_id, 'Nescafe Classic Coffee 50g', 150, 130, 18, 40, 'BEV-002', '8905002'),
  (target_shop_id, 'Coca Cola Drink 1.25L', 65, 55, 28, 80, 'BEV-003', '8905003'),
  (target_shop_id, 'Sprite Clear Drink 1.25L', 65, 55, 28, 80, 'BEV-004', '8905004'),
  (target_shop_id, 'Frooti Mango Drink 1L', 60, 50, 12, 50, 'BEV-005', '8905005'),
  (target_shop_id, 'Tropicana Mixed Fruit Juice 1L', 110, 95, 12, 40, 'BEV-006', '8905006'),
  (target_shop_id, 'Surf Excel Easy Wash 1kg', 130, 110, 18, 100, 'CLN-001', '8906001'),
  (target_shop_id, 'Ariel Complete Detergent 1kg', 140, 120, 18, 90, 'CLN-002', '8906002'),
  (target_shop_id, 'Vim Dishwash Liquid 500ml', 115, 95, 18, 60, 'CLN-003', '8906003'),
  (target_shop_id, 'Harpic Toilet Cleaner 500ml', 99, 85, 18, 50, 'CLN-004', '8906004'),
  (target_shop_id, 'Colin Glass Cleaner 500ml', 95, 80, 18, 40, 'CLN-005', '8906005'),
  (target_shop_id, 'Lifebuoy Soap 100g 4-Pack', 110, 95, 18, 80, 'PER-001', '8907001'),
  (target_shop_id, 'Dove Beauty Bathing Bar 100g', 60, 52, 18, 60, 'PER-002', '8907002'),
  (target_shop_id, 'Head & Shoulders Shampoo 340ml', 320, 280, 18, 40, 'PER-003', '8907003'),
  (target_shop_id, 'Colgate MaxFresh 150g', 115, 95, 18, 100, 'PER-004', '8907004'),
  (target_shop_id, 'Pepsodent GermiCheck 150g', 105, 90, 18, 80, 'PER-005', '8907005'),
  (target_shop_id, 'Parachute Coconut Oil 250ml', 105, 90, 18, 60, 'PER-006', '8907006'),
  (target_shop_id, 'MDH Garam Masala 100g', 85, 75, 5, 50, 'SPI-001', '8908001'),
  (target_shop_id, 'MDH Chana Masala 100g', 75, 65, 5, 50, 'SPI-002', '8908002'),
  (target_shop_id, 'Everest Turmeric Powder 100g', 35, 30, 5, 80, 'SPI-003', '8908003'),
  (target_shop_id, 'Catch Coriander Powder 100g', 45, 38, 5, 80, 'SPI-004', '8908004'),
  (target_shop_id, 'Mother Dairy Paneer 200g', 85, 75, 5, 30, 'DAI-003', '8902003'),
  (target_shop_id, 'Amul Cheese Slices 200g', 135, 120, 12, 40, 'DAI-004', '8902004'),
  (target_shop_id, 'Nutella Hazelnut Spread 350g', 360, 320, 18, 20, 'SNA-007', '8903007'),
  (target_shop_id, 'Kissan Mixed Fruit Jam 500g', 160, 140, 12, 40, 'SNA-008', '8903008'),
  (target_shop_id, 'Pillsbury Choco Fills 250g', 140, 120, 18, 50, 'SNA-009', '8903009'),
  (target_shop_id, 'Kelloggs Corn Flakes 475g', 180, 155, 18, 40, 'SNA-010', '8903010'),
  (target_shop_id, 'Quaker Oats 1kg', 190, 165, 5, 40, 'GRO-006', '8901006'),
  (target_shop_id, 'Kohinoor Charminar Rice 5kg', 450, 390, 5, 20, 'GRO-007', '8901007'),
  (target_shop_id, 'Aashirvaad Multigrain Atta 5kg', 290, 260, 5, 30, 'GRO-008', '8901008'),
  (target_shop_id, 'Dhara Mustard Oil 1L', 160, 140, 5, 50, 'GRO-009', '8901009'),
  (target_shop_id, 'Saffola Gold Cooking Oil 1L', 185, 165, 5, 40, 'GRO-010', '8901010'),
  (target_shop_id, 'Gowardhan Ghee 500ml', 310, 280, 12, 30, 'DAI-005', '8902005'),
  (target_shop_id, 'Chings Dark Soy Sauce 210g', 55, 48, 12, 60, 'SNA-011', '8903011'),
  (target_shop_id, 'Del Monte Tomato Ketchup 900g', 130, 110, 12, 50, 'SNA-012', '8903012');
  
END $$;
