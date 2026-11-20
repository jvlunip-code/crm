import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/use-customers';
import type { Customer } from '@/types';
import { toast } from 'sonner';

interface CustomerDialogProps {
  customer?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDialog({ customer, open, onOpenChange }: CustomerDialogProps) {
  const isEdit = !!customer;
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    company: '',
    nif: null as string | null,
    iban: null as string | null,
    decisor: null as string | null,
    segment: null as string | null,
    status: 'active' as 'active' | 'inactive',
  });

  React.useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        secondaryPhone: customer.secondaryPhone ?? '',
        company: customer.company,
        nif: customer.nif,
        iban: customer.iban,
        decisor: customer.decisor,
        segment: customer.segment,
        status: customer.status,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        secondaryPhone: '',
        company: '',
        nif: null,
        iban: null,
        decisor: null,
        segment: null,
        status: 'active',
      });
    }
  }, [customer, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEdit) {
        await updateCustomer.mutateAsync({ id: customer.id, updates: formData });
        toast.success('Cliente atualizado com sucesso');
      } else {
        await createCustomer.mutateAsync(formData);
        toast.success('Cliente criado com sucesso');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEdit ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente');
    }
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Altere os dados do cliente abaixo.' : 'Preencha os dados do novo cliente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2">
              <FieldLabel required htmlFor="name">
                Nome
              </FieldLabel>
              <Input size="sm"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nome completo"
                autoComplete="off"
                required
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel required htmlFor="email">
                Email
              </FieldLabel>
              <Input size="sm"
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                autoComplete="off"
                spellCheck={false}
                required
              />
            </Field>

            <Field>
              <FieldLabel required htmlFor="phone">
                Telefone
              </FieldLabel>
              <PhoneInput size="sm"
                id="phone"
                value={formData.phone}
                onChange={(v) => handleChange('phone', v)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="secondaryPhone">Telefone alternativo</FieldLabel>
              <PhoneInput size="sm"
                id="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={(v) => handleChange('secondaryPhone', v)}
              />
            </Field>

            <Field>
              <FieldLabel required htmlFor="company">
                Empresa
              </FieldLabel>
              <Input size="sm"
                id="company"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Nome da empresa"
                autoComplete="off"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="status">Estado</FieldLabel>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger size="sm" id="status" className="w-full">
                  <SelectValue placeholder="Selecionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button size="sm"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? 'A guardar…' : isEdit ? 'Guardar alterações' : 'Criar cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
