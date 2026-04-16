import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTA = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-primary p-12 md:p-20 text-center"
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_25%,hsl(var(--accent)/0.15)_50%,transparent_75%)]" />
          
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-6 tracking-tight">
              Pronto para automatizar o seu arrendamento?
            </h2>
            <p className="text-primary-foreground/70 text-lg max-w-xl mx-auto mb-10">
              Comece hoje e veja os melhores candidatos chegarem automaticamente ao seu dashboard.
            </p>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" className="h-13 px-8 text-base font-semibold rounded-xl">
                Começar gratuitamente
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
