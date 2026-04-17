import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Link2, Loader2, CheckCircle2, Check } from 'lucide-react';
import { mockAgents } from '@/lib/mock-data';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'link' | 'extracting' | 'criteria' | 'done';

const AddPropertyDialog = ({ open, onOpenChange }: Props) => {
  const [step, setStep] = useState<Step>('link');
  const [url, setUrl] = useState('');
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

  const handleExtract = () => {
    setStep('extracting');
    setTimeout(() => setStep('criteria'), 2000);
  };

  const handleCreate = () => {
    setStep('done');
  };

  const handleClose = () => {
    setStep('link');
    setUrl('');
    setSelectedAgents([]);
    onOpenChange(false);
  };

  const toggleAgent = (id: string) => {
    setSelectedAgents((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {step === 'link' && 'Adicionar imóvel'}
            {step === 'extracting' && 'A extrair informações...'}
            {step === 'criteria' && 'Configurar critérios'}
            {step === 'done' && 'Imóvel criado!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'link' && (
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm font-medium">Link do anúncio</Label>
              <div className="relative mt-1.5">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="https://idealista.pt/imovel/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Cole o link do Idealista, Imovirtual ou outro portal. Extraímos automaticamente título, preço, fotos e descrição.
              </p>
            </div>
            <Button onClick={handleExtract} disabled={!url} className="w-full rounded-lg font-semibold">
              Extrair informações
            </Button>
          </div>
        )}

        {step === 'extracting' && (
          <div className="py-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">A analisar o anúncio...</p>
          </div>
        )}

        {step === 'criteria' && (
          <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto">
            <div className="p-3 rounded-lg bg-muted/50 border text-sm">
              <p className="font-medium">✓ Informações extraídas com sucesso</p>
              <p className="text-muted-foreground text-xs mt-1">Título, preço, fotos e descrição importados.</p>
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

            <Button onClick={handleCreate} disabled={selectedAgents.length === 0} className="w-full rounded-lg font-semibold">
              Criar imóvel
            </Button>
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
