import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, CheckCircle2, Check, X } from 'lucide-react';
import { mockAgents } from '@/lib/mock-data';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'info' | 'criteria' | 'done';

const AddPropertyDialog = ({ open, onOpenChange }: Props) => {
  const [step, setStep] = useState<Step>('info');
  const [images, setImages] = useState<string[]>([]);
  const [propertyInfo, setPropertyInfo] = useState({
    title: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    hasGarage: false,
    hasElevator: false,
    description: '',
  });
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [criteria, setCriteria] = useState({
    minIncome: '',
    maxPeople: '',
    petsAllowed: false,
    advanceMonths: '2',
    depositMonths: '2',
    guarantorRequired: true,
    advanceWithoutGuarantor: '4',
    depositWithoutGuarantor: '3',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        if (images.length < 3) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImages((prev) => [...prev, event.target?.result as string]);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (propertyInfo.title && propertyInfo.price && propertyInfo.location) {
      setStep('criteria');
    }
  };

  const handleCreate = () => {
    setStep('done');
  };

  const handleClose = () => {
    setStep('info');
    setImages([]);
    setPropertyInfo({
      title: '',
      price: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      floor: '',
      hasGarage: false,
      hasElevator: false,
      description: '',
    });
    setSelectedAgents([]);
    onOpenChange(false);
  };

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pb-2 border-b">
          <DialogTitle className="font-display">
            {step === 'info' && 'Informações do imóvel'}
            {step === 'criteria' && 'Configurar critérios'}
            {step === 'done' && 'Imóvel criado!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'info' && (
          <div className="space-y-4 pt-2 pb-4">
            {/* Imagens */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Fotos do imóvel (máx. 3)</Label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <label className="border-2 border-dashed border-border rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="text-center">
                      <Upload className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Adicionar</span>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Recomendamos fotos do exterior, sala de estar e cozinha.</p>
            </div>

            {/* Campos obrigatórios */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Título do anúncio *</Label>
                <Input
                  placeholder="Ex: T2 renovado em Campo de Ourique"
                  value={propertyInfo.title}
                  onChange={(e) => setPropertyInfo(p => ({ ...p, title: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Renda (€) *</Label>
                  <Input
                    type="number"
                    placeholder="1200"
                    value={propertyInfo.price}
                    onChange={(e) => setPropertyInfo(p => ({ ...p, price: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Localização *</Label>
                  <Input
                    placeholder="Ex: Campo de Ourique, Lisboa"
                    value={propertyInfo.location}
                    onChange={(e) => setPropertyInfo(p => ({ ...p, location: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Características do imóvel */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-xs font-medium">Quartos</Label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={propertyInfo.bedrooms}
                    onChange={(e) => setPropertyInfo(p => ({ ...p, bedrooms: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Casas de banho</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={propertyInfo.bathrooms}
                    onChange={(e) => setPropertyInfo(p => ({ ...p, bathrooms: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Área (m²)</Label>
                  <Input
                    type="number"
                    placeholder="85"
                    value={propertyInfo.area}
                    onChange={(e) => setPropertyInfo(p => ({ ...p, area: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Andar</Label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={propertyInfo.floor}
                    onChange={(e) => setPropertyInfo(p => ({ ...p, floor: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Booleanos */}
              <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-muted/30 border">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Garagem incluída</Label>
                  <Switch
                    checked={propertyInfo.hasGarage}
                    onCheckedChange={(v) => setPropertyInfo(p => ({ ...p, hasGarage: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Elevador</Label>
                  <Switch
                    checked={propertyInfo.hasElevator}
                    onCheckedChange={(v) => setPropertyInfo(p => ({ ...p, hasElevator: v }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Descrição (opcional)</Label>
                <textarea
                  placeholder="Descreva características especiais do imóvel..."
                  value={propertyInfo.description}
                  onChange={(e) => setPropertyInfo(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                />
              </div>
            </div>

            <Button onClick={handleNext} className="w-full rounded-lg font-semibold">
              Continuar
            </Button>
          </div>
        )}

        {step === 'criteria' && (
          <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto">
            <div className="p-3 rounded-lg bg-muted/50 border text-sm">
              <p className="font-medium">✓ Imóvel: {propertyInfo.title}</p>
              <p className="text-muted-foreground text-xs mt-1">{propertyInfo.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Renda mínima (€)</Label>
                <Input type="number" placeholder="2400" value={criteria.minIncome} onChange={(e) => setCriteria(p => ({ ...p, minIncome: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium">Máx. pessoas</Label>
                <Input type="number" placeholder="3" value={criteria.maxPeople} onChange={(e) => setCriteria(p => ({ ...p, maxPeople: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium">Adiantamento (meses)</Label>
                <Input type="number" value={criteria.advanceMonths} onChange={(e) => setCriteria(p => ({ ...p, advanceMonths: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium">Caução (meses)</Label>
                <Input type="number" value={criteria.depositMonths} onChange={(e) => setCriteria(p => ({ ...p, depositMonths: e.target.value }))} className="mt-1" />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="text-xs font-medium">Animais permitidos</Label>
              <Switch checked={criteria.petsAllowed} onCheckedChange={(v) => setCriteria(p => ({ ...p, petsAllowed: v }))} />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="text-xs font-medium">Fiador necessário</Label>
              <Switch checked={criteria.guarantorRequired} onCheckedChange={(v) => setCriteria(p => ({ ...p, guarantorRequired: v }))} />
            </div>

            {criteria.guarantorRequired && (
              <div className="p-3 rounded-lg bg-muted/50 border space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Valores sem fiador (dinâmico)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Adiantamento s/ fiador</Label>
                    <Input type="number" value={criteria.advanceWithoutGuarantor} onChange={(e) => setCriteria(p => ({ ...p, advanceWithoutGuarantor: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Caução s/ fiador</Label>
                    <Input type="number" value={criteria.depositWithoutGuarantor} onChange={(e) => setCriteria(p => ({ ...p, depositWithoutGuarantor: e.target.value }))} className="mt-1" />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Label className="text-xs font-medium mb-2 block">Agentes responsáveis</Label>
              <div className="space-y-2">
                {mockAgents.map((agent) => {
                  const checked = selectedAgents.includes(agent.id);
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => toggleAgent(agent.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${
                        checked ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      <img src={agent.picture} alt={agent.name} className="w-8 h-8 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{agent.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{agent.specialty}</div>
                      </div>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checked ? 'bg-accent border-accent' : 'border-border'
                      }`}>
                        {checked && <Check className="w-3 h-3 text-accent-foreground" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Selecione um ou mais agentes responsáveis por este imóvel.</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button onClick={() => setStep('info')} variant="outline" className="rounded-lg font-semibold">
                Voltar
              </Button>
              <Button onClick={handleCreate} disabled={selectedAgents.length === 0} className="rounded-lg font-semibold">
                Criar imóvel
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-score-excellent mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold mb-2">Imóvel criado com sucesso!</h3>
            <p className="text-sm text-muted-foreground mb-6">A página pública está pronta para partilhar.</p>
            <Button onClick={handleClose} className="rounded-lg font-semibold">Fechar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPropertyDialog;
