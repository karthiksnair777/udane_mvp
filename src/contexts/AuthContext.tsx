import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AppUser = {
  id: string;
  email: string;
  profile: {
    id: string;
    name: string;
    email: string;
    role: "super_admin" | "shop_owner" | "shop_staff" | "delivery_agent";
    shop_id: string | null;
  } | null;
} | null;

type AuthContextType = {
  user: AppUser;
  isSignedIn: boolean;
  isLoaded: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: false,
  isLoaded: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchAndSetUser = async (supabaseUser: { id: string; email?: string } | null) => {
    if (!supabaseUser) {
      setUser(null);
      setIsLoaded(true);
      return;
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .single();

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      profile: profile ?? null,
    });
    setIsLoaded(true);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchAndSetUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchAndSetUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const useUser = () => {
  const ctx = useContext(AuthContext);
  return { user: ctx.user };
};
