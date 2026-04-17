import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (agent: { name: string; email: string; phone: string; specialty: string }) => void;
}

const AddAgentDialog = ({ open, onOpenChange, onAdd }: Props) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialty: '' });

  const submit = () => {
    if (!form.name || !form.email) return;
    onAdd(form);
    setForm({ name: '', email: '', phone: '', specialty: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Adicionar agente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs font-medium">Nome completo</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="mt-1.5" placeholder="Sofia Ribeiro" />
          </div>
          <div>
            <Label className="text-xs font-medium">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="mt-1.5" placeholder="sofia@vyllad.pt" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium">Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="mt-1.5" placeholder="+351 ..." />
            </div>
            <div>
              <Label className="text-xs font-medium">Especialidade / zona</Label>
              <Input value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))} className="mt-1.5" placeholder="Lisboa Centro" />
            </div>
          </div>
          <Button onClick={submit} disabled={!form.name || !form.email} className="w-full rounded-lg font-semibold">
            Criar agente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAgentDialog;
