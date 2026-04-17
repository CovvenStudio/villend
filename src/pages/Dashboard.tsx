import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Calendar, CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProperties, mockCandidates, mockAgents } from '@/lib/mock-data';
import { Candidate } from '@/lib/types';
import AddPropertyDialog from '@/components/dashboard/AddPropertyDialog';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

const statusConfig: Record<Candidate['status'], { label: string; icon: typeof Clock; className: string }> = {
  new: { label: 'Novo', icon: Clock, className: 'bg-muted text-muted-foreground' },
  approved: { label: 'Aprovado', icon: CheckCircle, className: 'bg-score-excellent text-score-excellent' },
  rejected: { label: 'Rejeitado', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  visit_scheduled: { label: 'Visita agendada', icon: Calendar, className: 'bg-accent/10 text-accent' },
};

const classificationConfig: Record<Candidate['classification'], { label: string; className: string }> = {
  excellent: { label: 'Excelente', className: 'score-excellent' },
  potential: { label: 'Potencial', className: 'score-potential' },
  low: { label: 'Baixa', className: 'score-low' },
};

const Dashboard = () => {
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [candidates, setCandidates] = useState(mockCandidates);
  const [showAddProperty, setShowAddProperty] = useState(false);

  const filteredProperties = useMemo(
    () => agentFilter === 'all'
      ? mockProperties
      : mockProperties.filter((p) => p.agentIds.includes(agentFilter)),
    [agentFilter]
  );

  const [selectedProperty, setSelectedProperty] = useState(filteredProperties[0]?.id);
  const effectiveSelected = filteredProperties.find((p) => p.id === selectedProperty)?.id ?? filteredProperties[0]?.id;

  const property = filteredProperties.find((p) => p.id === effectiveSelected);
  const propertyCandidates = candidates
    .filter((c) => c.propertyId === effectiveSelected)
    .sort((a, b) => b.score - a.score);

  const updateCandidateStatus = (id: string, status: Candidate['status']) => {
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  const propertyAgents = property
    ? mockAgents.filter((a) => property.agentIds.includes(a.id))
    : [];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">Imóveis</h1>
            <p className="text-sm text-muted-foreground mt-1">Gerir imóveis e candidatos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[200px] rounded-lg">
                  <SelectValue placeholder="Filtrar por agente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os agentes</SelectItem>
                  {mockAgents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddProperty(true)} className="rounded-xl font-semibold text-sm h-10 px-5">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar imóvel
            </Button>
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="rounded-2xl border bg-card p-16 text-center text-muted-foreground">
            <p className="text-sm">Nenhum imóvel atribuído a este agente.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-10 overflow-x-auto pb-2 -mx-1 px-1">
              {filteredProperties.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProperty(p.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left shrink-0 transition-all duration-300 ${
                    effectiveSelected === p.id
                      ? 'border-primary/20 bg-card shadow-sm'
                      : 'border-transparent hover:border-border hover:bg-card/50'
                  }`}
                >
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt="" className="w-11 h-11 rounded-lg object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center text-lg">🏠</div>
                  )}
                  <div>
                    <div className="text-sm font-semibold truncate max-w-[180px]">{p.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{(p.rentalPrice ?? p.price) ? `€${(p.rentalPrice ?? p.price)}/mês` : p.referenceId ?? ''}</div>
                  </div>
                </button>
              ))}
            </div>

            {property && (
              <>
                {propertyAgents.length > 0 && (
                  <div className="mb-6 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Agentes responsáveis:</span>
                    <div className="flex items-center gap-2">
                      {propertyAgents.map((a) => (
                        <div key={a.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border">
                          <img src={a.picture} alt={a.name} className="w-4 h-4 rounded-full" />
                          <span className="font-medium text-foreground">{a.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {[
                    { label: 'Total', value: propertyCandidates.length },
                    { label: 'Excelentes', value: propertyCandidates.filter(c => c.classification === 'excellent').length },
                    { label: 'Aprovados', value: propertyCandidates.filter(c => c.status === 'approved' || c.status === 'visit_scheduled').length },
                    { label: 'Visitas', value: propertyCandidates.filter(c => c.status === 'visit_scheduled').length },
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-xl border bg-card">
                      <div className="text-2xl font-display font-700 tracking-tight">{stat.value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="font-display font-600 text-sm">Candidatos</h2>
                <span className="text-xs text-muted-foreground">{propertyCandidates.length} resultados</span>
              </div>

              {propertyCandidates.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground">
                  <Users className="w-7 h-7 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Ainda sem candidatos</p>
                </div>
              ) : (
                <div className="divide-y">
                  {propertyCandidates.map((candidate, i) => {
                    const cls = classificationConfig[candidate.classification];
                    const st = statusConfig[candidate.status];
                    return (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-6 py-4 hover:bg-muted/30 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-700 text-sm shrink-0 ${
                            candidate.classification === 'excellent' ? 'bg-score-excellent' :
                            candidate.classification === 'potential' ? 'bg-score-potential' : 'bg-score-low'
                          }`}>
                            <span className={cls.className}>{candidate.score}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{candidate.name}</span>
                              <span className={`text-[11px] font-medium ${cls.className}`}>{cls.label}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              €{candidate.monthlyIncome}/mês · {candidate.numberOfPeople} pessoa(s)
                            </div>
                          </div>
                          <Badge variant="secondary" className={`${st.className} text-[11px] shrink-0 font-medium`}>
                            <st.icon className="w-3 h-3 mr-1" />
                            {st.label}
                          </Badge>
                          <div className="flex gap-1 shrink-0">
                            {candidate.status === 'new' && (
                              <>
                                <Button size="sm" variant="ghost" className="h-8 text-xs text-score-excellent hover:text-score-excellent"
                                  onClick={() => updateCandidateStatus(candidate.id, 'approved')}>
                                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aprovar
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:text-destructive"
                                  onClick={() => updateCandidateStatus(candidate.id, 'rejected')}>
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                            {candidate.status === 'approved' && (
                              <Button size="sm" variant="ghost" className="h-8 text-xs"
                                onClick={() => updateCandidateStatus(candidate.id, 'visit_scheduled')}>
                                <Calendar className="w-3.5 h-3.5 mr-1" /> Agendar
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {property && (
              <div className="mt-6 p-5 rounded-xl border bg-card flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Link público</div>
                  <code className="text-sm font-mono text-muted-foreground">/property/{property.id}</code>
                </div>
                <Link to={`/property/${property.id}`} target="_blank">
                  <Button variant="outline" size="sm" className="rounded-lg text-xs">
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Ver página
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      <AddPropertyDialog open={showAddProperty} onOpenChange={setShowAddProperty} />
    </DashboardLayout>
  );
};

export default Dashboard;
