import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Registe o imóvel',
    description: 'Título, preço e critérios em menos de 2 minutos. Sem formulários longos, sem configuração técnica.',
    detail: 'Renda mínima, caução, fiador — defina as regras uma vez e nunca mais pense nelas.',
  },
  {
    number: '02',
    title: 'Partilhe a página',
    description: 'Cada imóvel tem uma URL elegante e profissional. Substitua o link de contacto no anúncio ou partilhe diretamente.',
    detail: 'Os candidatos não precisam de conta. Menos fricção = mais candidaturas reais.',
  },
  {
    number: '03',
    title: 'O sistema qualifica',
    description: 'Cada candidato é avaliado automaticamente: renda, estabilidade, adequação. Score de 0 a 100, em segundos.',
    detail: 'Candidatos que não cumprem os critérios ficam sinalizados. Você concentra-se nos que importam.',
  },
  {
    number: '04',
    title: 'Aprove e agende',
    description: 'Com um clique, os candidatos aprovados recebem disponibilidade para visita. Escolhem o horário, confirmam — e aparecem.',
    detail: 'Sem mensagens de WhatsApp às 22h. Sem "afinal não posso ir". Sem surpresas.',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-28 md:py-40 border-y bg-card overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-20"
        >
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-5">Processo</p>
          <h2 className="font-display text-3xl md:text-[2.75rem] lg:text-5xl font-700 tracking-tight leading-tight">
            Do anúncio à visita marcada.<br className="hidden md:block" />
            <span className="text-muted-foreground">Em 4 passos.</span>
          </h2>
        </motion.div>

        <div className="max-w-3xl space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className="group grid grid-cols-[80px_1fr] gap-8 py-10 border-b border-border/50 last:border-0"
            >
              <div className="font-display text-5xl font-700 text-accent/20 group-hover:text-accent/40 transition-colors duration-500 tabular-nums pt-1">
                {step.number}
              </div>
              <div>
                <h3 className="font-display text-xl font-700 mb-2 tracking-tight">{step.title}</h3>
                <p className="text-foreground/70 text-sm leading-relaxed mb-2">{step.description}</p>
                <p className="text-muted-foreground text-xs leading-relaxed italic">{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
