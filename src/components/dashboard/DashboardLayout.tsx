import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Building2, Users, Calendar, UserCog, LogOut, Settings } from 'lucide-react';
import { auth } from '@/lib/auth';

const navItems = [
  { to: '/dashboard', icon: Building2, label: 'Imóveis', end: true },
  { to: '/dashboard/agentes', icon: UserCog, label: 'Agentes' },
  { to: '/dashboard/agendamentos', icon: Calendar, label: 'Agendamentos' },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const user = auth.getUser();

  const handleSignOut = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 border-r bg-card hidden lg:flex flex-col fixed h-screen">
        <div className="p-5 border-b flex justify-center">
          <Link to="/" className="flex items-center gap-1">
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-all duration-200 ${
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
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full bg-muted" />
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
      </aside>

      <main className="flex-1 overflow-auto lg:ml-60">{children}</main>
    </div>
  );
};

export default DashboardLayout;
