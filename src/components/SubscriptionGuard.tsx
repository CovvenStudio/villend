import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const BLOCKED_STATUSES = ['cancelled', 'past_due'];

/**
 * Wraps dashboard routes. Redirects to /select-agency
 * if the user's subscription is in a non-active state.
 */
const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const { memberships, subscription } = useAuth();

  // Only enforce after onboarding is complete (user has a membership)
  if (memberships.length > 0 && subscription && BLOCKED_STATUSES.includes(subscription.status)) {
    return <Navigate to="/select-agency" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
