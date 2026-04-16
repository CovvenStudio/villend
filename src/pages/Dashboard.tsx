import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Users, Plus, Settings, LogOut, Building2, Eye, Calendar, CheckCircle, XCircle, Clock, Star, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockProperties, mockCandidates } from '@/lib/mock-data';
import { Candidate } from '@/lib/types';
import AddPropertyDialog from '@/components/dashboard/AddPropertyDialog';

const statusConfig: Record<Candidate['status'], { label: string; icon: typeof Clock; className: string }> = {
  new: { label: 'Novo', icon: Clock, className: 'bg-muted text-muted-foreground' },
  approved: { label: 'Aprovado', icon: CheckCircle, className: 'bg-score-excellent/10 text-score-excellent' },
  rejected: { label: 'Rejeitado', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
  visit_scheduled: { label: 'Visita agendada', icon: Calendar, className: 'bg-accent/10 text-accent' },
};

const classificationConfig: Record<Candidate['classification'], { label: string; icon: typeof Star; className: string }> = {
  excellent: { label: 'Excelente', icon: Star, className: 'score-excellent' },
  potential: { label: 'Potencial', icon: AlertTriangle, className: 'score-potential' },
  low: { label: 'Baixa', icon: AlertTriangle, className: 'score-low' },
};

const Dashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState(mockProperties[0]?.id);
  const [candidates, setCandidates] = useState(mockCandidates);
  const [showAddProperty, setShowAddProperty] = useState(false);

  const property = mockProperties.find((p) => p.id === selectedProperty);
  const propertyCandidates = candidates
    .filter((c) => c.propertyId === selectedProperty)
    .sort((a, b) => b.score - a.score);

  const updateCandidateStatus = (id: string, status: Candidate['status']) => {
    setCandidates((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden lg:flex flex-col">
        <div className="p-5 border-b">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Home className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">Arrendou</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={Building2} label="Imóveis" active />
          <SidebarItem icon={Users} label="Candidatos" />
          <SidebarItem icon={Calendar} label="Visitas" />
          <SidebarItem icon={Settings} label="Definições" />
        </nav>

        <div className="p-4 border-t">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Gerir imóveis e candidatos</p>
            </div>
            <Button onClick={() => setShowAddProperty(true)} className="rounded-lg font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar imóvel
            </Button>
          </div>

          {/* Property selector */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {mockProperties.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProperty(p.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left shrink-0 transition-all ${
                  selectedProperty === p.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'hover:border-primary/30'
                }`}
              >
                <img src={p.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold truncate max-w-[180px]">{p.title}</div>
                  <div className="text-xs text-muted-foreground">€{p.price}/mês</div>
                </div>
              </button>
            ))}
          </div>

          {/* Stats */}
          {property && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total candidatos', value: propertyCandidates.length },
                { label: 'Excelentes', value: propertyCandidates.filter(c => c.classification === 'excellent').length },
                { label: 'Aprovados', value: propertyCandidates.filter(c => c.status === 'approved' || c.status === 'visit_scheduled').length },
                { label: 'Visitas agendadas', value: propertyCandidates.filter(c => c.status === 'visit_scheduled').length },
              ].map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl border bg-card">
                  <div className="text-2xl font-display font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Candidate table */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-display font-semibold">Candidatos</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{propertyCandidates.length} resultados</span>
              </div>
            </div>

            {propertyCandidates.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Ainda sem candidatos para este imóvel</p>
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
                      transition={{ delay: i * 0.05 }}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Score */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0 ${
                          candidate.classification === 'excellent' ? 'bg-score-excellent' :
                          candidate.classification === 'potential' ? 'bg-score-potential' :
                          'bg-score-low'
                        }`}>
                          <span className={cls.className}>{candidate.score}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{candidate.name}</span>
                            <span className={`text-xs font-medium ${cls.className}`}>{cls.label}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            €{candidate.monthlyIncome}/mês · {candidate.numberOfPeople} pessoa(s) · {candidate.employmentType === 'permanent' ? 'Contrato sem termo' : candidate.employmentType}
                          </div>
                        </div>

                        {/* Status */}
                        <Badge variant="secondary" className={`${st.className} text-xs shrink-0`}>
                          <st.icon className="w-3 h-3 mr-1" />
                          {st.label}
                        </Badge>

                        {/* Actions */}
                        <div className="flex gap-1 shrink-0">
                          {candidate.status === 'new' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-score-excellent hover:text-score-excellent"
                                onClick={() => updateCandidateStatus(candidate.id, 'approved')}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-destructive hover:text-destructive"
                                onClick={() => updateCandidateStatus(candidate.id, 'rejected')}
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Rejeitar
                              </Button>
                            </>
                          )}
                          {candidate.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs"
                              onClick={() => updateCandidateStatus(candidate.id, 'visit_scheduled')}
                            >
                              <Calendar className="w-3.5 h-3.5 mr-1" />
                              Agendar
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

          {/* Property link */}
          {property && (
            <div className="mt-6 p-4 rounded-xl border bg-muted/30 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Link público do imóvel</div>
                <code className="text-sm font-mono">/p/{property.slug}</code>
              </div>
              <Link to={`/p/${property.slug}`}>
                <Button variant="outline" size="sm" className="rounded-lg">
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Ver página
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <AddPropertyDialog open={showAddProperty} onOpenChange={setShowAddProperty} />
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active }: { icon: typeof Home; label: string; active?: boolean }) => (
  <button className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-colors ${active ? 'bg-primary/5 text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export default Dashboard;
