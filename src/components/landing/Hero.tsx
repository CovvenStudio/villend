import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
      
      {/* Gradient orb */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />

      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Plataforma inteligente para arrendamento</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-800 leading-[1.05] tracking-tight mb-6">
            Transforme leads em{' '}
            <span className="text-gradient">visitas agendadas</span>
            {' '}automaticamente
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed">
            Elimine o caos de mensagens. Qualifique candidatos instantaneamente 
            e conecte os melhores inquilinos aos seus imóveis — sem esforço manual.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="h-13 px-8 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Começar agora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/p/t2-campo-ourique-lisboa">
              <Button variant="outline" size="lg" className="h-13 px-8 text-base font-semibold rounded-xl">
                Ver exemplo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-md"
          >
            {[
              { value: '< 60s', label: 'Candidatura' },
              { value: '85%', label: 'Menos trabalho' },
              { value: '3x', label: 'Mais rápido' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
