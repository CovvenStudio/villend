import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Cole o link do anúncio',
    description: 'Basta colar o URL. Extraímos título, preço, fotos e descrição automaticamente.',
  },
  {
    number: '02',
    title: 'Configure os critérios',
    description: 'Defina renda mínima, caução, fiador e regras. O formulário adapta-se.',
  },
  {
    number: '03',
    title: 'Partilhe a página',
    description: 'Cada imóvel tem uma URL elegante. Partilhe nas redes ou cole no anúncio.',
  },
  {
    number: '04',
    title: 'Receba candidatos qualificados',
    description: 'Candidatos avaliados automaticamente. Aprove e agende visitas sem esforço.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-28 md:py-36 border-y bg-card">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-4">Processo</p>
          <h2 className="font-display text-3xl md:text-[2.75rem] font-700 tracking-tight mb-5 leading-tight">
            Do anúncio à visita,<br className="hidden md:block" /> em 4 passos
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-8 py-10 border-b border-border/60 last:border-0"
            >
              <div className="font-display text-5xl font-300 text-accent/25 shrink-0 w-16 tabular-nums">
                {step.number}
              </div>
              <div>
                <h3 className="font-display text-lg font-600 mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
