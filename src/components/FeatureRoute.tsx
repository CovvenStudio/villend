import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { useAuth } from '@/contexts/AuthContext';
import { resolveFirstAccessibleLoggedRoute } from '@/lib/route-access';

export default function FeatureRoute({
  featureKey,
  children,
  fallbackTo,
}: {
  featureKey: string;
  children: React.ReactNode;
  fallbackTo?: string;
}) {
  const { loading, isEnabled } = useFeatureFlags();
  const { memberships, currentAgencyId } = useAuth();

  const currentMembership = memberships.find((m) => m.agencyId === currentAgencyId) ?? null;
  const role = (currentMembership?.role ?? 'AGENT') as 'OWNER' | 'MANAGER' | 'AGENT';
  const computedFallback = resolveFirstAccessibleLoggedRoute(role, { isEnabled });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isEnabled(featureKey)) {
    if (fallbackTo) return <Navigate to={fallbackTo} replace />;
    if (computedFallback) return <Navigate to={computedFallback} replace />;
    return <Navigate to="/system-unavailable" replace />;
  }

  return <>{children}</>;
}
