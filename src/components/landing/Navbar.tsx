import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 surface-glass">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Arrendou</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="font-medium">
              Dashboard
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="font-semibold rounded-lg">
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
