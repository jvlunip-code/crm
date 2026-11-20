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
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AutocompleteInput } from '@/components/shared/AutocompleteInput';
import { useCreateCustomerService, useUpdateCustomerService } from '@/hooks/use-customer-services';
import { useTarifarios } from '@/hooks/use-tarifarios';
import type { CustomerService, Moeda } from '@/types';
import { toast } from 'sonner';

/**
 * What the service dialog opens for. The detail page owns this state so the
 * profile card ("Novo serviço") and the services table (edit, duplicate,
 * sub-service) share one dialog.
 */
export type ServiceDialogTarget =
  | { mode: 'create'; parentId?: number }
  | { mode: 'edit'; service: CustomerService }
  | { mode: 'duplicate'; service: CustomerService };

interface CustomerServiceDialogProps {
  customerId: number;
  parentId?: number;
  service?: CustomerService;
  /** Create mode, pre-filled from this service (same parent). */
  duplicateOf?: CustomerService;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerServiceDialog({
  customerId,
  parentId,
  service,
  duplicateOf,
  open,
  onOpenChange,
}: CustomerServiceDialogProps) {
  const isEdit = !!service;
  const isDuplicate = !isEdit && !!duplicateOf;
  const source = service ?? duplicateOf;
  const createService = useCreateCustomerService();
  const updateService = useUpdateCustomerService();
  const { data: tarifarios = [] } = useTarifarios();

  const [formData, setFormData] = React.useState({
    acesso: '',
    tarifario: '',
    operadora: '',
    valor: '',
    moeda: 'EUR' as Moeda,
    conta: '',
    cvp: '',
    dataFim: '',
    numClient: '',
    numServico: '',
    morada: '',
    observacoes: '',
  });

  React.useEffect(() => {
    if (source) {
      setFormData({
        acesso: source.acesso,
        tarifario: source.tarifario,
        operadora: source.operadora,
        valor: String(source.valor),
        moeda: source.moeda,
        conta: source.conta,
        cvp: source.cvp,
        dataFim: source.dataFim ?? '',
        numClient: source.numClient,
        numServico: source.numServico,
        morada: source.morada,
        observacoes: source.observacoes,
      });
    } else {
      setFormData({
        acesso: '',
        tarifario: '',
        operadora: '',
        valor: '',
        moeda: 'EUR',
        conta: '',
        cvp: '',
        dataFim: '',
        numClient: '',
        numServico: '',
        morada: '',
        observacoes: '',
      });
    }
  }, [source, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valor = parseFloat(formData.valor);
    if (isNaN(valor)) {
      toast.error('O valor deve ser um número válido');
      return;
    }

    const payload = {
      customerId,
      parentId: parentId ?? source?.parentId,
      acesso: formData.acesso,
      tarifario: formData.tarifario,
      operadora: formData.operadora,
      valor,
      moeda: formData.moeda,
      conta: formData.conta,
      cvp: formData.cvp,
      dataFim: formData.dataFim || null,
      numClient: formData.numClient,
      numServico: formData.numServico,
      morada: formData.morada,
      observacoes: formData.observacoes,
    };

    try {
      if (isEdit) {
        await updateService.mutateAsync({ id: service.id, updates: payload, customerId });
        toast.success('Serviço atualizado com sucesso');
      } else {
        await createService.mutateAsync(payload);
        toast.success(isDuplicate ? 'Serviço duplicado com sucesso' : 'Serviço criado com sucesso');
      }
      onOpenChange(false);
    } catch {
      toast.error(isEdit ? 'Erro ao atualizar serviço' : 'Erro ao criar serviço');
    }
  };

  const isPending = createService.isPending || updateService.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The dialog itself scrolls (max-h 100svh − 2rem); the footer stays pinned. */}
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? 'Editar serviço'
              : isDuplicate
                ? duplicateOf.parentId
                  ? 'Duplicar sub-serviço'
                  : 'Duplicar serviço'
                : parentId
                  ? 'Novo sub-serviço'
                  : 'Novo serviço'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Altere os dados do serviço abaixo.'
              : isDuplicate
                ? `Cópia de ${duplicateOf.acesso}. Altere o que for diferente e guarde para criar um novo serviço.`
                : parentId
                  ? 'Preencha os dados do sub-serviço.'
                  : 'Preencha os dados do novo serviço.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel required htmlFor="acesso">
                Acesso (ID)
              </FieldLabel>
              <Input size="sm"
                id="acesso"
                value={formData.acesso}
                onChange={(e) => handleChange('acesso', e.target.value)}
                // A duplicate usually differs by its access number: select it to type over.
                onFocus={isDuplicate ? (e) => e.currentTarget.select() : undefined}
                autoFocus={isDuplicate}
                placeholder="Ex: ACC-001"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="tarifario">Tarifário</FieldLabel>
              <AutocompleteInput size="sm"
                id="tarifario"
                value={formData.tarifario}
                onChange={(value) => handleChange('tarifario', value)}
                options={tarifarios}
                placeholder="Comece a escrever para ver sugestões"
              />
            </Field>

            <Field>
              <FieldLabel required htmlFor="operadora">
                Operadora
              </FieldLabel>
              <Input size="sm"
                id="operadora"
                value={formData.operadora}
                onChange={(e) => handleChange('operadora', e.target.value)}
                placeholder="Ex: MEO"
                required
              />
            </Field>

            <Field>
              <FieldLabel required htmlFor="valor">
                Valor mensal
              </FieldLabel>
              <Input size="sm"
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => handleChange('valor', e.target.value)}
                placeholder="Ex: 20.32"
                className="tabular-nums"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="moeda">Moeda</FieldLabel>
              <Select
                value={formData.moeda}
                onValueChange={(value) => handleChange('moeda', value)}
              >
                <SelectTrigger size="sm" id="moeda" className="w-full">
                  <SelectValue placeholder="Selecionar moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel required htmlFor="conta">
                Conta
              </FieldLabel>
              <Input size="sm"
                id="conta"
                value={formData.conta}
                onChange={(e) => handleChange('conta', e.target.value)}
                placeholder="Ex: CT-10001"
                required
              />
            </Field>

            <Field>
              <FieldLabel required htmlFor="cvp">
                CVP
              </FieldLabel>
              <Input size="sm"
                id="cvp"
                value={formData.cvp}
                onChange={(e) => handleChange('cvp', e.target.value)}
                placeholder="Ex: CVP-2001"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="dataFim">Data de Fim</FieldLabel>
              <DatePicker size="sm"
                id="dataFim"
                value={formData.dataFim}
                onChange={(v) => handleChange('dataFim', v)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="numClient">Número de Cliente</FieldLabel>
              <Input size="sm"
                id="numClient"
                value={formData.numClient}
                onChange={(e) => handleChange('numClient', e.target.value)}
                placeholder="Ex: NC-5001"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="numServico">Número de Serviço</FieldLabel>
              <Input size="sm"
                id="numServico"
                value={formData.numServico}
                onChange={(e) => handleChange('numServico', e.target.value)}
                placeholder="Ex: NS-8001"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="morada">Morada</FieldLabel>
            <Textarea
              id="morada"
              value={formData.morada}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('morada', e.target.value)
              }
              placeholder="Ex: Rua da Liberdade, 123, 1250-096 Lisboa"
              rows={2}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="observacoes">Observações</FieldLabel>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('observacoes', e.target.value)
              }
              placeholder="Notas adicionais sobre o serviço…"
              rows={3}
            />
          </Field>

          <DialogFooter className="sticky bottom-0 z-10 -mx-6 -mb-6 border-t border-border bg-card px-6 py-4">
            <Button size="sm"
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isPending}>
              {isPending ? 'A guardar…' : isEdit ? 'Guardar alterações' : 'Criar serviço'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
