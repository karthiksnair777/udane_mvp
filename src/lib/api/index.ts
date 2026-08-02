import { insforge } from '../insforge';
import { AuthService } from './auth';

export const ShopService = {
    async getAll() {
        const { data, error } = await insforge.database.from('shops').select();
        return { data, error };
    },
    async create(payload: any) {
        const { data, error } = await insforge.database.from('shops').insert([payload]).select().single();
        return { data, error };
    },
    async update(id: string, payload: any) {
        const { data, error } = await insforge.database.from('shops').update(payload).eq('id', id).select().single();
        return { data, error };
    }
};

export const ProfileService = {
    async getByEmail(email: string) {
        const { data, error } = await insforge.database.from('user_profiles').select().eq('email', email).maybeSingle();
        return { data, error };
    },
    async getById(id: string) {
        const { data, error } = await insforge.database.from('user_profiles').select().eq('id', id).maybeSingle();
        return { data, error };
    },
    async create(payload: any) {
        const { data, error } = await insforge.database.from('user_profiles').insert([payload]).select().single();
        return { data, error };
    }
};

export const ProductService = {
    async getByShop(shopId: string) {
        const { data, error } = await insforge.database.from('products').select().eq('shop_id', shopId);
        return { data, error };
    },
    async getInStock(shopId: string) {
        const { data, error } = await insforge.database.from('products').select().eq('shop_id', shopId).gt('stock_quantity', 0);
        return { data, error };
    },
    async create(payload: any) {
        const { data, error } = await insforge.database.from('products').insert([payload]).select().single();
        return { data, error };
    },
    async update(id: string, payload: any) {
        const { data, error } = await insforge.database.from('products').update(payload).eq('id', id).select().single();
        return { data, error };
    },
    async delete(id: string) {
        const { error } = await insforge.database.from('products').delete().eq('id', id);
        return { error };
    }
};

export const CustomerService = {
    async getByShop(shopId: string) {
        const { data, error } = await insforge.database.from('customers').select().eq('shop_id', shopId);
        return { data, error };
    },
    async create(payload: any) {
        const { data, error } = await insforge.database.from('customers').insert([payload]).select().single();
        return { data, error };
    },
    async update(id: string, payload: any) {
        const { data, error } = await insforge.database.from('customers').update(payload).eq('id', id).select().single();
        return { data, error };
    },
    async delete(id: string) {
        const { error } = await insforge.database.from('customers').delete().eq('id', id);
        return { error };
    }
};

export const SaleService = {
    async getByShop(shopId: string, limit = 50) {
        const { data, error } = await insforge.database
            .from('sales')
            .select('*, sale_items(*, products(*))')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false })
            .limit(limit);
        return { data, error };
    },
    async getGlobalSales() {
        const { data, error } = await insforge.database.from('sales').select();
        return { data, error };
    },
    async create(payload: any) {
        const { data, error } = await insforge.database.from('sales').insert([payload]).select().single();
        return { data, error };
    },
    async delete(id: string) {
        const { error } = await insforge.database.from('sales').delete().eq('id', id);
        return { error };
    }
};

export const SaleItemService = {
    async createMany(payload: any[]) {
        const { data, error } = await insforge.database.from('sale_items').insert(payload).select();
        return { data, error };
    }
};

export const ExpenseService = {
    async getByShop(shopId: string) {
        const { data, error } = await insforge.database.from('expenses').select().eq('shop_id', shopId);
        return { data, error };
    },
    async create(payload: any) {
        const { data, error } = await insforge.database.from('expenses').insert([payload]).select().single();
        return { data, error };
    },
    async delete(id: string) {
        const { error } = await insforge.database.from('expenses').delete().eq('id', id);
        return { error };
    }
};

export const SupplierService = {
    async getByShop(shopId: string) {
        const { data, error } = await insforge.database.from('suppliers').select().eq('shop_id', shopId);
        return { data, error };
    },
    async create(payload: any) {
        const { data, error } = await insforge.database.from('suppliers').insert([payload]).select().single();
        return { data, error };
    },
    async update(id: string, payload: any) {
        const { data, error } = await insforge.database.from('suppliers').update(payload).eq('id', id).select().single();
        return { data, error };
    },
    async delete(id: string) {
        const { error } = await insforge.database.from('suppliers').delete().eq('id', id);
        return { error };
    }
};

export const OrderService = {
    async getByCustomer(customerId: string) {
        const { data, error } = await insforge.database.from('orders').select().eq('customer_id', customerId);
        return { data, error };
    },
    async getByShop(shopId: string) {
        const { data, error } = await insforge.database
            .from('orders')
            .select('*, order_items(*, products(*))')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false });
        return { data, error };
    },
    async create(payload: any) {
        const { data, error } = await insforge.database.from('orders').insert([payload]).select().single();
        return { data, error };
    },
    async updateStatus(id: string, status: string) {
        const { data, error } = await insforge.database.from('orders').update({ status }).eq('id', id).select().single();
        return { data, error };
    }
};

export const OrderItemService = {
    async createMany(payload: any[]) {
        const { data, error } = await insforge.database.from('order_items').insert(payload).select();
        return { data, error };
    }
};

export { AuthService };
