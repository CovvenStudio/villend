import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, CheckCircle, XCircle, Clock, Eye, Filter,
  Flame, BanIcon, ChevronRight, Users, TrendingUp,
  Timer,
  ArrowUpRight, CalendarCheck, MoreHorizontal, Pencil, PauseCircle, PlayCircle, Archive, KeyRound, RotateCcw, Trophy,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { mockAppointments } from '@/lib/mock-data';
import { Candidate, Property } from '@/lib/types';
import { useLeads } from '@/hooks/useLeads';
import { contractLead, revertContractLead } from '@/lib/leads-api';
import { listAppointments, updateAppointmentStatus } from '@/lib/appointments-api';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyDto } from '@/lib/properties-api';
import { useProperties } from '@/hooks/useProperties';
import { useAgents } from '@/hooks/useAgents';
import AddPropertyDialog from '@/components/dashboard/AddPropertyDialog';
import EditPropertyDialog from '@/components/dashboard/EditPropertyDialog';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LeadDetailSheet from '@/components/dashboard/LeadDetailSheet';

// Adapts PropertyDto (API) to the Property shape expected by internal components
function toProperty(dto: PropertyDto): Property {
  return {
    ...dto,
    description: dto.description ?? '',
    price: dto.rentalPrice,
    images: dto.images,
    availableSlots: [],
    criteria: {
      minIncome: dto.criteria.minIncome,
      maxPeople: dto.criteria.maxPeople,
      petsAllowed: dto.criteria.petsAllowed,
      advanceMonths: dto.criteria.advanceMonths,
      depositMonths: dto.criteria.depositMonths,
      guarantorRequired: dto.criteria.guarantorRequired,
      advanceWithoutGuarantor: dto.criteria.advanceWithoutGuarantor ?? undefined,
      depositWithoutGuarantor: dto.criteria.depositWithoutGuarantor ?? undefined,
    },
  };
}


// ─── Priority config ──────────────────────────────────────────────────────────
function getPriorityConfig(c: Candidate) {
  if (c.status === 'visit_scheduled') return {
    badge: 'border-blue-200 bg-blue-50 text-blue-600',
    dot: 'bg-blue-500',
    label: 'Visita marcada',
  };
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
  visit_cancelled: { label: 'Visita cancelada', icon: XCircle, className: 'bg-orange-500/10 text-orange-600' },
  visit_finished: { label: 'Visita realizada', icon: CheckCircle, className: 'bg-emerald-500/10 text-emerald-600' },
  contracted: { label: 'Contrato fechado', icon: CheckCircle, className: 'bg-violet-500/10 text-violet-600' },
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


function quickInsight(c: Candidate): string {
  const incomeScore   = c.factorScores?.incomeRatio ?? 0;
  const guarantorScore = c.factorScores?.guarantor  ?? 0;
  if (c.hasPets && c.score < 50) return 'Animais · compatibilidade baixa com o imóvel';
  if (c.score >= 80 && c.urgency === 'immediate') return 'Perfil excelente · pronto para fechar';
  if (c.score >= 80 && c.urgency === 'soon') return 'Excelente perfil · disponível em breve';
  if (c.score >= 80) return 'Excelente perfil financeiro e laboral';
  if (c.score >= 60 && c.urgency === 'immediate') return 'Bom perfil · alta urgência de mudança';
  if (incomeScore < 30) return 'Rendimento abaixo do mínimo recomendado';
  if (guarantorScore < 40) return 'Garantias insuficientes para este imóvel';
  if (c.score >= 60) return 'Perfil razoável · sem urgência imediata';
  return 'Baixa compatibilidade com os critérios';
}

// ─── Smart Insights Panel ─────────────────────────────────────────────────────
function SmartInsightsPanel({
  allCandidates,
  properties,
  onSelectCandidate,
  onApprove,
  onReject,
  onSchedule,
  onReschedule,
  onComplete,
  onContract,
  onRevertContract,
}: {
  allCandidates: Candidate[];
  properties: Property[];
  onSelectCandidate: (c: Candidate) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSchedule: (c: Candidate) => void;
  onReschedule: (c: Candidate) => void;
  onComplete: (c: Candidate) => void;
  onContract: (c: Candidate) => void;
  onRevertContract: (c: Candidate) => void;
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
    { key: 'ready' as const, icon: Timer, label: 'Prontos agora', count: readyNow.length, color: 'text-emerald-500' },
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
                <AnimatePresence>
                  {displayed.map((c, i) => {
                    const prop = properties.find(p => p.id === c.propertyId);
                    const insight = quickInsight(c);
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => onSelectCandidate(c)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors text-left group cursor-pointer"
                      >
                        {tab === 'top' && (
                          <span className="text-xs font-display font-700 text-muted-foreground/30 w-4 shrink-0 text-center">{i + 1}</span>
                        )}
                        <ScoreCircle score={c.score} classification={c.classification} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{c.name}</span>
                            {c.status === 'approved' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-200 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />Aprovado
                              </span>
                            )}
                            {c.status === 'visit_scheduled' && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />Visita marcada
                              </span>
                            )}
                            {c.urgency === 'immediate' && c.status !== 'visit_scheduled' && (
                              <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5">
                                <Timer className="w-3 h-3" />Urgente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{insight}</p>
                        </div>
                        {prop && (
                          <span className="text-[10px] text-muted-foreground/50 hidden sm:block shrink-0 max-w-[120px] truncate">{prop.title}</span>
                        )}

                        {/* Quick actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {c.status === 'new' && (
                            <>
                              <button
                                onClick={e => { e.stopPropagation(); onApprove(c.id); }}
                                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Aprovar
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); onReject(c.id); }}
                                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Rejeitar
                              </button>
                            </>
                          )}
                          {c.status === 'approved' && (
                            <button
                              onClick={e => { e.stopPropagation(); onSchedule(c); }}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              <CalendarCheck className="w-3 h-3" /> Agendar
                            </button>
                          )}
                          {c.status === 'visit_cancelled' && (
                            <button
                              onClick={e => { e.stopPropagation(); onReschedule(c); }}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" /> Reagendar
                            </button>
                          )}
                          {c.status === 'visit_scheduled' && (
                            <button
                              onClick={e => { e.stopPropagation(); onComplete(c); }}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Finalizar
                            </button>
                          )}
                          {c.status === 'visit_finished' && (
                            <button
                              onClick={e => { e.stopPropagation(); onContract(c); }}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200 transition-colors"
                            >
                              <Trophy className="w-3.5 h-3.5" /> Fechar Contrato
                            </button>
                          )}
                          {c.status === 'contracted' && (
                            <button
                              onClick={e => { e.stopPropagation(); onRevertContract(c); }}
                              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" /> Reverter
                            </button>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                        </div>
                      </motion.div>
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
  onApprove,
  onReject,
  onSchedule,
  onReschedule,
  onComplete,
  onContract,
  onRevertContract,
}: {
  candidate: Candidate;
  property: Property | undefined;
  onClick: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onSchedule?: () => void;
  onReschedule?: () => void;
  onComplete?: () => void;
  onContract?: () => void;
  onRevertContract?: () => void;
}) {
  const priority = getPriorityConfig(candidate);
  const sc = statusConfig[candidate.status];
  const StatusIcon = sc.icon;
  const insight = quickInsight(candidate);

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
          {candidate.urgency === 'immediate' && candidate.status === 'new' && (
            <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5">
              <Timer className="w-3 h-3" />Agora
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

      <div className="flex items-center gap-2 shrink-0">
        {/* Status badge */}
        <span className={`hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-lg ${sc.className}`}>
          <StatusIcon className="w-3 h-3" />{sc.label}
        </span>

        {/* Quick actions — novos: aprovar / rejeitar */}
        {candidate.status === 'new' && onApprove && onReject && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); onApprove(); }}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Aprovar
            </button>
            <button
              onClick={e => { e.stopPropagation(); onReject(); }}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" /> Rejeitar
            </button>
          </div>
        )}

        {/* Quick action — aprovados: agendar */}
        {candidate.status === 'approved' && onSchedule && (
          <button
            onClick={e => { e.stopPropagation(); onSchedule(); }}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <CalendarCheck className="w-3 h-3" /> Agendar
          </button>
        )}

        {/* Quick action — visita cancelada: reagendar */}
        {candidate.status === 'visit_cancelled' && onReschedule && (
          <button
            onClick={e => { e.stopPropagation(); onReschedule(); }}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reagendar
          </button>
        )}

        {/* Quick actions — visita marcada: finalizar */}
        {candidate.status === 'visit_scheduled' && onComplete && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); onComplete(); }}
              className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Finalizar
            </button>
          </div>
        )}

        {/* Quick action — visita realizada: fechar contrato */}
        {candidate.status === 'visit_finished' && onContract && (
          <button
            onClick={e => { e.stopPropagation(); onContract(); }}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5" /> Fechar Contrato
          </button>
        )}

        {/* Quick action — contrato fechado: reverter */}
        {candidate.status === 'contracted' && onRevertContract && (
          <button
            onClick={e => { e.stopPropagation(); onRevertContract(); }}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reverter
          </button>
        )}

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
  const navigate = useNavigate();
  const { currentAgencyId } = useAuth();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingPropertyDto, setEditingPropertyDto] = useState<PropertyDto | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [propertyStatusFilter, setPropertyStatusFilter] = useState<'active' | 'closed'>('active');

  const { properties: propertyDtos, loading: propertiesLoading, setStatus: setPropertyStatus, refresh: refreshProperties } = useProperties();
  const { agents: realAgents } = useAgents();
  const filteredProperties = propertyDtos
    .filter(p => propertyStatusFilter === 'active'
      ? (p.status === 'ACTIVE' || p.status === 'PAUSED')
      : (p.status === 'RENTED' || p.status === 'ARCHIVED'))
    .map(toProperty);
  const effectiveSelected = selectedProperty ?? filteredProperties[0]?.id ?? null;
  const selectedPropertyDto = propertyDtos.find(p => p.id === effectiveSelected) ?? null;
  const property = filteredProperties.find(p => p.id === effectiveSelected) ?? null;

  const { candidates, scoringConfig, setStatus: setLeadStatus, refresh: refreshLeads } = useLeads(effectiveSelected);

  const propertyCandidates = useMemo(() => {
    return candidates
      .filter(c => scoreFilter === 'all' || (
        scoreFilter === 'high' ? c.score >= 80 :
        scoreFilter === 'mid' ? c.score >= 60 && c.score < 80 :
        c.score < 60
      ))
      .filter(c => statusFilter === 'all' || c.status === statusFilter)
      .filter(c => urgencyFilter === 'all' || c.urgency === urgencyFilter)
      .sort((a, b) => b.score - a.score);
  }, [candidates, scoreFilter, statusFilter, urgencyFilter]);

  const allAgentCandidates = useMemo(() =>
    candidates,
    [candidates]
  );

  const candidateProperty = useMemo(
    () => selectedCandidate ? (filteredProperties.find(p => p.id === selectedCandidate.propertyId) ?? property) : null,
    [selectedCandidate, filteredProperties, property]
  );

  async function handleStatusChange(id: string, status: Candidate['status']) {
    await setLeadStatus(id, status);
  }

  async function handleContract(id: string) {
    if (!currentAgencyId) return;
    try {
      await contractLead(currentAgencyId, id);
      await refreshLeads();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : null;
      toast({
        variant: 'destructive',
        title: 'Imóvel já reservado',
        description: msg ?? 'Outro lead já tem contrato fechado para este imóvel.',
      });
    }
  }

  async function handleRevertContract(id: string) {
    if (!currentAgencyId) return;
    try {
      await revertContractLead(currentAgencyId, id);
      await refreshLeads();
    } catch {
      // silently ignore
    }
  }

  async function handleComplete(leadId: string) {
    if (!currentAgencyId) return;
    try {
      const { items } = await listAppointments(currentAgencyId, { leadId, status: 'confirmed', take: 1 });
      if (!items.length) return;
      await updateAppointmentStatus(currentAgencyId, items[0].id, { status: 'completed' });
      await refreshLeads();
    } catch {
      // silently ignore
    }
  }

  function openCandidate(c: Candidate) {
    setSelectedCandidate(c);
    setSheetOpen(true);
  }

  const propertyAgents = realAgents.filter(a => property?.agentIds.includes(a.id));
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

        {propertyDtos.length === 0 ? (
          <div className="rounded-2xl border bg-card p-16 text-center text-muted-foreground">
            <p className="text-sm">Nenhum imóvel atribuído a este agente.</p>
          </div>
        ) : (
          <>
            {/* Property filter toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => { setPropertyStatusFilter('active'); setSelectedProperty(null); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  propertyStatusFilter === 'active'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/40'
                }`}
              >
                Ativos
              </button>
              <button
                onClick={() => { setPropertyStatusFilter('closed'); setSelectedProperty(null); }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  propertyStatusFilter === 'closed'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/40'
                }`}
              >
                Encerrados
              </button>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
                <p className="text-sm">Nenhum imóvel encerrado.</p>
              </div>
            ) : (<>
            {/* Property tabs */}
            <div className="flex gap-2.5 mb-8 overflow-x-auto pb-1 -mx-1 px-1">
              {filteredProperties.map((p) => {
                const dto = propertyDtos.find(d => d.id === p.id);
                return (
                  <div
                    key={p.id}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border text-left shrink-0 transition-all duration-200 cursor-pointer group ${
                      effectiveSelected === p.id
                        ? 'border-primary/30 bg-card shadow-sm'
                        : 'border-transparent hover:border-border hover:bg-card/50'
                    }`}
                    onClick={() => setSelectedProperty(p.id)}
                  >
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-base shrink-0">🏠</div>
                    )}
                    <div className="min-w-0 pr-5">
                      <div className="flex items-center gap-1.5">
                        <div className="text-sm font-semibold truncate max-w-[140px]">{p.title}</div>
                        {dto?.status === 'PAUSED' && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                            Pausado
                          </span>
                        )}
                        {dto?.status === 'RENTED' && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
                            Arrendado
                          </span>
                        )}
                        {dto?.status === 'ARCHIVED' && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground border shrink-0">
                            Retirado
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {(p.rentalPrice ?? p.price) ? `€${(p.rentalPrice ?? p.price)?.toLocaleString('pt-PT')}/mês` : p.referenceId ?? ''}
                      </div>
                    </div>
                    {/* Card actions dropdown */}
                    {dto && (
                      <div
                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() => { setEditingPropertyDto(dto); setEditOpen(true); }}
                              className="gap-2"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Editar imóvel
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {dto.status === 'ACTIVE' ? (
                              <DropdownMenuItem
                                onClick={() => setPropertyStatus(dto.id, 'PAUSED')}
                                className="gap-2"
                              >
                                <PauseCircle className="w-3.5 h-3.5" /> Pausar
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setPropertyStatus(dto.id, 'ACTIVE')}
                                className="gap-2"
                              >
                                <PlayCircle className="w-3.5 h-3.5" /> Retomar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="gap-2 text-destructive focus:text-destructive data-[state=open]:text-destructive">
                                <Archive className="w-3.5 h-3.5" /> Encerrar
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent className="w-44">
                                <DropdownMenuItem
                                  onClick={() => setPropertyStatus(dto.id, 'RENTED')}
                                  className="gap-2"
                                >
                                  <KeyRound className="w-3.5 h-3.5" /> Imóvel arrendado
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setPropertyStatus(dto.id, 'ARCHIVED')}
                                  className="gap-2 text-destructive focus:text-destructive"
                                >
                                  <Archive className="w-3.5 h-3.5" /> Retirar imóvel
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Agents row */}
            {propertyAgents.length > 0 && (
              <div className="mb-6 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Responsáveis:</span>
                <div className="flex items-center gap-2">
                  {propertyAgents.map(a => (
                    <div key={a.id} className="flex items-center gap-1.5">
                      <img src={a.avatarUrl ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(a.name)}`} alt={a.name} referrerPolicy="no-referrer" className="w-6 h-6 rounded-full object-cover" />
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
                {selectedPropertyDto && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => { setEditingPropertyDto(selectedPropertyDto); setEditOpen(true); }}
                        className="gap-2"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Editar imóvel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {selectedPropertyDto.status === 'ACTIVE' ? (
                        <DropdownMenuItem
                          onClick={() => setPropertyStatus(selectedPropertyDto.id, 'PAUSED')}
                          className="gap-2"
                        >
                          <PauseCircle className="w-3.5 h-3.5" /> Pausar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => setPropertyStatus(selectedPropertyDto.id, 'ACTIVE')}
                          className="gap-2"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Retomar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2 text-destructive focus:text-destructive data-[state=open]:text-destructive">
                          <Archive className="w-3.5 h-3.5" /> Encerrar
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-44">
                          <DropdownMenuItem
                            onClick={() => setPropertyStatus(selectedPropertyDto.id, 'RENTED')}
                            className="gap-2"
                          >
                            <KeyRound className="w-3.5 h-3.5" /> Imóvel arrendado
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setPropertyStatus(selectedPropertyDto.id, 'ARCHIVED')}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Archive className="w-3.5 h-3.5" /> Retirar imóvel
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              onApprove={id => handleStatusChange(id, 'approved')}
              onReject={id => handleStatusChange(id, 'rejected')}
              onSchedule={c => navigate('/appointments', { state: { preSelectLeadId: c.id } })}
              onReschedule={c => navigate('/appointments', { state: { preSelectLeadId: c.id } })}
              onComplete={c => handleComplete(c.id)}
              onContract={c => handleContract(c.id)}
              onRevertContract={c => handleRevertContract(c.id)}
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
                    <Timer className="w-3 h-3 mr-1.5" />
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
                      onApprove={c.status === 'new' ? () => handleStatusChange(c.id, 'approved') : undefined}
                      onReject={c.status === 'new' ? () => handleStatusChange(c.id, 'rejected') : undefined}
                      onSchedule={c.status === 'approved' ? () => navigate('/appointments', { state: { preSelectLeadId: c.id } }) : undefined}
                      onReschedule={c.status === 'visit_cancelled' ? () => navigate('/appointments', { state: { preSelectLeadId: c.id } }) : undefined}
                      onComplete={c.status === 'visit_scheduled' ? () => handleComplete(c.id) : undefined}
                      onContract={c.status === 'visit_finished' ? () => handleContract(c.id) : undefined}
                      onRevertContract={c.status === 'contracted' ? () => handleRevertContract(c.id) : undefined}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
            </>)}
          </>
        )}
      </div>

      <AddPropertyDialog open={addOpen} onOpenChange={setAddOpen} onCreated={refreshProperties} />

      {editOpen && editingPropertyDto && (
        <EditPropertyDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          property={editingPropertyDto}
          onSaved={(saved) => { setEditingPropertyDto(saved); refreshProperties(); }}
        />
      )}

      <LeadDetailSheet
        candidate={selectedCandidate}
        property={candidateProperty}
        scoringConfig={scoringConfig}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </DashboardLayout>
  );
}


