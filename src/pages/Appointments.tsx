import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, MapPin, User, Filter,
  X, CalendarCheck, UserCheck, Plus, ChevronRight, Link2, Check,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mockAppointments, mockProperties, mockCandidates, mockAgents } from '@/lib/mock-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Appointment, Candidate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

const statusConfig = {
  confirmed: { label: 'Confirmada', className: 'bg-accent/10 text-accent' },
  completed: { label: 'Concluída', className: 'bg-emerald-500/10 text-emerald-600' },
  cancelled: { label: 'Cancelada', className: 'bg-destructive/10 text-destructive' },
};

// ─── Schedule Modal ───────────────────────────────────────────────────────────

interface ScheduleModalProps {
  candidate: Candidate;
  onClose: () => void;
  onConfirm: (apt: Appointment) => void;
}

const ScheduleModal = ({ candidate, onClose, onConfirm }: ScheduleModalProps) => {
  const property = mockProperties.find(p => p.id === candidate.propertyId);

  // Pre-fill from proposedVisit if present
  const proposed = candidate.proposedVisit ? new Date(candidate.proposedVisit) : null;
  const proposedDate = proposed
    ? proposed.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const proposedTime = proposed
    ? `${String(proposed.getHours()).padStart(2, '0')}:${String(proposed.getMinutes()).padStart(2, '0')}`
    : '';

  const [date, setDate] = useState(proposedDate);
  const [time, setTime] = useState(proposedTime);
  const [agentId, setAgentId] = useState(mockAgents[0]?.id ?? '');
  const [notes, setNotes] = useState('');
  const isProposed = !!candidate.proposedVisit;

  const canSubmit = date && time && agentId;

  const handleSubmit = () => {
    const apt: Appointment = {
      id: `apt-${Date.now()}`,
      propertyId: candidate.propertyId,
      candidateId: candidate.id,
      agentId,
      date,
      time,
      status: 'confirmed',
      notes: notes || undefined,
    };
    onConfirm(apt);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        key="panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="w-full max-w-lg bg-card rounded-2xl shadow-2xl border pointer-events-auto overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
            <div>
              <h2 className="font-display font-700 text-lg tracking-tight">
                {isProposed ? 'Confirmar visita proposta' : 'Agendar visita'}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {candidate.name} · {property?.title ?? '—'}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Proposed visit callout */}
            {isProposed && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <CalendarCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-amber-800">Candidato propôs uma data</p>
                  <p className="text-amber-700 mt-0.5">
                    {new Date(candidate.proposedVisit!).toLocaleDateString('pt-PT', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })} às {proposedTime}
                  </p>
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Data da visita</Label>
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setDate(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>

            {/* Time slots */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Horário</Label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTime(t)}
                    className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                      time === t
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Agent */}
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Agente responsável</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger className="rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockAgents.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label className="text-xs font-medium mb-1.5 block">Notas <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Textarea
                placeholder="Ex: trazer documentos de rendimento, visita guiada ao exterior…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="rounded-xl resize-none text-sm"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
                Cancelar
              </Button>
              <Button
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="flex-1 rounded-xl font-semibold"
              >
                <CalendarCheck className="w-4 h-4 mr-1.5" />
                {isProposed ? 'Confirmar visita' : 'Agendar visita'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Pending Card ─────────────────────────────────────────────────────────────

const PendingCard = ({ candidate, onSchedule }: { candidate: Candidate; onSchedule: () => void }) => {
  const property = mockProperties.find(p => p.id === candidate.propertyId);
  const hasProposed = !!candidate.proposedVisit;
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/visit/${candidate.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: 'Link copiado!', description: `Partilhe com ${candidate.name.split(' ')[0]}.` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-all">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <UserCheck className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm">{candidate.name}</span>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {candidate.score}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{property?.title ?? '—'}</p>
        {hasProposed && (
          <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1">
            <CalendarCheck className="w-3 h-3" />
            Propõe {new Date(candidate.proposedVisit!).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })} às{' '}
            {new Date(candidate.proposedVisit!).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopyLink}
          title="Copiar link de agendamento"
          className={`p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5 ${
            copied
              ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
              : 'border-border hover:border-primary/40 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copiado' : 'Link'}</span>
        </button>
        <Button
          size="sm"
          variant={hasProposed ? 'default' : 'outline'}
          onClick={onSchedule}
          className="rounded-lg shrink-0 gap-1.5 text-xs"
        >
          {hasProposed ? (
            <><CalendarCheck className="w-3.5 h-3.5" /> Confirmar</>
          ) : (
            <><Plus className="w-3.5 h-3.5" /> Agendar</>
          )}
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

// ─── Stat ─────────────────────────────────────────────────────────────────────

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-5 rounded-xl border bg-card">
    <div className="text-2xl font-display font-700 tracking-tight">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

// ─── Section ──────────────────────────────────────────────────────────────────

const Section = ({ title, items, muted }: { title: string; items: ReturnType<typeof useEnriched>; muted?: boolean }) => (
  <div className={muted ? 'mt-10 opacity-70' : 'mb-10'}>
    <h2 className="font-display font-600 text-sm mb-4">{title}</h2>
    {items.length === 0 ? (
      <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
        <CalendarIcon className="w-7 h-7 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Sem agendamentos</p>
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((apt, i) => {
          const st = statusConfig[apt.status as keyof typeof statusConfig];
          return (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl border bg-card hover:shadow-md transition-all duration-300 flex items-center gap-5"
            >
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-primary/[0.04] shrink-0">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {new Date(apt.date + 'T00:00').toLocaleDateString('pt-PT', { month: 'short' })}
                </span>
                <span className="font-display font-700 text-xl leading-none">
                  {new Date(apt.date + 'T00:00').getDate()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">{apt.property?.title}</span>
                  {st && (
                    <Badge variant="secondary" className={`${st.className} text-[11px] font-medium`}>
                      {st.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {apt.time}</span>
                  {apt.property?.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {apt.property.location}</span>
                  )}
                  <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {apt.candidate?.name}</span>
                </div>
                {apt.notes && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{apt.notes}</p>
                )}
              </div>
              {apt.agent && (
                <div className="hidden sm:flex items-center gap-2 pl-4 border-l shrink-0">
                  <img src={apt.agent.picture} alt={apt.agent.name} className="w-8 h-8 rounded-full bg-muted" />
                  <div className="text-xs">
                    <div className="font-medium truncate max-w-[120px]">{apt.agent.name}</div>
                    <div className="text-muted-foreground text-[10px]">Agente</div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    )}
  </div>
);

// Helper used for type inference
function useEnriched(apts: Appointment[]) {
  return apts.map(a => ({
    ...a,
    property: mockProperties.find(p => p.id === a.propertyId),
    candidate: mockCandidates.find(c => c.id === a.candidateId),
    agent: mockAgents.find(ag => ag.id === a.agentId),
  }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const Appointments = () => {
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [schedulingFor, setSchedulingFor] = useState<Candidate | null>(null);

  // Approved candidates not yet in appointments
  const scheduledCandidateIds = new Set(appointments.map(a => a.candidateId));
  const pendingCandidates = mockCandidates.filter(
    c => c.status === 'approved' && !scheduledCandidateIds.has(c.id)
  );

  const enriched = useEnriched(appointments);

  const filtered = enriched
    .filter(a => agentFilter === 'all' || a.agentId === agentFilter)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const upcoming = filtered.filter(a => a.status === 'confirmed');
  const past = filtered.filter(a => a.status !== 'confirmed');

  const today = new Date().toISOString().slice(0, 10);

  const handleConfirm = (apt: Appointment) => {
    setAppointments(prev => [...prev, apt]);
    setSchedulingFor(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">Agendamentos</h1>
            <p className="text-sm text-muted-foreground mt-1">Visitas confirmadas e histórico</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[200px] rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os agentes</SelectItem>
                {mockAgents.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Stat label="Próximas" value={upcoming.length} />
          <Stat label="Concluídas" value={enriched.filter(a => a.status === 'completed').length} />
          <Stat label="Hoje" value={upcoming.filter(a => a.date === today).length} />
          <Stat label="Aguardam agendamento" value={pendingCandidates.length} />
        </div>

        {/* Pending scheduling — approved candidates */}
        {pendingCandidates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-display font-600 text-sm">Candidatos aprovados — aguardam agendamento</h2>
              <span className="text-[11px] font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {pendingCandidates.length}
              </span>
            </div>
            <div className="space-y-2">
              {pendingCandidates.map(c => (
                <PendingCard
                  key={c.id}
                  candidate={c}
                  onSchedule={() => setSchedulingFor(c)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Appointment lists */}
        <Section title="Próximas visitas" items={upcoming} />
        {past.length > 0 && <Section title="Histórico" items={past} muted />}
      </div>

      {/* Schedule modal */}
      {schedulingFor && (
        <ScheduleModal
          candidate={schedulingFor}
          onClose={() => setSchedulingFor(null)}
          onConfirm={handleConfirm}
        />
      )}
    </DashboardLayout>
  );
};

export default Appointments;
