import { motion } from 'framer-motion';
import { FilePlus2, FileCheck, BarChart3, CalendarCheck, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: FilePlus2,
    title: 'Criação em segundos',
    description: 'Adicione o imóvel com título, preço e critérios. Cole o link do anúncio como referência — sem extracção, sem aborrecimentos.',
  },
  {
    icon: FileCheck,
    title: 'Formulário inteligente',
    description: 'Candidatos respondem apenas o relevante. Sem conta, sem fricção — menos de 60 segundos.',
  },
  {
    icon: BarChart3,
    title: 'Scoring automático',
    description: 'Score de 0 a 100 baseado em renda, estabilidade profissional e adequação ao imóvel.',
  },
  {
    icon: CalendarCheck,
    title: 'Agendamento direto',
    description: 'Candidatos aprovados escolhem horários disponíveis. Sem troca de mensagens, sem confusão.',
  },
  {
    icon: Shield,
    title: 'Critérios dinâmicos',
    description: 'Renda mínima, caução, fiador — o formulário adapta-se automaticamente às suas regras.',
  },
  {
    icon: Zap,
    title: 'Dashboard centralizado',
    description: 'Candidatos ordenados por score, status em tempo real. Decida em segundos.',
  },
];

const Features = () => {
  return (
    <section className="py-28 md:py-36">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-4">Funcionalidades</p>
          <h2 className="font-display text-3xl md:text-[2.75rem] font-700 tracking-tight mb-5 leading-tight">
            Tudo o que precisa.<br className="hidden md:block" /> Nada que não precisa.
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            Registe um imóvel, defina as regras, partilhe o link. Os candidatos qualificam-se sozinhos.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group p-7 rounded-2xl border bg-card hover:shadow-xl hover:shadow-primary/[0.03] transition-all duration-500"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/15 transition-colors duration-300">
                <feature.icon className="w-[18px] h-[18px] text-accent" />
              </div>
              <h3 className="font-display text-base font-600 mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
