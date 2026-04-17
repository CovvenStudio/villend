import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTA = () => {
  return (
    <section className="py-28 md:py-36">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] bg-primary p-14 md:p-24 text-center"
        >
          {/* Accent glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-6">Comece hoje</p>
            <h2 className="font-display text-3xl md:text-5xl font-700 text-primary-foreground mb-6 tracking-tight leading-tight">
              Pronto para simplificar<br className="hidden md:block" /> o seu arrendamento?
            </h2>
            <p className="text-primary-foreground/60 text-base max-w-md mx-auto mb-10 leading-relaxed">
              Os melhores candidatos, automaticamente no seu dashboard. Sem esforço.
            </p>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="h-12 px-7 text-sm font-semibold rounded-xl">
                Comece já
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
