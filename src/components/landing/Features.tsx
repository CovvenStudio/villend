import { motion } from 'framer-motion';
import { FilePlus2, FileCheck, BarChart3, CalendarCheck, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: FilePlus2,
    title: 'Imóvel publicado em 2 minutos',
    description: 'Título, preço, critérios e link de referência. Sem extração automática, sem dependências — está no ar antes de terminar o café.',
  },
  {
    icon: FileCheck,
    title: 'Formulário que filtra sozinho',
    description: 'Candidatos respondem apenas o que importa. Sem conta, sem fricção — menos de 60 segundos. Os que não cumprem os critérios ficam de fora automaticamente.',
  },
  {
    icon: BarChart3,
    title: 'Score implacável de 0 a 100',
    description: 'Renda, estabilidade profissional, adequação ao imóvel. Cada candidato pontuado e ordenado. Você decide apenas o top 3.',
  },
  {
    icon: CalendarCheck,
    title: 'Visitas que se agendam sozinhas',
    description: 'Candidatos aprovados escolhem o horário disponível. Zero troca de mensagens, zero confusão. A agenda gere-se a si própria.',
  },
  {
    icon: Shield,
    title: 'As suas regras, aplicadas sempre',
    description: 'Renda mínima, caução, fiador, animais — defina uma vez. O formulário adapta-se e filtra automaticamente. Nenhuma exceção passa.',
  },
  {
    icon: Zap,
    title: 'Dashboard que decide por si',
    description: 'Todos os candidatos, ordenados por score, com estado em tempo real. O que demoraria 4 horas agora dura 4 minutos.',
  },
];

const Features = () => {
  return (
    <section className="py-28 md:py-40">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-20"
        >
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-5">Como funciona</p>
          <h2 className="font-display text-3xl md:text-[2.75rem] lg:text-5xl font-700 tracking-tight mb-5 leading-tight">
            Tudo o que precisa.<br className="hidden md:block" />
            <span className="text-muted-foreground">Nada que não precisa.</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Uma plataforma construída especificamente para quem gere imóveis em Portugal — sem excessos, sem curva de aprendizagem.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group relative p-8 rounded-3xl border bg-card hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 overflow-hidden"
            >
              {/* Subtle glow on hover */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-accent/8 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/18 transition-colors duration-300">
                  <feature.icon className="w-[18px] h-[18px] text-accent" />
                </div>
                <h3 className="font-display text-base font-700 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
