import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MapPin, User, CheckCircle, Filter } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { mockAppointments, mockProperties, mockCandidates, mockAgents } from '@/lib/mock-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusConfig = {
  confirmed: { label: 'Confirmada', className: 'bg-accent/10 text-accent' },
  completed: { label: 'Concluída', className: 'bg-score-excellent text-score-excellent' },
  cancelled: { label: 'Cancelada', className: 'bg-destructive/10 text-destructive' },
};

const Appointments = () => {
  const [agentFilter, setAgentFilter] = useState<string>('all');

  const enriched = useMemo(() => {
    return mockAppointments.map((a) => ({
      ...a,
      property: mockProperties.find((p) => p.id === a.propertyId),
      candidate: mockCandidates.find((c) => c.id === a.candidateId),
      agent: mockAgents.find((ag) => ag.id === a.agentId),
    }));
  }, []);

  const filtered = enriched
    .filter((a) => agentFilter === 'all' || a.agentId === agentFilter)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const upcoming = filtered.filter((a) => a.status === 'confirmed');
  const past = filtered.filter((a) => a.status !== 'confirmed');

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-6xl">
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
                {mockAgents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Stat label="Próximas" value={upcoming.length} />
          <Stat label="Concluídas" value={enriched.filter((a) => a.status === 'completed').length} />
          <Stat label="Hoje" value={upcoming.filter((a) => a.date === new Date().toISOString().slice(0, 10)).length} />
          <Stat label="Esta semana" value={upcoming.length} />
        </div>

        <Section title="Próximas visitas" items={upcoming} />
        {past.length > 0 && <Section title="Histórico" items={past} muted />}
      </div>
    </DashboardLayout>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-5 rounded-xl border bg-card">
    <div className="text-2xl font-display font-700 tracking-tight">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

const Section = ({ title, items, muted }: { title: string; items: any[]; muted?: boolean }) => (
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
                  {new Date(apt.date).toLocaleDateString('pt-PT', { month: 'short' })}
                </span>
                <span className="font-display font-700 text-xl leading-none">
                  {new Date(apt.date).getDate()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate">{apt.property?.title}</span>
                  <Badge variant="secondary" className={`${st.className} text-[11px] font-medium`}>
                    {st.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {apt.time}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {apt.property?.location}</span>
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

export default Appointments;
