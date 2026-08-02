import { supabase, Shop } from '../supabase';

export const ShopService = {
    async getAll() {
        return supabase.from('shops').select('*').order('created_at', { ascending: false });
    },
    
    async getById(id: string) {
        return supabase.from('shops').select('*').eq('id', id).single();
    },

    async create(payload: Partial<Shop>) {
        return supabase.from('shops').insert(payload).select().single();
    },

    async update(id: string, payload: Partial<Shop>) {
        return supabase.from('shops').update(payload).eq('id', id).select().single();
    },
    
    async delete(id: string) {
        return supabase.from('shops').delete().eq('id', id);
    }
};
