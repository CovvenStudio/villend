import { Home } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Home className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-display text-sm font-bold">Arrendou</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 Arrendou. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
