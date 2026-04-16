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
      <aside className="w-60 border-r bg-card hidden lg:flex flex-col">
        <div className="p-5 border-b">
          <Link to="/" className="flex items-center gap-1">
            <span className="font-display text-lg font-700 tracking-tight">domu</span>
            <span className="text-accent text-lg">.</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <SidebarItem icon={Building2} label="Imóveis" active />
          <SidebarItem icon={Users} label="Candidatos" />
          <SidebarItem icon={Calendar} label="Visitas" />
          <SidebarItem icon={Settings} label="Definições" />
        </nav>

        <div className="p-4 border-t">
          <button className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-10 max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="font-display text-2xl font-700 tracking-tight">Imóveis</h1>
              <p className="text-sm text-muted-foreground mt-1">Gerir imóveis e candidatos</p>
            </div>
            <Button onClick={() => setShowAddProperty(true)} className="rounded-xl font-semibold text-sm h-10 px-5">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar imóvel
            </Button>
          </div>

          {/* Property selector */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 -mx-1 px-1">
            {mockProperties.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProperty(p.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left shrink-0 transition-all duration-300 ${
                  selectedProperty === p.id
                    ? 'border-primary/20 bg-card shadow-sm'
                    : 'border-transparent hover:border-border hover:bg-card/50'
                }`}
              >
                <img src={p.images[0]} alt="" className="w-11 h-11 rounded-lg object-cover" />
                <div>
                  <div className="text-sm font-semibold truncate max-w-[180px]">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">€{p.price}/mês</div>
                </div>
              </button>
            ))}
          </div>

          {/* Stats */}
          {property && (
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
          )}

          {/* Candidate list */}
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
                        {/* Score */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-700 text-sm shrink-0 ${
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
                            <span className={`text-[11px] font-medium ${cls.className}`}>{cls.label}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            €{candidate.monthlyIncome}/mês · {candidate.numberOfPeople} pessoa(s)
                          </div>
                        </div>

                        {/* Status */}
                        <Badge variant="secondary" className={`${st.className} text-[11px] shrink-0 font-medium`}>
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
                                <XCircle className="w-3.5 h-3.5" />
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
            <div className="mt-6 p-5 rounded-xl border bg-card flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Link público</div>
                <code className="text-sm font-mono text-muted-foreground">/p/{property.slug}</code>
              </div>
              <Link to={`/p/${property.slug}`}>
                <Button variant="outline" size="sm" className="rounded-lg text-xs">
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
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
  <button className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-all duration-200 ${
    active
      ? 'bg-primary/[0.04] text-foreground font-medium'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
  }`}>
    <Icon className="w-[18px] h-[18px]" />
    {label}
  </button>
);

export default Dashboard;
