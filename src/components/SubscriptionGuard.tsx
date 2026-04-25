import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const BLOCKED_STATUSES = ['cancelled', 'past_due'];

/**
 * Wraps dashboard routes. Redirects based on subscription state:
 * - cancelled / past_due → /select-agency
 * - trialing with expired trialEndsAt → /upgrade
 */
const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const { memberships, subscription } = useAuth();

  // Only enforce after onboarding is complete (user has a membership)
  if (memberships.length === 0 || !subscription) return <>{children}</>;

  if (BLOCKED_STATUSES.includes(subscription.status)) {
    return <Navigate to="/select-agency" replace />;
  }

  // Trial expired: trialEndsAt is in the past
  if (
    subscription.status === 'trialing' &&
    subscription.trialEndsAt &&
    new Date(subscription.trialEndsAt).getTime() < Date.now()
  ) {
    return <Navigate to="/onboarding/upgrade" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
