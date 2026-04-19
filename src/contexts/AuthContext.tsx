import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  signInWithGoogle,
  getMe,
  logoutApi,
  persistSession,
  clearSession,
  hasPersistedSession,
  type AuthUser,
  type AuthMembership,
} from '@/lib/auth-api';

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  memberships: AuthMembership[];
  currentAgencyId: string | null;
  /** Sign in via Google OAuth access token (obtained from Google button) */
  signIn: (googleAccessToken: string) => Promise<{ needsOnboarding: boolean; multipleAgencies: boolean }>;
  signOut: () => Promise<void>;
  /** Set active agency (for multi-agency owners) */
  selectAgency: (agencyId: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [memberships, setMemberships] = useState<AuthMembership[]>([]);
  const [currentAgencyId, setCurrentAgencyId] = useState<string | null>(null);

  // On mount: try to restore session from stored refresh token
  useEffect(() => {
    if (!hasPersistedSession()) {
      setStatus('unauthenticated');
      return;
    }

    getMe()
      .then(({ user: u, memberships: m }) => {
        setUser(u);
        setMemberships(m);
        // Auto-select agency if user has exactly one
        if (m.length === 1) setCurrentAgencyId(m[0].agencyId);
        const stored = localStorage.getItem('vyllad_current_agency');
        if (stored && m.some((mb) => mb.agencyId === stored)) {
          setCurrentAgencyId(stored);
        }
        setStatus('authenticated');
      })
      .catch(() => {
        clearSession();
        setStatus('unauthenticated');
      });
  }, []);

  const signIn = useCallback(async (googleAccessToken: string) => {
    const session = await signInWithGoogle(googleAccessToken);
    persistSession(session);
    setUser(session.user);
    setMemberships(session.memberships);

    if (session.memberships.length === 1) {
      setCurrentAgencyId(session.memberships[0].agencyId);
      localStorage.setItem('vyllad_current_agency', session.memberships[0].agencyId);
    }

    setStatus('authenticated');

    return {
      needsOnboarding: session.needsOnboarding,
      multipleAgencies: session.memberships.length > 1,
    };
  }, []);

  const signOut = useCallback(async () => {
    await logoutApi();
    clearSession();
    localStorage.removeItem('vyllad_current_agency');
    setUser(null);
    setMemberships([]);
    setCurrentAgencyId(null);
    setStatus('unauthenticated');
  }, []);

  const selectAgency = useCallback((agencyId: string) => {
    setCurrentAgencyId(agencyId);
    localStorage.setItem('vyllad_current_agency', agencyId);
  }, []);

  return (
    <AuthContext.Provider
      value={{ status, user, memberships, currentAgencyId, signIn, signOut, selectAgency }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
