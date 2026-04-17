import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, Phone, MapPin, TrendingUp, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AddAgentDialog from '@/components/dashboard/AddAgentDialog';
import { mockAgents } from '@/lib/mock-data';
import { Agent } from '@/lib/types';

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [open, setOpen] = useState(false);

  const handleAdd = (agent: Omit<Agent, 'id' | 'agencyId' | 'activeListings' | 'conversionRate' | 'joinedAt' | 'picture'>) => {
    const newAgent: Agent = {
      ...agent,
      id: `agent-${Date.now()}`,
      agencyId: 'agency-1',
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(agent.name)}`,
      activeListings: 0,
      conversionRate: 0,
      joinedAt: new Date().toISOString().slice(0, 10),
    };
    setAgents((p) => [newAgent, ...p]);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-2xl font-700 tracking-tight">Agentes</h1>
            <p className="text-sm text-muted-foreground mt-1">Gerir os agentes da sua imobiliária</p>
          </div>
          <Button onClick={() => setOpen(true)} className="rounded-xl font-semibold text-sm h-10 px-5">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar agente
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Stat label="Agentes" value={agents.length} />
          <Stat label="Imóveis ativos" value={agents.reduce((s, a) => s + a.activeListings, 0)} />
          <Stat label="Taxa média" value={`${Math.round(agents.reduce((s, a) => s + a.conversionRate, 0) / Math.max(agents.length, 1))}%`} />
          <Stat label="Especialidades" value={new Set(agents.map((a) => a.specialty)).size} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl border bg-card hover:shadow-lg hover:shadow-primary/[0.04] transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-5">
                <img src={agent.picture} alt={agent.name} className="w-14 h-14 rounded-full bg-muted shrink-0" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display font-600 text-base truncate">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3" /> {agent.specialty}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground mb-5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{agent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  {agent.phone}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Ativos
                  </div>
                  <div className="font-display font-700 text-lg mt-0.5">{agent.activeListings}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Conversão
                  </div>
                  <div className="font-display font-700 text-lg mt-0.5 text-accent">{agent.conversionRate}%</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AddAgentDialog open={open} onOpenChange={setOpen} onAdd={handleAdd} />
    </DashboardLayout>
  );
};

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="p-5 rounded-xl border bg-card">
    <div className="text-2xl font-display font-700 tracking-tight">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

export default Agents;
