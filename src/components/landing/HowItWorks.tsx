import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Cole o link do anúncio',
    description: 'Basta colar o URL do Idealista. Extraímos título, preço, fotos e descrição automaticamente.',
  },
  {
    number: '02',
    title: 'Configure os critérios',
    description: 'Defina renda mínima, caução, fiador e regras. O formulário adapta-se automaticamente.',
  },
  {
    number: '03',
    title: 'Partilhe a página',
    description: 'Cada imóvel ganha uma URL pública elegante. Partilhe nas redes ou cole no anúncio.',
  },
  {
    number: '04',
    title: 'Receba candidatos qualificados',
    description: 'Os candidatos são avaliados automaticamente. Aprove os melhores e agende visitas sem esforço.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 md:py-32 bg-muted/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Como funciona
          </h2>
          <p className="text-muted-foreground text-lg">
            Do anúncio à visita em 4 passos simples
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 py-8 border-b last:border-0"
            >
              <div className="font-display text-4xl font-bold text-accent/30 shrink-0 w-16">
                {step.number}
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
