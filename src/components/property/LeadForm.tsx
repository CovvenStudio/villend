import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Loader2, X, ChevronLeft,
  Zap, CalendarDays, Calendar, Eye,
  User, Users, UserPlus, Home,
  Ban, PawPrint,
  Banknote, Wallet, CreditCard, Gem,
  FileCheck2, FileText, Briefcase, HelpCircle,
  UserCheck, UserX,
  GraduationCap, Search,
  ThumbsUp, ThumbsDown,
  Tag, Plane, MessageCircle,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Property } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// ─── Scoring Engine ──────────────────────────────────────────────────────────

interface LeadData {
  urgency: string;
  household: string;
  hasPets: boolean;
  petCount: string;
  petTypes: string[];
  income: string;
  job: string;
  hasGuarantor: string; // 'Sim' | 'Não' | '' (só relevante se não tem contrato PT)
  hasVisited: string;
  motivation: string;
  name: string;
  phone: string;
  email: string;
}

const INCOME_MIDPOINTS: Record<string, number> = {
  '< €1000': 700,
  '€1000–€2000': 1500,
  '€2000–€4000': 3000,
  '€4000+': 5500,
};

const URGENCY_SCORE: Record<string, number> = {
  'Imediatamente': 15,
  'Em 15 dias': 12,
  'Em 1 mês': 8,
  'Só a explorar': 2,
};

const JOB_SCORE: Record<string, number> = {
  'Contrato sem termo': 12,
  'Contrato a prazo': 9,
  'Independente': 7,
  'Estudante': 3,
  'Entre empregos': 2,
  'Outro': 4,
};

// Returns whether the candidate needs to be asked about guarantor
function needsGuarantorStep(job: string, criteria: Property['criteria']): boolean {
  if (!criteria.guarantorRequired) return false;
  return job !== 'Contrato sem termo' && job !== 'Contrato a prazo';
}

function calcScore(data: LeadData, property: Property): number {
  let score = 0;
  const { criteria, price } = property;

  // ── Financial capacity (0–40) ────────────────────────────────────────────
  const income = INCOME_MIDPOINTS[data.income] || 0;
  if (income >= criteria.minIncome * 3.5) score += 40;
  else if (income >= criteria.minIncome * 3) score += 32;
  else if (income >= criteria.minIncome * 2.5) score += 24;
  else if (income >= criteria.minIncome * 2) score += 16;
  else if (income >= criteria.minIncome) score += 8;
  if (income < criteria.minIncome) score = Math.max(0, score - 15);

  // ── Property fit (0–25) ──────────────────────────────────────────────────
  const peopleMap: Record<string, number> = { 'Só eu': 1, '2 pessoas': 2, '3 pessoas': 3, '4 ou mais': 4 };
  const people = peopleMap[data.household] || 1;
  if (people <= criteria.maxPeople) score += 15;
  else if (people === criteria.maxPeople + 1) score += 5;
  else score = Math.max(0, score - 10);

  if (!data.hasPets) score += 10;
  else if (criteria.petsAllowed) score += 10;
  else score = Math.max(0, score - 15);

  // ── Guarantor fit ────────────────────────────────────────────────────────
  if (criteria.guarantorRequired) {
    if (data.hasGuarantor === 'Sim') score += 8;
    else if (data.hasGuarantor === 'Não' && criteria.advanceWithoutGuarantor) score += 3;
    else if (data.hasGuarantor === 'Não') score = Math.max(0, score - 5);
  }

  // ── Urgency (0–15) ───────────────────────────────────────────────────────
  score += URGENCY_SCORE[data.urgency] || 0;

  // ── Intent & quality (0–20) ──────────────────────────────────────────────
  score += JOB_SCORE[data.job] || 4;
  if (data.hasVisited === 'Sim') score += 5;
  if (data.motivation === 'Relocalização por trabalho' || data.motivation === 'Melhor preço') score += 3;

  // suppress unused variable warning
  void price;

  return Math.max(0, Math.min(100, score));
}

function getClassification(score: number) {
  if (score >= 70) return 'excellent';
  if (score >= 45) return 'potential';
  return 'low';
}

// ─── Option Button ────────────────────────────────────────────────────────────

const OptionBtn = ({
  label, icon, selected, onClick,
}: { label: string; icon?: React.ReactNode; selected: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left text-sm font-medium transition-all ${
      selected
        ? 'border-primary bg-primary/5 text-primary'
        : 'border-border hover:border-primary/40 hover:bg-muted/50'
    }`}
  >
    {icon && (
      <span className={`flex-shrink-0 transition-colors ${selected ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </span>
    )}
    <span>{label}</span>
    {selected && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
  </button>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const BASE_STEPS = ['urgency', 'household', 'pets', 'income', 'job', 'intent', 'motivation', 'contact'];
const STEPS_WITH_GUARANTOR = ['urgency', 'household', 'pets', 'income', 'job', 'guarantor', 'intent', 'motivation', 'contact'];

const ProgressBar = ({ current, steps }: { current: string; steps: string[] }) => {
  const idx = steps.indexOf(current);
  const pct = idx < 0 ? 100 : ((idx + 1) / steps.length) * 100;
  return (
    <div className="w-full">
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      {idx >= 0 && (
        <p className="text-[11px] text-muted-foreground mt-1.5 text-right">
          Passo {idx + 1} de {steps.length}
        </p>
      )}
    </div>
  );
};

// ─── Lead Form ────────────────────────────────────────────────────────────────

const PET_TYPES = [
  { label: 'Cão', icon: '🐕' },
  { label: 'Gato', icon: '🐈' },
  { label: 'Pássaro', icon: '🦜' },
  { label: 'Coelho', icon: '🐇' },
  { label: 'Peixe', icon: '🐟' },
  { label: 'Réptil', icon: '🦎' },
  { label: 'Hamster', icon: '🐹' },
];

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
};

const LeadForm = ({ property, onClose }: { property: Property; onClose: () => void }) => {
  const { toast } = useToast();
  const [step, setStep] = useState<string>('urgency');
  const [data, setData] = useState<LeadData>({
    urgency: '', household: '', hasPets: false, petCount: '', petTypes: [],
    income: '', job: '', hasGuarantor: '', hasVisited: '', motivation: '',
    name: '', phone: '', email: '',
  });

  const steps = needsGuarantorStep(data.job, property.criteria) ? STEPS_WITH_GUARANTOR : BASE_STEPS;
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; classification: string } | null>(null);
  const [jobIsOther, setJobIsOther] = useState(false);
  const [motivationIsOther, setMotivationIsOther] = useState(false);

  const set = (field: keyof LeadData, value: string | boolean | string[]) =>
    setData(prev => ({ ...prev, [field]: value }));

  const togglePetType = (type: string) => {
    setData(prev => ({
      ...prev,
      petTypes: prev.petTypes.includes(type)
        ? prev.petTypes.filter(t => t !== type)
        : [...prev.petTypes, type],
    }));
  };

  const next = (nextStep: string) => setStep(nextStep);

  const submit = () => {
    setSubmitting(true);
    const score = calcScore(data, property);
    const classification = getClassification(score);
    setTimeout(() => {
      setSubmitting(false);
      setResult({ score, classification });
      setStep('result');
      toast({
        title: 'Candidatura enviada!',
        description: 'A sua candidatura foi recebida com sucesso.',
      });
    }, 1500);
  };

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">A analisar o seu perfil…</p>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold mb-2">Candidatura recebida!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A sua candidatura foi submetida com sucesso. Iremos análisar o seu perfil e entrará em contacto em breve.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-muted/50 border text-sm text-left space-y-3">
          <div className="flex gap-3">
            <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">Pode acompanhar o estado da sua candidatura através do link que receberá por email.</p>
          </div>
          <div className="flex gap-3">
            <Home className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">Assim que a candidatura for <strong className="text-foreground">aprovada</strong>, poderá marcar a visita ao imóvel diretamente pelo link.</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Confirmação enviada para <strong>{data.email}</strong>
        </p>
      </motion.div>
    );
  }

  const stepContent: Record<string, React.ReactNode> = {
    urgency: (
      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold mb-1">Quando planeia mudar-se?</h3>
        <p className="text-sm text-muted-foreground mb-4">Ajuda-nos a perceber a urgência da sua procura.</p>
        {[
          { label: 'Imediatamente', icon: <Zap className="w-4 h-4" /> },
          { label: 'Em 15 dias', icon: <CalendarDays className="w-4 h-4" /> },
          { label: 'Em 1 mês', icon: <Calendar className="w-4 h-4" /> },
          { label: 'Só a explorar', icon: <Eye className="w-4 h-4" /> },
        ].map(o => (
          <OptionBtn key={o.label} label={o.label} icon={o.icon}
            selected={data.urgency === o.label}
            onClick={() => { set('urgency', o.label); setTimeout(() => next('household'), 200); }}
          />
        ))}
      </div>
    ),

    household: (
      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold mb-1">Quem vai viver no imóvel?</h3>
        <p className="text-sm text-muted-foreground mb-4">Inclua todas as pessoas que vão residir.</p>
        {[
          { label: 'Só eu', icon: <User className="w-4 h-4" /> },
          { label: '2 pessoas', icon: <Users className="w-4 h-4" /> },
          { label: '3 pessoas', icon: <UserPlus className="w-4 h-4" /> },
          { label: '4 ou mais', icon: <Home className="w-4 h-4" /> },
        ].map(o => (
          <OptionBtn key={o.label} label={o.label} icon={o.icon}
            selected={data.household === o.label}
            onClick={() => { set('household', o.label); setTimeout(() => next('pets'), 200); }}
          />
        ))}
      </div>
    ),

    pets: (
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold mb-1">Vai trazer animais de estimação?</h3>
        <p className="text-sm text-muted-foreground mb-2">Seja honesto — ajuda a encontrar o imóvel certo.</p>
        <div className="grid grid-cols-2 gap-3">
          <OptionBtn label="Não" icon={<Ban className="w-4 h-4" />}
            selected={data.hasPets === false && data.urgency !== ''}
            onClick={() => { set('hasPets', false); setTimeout(() => next('income'), 200); }}
          />
          <OptionBtn label="Sim" icon={<PawPrint className="w-4 h-4" />}
            selected={data.hasPets === true}
            onClick={() => set('hasPets', true)}
          />
        </div>

        <AnimatePresence>
          {data.hasPets && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-2 space-y-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block">Quantos animais?</Label>
                  <div className="flex gap-2">
                    {['1', '2', '3+'].map(n => (
                      <button key={n} type="button" onClick={() => set('petCount', n)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${data.petCount === n ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted/50'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">Que tipo(s) de animais?</Label>
                  <div className="flex flex-wrap gap-2">
                    {PET_TYPES.map(({ label, icon }) => (
                      <button key={label} type="button" onClick={() => togglePetType(label)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${data.petTypes.includes(label) ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted/50'}`}>
                        <span>{icon}</span> {label}
                        {data.petTypes.includes(label) && <X className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={() => next('income')} disabled={!data.petCount || data.petTypes.length === 0} className="w-full rounded-xl">
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),

    income: (
      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold mb-1">Para garantir que este imóvel se encaixa no seu orçamento…</h3>
        <p className="text-sm text-muted-foreground mb-4">Qual é o rendimento mensal líquido do agregado familiar?</p>
        {[
          { label: 'Menos de €1.000', value: '< €1000', icon: <Banknote className="w-4 h-4" /> },
          { label: '€1.000 – €2.000', value: '€1000–€2000', icon: <Wallet className="w-4 h-4" /> },
          { label: '€2.000 – €4.000', value: '€2000–€4000', icon: <CreditCard className="w-4 h-4" /> },
          { label: 'Mais de €4.000', value: '€4000+', icon: <Gem className="w-4 h-4" /> },
        ].map(o => (
          <OptionBtn key={o.value} label={o.label} icon={o.icon}
            selected={data.income === o.value}
            onClick={() => { set('income', o.value); setTimeout(() => next('job'), 200); }}
          />
        ))}
      </div>
    ),

    job: (
      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold mb-1">Qual é a sua situação profissional?</h3>
        <p className="text-sm text-muted-foreground mb-4">Esta informação é confidencial e serve apenas para qualificação.</p>
        {[
          { label: 'Contrato sem termo', icon: <FileCheck2 className="w-4 h-4" /> },
          { label: 'Contrato a prazo', icon: <FileText className="w-4 h-4" /> },
          { label: 'Independente', icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Estudante', icon: <GraduationCap className="w-4 h-4" /> },
          { label: 'Entre empregos', icon: <Search className="w-4 h-4" /> },
          { label: 'Outro', icon: <HelpCircle className="w-4 h-4" /> },
        ].map(o => (
          <OptionBtn key={o.label} label={o.label} icon={o.icon}
            selected={o.label === 'Outro' ? jobIsOther : (!jobIsOther && data.job === o.label)}
            onClick={() => {
              if (o.label === 'Outro') {
                setJobIsOther(true);
                set('job', '');
              } else {
                setJobIsOther(false);
                set('job', o.label);
                const requiresGuarantor = needsGuarantorStep(o.label, property.criteria);
                setTimeout(() => next(requiresGuarantor ? 'guarantor' : 'intent'), 200);
              }
            }}
          />
        ))}
        <AnimatePresence>
          {jobIsOther && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="space-y-3 pt-1 pb-1 px-1">
                <Input
                  placeholder="Descreva a sua situação profissional..."
                  value={data.job}
                  onChange={e => set('job', e.target.value)}
                  className="h-11 rounded-xl"
                  autoFocus
                />
                <Button
                  disabled={!data.job.trim()}
                  onClick={() => next(needsGuarantorStep('Outro', property.criteria) ? 'guarantor' : 'intent')}
                  className="w-full rounded-xl"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ),

    guarantor: (() => {
      const hasGuarantorData = data.hasGuarantor;
      const advance = hasGuarantorData === 'Não' && property.criteria.advanceWithoutGuarantor
        ? property.criteria.advanceWithoutGuarantor
        : property.criteria.advanceMonths;
      const deposit = hasGuarantorData === 'Não' && property.criteria.depositWithoutGuarantor
        ? property.criteria.depositWithoutGuarantor
        : property.criteria.depositMonths;
      const rent = property.rentalPrice || property.price;

      return (
        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold mb-1">Tem fiador disponível?</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Como não tem contrato de trabalho em Portugal, um fiador pode facilitar a aprovação da candidatura.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'Sim', label: 'Sim, tenho', sub: 'Fiador disponível', Icon: UserCheck },
              { value: 'Não', label: 'Não tenho', sub: 'Sem fiador', Icon: UserX },
            ].map(({ value, label, sub, Icon }) => {
              const sel = data.hasGuarantor === value;
              return (
                <button key={value} type="button" onClick={() => set('hasGuarantor', value)}
                  className={`relative flex flex-col items-center justify-center gap-2 py-6 px-3 rounded-2xl border text-center transition-all ${
                    sel ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40 hover:bg-muted/50'
                  }`}>
                  <span className={`p-2.5 rounded-full transition-colors ${sel ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`w-5 h-5 transition-colors ${sel ? 'text-primary' : 'text-muted-foreground'}`} />
                  </span>
                  <span className="text-sm font-semibold leading-tight">{label}</span>
                  <span className={`text-xs transition-colors ${sel ? 'text-primary/70' : 'text-muted-foreground'}`}>{sub}</span>
                  {sel && <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {hasGuarantorData !== '' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Valores estimados de entrada</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Adiantamento ({advance} meses)</span>
                      <span className="font-bold">€{(advance * (rent ?? 0)).toLocaleString('pt-PT')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Caução ({deposit} meses)</span>
                      <span className="font-bold">€{(deposit * (rent ?? 0)).toLocaleString('pt-PT')}</span>
                    </div>
                    <div className="border-t pt-2 flex items-center justify-between text-sm font-bold">
                      <span>Total estimado</span>
                      <span>€{((advance + deposit) * (rent ?? 0)).toLocaleString('pt-PT')}</span>
                    </div>
                  </div>
                  {hasGuarantorData === 'Não' && property.criteria.advanceWithoutGuarantor && (
                    <p className="text-xs text-amber-600">Sem fiador os valores de entrada são ajustados conforme critérios do imóvel.</p>
                  )}
                </div>
                <Button onClick={() => next('intent')} className="w-full rounded-xl mt-3">
                  Continuar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    })(),

    intent: (
      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold mb-1">Visitou algum imóvel recentemente?</h3>
        <p className="text-sm text-muted-foreground mb-4">Ajuda-nos a perceber em que fase da procura está.</p>
        <div className="grid grid-cols-2 gap-3">
          <OptionBtn label="Sim" icon={<ThumbsUp className="w-4 h-4" />}
            selected={data.hasVisited === 'Sim'}
            onClick={() => { set('hasVisited', 'Sim'); setTimeout(() => next('motivation'), 200); }}
          />
          <OptionBtn label="Não" icon={<ThumbsDown className="w-4 h-4" />}
            selected={data.hasVisited === 'Não'}
            onClick={() => { set('hasVisited', 'Não'); setTimeout(() => next('motivation'), 200); }}
          />
        </div>
      </div>
    ),

    motivation: (
      <div className="space-y-3">
        <h3 className="font-display text-xl font-bold mb-1">O que procura principalmente? <span className="text-muted-foreground text-sm font-normal">(opcional)</span></h3>
        {[
          { label: 'Melhor localização', icon: <MapPin className="w-4 h-4" /> },
          { label: 'Melhor preço', icon: <Tag className="w-4 h-4" /> },
          { label: 'Relocalização por trabalho', icon: <Plane className="w-4 h-4" /> },
          { label: 'Outro motivo', icon: <MessageCircle className="w-4 h-4" /> },
        ].map(o => (
          <OptionBtn key={o.label} label={o.label} icon={o.icon}
            selected={o.label === 'Outro motivo' ? motivationIsOther : (!motivationIsOther && data.motivation === o.label)}
            onClick={() => {
              if (o.label === 'Outro motivo') {
                setMotivationIsOther(true);
                set('motivation', '');
              } else {
                setMotivationIsOther(false);
                set('motivation', o.label);
                setTimeout(() => next('contact'), 200);
              }
            }}
          />
        ))}
        <AnimatePresence>
          {motivationIsOther && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="space-y-3 pt-1 pb-1 px-1">
                <Input
                  placeholder="Qual é o seu principal motivo?"
                  value={data.motivation}
                  onChange={e => set('motivation', e.target.value)}
                  className="h-11 rounded-xl"
                  autoFocus
                />
                <Button
                  disabled={!data.motivation.trim()}
                  onClick={() => next('contact')}
                  className="w-full rounded-xl"
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!motivationIsOther && (
          <button type="button" onClick={() => next('contact')} className="w-full text-xs text-muted-foreground hover:text-foreground py-2 transition-colors">
            Saltar esta pergunta →
          </button>
        )}
      </div>
    ),

    contact: (
      <div className="space-y-4">
        <h3 className="font-display text-xl font-bold mb-1">Quase lá! Deixe os seus contactos.</h3>
        <p className="text-sm text-muted-foreground mb-4">O agente responsável irá contactá-lo para confirmar os próximos passos.</p>
        <div>
          <Label className="text-xs font-medium">Nome completo</Label>
          <Input placeholder="Maria Silva" value={data.name} onChange={e => set('name', e.target.value)} className="mt-1 h-11 rounded-xl" />
        </div>
        <div>
          <Label className="text-xs font-medium">Telefone</Label>
          <Input type="tel" placeholder="+351 912 345 678" value={data.phone} onChange={e => set('phone', e.target.value)} className="mt-1 h-11 rounded-xl" />
        </div>
        <div>
          <Label className="text-xs font-medium">Email</Label>
          <Input type="email" placeholder="maria@email.com" value={data.email} onChange={e => set('email', e.target.value)} className="mt-1 h-11 rounded-xl" />
        </div>
        <Button
          onClick={submit}
          disabled={!data.name || !data.phone || !data.email}
          className="w-full h-12 rounded-xl font-semibold text-sm"
        >
          Enviar candidatura
        </Button>
        <p className="text-[11px] text-muted-foreground text-center">
          Receberá um email com o resultado da sua candidatura.
        </p>
      </div>
    ),
  };

  const currentContent = stepContent[step];

  return (
    <div className="space-y-4">
      <ProgressBar current={step} steps={steps} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {currentContent}
        </motion.div>
      </AnimatePresence>

      {step !== 'urgency' && step !== 'result' && step !== 'contact' && (
        <button
          type="button"
          onClick={() => {
            const idx = steps.indexOf(step);
            if (idx > 0) setStep(steps[idx - 1]);
          }}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors pt-1"
        >
          <ChevronLeft className="w-3 h-3" /> Voltar
        </button>
      )}
    </div>
  );
};

export default LeadForm;
