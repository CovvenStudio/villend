import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronDown, Loader2, Building2, MapPin, Users, FileText, Zap, BarChart3, Link2, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { usePlans } from '@/plans';
import { useOnboarding, isOnboardingComplete } from '@/onboarding';
import type { AgencySetup } from '@/onboarding';
import type { Plan, PlanId } from '@/plans';

// ─── Portugal Districts ───────────────────────────────────────────────────────
const PORTUGAL_DISTRICTS = [
  'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra',
  'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto',
  'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu',
  'Região Autónoma dos Açores', 'Região Autónoma da Madeira',
];

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { key: 'plan', label: 'Plano' },
  { key: 'agency', label: 'Imobiliária' },
  { key: 'confirm', label: 'Confirmação' },
];

function StepIndicator({ current }: { current: string }) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-0 mb-12">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
            i < currentIdx && 'text-muted-foreground',
            i === currentIdx && 'bg-foreground text-background',
            i > currentIdx && 'text-muted-foreground/40',
          )}>
            {i < currentIdx ? (
              <Check className="w-3 h-3" />
            ) : (
              <span className={cn(
                'w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold',
                i === currentIdx ? 'border-background bg-background text-foreground' : 'border-current'
              )}>{i + 1}</span>
            )}
            {step.label}
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn(
              'w-8 h-px mx-1 transition-colors duration-300',
              i < currentIdx ? 'bg-muted-foreground/40' : 'bg-border'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────
const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Score': <Star className="w-3 h-3" />,
  'AI': <Zap className="w-3 h-3" />,
  'Analytics': <BarChart3 className="w-3 h-3" />,
  'Magic': <Link2 className="w-3 h-3" />,
  'Agendamento': <Calendar className="w-3 h-3" />,
};

function getFeatureIcon(feature: string) {
  for (const [key, icon] of Object.entries(FEATURE_ICONS)) {
    if (feature.includes(key)) return icon;
  }
  return <Check className="w-3 h-3" />;
}

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  onSelect: (id: PlanId) => void;
}) {
  const isTrial = plan.id === 'trial';
  const isScale = plan.id === 'scale';

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(plan.id)}
      className={cn(
        'relative w-full h-full text-left rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected
          ? 'border-foreground bg-card shadow-lg'
          : plan.highlighted
          ? 'border-foreground/30 bg-card hover:border-foreground/60'
          : 'border-border bg-card hover:border-foreground/30',
        isTrial && 'border-dashed',
      )}
    >
      {/* Badge */}
      {plan.badge && (
        <span className={cn(
          'absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap',
          plan.highlighted
            ? 'bg-foreground text-background'
            : isTrial
            ? 'bg-accent text-accent-foreground'
            : 'bg-muted text-muted-foreground',
        )}>
          {plan.badge}
        </span>
      )}

      {/* Header */}
      <div>
        <p className="font-display text-base font-700 tracking-tight">{plan.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{plan.tagline}</p>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1">
        {plan.billing === 'contact' ? (
          <span className="font-display text-xl font-600">Contactar</span>
        ) : isTrial ? (
          <>
            <span className="font-display text-3xl font-700 tracking-tight">Grátis</span>
            <span className="text-xs text-muted-foreground">/ {plan.limits.trialDays} dias</span>
          </>
        ) : (
          <>
            <span className="font-display text-3xl font-700 tracking-tight">€{plan.price}</span>
            <span className="text-xs text-muted-foreground">/mês</span>
          </>
        )}
      </div>

      {/* Limits summary */}
      {!isScale && (
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/60">
          <div className="text-center">
            <p className="font-display text-lg font-700">{plan.limits.properties ?? '∞'}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">imóveis</p>
          </div>
          <div className="text-center border-x border-border/60">
            <p className="font-display text-lg font-700">{plan.limits.candidatesPerProperty ?? '∞'}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">candidatos/mês</p>
          </div>
          <div className="text-center">
            <p className="font-display text-lg font-700">{plan.limits.agents ?? '∞'}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">agentes</p>
          </div>
        </div>
      )}

      {/* Features */}
      <ul className="space-y-1.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 text-accent shrink-0">{getFeatureIcon(f)}</span>
            {f}
          </li>
        ))}
      </ul>

      {/* Selection indicator */}
      <div className={cn(
        'h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200',
        selected
          ? 'bg-foreground text-background'
          : 'bg-muted/60 text-muted-foreground',
      )}>
        {selected ? (
          <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Selecionado</span>
        ) : (
          plan.cta
        )}
      </div>
    </motion.button>
  );
}

// ─── Step 1 — Plan Selection ──────────────────────────────────────────────────
function StepPlan({ onSelect }: { onSelect: (id: PlanId) => void }) {
  const { plans, loading } = usePlans();
  const [hovered, setHovered] = useState<PlanId | null>(null);

  return (
    <div>
      <h1 className="font-display text-3xl font-700 tracking-tight mb-2">
        Escolha o seu plano
      </h1>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        Todos os planos incluem triagem automática de candidatos.<br />
        Pode alterar ou cancelar a qualquer momento.
      </p>

      {loading ? (
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">A carregar planos…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="h-full"
              onMouseEnter={() => setHovered(plan.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <PlanCard
                plan={plan}
                selected={hovered === plan.id}
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 2 — Agency Setup ────────────────────────────────────────────────────
function StepAgency({
  initial,
  onSubmit,
  onBack,
}: {
  initial: AgencySetup;
  onSubmit: (data: AgencySetup) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<AgencySetup>(initial);
  const valid = form.name.trim().length > 0 && form.county.trim().length > 0 && form.district.length > 0;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!valid) return;
      onSubmit(form);
    },
    [form, valid, onSubmit],
  );

  return (
    <div className="max-w-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </button>

      <h1 className="font-display text-3xl font-700 tracking-tight mb-2">
        Configure a sua imobiliária
      </h1>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        Isto ajuda a personalizar os critérios de qualificação para a sua região.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="agency-name" className="text-sm font-medium flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            Nome da imobiliária
          </Label>
          <Input
            id="agency-name"
            placeholder="Ex: Ribeiro & Associados"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="h-11 rounded-xl"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="agency-district" className="text-sm font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            Distrito
          </Label>
          <div className="relative">
            <select
              id="agency-district"
              value={form.district}
              onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
              className={cn(
                'w-full h-11 rounded-xl border border-input bg-background px-3 pr-10 text-sm appearance-none',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
                'transition-colors',
                !form.district && 'text-muted-foreground',
              )}
            >
              <option value="" disabled>Selecione o distrito</option>
              {PORTUGAL_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="agency-county" className="text-sm font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            Concelho
          </Label>
          <Input
            id="agency-county"
            placeholder="Ex: Lisboa"
            value={form.county}
            onChange={(e) => setForm((p) => ({ ...p, county: e.target.value }))}
            className="h-11 rounded-xl"
          />
        </div>

        <Button
          type="submit"
          disabled={!valid}
          className="w-full h-11 rounded-xl font-medium mt-2"
        >
          Continuar
        </Button>
      </form>
    </div>
  );
}

// ─── Step 3 — Confirmation ────────────────────────────────────────────────────
function StepConfirm({
  selectedPlanId,
  agency,
  onConfirm,
  onBack,
  submitting,
}: {
  selectedPlanId: PlanId;
  agency: AgencySetup;
  onConfirm: () => void;
  onBack: () => void;
  submitting: boolean;
}) {
  const { plans } = usePlans();
  const plan = plans.find((p) => p.id === selectedPlanId);

  if (!plan) return null;

  const isTrial = plan.id === 'trial';
  const isScale = plan.id === 'scale';

  return (
    <div className="max-w-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Voltar
      </button>

      <h1 className="font-display text-3xl font-700 tracking-tight mb-2">
        Confirmar subscrição
      </h1>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        Reveja os detalhes antes de começar.
      </p>

      {/* Summary card */}
      <div className="rounded-2xl border bg-card p-5 space-y-4 mb-6">
        {/* Agency */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Imobiliária</p>
            <p className="text-sm font-medium">{agency.name}</p>
            <p className="text-xs text-muted-foreground">{agency.county}, {agency.district}</p>
          </div>
        </div>

        <div className="border-t border-border/60" />

        {/* Plan */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plano</p>
              <p className="text-sm font-medium">{plan.name}</p>
              {isTrial && (
                <p className="text-xs text-accent font-medium">1 mês grátis</p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            {isScale ? (
              <p className="text-sm font-medium">A combinar</p>
            ) : isTrial ? (
              <>
                <p className="text-sm font-medium">Grátis</p>
                <p className="text-xs text-muted-foreground">após trial: €{plans.find((p) => p.id === 'basic')?.price}/mês</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">€{plan.price}/mês</p>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-border/60" />

        {/* Limits */}
        {!isScale && (
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-0.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="font-semibold text-sm">{plan.limits.properties ?? '∞'}</p>
              <p className="text-[10px] text-muted-foreground">imóveis</p>
            </div>
            <div className="flex flex-col items-center gap-0.5 border-x border-border/60">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="font-semibold text-sm">{plan.limits.candidatesPerProperty ?? '∞'}</p>
              <p className="text-[10px] text-muted-foreground">cand./mês</p>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="font-semibold text-sm">{plan.limits.agents ?? '∞'}</p>
              <p className="text-[10px] text-muted-foreground">agentes</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mb-6 leading-relaxed">
        Pode cancelar ou alterar o plano a qualquer momento.
      </p>

      <Button
        onClick={onConfirm}
        disabled={submitting}
        className="w-full h-11 rounded-xl font-medium"
      >
        {submitting ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" />A configurar…</>
        ) : (
          'Confirmar e começar'
        )}
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const { step, selectedPlanId, agency, submitting, selectPlan, submitAgency, goBack, confirm } =
    useOnboarding();

  // If already onboarded (e.g. direct navigation), redirect in effect
  useEffect(() => {
    if (isOnboardingComplete()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleConfirm = async () => {
    await confirm();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-display text-xl font-700 tracking-tight">vyllad</span>
            <span className="text-accent text-xl">.</span>
          </div>
          <span className="text-xs text-muted-foreground">Configuração inicial</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container mx-auto px-6 py-12 max-w-5xl">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {step === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              <StepPlan onSelect={selectPlan} />
            </motion.div>
          )}

          {step === 'agency' && (
            <motion.div
              key="agency"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              <StepAgency initial={agency} onSubmit={submitAgency} onBack={goBack} />
            </motion.div>
          )}

          {step === 'confirm' && selectedPlanId && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
            >
              <StepConfirm
                selectedPlanId={selectedPlanId}
                agency={agency}
                onConfirm={handleConfirm}
                onBack={goBack}
                submitting={submitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Onboarding;
