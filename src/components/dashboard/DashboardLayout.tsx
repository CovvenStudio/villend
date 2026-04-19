import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Calendar, UserCog, LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/dashboard', icon: Building2, label: 'Imóveis', end: true },
  { to: '/dashboard/agentes', icon: UserCog, label: 'Agentes' },
  { to: '/dashboard/agendamentos', icon: Calendar, label: 'Agendamentos' },
];

function NavContent({ onNav }: { onNav?: () => void }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b flex justify-center">
        <Link to="/" className="flex items-center gap-1" onClick={onNav}>
          <span className="font-display text-2xl font-700 tracking-tight">vyllad</span>
          <span className="text-accent text-2xl">.</span>
        </Link>
      </div>

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
              <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#1a2341] ring-offset-1" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1a2341]/10 flex items-center justify-center text-sm font-semibold text-[#1a2341] ring-2 ring-[#1a2341] ring-offset-1">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
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
