import { ShopService, ProductService, CustomerService, SaleService, SaleItemService } from './api';

export async function seedDemoData() {
    try {
        console.log("Starting Demo Data Seeding...");
        
        const { ProfileService } = await import('./api/index');
        
        // --- 1. SUPERMARKET ---
        const shop1Res = await ShopService.create({
            name: "FreshMart",
            phone: "+91 98765 43210",
            address: "123 Market Street, Tech Park, Bangalore",
            owner_email: "freshmart@udane.com",
            status: "active",
            category: "All",
            gst_number: "29ABCDE1234F2Z5",
            business_hours: "08:00 AM - 10:00 PM"
        } as any);
        const shop1 = shop1Res.data.id;
        
        await ProfileService.create({
            email: "freshmart@udane.com",
            name: "FreshMart Admin",
            role: "shop_owner",
            shop_id: shop1
        });

        const groceryProducts = [
            { name: "Organic Bananas (1kg)", selling_price: 60, stock_quantity: 150, category_id: "Produce", image_url: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&q=80" },
            { name: "Fresh Apples (1kg)", selling_price: 180, stock_quantity: 100, category_id: "Produce", image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500&q=80" },
            { name: "Whole Wheat Bread", selling_price: 45, stock_quantity: 30, category_id: "Dairy", image_url: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500&q=80" },
            { name: "Amul Butter (500g)", selling_price: 260, stock_quantity: 45, category_id: "Dairy", image_url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80" },
            { name: "Tata Salt (1kg)", selling_price: 24, stock_quantity: 200, category_id: "Household", image_url: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500&q=80" },
            { name: "Maggi Noodles (4-pack)", selling_price: 56, stock_quantity: 80, category_id: "Snacks", image_url: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80" }
        ];

        // --- 2. ORGANIC VEGGIES ---
        const shop2Res = await ShopService.create({
            name: "Green Basket",
            phone: "+91 98765 43211",
            address: "45 Farm Lane, Indiranagar, Bangalore",
            owner_email: "greenbasket@udane.com",
            status: "active",
            category: "Produce",
            gst_number: "29ABCDE1234F2Z6",
            business_hours: "07:00 AM - 09:00 PM"
        } as any);
        const shop2 = shop2Res.data.id;
        
        await ProfileService.create({
            email: "greenbasket@udane.com",
            name: "Green Basket Admin",
            role: "shop_owner",
            shop_id: shop2
        });

        const organicProducts = [
            { name: "Organic Spinach (Bundle)", selling_price: 35, stock_quantity: 40, category_id: "Produce", image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&q=80" },
            { name: "Farm Fresh Tomatoes (1kg)", selling_price: 80, stock_quantity: 120, category_id: "Produce", image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80" },
            { name: "Organic Avocados (2 pcs)", selling_price: 250, stock_quantity: 20, category_id: "Produce", image_url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&q=80" },
            { name: "Free-range Eggs (6 pcs)", selling_price: 90, stock_quantity: 60, category_id: "Dairy", image_url: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=500&q=80" }
        ];

        // --- 3. DAILY NEEDS ---
        const shop3Res = await ShopService.create({
            name: "Corner Mart",
            phone: "+91 98765 43212",
            address: "78 Residential Layout, Koramangala, Bangalore",
            owner_email: "dailyneeds@udane.com",
            status: "active",
            category: "Household",
            gst_number: "29ABCDE1234F2Z7",
            business_hours: "06:00 AM - 11:00 PM"
        } as any);
        const shop3 = shop3Res.data.id;
        
        await ProfileService.create({
            email: "dailyneeds@udane.com",
            name: "Daily Needs Admin",
            role: "shop_owner",
            shop_id: shop3
        });

        const dailyProducts = [
            { name: "Surf Excel Matic (2kg)", selling_price: 420, stock_quantity: 25, category_id: "Household", image_url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=500&q=80" },
            { name: "Dettol Handwash", selling_price: 99, stock_quantity: 50, category_id: "Household", image_url: "https://images.unsplash.com/photo-1584483787723-57771746654e?w=500&q=80" },
            { name: "Lays Classic Salted", selling_price: 20, stock_quantity: 120, category_id: "Snacks", image_url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80" },
            { name: "Dairy Milk Silk", selling_price: 80, stock_quantity: 85, category_id: "Snacks", image_url: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=500&q=80" },
            { name: "Nandini Milk (500ml)", selling_price: 22, stock_quantity: 200, category_id: "Dairy", image_url: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80" }
        ];

        const insertProducts = async (products: any[], shopId: string) => {
            const created = [];
            for (const p of products) {
                const res = await ProductService.create({ ...p, shop_id: shopId, tax_percentage: 5 });
                if (res.data) created.push(res.data);
            }
            return created;
        };

        const createdProducts1 = await insertProducts(groceryProducts, shop1);
        const createdProducts2 = await insertProducts(organicProducts, shop2);
        const createdProducts3 = await insertProducts(dailyProducts, shop3);
        const allProducts = [...createdProducts1, ...createdProducts2, ...createdProducts3];

        console.log(`Created ${allProducts.length} Products across 3 shops`);

        // 3. Create Customers (Shared for simplicity)
        const customersData = [
            { name: "Rahul Sharma", phone: "9876511111", loyalty_points: 120, credit_balance: 0 },
            { name: "Priya Patel", phone: "9876522222", loyalty_points: 45, credit_balance: 500 }
        ];

        const createdCustomers = [];
        for (const c of customersData) {
            const res = await CustomerService.create({ ...c, shop_id: shop1 });
            if (res.data) createdCustomers.push(res.data);
        }

        // 4. Create Sales for Shop 1 (to populate charts)
        const paymentMethods = ["Cash", "UPI", "Card"];
        let salesCount = 0;

        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 7));
            
            const numItems = Math.floor(Math.random() * 3) + 1;
            const saleItems = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const product = createdProducts1[Math.floor(Math.random() * createdProducts1.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const price = product.selling_price;
                const total = price * quantity;
                
                saleItems.push({
                    product_id: product.id,
                    quantity,
                    unit_price: price,
                    total_price: total
                });
                totalAmount += total;
            }

            const saleRes = await SaleService.create({
                shop_id: shop1,
                invoice_number: `DEMO-INV-${1000 + i}`,
                total_amount: totalAmount,
                payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                status: "paid",
            });

            if (saleRes.data) {
                const itemsToInsert = saleItems.map(item => ({
                    ...item,
                    sale_id: saleRes.data.id
                }));
                await SaleItemService.createMany(itemsToInsert);
                salesCount++;
            }
        }

        console.log("Demo Data Seeded Successfully!");
        return true;
    } catch (error: any) {
        console.error("Seeding Error:", error);
        return false;
    }
}
