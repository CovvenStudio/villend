import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ChevronRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const AgencySelect = () => {
  const { memberships, selectAgency, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (agencyId: string) => {
    selectAgency(agencyId);
    navigate('/dashboard', { replace: true });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-700 tracking-tight">vyllad</span>
          <span className="text-accent text-2xl">.</span>
        </div>

        <h1 className="font-display text-2xl font-700 tracking-tight mb-2 text-center">
          Selecionar imobiliária
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Tem acesso a várias imobiliárias. Escolha com qual pretende trabalhar agora.
        </p>

        <div className="space-y-3">
          {memberships.map((m) => (
            <button
              key={m.agencyId}
              onClick={() => handleSelect(m.agencyId)}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-foreground/30 hover:bg-muted/50 transition-all duration-200 group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{m.agencyName}</p>
                <p className="text-xs text-muted-foreground capitalize">{m.role.toLowerCase()}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground gap-2">
            <LogOut className="w-4 h-4" />
            Sair da conta
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AgencySelect;
