import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Subtle warm gradient orb */}
      <div className="absolute top-1/3 right-1/6 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/6 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card text-sm text-muted-foreground mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Arrendamento inteligente em Portugal
          </motion.div>

          <h1 className="font-display text-[2.75rem] md:text-6xl lg:text-7xl font-700 leading-[1.06] tracking-tight mb-7">
            De lead a visita,{' '}
            <span className="text-gradient">sem esforço</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-12 leading-relaxed">
            Qualifique candidatos automaticamente, elimine triagem manual 
            e agende visitas — tudo numa plataforma elegante e rápida.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/dashboard">
              <Button size="lg" className="h-12 px-7 text-sm font-semibold rounded-xl">
                Começar gratuitamente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/p/t2-campo-ourique-lisboa">
              <Button variant="outline" size="lg" className="h-12 px-7 text-sm font-semibold rounded-xl">
                Ver demonstração
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Elegant stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-20 flex gap-12 md:gap-16"
        >
          {[
            { value: '< 60s', label: 'por candidatura' },
            { value: '85%', label: 'menos trabalho manual' },
            { value: '3×', label: 'mais rápido a agendar' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="font-display text-2xl font-700 tracking-tight">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1.5 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
