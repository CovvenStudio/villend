import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Clock, MapPin, CheckCircle,
  ChevronLeft, ChevronRight, Loader2, X, CalendarX2, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  getVisitInfo,
  submitProposedSlots,
  type VisitInfoResponse,
  type ProposedSlotDto,
} from '@/lib/leads-api';
import { cancelAppointmentPublic, rescheduleAppointmentPublic } from '@/lib/appointments-api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Generate HH:MM sub-slots within [start, end) at intervalMinutes (used for booked check). */
function generateSubSlotsPublic(start: string, end: string, intervalMinutes: number): string[] {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins   = eh * 60 + em;
  const slots: string[] = [];
  for (let m = startMins; m < endMins; m += intervalMinutes) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return slots;
}

// ─── Mini Calendar ────────────────────────────────────────────────────────────

function MiniCalendar({
  selectedDates,
  onToggleDate,
  minDate,
  availableWeekdays,
  blockedDates,
}: {
  selectedDates: Set<string>;
  onToggleDate: (d: string) => void;
  minDate: string;
  availableWeekdays?: number[];
  blockedDates?: Set<string>;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const cells = Array.from(
    { length: firstDow + daysInMonth },
    (_, i) => (i < firstDow ? null : i - firstDow + 1),
  );

  return (
    <div className="rounded-2xl border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button
          type="button"
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-sm font-semibold">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="px-3 py-3">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />;
            const ds = toDateStr(viewYear, viewMonth, d);
            const isPast      = ds < minDate;
            const isDayOff    = availableWeekdays != null && !availableWeekdays.includes(new Date(ds + 'T00:00').getDay());
            const isBlocked   = blockedDates?.has(ds) ?? false;
            const isDisabled  = isPast || isDayOff || isBlocked;
            const isSelected  = selectedDates.has(ds);
            const isToday     = ds === new Date().toISOString().slice(0, 10);

            return (
              <button
                key={ds}
                type="button"
                disabled={isDisabled}
                onClick={() => onToggleDate(ds)}
                className={[
                  'h-9 w-full rounded-xl text-sm font-medium transition-all select-none',
                  isDisabled
                    ? 'text-gray-300 cursor-not-allowed line-through decoration-gray-300'
                    : 'cursor-pointer hover:bg-[#1a2341]/8',
                  isSelected
                    ? 'bg-[#1a2341] text-white font-semibold shadow-sm'
                    : isToday && !isDisabled
                    ? 'ring-2 ring-[#1a2341] text-[#1a2341] font-semibold'
                    : !isDisabled ? 'text-gray-700' : '',
                ].join(' ')}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Step: choose dates + periods ─────────────────────────────────────────────

function StepChoose({
  info,
  onSubmit,
}: {
  info: VisitInfoResponse;
  onSubmit: (slots: ProposedSlotDto[]) => void;
}) {
  const config  = info.schedulingConfig;
  const maxPick = config?.maxClientChoices ?? 3;
  const periods = config?.periods ?? [
    { label: 'Manhã',           start: '09:00', end: '12:00' },
    { label: 'Início da tarde', start: '14:00', end: '16:00' },
    { label: 'Final do dia',    start: '16:00', end: '18:00' },
  ];
  const intervalMin = config?.agentSlotIntervalMinutes ?? 30;
  const bookedSlots = info.bookedSlots ?? [];
  const propertyAgentIds = info.propertyAgentIds ?? [];
  const totalAgents = Math.max(propertyAgentIds.length, 1);

  // Pre-compute: for each date, which period labels are fully booked
  // A period is "fully booked" only if ALL agents for the property are booked
  // at every sub-slot within that period.
  const fullyBookedPeriods = useMemo<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>();
    for (const period of periods) {
      const subSlots = generateSubSlotsPublic(period.start, period.end, intervalMin);
      if (subSlots.length === 0) continue;
      // Group booked times by date, then by agentId
      const bookedByDateAgent = new Map<string, Map<string, Set<string>>>();
      for (const bs of bookedSlots) {
        if (!bookedByDateAgent.has(bs.date)) bookedByDateAgent.set(bs.date, new Map());
        const byAgent = bookedByDateAgent.get(bs.date)!;
        if (!byAgent.has(bs.agentId)) byAgent.set(bs.agentId, new Set());
        byAgent.get(bs.agentId)!.add(bs.time);
      }
      for (const [date, byAgent] of bookedByDateAgent) {
        // A sub-slot is "taken" only if ALL agents are booked at that time
        const allSlotsTaken = subSlots.every(slot => {
          const agentsToCheck = propertyAgentIds.length > 0 ? propertyAgentIds : [...byAgent.keys()];
          return agentsToCheck.every(agId => byAgent.get(agId)?.has(slot));
        });
        if (allSlotsTaken) {
          if (!map.has(date)) map.set(date, new Set());
          map.get(date)!.add(period.label);
        }
      }
    }
    return map;
  }, [bookedSlots, propertyAgentIds, periods, intervalMin, totalAgents]);

  // Dates where ALL periods are fully booked → disable in calendar
  const fullyBookedDates = useMemo(() => {
    const dates = new Set<string>();
    for (const [date, bookedPeriodSet] of fullyBookedPeriods) {
      if (periods.every(p => bookedPeriodSet.has(p.label))) {
        dates.add(date);
      }
    }
    return dates;
  }, [fullyBookedPeriods, periods]);

  const [slots, setSlots] = useState<ProposedSlotDto[]>([]);
  // date currently being period-picked
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  const selectedDates = new Set(slots.map(s => s.date));
  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const handleToggleDate = (date: string) => {
    if (fullyBookedDates.has(date)) return;
    if (selectedDates.has(date)) {
      setSlots(s => s.filter(sl => sl.date !== date));
      if (pendingDate === date) setPendingDate(null);
    } else {
      if (slots.length >= maxPick) return;
      setPendingDate(date);
    }
  };

  const handlePickPeriod = (periodLabel: string) => {
    if (!pendingDate) return;
    setSlots(s => [...s.filter(sl => sl.date !== pendingDate), { date: pendingDate, periodLabel }]);
    setPendingDate(null);
  };

  const handleRemoveSlot = (idx: number) => {
    setSlots(s => s.filter((_, i) => i !== idx));
  };

  const formatDate = (ds: string) => {
    const d = new Date(ds + 'T00:00');
    return d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const canSubmit = slots.length > 0 && !pendingDate;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1a2341]">
          Escolha até {maxPick} {maxPick !== 1 ? 'opções' : 'opção'} de visita
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Seleccione um dia no calendário e depois o período que prefere.
          O agente confirmará a hora exacta dentro desse período.
        </p>
      </div>

      <MiniCalendar
        selectedDates={selectedDates}
        onToggleDate={handleToggleDate}
        minDate={minDate}
        availableWeekdays={config?.availableWeekdays}
        blockedDates={fullyBookedDates}
      />

      {/* Period picker */}
      <AnimatePresence>
        {pendingDate && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl border bg-white p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-[#1a2341]">
                {formatDate(pendingDate)} — escolha um período
              </p>
              <button
                onClick={() => setPendingDate(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {periods.map(p => {
                const isFullyBooked = fullyBookedPeriods.get(pendingDate)?.has(p.label) ?? false;
                return (
                  <button
                    key={p.label}
                    type="button"
                    disabled={isFullyBooked}
                    onClick={() => !isFullyBooked && handlePickPeriod(p.label)}
                    className={`flex flex-col items-center p-3 rounded-xl border transition-all text-left ${
                      isFullyBooked
                        ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200'
                        : 'hover:border-[#1a2341]/40 hover:bg-[#1a2341]/[0.03]'
                    }`}
                  >
                    <span className="font-semibold text-sm text-[#1a2341]">{p.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{p.start} – {p.end}</span>
                    {isFullyBooked && (
                      <span className="text-[10px] text-red-400 font-semibold mt-1">Esgotado</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected slots */}
      {slots.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            As suas opções ({slots.length}/{maxPick})
          </p>
          {slots.map((s, i) => (
            <div
              key={`${s.date}-${s.periodLabel}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1a2341]/[0.04] border border-[#1a2341]/10"
            >
              <CalendarCheck className="w-4 h-4 text-[#1a2341] shrink-0" />
              <div className="flex-1 text-sm">
                <span className="font-semibold text-[#1a2341]">{formatDate(s.date)}</span>
                <span className="text-gray-500 mx-2">·</span>
                <span className="text-gray-600">{s.periodLabel}</span>
              </div>
              <button
                onClick={() => handleRemoveSlot(i)}
                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button
        disabled={!canSubmit}
        onClick={() => onSubmit(slots)}
        className="w-full rounded-2xl h-12 font-semibold text-base"
        style={{ backgroundColor: '#1a2341' }}
      >
        <CalendarCheck className="w-4 h-4 mr-2" />
        Enviar preferências de visita
      </Button>
    </div>
  );
}

// ─── Step: success ────────────────────────────────────────────────────────────

function StepSuccess({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold text-[#1a2341] mb-2">
        Preferências enviadas!
      </h2>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">
        Olá {name.split(' ')[0]}, as suas opções foram registadas.
        O agente entrará em contacto para confirmar a data e hora exacta.
      </p>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VisitSlotPicker() {
  const { candidateId: leadId } = useParams<{ candidateId: string }>();
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token') ?? '';
  const cancelToken    = searchParams.get('cancelToken') ?? '';
  const appointmentId  = searchParams.get('appointmentId') ?? '';
  const { toast } = useToast();

  const [info, setInfo]       = useState<VisitInfoResponse | null>(null);
  const [step, setStep]       = useState<'loading' | 'manage' | 'choose' | 'success' | 'cancelled' | 'error'>(
    cancelToken && appointmentId ? 'manage' : 'loading'
  );
  // appointmentId resolved from URL or from getVisitInfo (old email links)
  const [resolvedAptId, setResolvedAptId]           = useState(appointmentId);
  const [resolvedCancelToken, setResolvedCancelToken] = useState(cancelToken);
  const [actionBusy, setActionBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // New email links: appointmentId present → show manage view directly
    if (cancelToken && appointmentId) return;

    if (!leadId || !token) { setStep('error'); return; }

    getVisitInfo(leadId, token)
      .then(data => {
        setInfo(data);
        // Old email links: cancelToken present but no appointmentId
        // → backend returns activeAppointment so we can show manage view
        if (cancelToken && data.activeAppointment) {
          setResolvedAptId(data.activeAppointment.id);
          setResolvedCancelToken(data.activeAppointment.cancelToken);
          setStep('manage');
          return;
        }
        setStep(data.lead.proposedSlots.length > 0 ? 'success' : 'choose');
      })
      .catch(() => setStep('error'));
  }, [leadId, token, cancelToken, appointmentId]);

  const handlePublicCancel = async () => {
    setActionBusy(true);
    try {
      await cancelAppointmentPublic(resolvedAptId, resolvedCancelToken);
      setStep('cancelled');
    } catch {
      toast({ title: 'Erro ao cancelar. Tente novamente.', variant: 'destructive' });
    } finally {
      setActionBusy(false);
    }
  };

  const handlePublicReschedule = async () => {
    if (!leadId || !token) { setStep('error'); return; }
    setActionBusy(true);
    try {
      await rescheduleAppointmentPublic(resolvedAptId, resolvedCancelToken);
      const data = await getVisitInfo(leadId, token);
      setInfo(data);
      setStep('choose');
    } catch {
      toast({ title: 'Erro ao reagendar. Tente novamente.', variant: 'destructive' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleSubmit = async (slots: ProposedSlotDto[]) => {
    if (!leadId) return;
    setSubmitting(true);
    try {
      await submitProposedSlots(leadId, token, slots);
      setStep('success');
    } catch {
      toast({ title: 'Erro ao enviar preferências. Tente novamente.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <p className="text-xl font-bold tracking-tight" style={{ color: '#1a2341' }}>
          vyllad<span style={{ color: '#c9a96e' }}>.</span>
        </p>
        {info?.property && (
          <span className="text-sm text-gray-500 flex items-center gap-1.5 border-l pl-3 ml-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {info.property.title}
            {info.property.location && (
              <span className="text-gray-400">· {info.property.location}</span>
            )}
          </span>
        )}
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border shadow-sm p-6 sm:p-8"
          >
            {step === 'loading' && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
              </div>
            )}

            {step === 'manage' && (
              <div className="text-center py-8 space-y-5">
                <div className="w-14 h-14 rounded-full bg-[#1a2341]/[0.06] flex items-center justify-center mx-auto">
                  <CalendarCheck className="w-7 h-7 text-[#1a2341]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1a2341]">Gerir a sua visita</h2>
                  <p className="text-sm text-gray-500 mt-1">O que pretende fazer com a visita agendada?</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handlePublicReschedule}
                    disabled={actionBusy}
                    className="w-full gap-2 bg-[#1a2341] hover:bg-[#1a2341]/90"
                  >
                    {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Reagendar visita
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePublicCancel}
                    disabled={actionBusy}
                    className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {actionBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarX2 className="w-4 h-4" />}
                    Cancelar visita
                  </Button>
                </div>
              </div>
            )}

            {step === 'cancelled' && (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  <CalendarX2 className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-base font-semibold text-gray-700">Visita cancelada</p>
                <p className="text-sm text-gray-500">A sua visita foi cancelada com sucesso. A agência foi notificada.</p>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center py-10">
                <p className="text-base font-semibold text-gray-700">Link inválido ou expirado</p>
                <p className="text-sm text-gray-500 mt-2">
                  Se tiver dúvidas, contacte a agência diretamente.
                </p>
              </div>
            )}

            {step === 'choose' && info && (
              <StepChoose
                info={info}
                onSubmit={handleSubmit}
              />
            )}

            {step === 'success' && info && (
              <StepSuccess name={info.lead.name} />
            )}

            {(submitting || (actionBusy && step === 'loading')) && (
              <div className="absolute inset-0 bg-white/70 rounded-3xl flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </div>
            )}
          </motion.div>

          {/* Info */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> O agente confirmará a hora exacta
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
