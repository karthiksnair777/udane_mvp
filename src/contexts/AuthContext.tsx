import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "../lib/api/auth";

type AppUser = {
  id: string;
  email: string;
  profile: {
    id: string;
    name: string;
    email: string;
    role: "super_admin" | "shop_owner" | "shop_staff" | "customer";
    shop_id: string | null;
  } | null;
} | null;

type AuthContextType = {
  user: AppUser;
  isSignedIn: boolean;
  isLoaded: boolean;
  viewingShopId: string | null;
  setViewingShopId: (id: string | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: false,
  isLoaded: false,
  viewingShopId: null,
  setViewingShopId: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [viewingShopId, setViewingShopIdState] = useState<string | null>(() => {
    return localStorage.getItem('viewing_shop_id');
  });

  const setViewingShopId = (id: string | null) => {
    if (id) {
      localStorage.setItem('viewing_shop_id', id);
    } else {
      localStorage.removeItem('viewing_shop_id');
    }
    setViewingShopIdState(id);
  };

  const fetchAndSetUser = async (supabaseUser: { id: string; email?: string } | null) => {
    if (!supabaseUser) {
      setUser(null);
      setIsLoaded(true);
      return;
    }

    const { data: profile } = await AuthService.getUserProfile(supabaseUser.id);

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      profile: profile ?? null,
    });
    setIsLoaded(true);
  };

  useEffect(() => {
    AuthService.getSession().then(({ data: { session } }) => {
      fetchAndSetUser(session?.user ?? null);
    });

    const subscription = AuthService.onAuthStateChange((_event, session) => {
      fetchAndSetUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, isLoaded, viewingShopId, setViewingShopId }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useUser = () => {
  const ctx = useContext(AuthContext);
  return { user: ctx.user };
};

export const useShop = () => {
  const ctx = useContext(AuthContext);
  const isSuperAdmin = ctx.user?.profile?.role === 'super_admin';
  const shopId = isSuperAdmin && ctx.viewingShopId ? ctx.viewingShopId : ctx.user?.profile?.shop_id;
  
  return { 
    shopId, 
    isSuperAdmin, 
    viewingShopId: ctx.viewingShopId, 
    setViewingShopId: ctx.setViewingShopId 
  };
};
