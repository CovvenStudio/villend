const Footer = () => {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          <span className="font-display text-sm font-700 tracking-tight">domu</span>
          <span className="text-accent text-sm">.</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 Domu. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
