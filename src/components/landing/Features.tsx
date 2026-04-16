import { motion } from 'framer-motion';
import { Link2, FileCheck, BarChart3, CalendarCheck, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: Link2,
    title: 'Criar via link',
    description: 'Cole o link do Idealista e o sistema extrai automaticamente todas as informações do imóvel.',
  },
  {
    icon: FileCheck,
    title: 'Formulário inteligente',
    description: 'Candidatos respondem apenas perguntas relevantes. Sem conta, sem fricção — em menos de 60 segundos.',
  },
  {
    icon: BarChart3,
    title: 'Scoring automático',
    description: 'Cada candidato recebe um score de 0 a 100 baseado em renda, estabilidade e adequação ao imóvel.',
  },
  {
    icon: CalendarCheck,
    title: 'Agendamento direto',
    description: 'Candidatos aprovados escolhem horários disponíveis. Sem troca de mensagens, sem confusão.',
  },
  {
    icon: Shield,
    title: 'Critérios personalizáveis',
    description: 'Defina renda mínima, caução, fiador e mais. O formulário adapta-se dinamicamente às suas regras.',
  },
  {
    icon: Zap,
    title: 'Dashboard centralizado',
    description: 'Veja todos os candidatos ordenados por score com status em tempo real. Decida em segundos.',
  },
];

const Features = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Tudo o que precisa, nada que não precisa
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Uma camada inteligente sobre os seus anúncios. Sem substituir os sistemas que já usa.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-2xl border bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
