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
          <Link to="/" className="text-accent hover:underline">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 h-14 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* Left column */}
          <div>
            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted mb-6"
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage(i => i === property.images.length - 1 ? 0 : i + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {property.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-card' : 'bg-card/50'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* Property info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">{property.title}</h1>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{property.location}</span>
              </div>

              <div className="flex gap-6 mb-8">
                {[
                  { icon: BedDouble, value: `${property.bedrooms} quartos` },
                  { icon: Bath, value: `${property.bathrooms} WC` },
                  { icon: Maximize2, value: `${property.area} m²` },
                ].map((item) => (
                  <div key={item.value} className="flex items-center gap-2 text-sm">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="prose prose-sm max-w-none">
                <h3 className="font-display text-lg font-semibold mb-3">Descrição</h3>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              {/* Criteria summary */}
              <div className="mt-8 p-5 rounded-xl bg-muted/50 border">
                <h3 className="font-display text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Condições</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Renda mínima:</span> <strong>€{property.criteria.minIncome}</strong></div>
                  <div><span className="text-muted-foreground">Máx. pessoas:</span> <strong>{property.criteria.maxPeople}</strong></div>
                  <div><span className="text-muted-foreground">Animais:</span> <strong>{property.criteria.petsAllowed ? 'Permitidos' : 'Não permitidos'}</strong></div>
                  <div><span className="text-muted-foreground">Fiador:</span> <strong>{property.criteria.guarantorRequired ? 'Necessário' : 'Não necessário'}</strong></div>
                  <div><span className="text-muted-foreground">Adiantamento:</span> <strong>{property.criteria.advanceMonths} meses</strong></div>
                  <div><span className="text-muted-foreground">Caução:</span> <strong>{property.criteria.depositMonths} meses</strong></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - CTA card */}
          <div>
            <div className="lg:sticky lg:top-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-6">
                  <div className="font-display text-3xl font-bold">€{property.price}</div>
                  <span className="text-sm text-muted-foreground">/mês</span>
                </div>

                {!showForm ? (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20"
                  >
                    Candidatar-se para visita
                  </Button>
                ) : (
                  <ApplicationForm property={property} />
                )}

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Processo rápido — menos de 60 segundos
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;
