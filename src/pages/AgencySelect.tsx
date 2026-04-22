import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Building2, ChevronRight, Loader2, LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';

const ROLE_LABEL: Record<string, string> = { OWNER: 'Proprietário', MANAGER: 'Gerente', AGENT: 'Colaborador' };

const BLOCKED_STATUSES = ['cancelled', 'past_due'];

const AgencySelect = () => {
  const { memberships, subscription, selectAgency, signOut } = useAuth();
  const navigate = useNavigate();
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const isBlocked = !!subscription && BLOCKED_STATUSES.includes(subscription.status);
  const isPastDue = subscription?.status === 'past_due';
  const isOwnerAnywhere = memberships.some((m) => m.role === 'OWNER');

  const handleSelect = (agencyId: string) => {
    if (isBlocked) return;
    selectAgency(agencyId);
    navigate('/dashboard', { replace: true });
  };

  const handleRenew = async () => {
    setRenewing(true);
    setRenewError(null);
    try {
      const { url } = await apiFetch<{ url: string }>('/subscriptions/portal', { method: 'POST' });
      window.location.href = url;
    } catch {
      setRenewError('Não foi possível abrir o portal de pagamento. Tente novamente ou contacte o suporte.');
      setRenewing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-700 tracking-tight">vyllad</span>
          <span className="text-accent text-2xl">.</span>
        </div>

        {isBlocked ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-700 tracking-tight mb-2 text-center">
              {isPastDue ? 'Pagamento em falta' : 'Subscrição cancelada'}
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-6 leading-relaxed">
              {isPastDue
                ? 'Existe um pagamento por processar. Actualize o método de pagamento para retomar o acesso à plataforma.'
                : 'A sua subscrição foi cancelada. Para voltar a ter acesso, renove a sua subscrição ou contacte o suporte.'}
            </p>
            <Button
              className="w-full h-11 rounded-xl mb-3"
              onClick={handleRenew}
              disabled={renewing}
            >
              {renewing ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />A abrir portal…</>
              ) : (
                'Renovar subscrição'
              )}
            </Button>
            {renewError && (
              <p className="text-xs text-destructive text-center mb-3">{renewError}</p>
            )}
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Precisa de ajuda?{' '}
              <a
                href="mailto:support@vyllad.com"
                className="underline hover:text-foreground transition-colors"
              >
                support@vyllad.com
              </a>
            </p>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-700 tracking-tight mb-2 text-center">
              Selecionar imobiliária
            </h1>
            <p className="text-muted-foreground text-sm text-center mb-8">
              Tem acesso a várias imobiliárias. Escolha com qual pretende trabalhar agora.
            </p>

            <div className="space-y-3">
              {memberships.map((m) => (
                <button
                  key={m.agencyId}
                  onClick={() => handleSelect(m.agencyId)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-foreground/30 hover:bg-muted/50 transition-all duration-200 group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{m.agencyName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{ROLE_LABEL[m.role] ?? m.role.toLowerCase()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                </button>
              ))}
            </div>

            {!isOwnerAnywhere && (
              <div className="mt-6 pt-5 border-t">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Quer gerir os seus próprios imóveis?
                </p>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl gap-2"
                  onClick={() => navigate('/onboarding?new=1')}
                >
                  <Plus className="w-4 h-4" />
                  Criar a minha conta
                </Button>
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground gap-2">
            <LogOut className="w-4 h-4" />
            Sair da conta
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AgencySelect;
