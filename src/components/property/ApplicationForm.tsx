import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Property, calculateScore } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface Props {
  property: Property;
}

type Step = 'personal' | 'financial' | 'details' | 'submitting' | 'done';

const ApplicationForm = ({ property }: Props) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('personal');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    monthlyIncome: '',
    employmentType: '' as string,
    employmentDuration: '',
    numberOfPeople: '',
    hasPets: false,
    petDetails: '',
    hasGuarantor: false,
  });

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setStep('submitting');
    
    const candidateData = {
      propertyId: property.id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      monthlyIncome: Number(form.monthlyIncome),
      numberOfPeople: Number(form.numberOfPeople),
      hasPets: form.hasPets,
      petDetails: form.petDetails || undefined,
      hasGuarantor: form.hasGuarantor,
      employmentType: form.employmentType as any,
      employmentDuration: Number(form.employmentDuration),
    };

    const { score, classification } = calculateScore(candidateData, property.criteria, property.price);

    // Simulate submission
    setTimeout(() => {
      setStep('done');
      toast({
        title: 'Candidatura enviada!',
        description: `Score: ${score}/100 — ${classification === 'excellent' ? 'Excelente' : classification === 'potential' ? 'Potencial' : 'Baixa compatibilidade'}`,
      });
    }, 1500);
  };

  // Dynamic deposit/advance display
  const advanceMonths = !form.hasGuarantor && property.criteria.advanceWithoutGuarantor
    ? property.criteria.advanceWithoutGuarantor
    : property.criteria.advanceMonths;
  const depositMonths = !form.hasGuarantor && property.criteria.depositWithoutGuarantor
    ? property.criteria.depositWithoutGuarantor
    : property.criteria.depositMonths;

  if (step === 'done') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
        <CheckCircle2 className="w-12 h-12 text-score-excellent mx-auto mb-4" />
        <h3 className="font-display text-lg font-bold mb-2">Candidatura enviada!</h3>
        <p className="text-sm text-muted-foreground">
          Receberá um email em <strong>{form.email}</strong> com um link para acompanhar o status da sua candidatura.
        </p>
      </motion.div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {step === 'personal' && (
          <motion.div key="personal" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Nome completo</Label>
              <Input placeholder="Maria Silva" value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium">Email</Label>
              <Input type="email" placeholder="maria@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium">Telefone</Label>
              <Input type="tel" placeholder="+351 912 345 678" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="mt-1" />
            </div>
            <Button
              onClick={() => setStep('financial')}
              disabled={!form.name || !form.email || !form.phone}
              className="w-full rounded-lg"
            >
              Continuar
            </Button>
          </motion.div>
        )}

        {step === 'financial' && (
          <motion.div key="financial" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Rendimento mensal líquido (€)</Label>
              <Input type="number" placeholder="2500" value={form.monthlyIncome} onChange={(e) => update('monthlyIncome', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium">Situação profissional</Label>
              <Select value={form.employmentType} onValueChange={(v) => update('employmentType', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Contrato sem termo</SelectItem>
                  <SelectItem value="contract">Contrato a termo</SelectItem>
                  <SelectItem value="freelancer">Freelancer / Independente</SelectItem>
                  <SelectItem value="student">Estudante</SelectItem>
                  <SelectItem value="retired">Reformado</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium">Tempo na posição atual (meses)</Label>
              <Input type="number" placeholder="24" value={form.employmentDuration} onChange={(e) => update('employmentDuration', e.target.value)} className="mt-1" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('personal')} className="flex-1 rounded-lg">Voltar</Button>
              <Button
                onClick={() => setStep('details')}
                disabled={!form.monthlyIncome || !form.employmentType || !form.employmentDuration}
                className="flex-1 rounded-lg"
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div key="details" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Número de pessoas</Label>
              <Input type="number" placeholder="2" value={form.numberOfPeople} onChange={(e) => update('numberOfPeople', e.target.value)} className="mt-1" />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label className="text-xs font-medium">Tem animais de estimação?</Label>
              <Switch checked={form.hasPets} onCheckedChange={(v) => update('hasPets', v)} />
            </div>
            {form.hasPets && (
              <Input placeholder="Ex: 1 gato" value={form.petDetails} onChange={(e) => update('petDetails', e.target.value)} />
            )}

            {property.criteria.guarantorRequired && (
              <>
                <div className="flex items-center justify-between py-2">
                  <Label className="text-xs font-medium">Tem fiador?</Label>
                  <Switch checked={form.hasGuarantor} onCheckedChange={(v) => update('hasGuarantor', v)} />
                </div>
                
                {/* Dynamic payment info */}
                <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Adiantamento:</span>
                    <span className="font-semibold">{advanceMonths} meses (€{advanceMonths * property.price})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Caução:</span>
                    <span className="font-semibold">{depositMonths} meses (€{depositMonths * property.price})</span>
                  </div>
                  {!form.hasGuarantor && property.criteria.advanceWithoutGuarantor && (
                    <p className="text-score-potential mt-1">
                      Sem fiador, os valores de adiantamento e caução são ajustados.
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setStep('financial')} className="flex-1 rounded-lg">Voltar</Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.numberOfPeople}
                className="flex-1 rounded-lg"
              >
                Enviar candidatura
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      {step !== 'done' && step !== 'submitting' && (
        <div className="flex justify-center gap-1.5 pt-2">
          {['personal', 'financial', 'details'].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationForm;
