import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';

export interface BillingCountry {
  id: string;
  name: string;
  countryCode: string;
  market: string;
  currency: string;
  flagEmoji: string | null;
}

export function useBillingCountries() {
  const [countries, setCountries] = useState<BillingCountry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<BillingCountry[]>('/billing-countries')
      .then(setCountries)
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, []);

  return { countries, loading };
}
