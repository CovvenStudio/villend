import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, Maximize2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockProperties } from '@/lib/mock-data';
import ApplicationForm from '@/components/property/ApplicationForm';

const PropertyPage = () => {
  const { slug } = useParams();
  const property = mockProperties.find((p) => p.slug === slug);
  const [currentImage, setCurrentImage] = useState(0);
  const [showForm, setShowForm] = useState(false);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Imóvel não encontrado</h1>
          <Link to="/" className="text-accent hover:underline text-sm">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-card/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Link>
          <div className="flex items-center gap-1">
            <span className="font-display text-sm font-700">vyllad</span>
            <span className="text-accent text-sm">.</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-[1fr,360px] gap-10">
          {/* Left column */}
          <div>
            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted mb-8"
            >
              <img
                src={property.images[currentImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage(i => i === 0 ? property.images.length - 1 : i - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImage(i => i === property.images.length - 1 ? 0 : i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {property.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImage ? 'w-4 bg-card' : 'bg-card/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Property info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h1 className="font-display text-2xl md:text-3xl font-700 tracking-tight mb-3">{property.title}</h1>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-8">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm">{property.location}</span>
              </div>

              <div className="flex gap-8 mb-10 pb-10 border-b">
                {[
                  { icon: BedDouble, value: property.bedrooms, label: 'quartos' },
                  { icon: Bath, value: property.bathrooms, label: 'WC' },
                  { icon: Maximize2, value: `${property.area}`, label: 'm²' },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <item.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                    <div className="text-sm font-semibold">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-display text-base font-600 mb-3">Descrição</h3>
                <p className="text-muted-foreground text-sm leading-[1.7]">{property.description}</p>
              </div>

              {/* Criteria summary */}
              <div className="mt-10 p-6 rounded-2xl bg-card border">
                <h3 className="text-xs font-semibold mb-4 uppercase tracking-[0.15em] text-muted-foreground">Condições</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Renda mínima', value: `€${property.criteria.minIncome}` },
                    { label: 'Máx. pessoas', value: property.criteria.maxPeople },
                    { label: 'Animais', value: property.criteria.petsAllowed ? 'Permitidos' : 'Não permitidos' },
                    { label: 'Fiador', value: property.criteria.guarantorRequired ? 'Necessário' : 'Não necessário' },
                    { label: 'Adiantamento', value: `${property.criteria.advanceMonths} meses` },
                    { label: 'Caução', value: `${property.criteria.depositMonths} meses` },
                  ].map((item) => (
                    <div key={item.label}>
                      <span className="text-muted-foreground text-xs">{item.label}</span>
                      <div className="font-semibold mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - CTA card */}
          <div>
            <div className="lg:sticky lg:top-20">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border bg-card p-6"
              >
                <div className="mb-6">
                  <div className="font-display text-3xl font-700 tracking-tight">
                    €{property.price}
                    <span className="text-base font-400 text-muted-foreground ml-1">/mês</span>
                  </div>
                </div>

                {!showForm ? (
                  <>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="w-full h-12 text-sm font-semibold rounded-xl"
                    >
                      Candidatar-se para visita
                    </Button>
                    <p className="text-[11px] text-muted-foreground text-center mt-3">
                      Processo rápido — menos de 60 segundos
                    </p>
                  </>
                ) : (
                  <ApplicationForm property={property} />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;
