import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { useAuth } from '@/contexts/AuthContext';
import { resolveFirstAccessibleLoggedRoute } from '@/lib/route-access';
import { useEffect } from 'react';

export default function SystemUnavailable() {
  const { refresh, isEnabled, loading } = useFeatureFlags();
  const { memberships, currentAgencyId, signOut, status } = useAuth();
  const navigate = useNavigate();

  const currentMembership = memberships.find((m) => m.agencyId === currentAgencyId) ?? null;
  const role = (currentMembership?.role ?? 'AGENT') as 'OWNER' | 'MANAGER' | 'AGENT';

  // If flags reload and a route becomes accessible, navigate away automatically.
  useEffect(() => {
    if (loading) return;
    const target = resolveFirstAccessibleLoggedRoute(role, { isEnabled });
    if (target) navigate(target, { replace: true });
  }, [loading]);

  const handleRetry = () => {
    void refresh();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-700 tracking-tight">
            System temporarily unavailable
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All platform features are currently disabled for maintenance or incident
            mitigation. The system will be restored as soon as possible.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Try again
          </button>

          {status === 'authenticated' && (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          )}
        </div>

        {/* Brand */}
        <p className="text-xs text-muted-foreground/50 pt-2">
          <span className="font-display font-700">vyllad</span>
          <span className="text-accent">.</span>
        </p>
      </div>
    </div>
  );
}
