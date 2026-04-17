import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, Maximize2, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockProperties } from '@/lib/mock-data';

const AnnouncementPublic = () => {
  const { id } = useParams<{ id: string }>();
  const property = mockProperties.find(p => p.id === id);
  const [currentImage, setCurrentImage] = useState(0);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Anúncio não encontrado</h1>
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
          <div className="w-16" />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-[1fr,320px] gap-10">
          {/* Left */}
          <div>
            {/* Image gallery */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted mb-8"
            >
              {property.images && property.images.length > 0 ? (
                <>
                  <img src={property.images[currentImage]} alt={property.title} className="w-full h-full object-cover" />
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImage(i => i === 0 ? property.images.length - 1 : i - 1)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCurrentImage(i => i === property.images.length - 1 ? 0 : i + 1)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {property.images.map((_, i) => (
                          <button key={i} onClick={() => setCurrentImage(i)}
                            className={`h-1.5 rounded-full transition-all ${i === currentImage ? 'w-4 bg-card' : 'w-1.5 bg-card/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                  Sem imagens
                </div>
              )}

              {property.referenceId && (
                <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-mono font-semibold">
                  {property.referenceId}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h1 className="font-display text-2xl md:text-3xl font-700 tracking-tight mb-2">{property.title}</h1>

              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm">{property.location}</span>
              </div>

              <div className="flex flex-wrap gap-6 mb-8 pb-8 border-b">
                {property.bedrooms !== undefined && (
                  <div className="text-center">
                    <BedDouble className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                    <div className="text-sm font-semibold">{property.bedrooms}</div>
                    <div className="text-xs text-muted-foreground">quartos</div>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="text-center">
                    <Bath className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                    <div className="text-sm font-semibold">{property.bathrooms}</div>
                    <div className="text-xs text-muted-foreground">WC</div>
                  </div>
                )}
                {property.area !== undefined && (
                  <div className="text-center">
                    <Maximize2 className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                    <div className="text-sm font-semibold">{property.area}</div>
                    <div className="text-xs text-muted-foreground">m²</div>
                  </div>
                )}
                {property.floor !== undefined && (
                  <div className="text-center">
                    <div className="text-base mx-auto mb-1.5 text-center">🏢</div>
                    <div className="text-sm font-semibold">{property.floor === 0 ? 'R/C' : `${property.floor}º`}</div>
                    <div className="text-xs text-muted-foreground">andar</div>
                  </div>
                )}
              </div>

              {(property.hasGarage || property.hasElevator) && (
                <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b">
                  {property.hasGarage && <span className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium">🅿️ Garagem</span>}
                  {property.hasElevator && <span className="px-3 py-1.5 bg-muted rounded-full text-xs font-medium">🛗 Elevador</span>}
                </div>
              )}

              {property.description && (
                <div>
                  <h3 className="font-display text-base font-600 mb-3">Descrição</h3>
                  <p className="text-muted-foreground text-sm leading-[1.7]">{property.description}</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right */}
          <div>
            <div className="lg:sticky lg:top-20 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border bg-card p-6"
              >
                <div className="font-display text-3xl font-700 tracking-tight mb-1">
                  €{(property.rentalPrice || property.price).toLocaleString('pt-PT')}
                  <span className="text-base font-400 text-muted-foreground ml-1">/mês</span>
                </div>

                {property.referenceId && (
                  <p className="text-xs text-muted-foreground font-mono mb-4">Ref: {property.referenceId}</p>
                )}

                {property.announcementLink && (
                  <Button
                    onClick={() => window.open(property.announcementLink, '_blank')}
                    className="w-full h-11 rounded-xl font-semibold text-sm flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver anúncio original
                  </Button>
                )}
              </motion.div>

              {/* Criteria summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border bg-card p-5"
              >
                <h3 className="text-xs font-semibold mb-3 uppercase tracking-[0.15em] text-muted-foreground">Condições</h3>
                <div className="space-y-2.5 text-sm">
                  {[
                    { label: 'Renda mínima', value: `€${property.criteria.minIncome.toLocaleString('pt-PT')}` },
                    { label: 'Máx. pessoas', value: String(property.criteria.maxPeople) },
                    { label: 'Animais', value: property.criteria.petsAllowed ? '✅ Permitidos' : '❌ Não permitidos' },
                    { label: 'Adiantamento', value: `${property.criteria.advanceMonths} meses` },
                    { label: 'Caução', value: `${property.criteria.depositMonths} meses` },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementPublic;
