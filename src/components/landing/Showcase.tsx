import { motion } from 'framer-motion';
import lisbonFacade from '@/assets/lisbon-facade.jpg';
import interiorLiving from '@/assets/interior-living.jpg';
import interiorKitchen from '@/assets/interior-kitchen.jpg';

const Showcase = () => {
  return (
    <section className="py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <p className="text-xs font-medium tracking-[0.2em] uppercase text-accent mb-4">Imóveis</p>
          <h2 className="font-display text-3xl md:text-[2.75rem] font-700 tracking-tight mb-5 leading-tight">
            Apartamentos, vivendas, escritórios.<br className="hidden md:block" />
            <span className="text-muted-foreground">Tudo num só lugar.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-12 gap-4 md:gap-6 max-w-5xl mx-auto">
          {/* Lisbon facade - large left */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 md:col-span-5 row-span-2 relative rounded-3xl overflow-hidden group h-[400px] md:h-[560px]"
          >
            <motion.img
              src={lisbonFacade}
              alt="Fachada Lisboa"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.2 }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-primary-foreground">
              <p className="text-xs tracking-[0.2em] uppercase text-accent mb-2">Lisboa</p>
              <p className="font-display text-xl font-600">Edifícios históricos restaurados</p>
            </div>
          </motion.div>

          {/* Living */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-6 md:col-span-7 relative rounded-3xl overflow-hidden group h-[270px]"
          >
            <motion.img
              src={interiorLiving}
              alt="Sala"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.2 }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            <div className="absolute bottom-5 left-5 text-primary-foreground">
              <p className="text-xs tracking-[0.2em] uppercase text-accent mb-1">Interior</p>
              <p className="font-display text-lg font-600">Apartamentos modernos</p>
            </div>
          </motion.div>

          {/* Kitchen */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-6 md:col-span-7 relative rounded-3xl overflow-hidden group h-[270px]"
          >
            <motion.img
              src={interiorKitchen}
              alt="Cozinha"
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.2 }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            <div className="absolute bottom-5 left-5 text-primary-foreground">
              <p className="text-xs tracking-[0.2em] uppercase text-accent mb-1">Acabamentos</p>
              <p className="font-display text-lg font-600">Cozinhas premium</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
