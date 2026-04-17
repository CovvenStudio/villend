import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockCandidates, mockProperties, mockAppointments } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

// ─── Slot generation ──────────────────────────────────────────────────────────

// 09:00 to 17:30 every 30 min = 18 slots
const ALL_TIMES = Array.from({ length: 18 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

// Next 14 weekdays (Mon–Sat, skip Sunday)
function getAvailableDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let offset = 1;
  while (dates.length < 14) {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    if (d.getDay() !== 0) dates.push(d.toISOString().slice(0, 10));
    offset++;
  }
  return dates;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const VisitBooking = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const { toast } = useToast();

  const candidate = mockCandidates.find(c => c.id === candidateId);
  const property = candidate ? mockProperties.find(p => p.id === candidate.propertyId) : undefined;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (!candidate || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold mb-2">Link inválido</h1>
          <p className="text-sm text-muted-foreground">Este link de agendamento não existe ou já expirou.</p>
          <Link to="/" className="text-accent hover:underline text-sm mt-4 inline-block">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  if (candidate.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-xl font-bold mb-2">Agendamento não disponível</h1>
          <p className="text-sm text-muted-foreground">A sua candidatura ainda não foi aprovada para este imóvel.</p>
        </div>
      </div>
    );
  }

  // ── Blocked slots: agent already has a confirmed appointment at that date+time ──
  const agentIds = new Set(property.agentIds);
  const blockedSlots = new Set(
    mockAppointments
      .filter(a => agentIds.has(a.agentId) && a.status === 'confirmed')
      .map(a => `${a.date}|${a.time}`)
  );

  const availableDates = getAvailableDates();

  const timesForDate = (date: string) =>
    ALL_TIMES.filter(t => !blockedSlots.has(`${date}|${t}`));

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    setSubmitted(true);
    toast({ title: 'Pedido de visita enviado!', description: 'O agente irá confirmar brevemente.' });
  };

  // ── Confirmation screen ────────────────────────────────────────────────────

  if (submitted && selectedDate && selectedTime) {
    const confirmedDate = new Date(selectedDate + 'T00:00');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-700 tracking-tight mb-2">Pedido enviado!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A sua preferência foi registada. O agente irá confirmar a data brevemente.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border text-sm space-y-2.5 text-left">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{property.title}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{confirmedDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{selectedTime}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Receberá confirmação por email assim que o agente aprovar a data.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto px-6 h-14 flex items-center justify-center">
          <div className="flex items-center gap-1">
            <span className="font-display text-lg font-700 tracking-tight">vyllad</span>
            <span className="text-accent text-lg">.</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10 max-w-xl">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Candidatura aprovada
          </p>
          <h1 className="font-display text-2xl font-700 tracking-tight mb-2">
            Olá, {candidate.name.split(' ')[0]}!
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A sua candidatura ao{' '}
            <strong className="text-foreground">{property.title}</strong>{' '}
            foi aprovada. Escolha um dia e horário que prefere para realizar a visita.
          </p>
          {property.location && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{property.location}</span>
            </div>
          )}
        </motion.div>

        {/* Date picker */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            1. Escolha um dia
          </h2>
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth">
              {availableDates.map(date => {
                const d = new Date(date + 'T00:00');
                const slots = timesForDate(date);
                const isSelected = selectedDate === date;
                const noSlots = slots.length === 0;
                return (
                  <button
                    key={date}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                    disabled={noSlots}
                    className={`snap-start flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border text-sm transition-all ${
                      noSlots
                        ? 'opacity-25 cursor-not-allowed border-border'
                        : isSelected
                          ? 'border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-border hover:border-primary/40 hover:bg-muted/50 cursor-pointer'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wide font-medium mb-0.5 opacity-70">
                      {d.toLocaleDateString('pt-PT', { weekday: 'short' })}
                    </span>
                    <span className="font-display font-700 text-lg leading-tight">{d.getDate()}</span>
                    <span className="text-[10px] opacity-60 mt-0.5">
                      {d.toLocaleDateString('pt-PT', { month: 'short' })}
                    </span>
                    {!noSlots && (
                      <span className="text-[9px] mt-1 opacity-50">{slots.length} slots</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Time slots */}
        <AnimatePresence>
          {selectedDate && (
            <motion.section
              key="times"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                2. Escolha um horário
              </h2>
              {timesForDate(selectedDate).length === 0 ? (
                <div className="p-4 rounded-xl bg-muted/50 border text-sm text-muted-foreground text-center">
                  Sem horários disponíveis neste dia. Por favor escolha outro.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {timesForDate(selectedDate).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTime(t)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        selectedTime === t
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/40 hover:bg-muted/50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Summary + submit */}
        <AnimatePresence>
          {selectedDate && selectedTime && (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-card border text-sm space-y-2.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Resumo</p>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{new Date(selectedDate + 'T00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{selectedTime}</span>
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full h-12 rounded-xl font-semibold">
                Confirmar preferência de visita
              </Button>
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                A visita será confirmada pelo agente com base na disponibilidade.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default VisitBooking;
