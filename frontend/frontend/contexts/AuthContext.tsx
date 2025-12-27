import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase, isSupabaseReady } from "../utils/supabase";
import { MOCK_AUTH } from "../utils/featureFlags";

export type UserRole = "admin" | "client"; // ✅ Exported so other files can use
export type AppUser = {
  id: string;
  email: string;
  role: UserRole;
  onboardingComplete?: boolean;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const MOCK_STORAGE_KEY = "mock_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle session / mock setup on mount
  useEffect(() => {
    (async () => {
      if (MOCK_AUTH || !isSupabaseReady) {
        // Restore mock session if available
        const raw = localStorage.getItem(MOCK_STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
        setLoading(false);
        return;
      }

      // Restore Supabase session
      const { data } = await supabase.auth.getSession();
      applySession(data.session);
      setLoading(false);

      // Subscribe to auth state changes
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        applySession(session);
      });

      return () => {
        sub.subscription.unsubscribe();
      };
    })();
  }, []);

  function applySession(
    session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
  ) {
    if (!session?.user) {
      setUser(null);
      return;
    }

    const role = (session.user.user_metadata?.role as UserRole) || "client";
    const onboardingComplete = !!session.user.user_metadata?.onboardingComplete;

    setUser({
      id: session.user.id,
      email: session.user.email ?? "",
      role,
      onboardingComplete,
    });
  }

  // Login handler
  async function loginWithEmail(email: string, password: string) {
    if (MOCK_AUTH || !isSupabaseReady) {
      const role: UserRole = email.includes("admin") ? "admin" : "client";
      const fakeUser: AppUser = { id: "mock-id", email, role, onboardingComplete: false };
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(fakeUser));
      setUser(fakeUser);
      return;
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    applySession(data.session);
  }

  // Logout handler
  async function logout() {
    if (MOCK_AUTH || !isSupabaseReady) {
      localStorage.removeItem(MOCK_STORAGE_KEY);
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  }

  // Get token for API calls
  async function getIdToken(): Promise<string | null> {
    if (MOCK_AUTH || !isSupabaseReady) {
      return "mock-token";
    }
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithEmail,
      logout,
      getIdToken,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook for using auth
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}


