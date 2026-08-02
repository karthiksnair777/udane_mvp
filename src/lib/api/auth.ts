import { insforge } from '../insforge';
import { ProfileService } from './index';

export const AuthService = {
    async signIn(email: string, password?: string) {
        console.log("InsForge Auth: signIn", email);
        const { data, error } = await insforge.auth.signInWithPassword({
            email,
            password: password || 'default_password' // Use a default password if not provided in the original mock UI
        });
        
        if (error || !data || !data.user) return { data: null, error: error || new Error("User not found") };
        
        return { data: { user: { id: data.user.id, email: data.user.email } }, error: null };
    },
    
    async signUp(email: string, password?: string, name?: string) {
        console.log("InsForge Auth: signUp", email);
        const { data, error } = await insforge.auth.signUp({
            email,
            password: password || 'default_password',
            name: name || email.split('@')[0],
            redirectTo: window.location.origin + '/login'
        });
        
        if (error || !data) return { data: null, error };
        
        return { data: { user: { id: data.user?.id, email: data.user?.email } }, error: null };
    },

    async signOut() {
        console.log("InsForge Auth: signOut");
        const { error } = await insforge.auth.signOut();
        return { error };
    },

    async getSession() {
        const { data, error } = await insforge.auth.getCurrentUser();
        if (data?.user) {
            return { data: { session: { user: { id: data.user.id, email: data.user.email } } }, error: null };
        }
        return { data: { session: null }, error };
    },

    async getUserProfile(_userId: string) {
        const { data: userSession } = await insforge.auth.getCurrentUser();
        if (!userSession?.user) return { data: null, error: new Error("Not authenticated") };

        const email = userSession.user.email;
        let { data: profile } = await ProfileService.getByEmail(email as string);
        
        // Auto-create for backward compatibility with existing mock sessions
        if (!profile) {
            const role = email === 'admin@udane.com' ? 'super_admin' : 'shop_owner';
            const res = await ProfileService.create({
                email,
                name: email?.split('@')[0],
                role,
                shop_id: null
            });
            profile = res.data;
        }

        return { 
            data: { 
                id: profile.id, 
                name: profile.name, 
                email: profile.email, 
                role: profile.role as any,
                shop_id: profile.shop_id
            }, 
            error: null 
        };
    },

    onAuthStateChange(_callback: (event: string, session: any) => void) {
        return { unsubscribe: () => {} };
    }
};
