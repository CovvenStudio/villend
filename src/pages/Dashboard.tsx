import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, CheckCircle, XCircle, Clock, Eye, Filter,
  Zap, Flame, BanIcon, ChevronRight, Users, TrendingUp,
  ArrowUpRight, CalendarCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProperties, mockCandidates, mockAgents, mockAppointments } from '@/lib/mock-data';
import { Candidate, Property, generateInsight } from '@/lib/types';
import AddPropertyDialog from '@/components/dashboard/AddPropertyDialog';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LeadDetailSheet from '@/components/dashboard/LeadDetailSheet';


// ─── Priority config ──────────────────────────────────────────────────────────
function getPriorityConfig(c: Candidate) {
  if (c.score >= 80) return {
    badge: 'border-border/60 bg-card text-foreground',
    dot: 'bg-emerald-500',
    label: 'Contactar agora',
  };
  if (c.score >= 60) return {
    badge: 'border-border/60 bg-card text-foreground',
    dot: 'bg-amber-400',
    label: 'Avaliar',
  };
  return {
    badge: 'border-border/60 bg-card text-muted-foreground',
    dot: 'bg-muted-foreground/30',
    label: 'Desprioritizar',
  };
}

const statusConfig: Record<Candidate['status'], { label: string; icon: typeof Clock; className: string }> = {
  new: { label: 'Novo', icon: Clock, className: 'bg-muted text-muted-foreground' },
  approved: { label: 'Aprovado', icon: CheckCircle, className: 'bg-emerald-500/10 text-emerald-600' },
  rejected: { label: 'Rejeitado', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  visit_scheduled: { label: 'Visita marcada', icon: Calendar, className: 'bg-blue-500/10 text-blue-600' },
};

// ─── Score circle ─────────────────────────────────────────────────────────────
function ScoreCircle({ score, classification }: { score: number; classification: Candidate['classification'] }) {
  const color =
    classification === 'excellent' ? 'text-foreground' :
    classification === 'potential' ? 'text-foreground' : 'text-muted-foreground';
  return (
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-muted/60 relative">
      <span className={`font-display font-700 text-base leading-none ${color}`}>{score}</span>
      <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full ${
        classification === 'excellent' ? 'bg-emerald-500' :
        classification === 'potential' ? 'bg-amber-400' : 'bg-muted-foreground/30'
      }`} />
    </div>
  );
}


// ─── Smart Insights Panel ─────────────────────────────────────────────────────
function SmartInsightsPanel({
  allCandidates,
  properties,
  onSelectCandidate,
}: {
  allCandidates: Candidate[];
  properties: Property[];
  onSelectCandidate: (c: Candidate) => void;
}) {
  const topLeads = [...allCandidates]
    .filter(c => c.status !== 'rejected')
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const readyNow = allCandidates.filter(
    c => c.urgency === 'immediate' && c.classification !== 'low' && c.status !== 'rejected'
  );
  const ignore = allCandidates.filter(c => c.classification === 'low' && c.status === 'new');

  const [tab, setTab] = useState<'top' | 'ready' | 'ignore'>('top');
  const displayed = tab === 'top' ? topLeads : tab === 'ready' ? readyNow : ignore;

  const tabs = [
    { key: 'top' as const, icon: Flame, label: 'Top 5 hoje', count: topLeads.length, color: 'text-orange-500' },
    { key: 'ready' as const, icon: Zap, label: 'Prontos agora', count: readyNow.length, color: 'text-emerald-500' },
    { key: 'ignore' as const, icon: BanIcon, label: 'Para ignorar', count: ignore.length, color: 'text-muted-foreground' },
  ];

  const subtitles: Record<typeof tab, string> = {
    top: 'Maior probabilidade de conversão. Contacta primeiro.',
    ready: 'Alta urgência de mudança — não percas tempo.',
    ignore: 'Baixa compatibilidade com os critérios. Poupa energia.',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border bg-card overflow-hidden mb-8"
    >
      <div className="flex border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors relative ${
              tab === t.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className={`w-4 h-4 ${t.key === tab ? t.color : ''}`} />
            <span className="hidden sm:inline">{t.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
              tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>{t.count}</span>
            {tab === t.key && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-3 font-medium">{subtitles[tab]}</p>
        {displayed.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-6">Nenhum lead nesta categoria.</p>
        ) : (
          <div className="space-y-1">
            <AnimatePresence mode="wait">
              {displayed.map((c, i) => {
                const prop = properties.find(p => p.id === c.propertyId);
                const insight = prop
                  ? generateInsight(c, prop.criteria, prop.rentalPrice ?? prop.price ?? 0)
                  : '';
                return (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => onSelectCandidate(c)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                  >
                    {tab === 'top' && (
                      <span className="text-xs font-display font-700 text-muted-foreground/30 w-4 shrink-0 text-center">{i + 1}</span>
                    )}
                    <ScoreCircle score={c.score} classification={c.classification} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{c.name}</span>
                        {c.urgency === 'immediate' && (
                          <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5">
                            <Zap className="w-3 h-3" />Urgente
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{insight}</p>
                    </div>
                    {prop && (
                      <span className="text-[10px] text-muted-foreground/50 hidden sm:block shrink-0 max-w-[120px] truncate">{prop.title}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Lead Card ────────────────────────────────────────────────────────────────
function LeadCard({
  candidate,
  property,
  onClick,
}: {
  candidate: Candidate;
  property: Property | undefined;
  onClick: () => void;
}) {
  const priority = getPriorityConfig(candidate);
  const sc = statusConfig[candidate.status];
  const StatusIcon = sc.icon;
  const insight = property
    ? generateInsight(candidate, property.criteria, property.rentalPrice ?? property.price ?? 0)
    : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="group flex items-center gap-4 px-4 py-4 rounded-2xl border bg-card hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
      onClick={onClick}
    >
      <ScoreCircle score={candidate.score} classification={candidate.classification} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm">{candidate.name}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${priority.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priority.dot}`} />
            {priority.label}
          </span>
          {candidate.urgency === 'immediate' && (
            <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5">
              <Zap className="w-3 h-3" />Agora
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{insight}</p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />€{candidate.monthlyIncome.toLocaleString('pt-PT')}/mês
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />{candidate.numberOfPeople} pessoa{candidate.numberOfPeople > 1 ? 's' : ''}
          </span>
          {property && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">{property.title}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg ${sc.className}`}>
          <StatusIcon className="w-3 h-3" />{sc.label}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
      </div>
    </motion.div>
  );
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow({ candidates }: { candidates: Candidate[] }) {
  const total = candidates.length;
  const excellent = candidates.filter(c => c.classification === 'excellent').length;
  const visitsScheduled = candidates.filter(c => c.status === 'visit_scheduled').length;
  const avgScore = total > 0 ? Math.round(candidates.reduce((s, c) => s + c.score, 0) / total) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: 'Candidatos', value: total, icon: Users, sub: 'total' },
        { label: 'Alta prioridade', value: excellent, icon: ArrowUpRight, sub: 'para contactar', highlight: excellent > 0 },
        { label: 'Visitas marcadas', value: visitsScheduled, icon: CalendarCheck, sub: 'confirmadas' },
        { label: 'Score médio', value: avgScore, icon: TrendingUp, sub: 'dos candidatos' },
      ].map(({ label, value, icon: Icon, sub, highlight }) => (
        <div key={label} className={`rounded-2xl border p-4 bg-card ${highlight ? 'border-emerald-500/20' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <Icon className={`w-4 h-4 ${highlight ? 'text-emerald-500' : 'text-muted-foreground/40'}`} />
          </div>
          <div className={`font-display text-2xl font-700 tracking-tight ${highlight ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
            {value}
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [addOpen, setAddOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);

  // Determine which agent is logged in (mock: agent-1)
  const currentAgent = mockAgents[0];
  const filteredProperties = mockProperties.filter(p =>
    p.agentIds.includes(currentAgent.id)
  );
  const effectiveSelected = selectedProperty ?? filteredProperties[0]?.id ?? null;
  const property = filteredProperties.find(p => p.id === effectiveSelected) ?? null;

  const propertyCandidates = useMemo(() => {
    return candidates
      .filter(c => c.propertyId === effectiveSelected)
      .filter(c => scoreFilter === 'all' || (
        scoreFilter === 'high' ? c.score >= 80 :
        scoreFilter === 'mid' ? c.score >= 60 && c.score < 80 :
        c.score < 60
      ))
      .filter(c => statusFilter === 'all' || c.status === statusFilter)
      .filter(c => urgencyFilter === 'all' || c.urgency === urgencyFilter)
      .sort((a, b) => b.score - a.score);
  }, [candidates, effectiveSelected, scoreFilter, statusFilter, urgencyFilter]);

  const allAgentCandidates = useMemo(() =>
    candidates.filter(c =>
      filteredProperties.some(p => p.id === c.propertyId)
    ),
    [candidates, filteredProperties]
  );

  function handleStatusChange(id: string, status: Candidate['status']) {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  }

  function openCandidate(c: Candidate) {
    setSelectedCandidate(c);
    setSheetOpen(true);
  }

  const propertyAgents = mockAgents.filter(a => property?.agentIds.includes(a.id));
  const propertyAppointments = mockAppointments.filter(a => a.propertyId === effectiveSelected);

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8 gap-4"
        >
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-700 tracking-tight">
              Quem contactar agora
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Leads classificados por prioridade de conversão
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            size="sm"
            className="shrink-0 gap-2 rounded-xl font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo imóvel</span>
          </Button>
        </motion.div>

        {filteredProperties.length === 0 ? (
          <div className="rounded-2xl border bg-card p-16 text-center text-muted-foreground">
            <p className="text-sm">Nenhum imóvel atribuído a este agente.</p>
          </div>
        ) : (
          <>
            {/* Property tabs */}
            <div className="flex gap-2.5 mb-8 overflow-x-auto pb-1 -mx-1 px-1">
              {filteredProperties.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProperty(p.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left shrink-0 transition-all duration-200 ${
                    effectiveSelected === p.id
                      ? 'border-primary/30 bg-card shadow-sm'
                      : 'border-transparent hover:border-border hover:bg-card/50'
                  }`}
                >
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-base shrink-0">🏠</div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate max-w-[160px]">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {(p.rentalPrice ?? p.price) ? `€${(p.rentalPrice ?? p.price)?.toLocaleString('pt-PT')}/mês` : p.referenceId ?? ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Agents row */}
            {propertyAgents.length > 0 && (
              <div className="mb-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Responsáveis:</span>
                <div className="flex items-center gap-2">
                  {propertyAgents.map(a => (
                    <div key={a.id} className="flex items-center gap-1.5">
                      <img src={a.picture} alt={a.name} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-medium text-foreground">{a.name}</span>
                    </div>
                  ))}
                </div>
                {property && (
                  <Link
                    to={`/p/${property.slug}`}
                    className="ml-auto flex items-center gap-1 text-primary hover:underline font-medium"
                    target="_blank"
                  >
                    Ver página pública <Eye className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* Stats */}
            <StatsRow candidates={allAgentCandidates} />

            {/* Smart Insights */}
            <SmartInsightsPanel
              allCandidates={allAgentCandidates}
              properties={filteredProperties}
              onSelectCandidate={openCandidate}
            />

            {/* Upcoming visits */}
            {propertyAppointments.filter(a => a.status === 'confirmed').length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border bg-card p-5 mb-8"
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-3">
                  Visitas confirmadas
                </h3>
                <div className="space-y-2">
                  {propertyAppointments
                    .filter(a => a.status === 'confirmed')
                    .map(apt => {
                      const cand = candidates.find(c => c.id === apt.candidateId);
                      return (
                        <div key={apt.id} className="flex items-center gap-3 text-sm">
                          <CalendarCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="font-medium">{cand?.name ?? '—'}</span>
                          <span className="text-muted-foreground">
                            {apt.date} às {apt.time}
                          </span>
                          {apt.notes && (
                            <span className="text-xs text-muted-foreground/60 hidden sm:block truncate">{apt.notes}</span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* Filters + Lead list */}
            <div className="flex flex-wrap gap-2.5 mb-5 items-center">
              <h2 className="font-display font-700 text-base flex-1">
                Todos os candidatos
                <span className="ml-2 text-sm font-400 text-muted-foreground font-sans">
                  ({propertyCandidates.length})
                </span>
              </h2>
              <div className="flex gap-2 flex-wrap">
                <Select value={scoreFilter} onValueChange={setScoreFilter}>
                  <SelectTrigger className="h-8 text-xs rounded-lg w-[130px]">
                    <Filter className="w-3 h-3 mr-1.5" />
                    <SelectValue placeholder="Score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os scores</SelectItem>
                    <SelectItem value="high">Alta prioridade (80+)</SelectItem>
                    <SelectItem value="mid">Média (60–79)</SelectItem>
                    <SelectItem value="low">Baixa (&lt;60)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="h-8 text-xs rounded-lg w-[120px]">
                    <Zap className="w-3 h-3 mr-1.5" />
                    <SelectValue placeholder="Urgência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toda urgência</SelectItem>
                    <SelectItem value="immediate">Urgente</SelectItem>
                    <SelectItem value="soon">Em breve</SelectItem>
                    <SelectItem value="flexible">Flexível</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs rounded-lg w-[130px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os estados</SelectItem>
                    <SelectItem value="new">Novos</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                    <SelectItem value="visit_scheduled">Visita marcada</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {propertyCandidates.length === 0 ? (
              <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
                <p className="text-sm">Nenhum candidato encontrado com os filtros actuais.</p>
              </div>
            ) : (
              <motion.div layout className="space-y-3">
                <AnimatePresence>
                  {propertyCandidates.map(c => (
                    <LeadCard
                      key={c.id}
                      candidate={c}
                      property={filteredProperties.find(p => p.id === c.propertyId)}
                      onClick={() => openCandidate(c)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>

      <AddPropertyDialog open={addOpen} onOpenChange={setAddOpen} />

      <LeadDetailSheet
        candidate={selectedCandidate}
        property={property}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </DashboardLayout>
  );
}


