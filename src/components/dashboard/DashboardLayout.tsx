import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Calendar, UserCog, LogOut, Menu, ChevronsUpDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

const ROLE_LABEL: Record<string, string> = { OWNER: 'Proprietário', MANAGER: 'Gerente', AGENT: 'Colaborador' };

const navItems = [
  { to: '/dashboard', icon: Building2, label: 'Imóveis', end: true },
  { to: '/agents', icon: UserCog, label: 'Agentes' },
  { to: '/appointments', icon: Calendar, label: 'Agendamentos' },
];

function NavContent({ onNav }: { onNav?: () => void }) {
  const navigate = useNavigate();
  const { user, memberships, currentAgencyId, signOut } = useAuth();

  const currentAgency = memberships.find((m) => m.agencyId === currentAgencyId) ?? null;
  const hasMultipleAgencies = memberships.length > 1;

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const handleSwitchAgency = () => {
    onNav?.();
    navigate('/select-agency');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b flex justify-center">
        <Link to="/" className="flex items-center gap-1" onClick={onNav}>
          <span className="font-display text-2xl font-700 tracking-tight">vyllad</span>
          <span className="text-accent text-2xl">.</span>
        </Link>
      </div>

      {currentAgency && (
        <div className="px-3 pt-3">
          <button
            onClick={hasMultipleAgencies ? handleSwitchAgency : undefined}
            disabled={!hasMultipleAgencies}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-muted/40 text-left transition-colors ${
              hasMultipleAgencies ? 'hover:bg-muted cursor-pointer' : 'cursor-default'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{currentAgency.agencyName}</p>
              <p className="text-[10px] text-muted-foreground">{ROLE_LABEL[currentAgency.role] ?? currentAgency.role}</p>
            </div>
            {hasMultipleAgencies && <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          </button>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNav}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-all duration-200 ${
                isActive
                  ? 'bg-primary/[0.05] text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t space-y-3">
        {user && (
          <div className="flex items-center gap-3 px-1">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#1a2341] ring-offset-1"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'flex');
                }}
              />
            ) : null}
            <div
              className="w-9 h-9 rounded-full bg-[#1a2341]/10 items-center justify-center text-sm font-semibold text-[#1a2341] ring-2 ring-[#1a2341] ring-offset-1"
              style={{ display: user.avatarUrl ? 'none' : 'flex' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{user.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );
}

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="w-60 border-r bg-card hidden lg:flex flex-col fixed h-screen">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-1">
          <span className="font-display text-xl font-700 tracking-tight">vyllad</span>
          <span className="text-accent text-xl">.</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Abrir menu">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <NavContent onNav={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      <main className="flex-1 overflow-auto lg:ml-60 pt-14 lg:pt-0">{children}</main>
    </div>
  );
};

export default DashboardLayout;
