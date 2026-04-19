import { useRef, useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BillingCountry } from './useBillingCountries';

interface Props {
  countries: BillingCountry[];
  value: BillingCountry | null;
  onChange: (country: BillingCountry) => void;
  loading?: boolean;
  className?: string;
}

export function BillingCountrySelect({ countries, value, onChange, loading, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-xl border border-input bg-background',
          'text-sm transition-colors hover:border-foreground/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        {value ? (
          <>
            {value.flagEmoji && <span className="text-base leading-none">{value.flagEmoji}</span>}
            <span className="font-medium">{value.name}</span>
            <span className="text-muted-foreground text-xs">{value.currency}</span>
          </>
        ) : (
          <span className="text-muted-foreground">País de faturação</span>
        )}
        <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground ml-1 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={cn(
          'absolute z-50 top-full mt-1.5 left-0 min-w-[200px]',
          'bg-popover border border-border rounded-xl shadow-lg',
          'py-1 overflow-hidden',
        )}>
          {countries.map((c) => (
            <button
              key={c.countryCode}
              type="button"
              onClick={() => { onChange(c); setOpen(false); }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                'hover:bg-accent/10',
                value?.countryCode === c.countryCode
                  ? 'bg-accent/10 font-medium text-foreground'
                  : 'text-foreground',
              )}
            >
              {c.flagEmoji && <span className="text-base leading-none w-5 text-center">{c.flagEmoji}</span>}
              <span className="flex-1 text-left">{c.name}</span>
              <span className="text-muted-foreground text-xs">{c.currency}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
