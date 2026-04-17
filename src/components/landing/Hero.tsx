import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import heroVilla from '@/assets/hero-villa.jpg';
import interiorLiving from '@/assets/interior-living.jpg';
import interiorKitchen from '@/assets/interior-kitchen.jpg';

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const cardY1 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const cardY2 = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  return (
    <section ref={ref} className="relative min-h-[100vh] flex items-center overflow-hidden pt-20 pb-12">
      {/* Background gradient orbs */}
      <div className="absolute top-1/3 right-1/6 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/6 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card text-sm text-muted-foreground mb-8"
            >
              <Sparkles className="w-3 h-3 text-accent" />
              Arrendamento inteligente em Portugal
            </motion.div>

            <h1 className="font-display text-[2.75rem] md:text-6xl lg:text-7xl font-700 leading-[1.04] tracking-tight mb-7">
              De lead a visita,{' '}
              <span className="text-gradient">sem esforço</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
              Qualifique candidatos automaticamente, elimine triagem manual
              e agende visitas — tudo numa plataforma elegante e rápida.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link to="/login">
                <Button size="lg" className="h-12 px-7 text-sm font-semibold rounded-xl group">
                  Comece já
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/p/t2-campo-ourique-lisboa">
                <Button variant="outline" size="lg" className="h-12 px-7 text-sm font-semibold rounded-xl">
                  Ver demonstração
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex gap-10 md:gap-14"
            >
              {[
                { value: '< 60s', label: 'por candidatura' },
                { value: '85%', label: 'menos triagem' },
                { value: '3×', label: 'mais rápido' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-display text-2xl font-700 tracking-tight">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1.5 tracking-wide">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: animated photo collage */}
          <div className="lg:col-span-6 relative h-[520px] lg:h-[600px]">
            {/* Main villa image with parallax + ken burns */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ y: heroY }}
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20"
            >
              <motion.img
                src={heroVilla}
                alt="Villa de luxo ao pôr do sol"
                style={{ scale: heroScale }}
                className="w-full h-full object-cover"
                width={1920}
                height={1080}
              />
              {/* Animated radar circle suggesting "scanning property" */}
              <motion.div
                className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full border-2 border-accent/60 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full border-2 border-accent/60 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: 1 }}
              />
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-accent rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-accent/50" />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/60 to-transparent p-5">
                <p className="text-primary-foreground text-xs font-medium tracking-wide">Villa Cascais · €4.500/mês</p>
              </div>
            </motion.div>

            {/* Floating card 1 — interior */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ y: cardY1 }}
              className="absolute -left-6 bottom-12 w-44 h-56 rounded-2xl overflow-hidden shadow-xl border-4 border-background hidden md:block"
            >
              <img src={interiorLiving} alt="Interior" className="w-full h-full object-cover" width={1024} height={1280} loading="lazy" />
            </motion.div>

            {/* Floating card 2 — kitchen */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ y: cardY2 }}
              className="absolute -right-4 -top-4 w-40 h-40 rounded-2xl overflow-hidden shadow-xl border-4 border-background hidden md:block"
            >
              <img src={interiorKitchen} alt="Cozinha" className="w-full h-full object-cover" width={1024} height={1024} loading="lazy" />
            </motion.div>

            {/* Floating score badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
              className="absolute top-6 left-6 bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-score-excellent flex items-center justify-center">
                  <span className="score-excellent font-display font-700 text-sm">92</span>
                </div>
                <div>
                  <div className="text-xs font-semibold">Maria Silva</div>
                  <div className="text-[10px] text-muted-foreground">Excelente match</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
