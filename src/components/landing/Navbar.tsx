import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 surface-glass">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-700 tracking-tight">domu</span>
          <span className="text-accent text-xl">.</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Dashboard
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="sm" className="font-medium rounded-lg text-sm px-5">
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
