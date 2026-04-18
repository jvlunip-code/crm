import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useCreateCustomerService, useUpdateCustomerService } from '@/hooks/use-customer-services'
import type { CustomerService, Moeda } from '@/types'
import { toast } from 'sonner'

interface CustomerServiceDialogProps {
  customerId: number
  parentId?: number
  service?: CustomerService
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerServiceDialog({
  customerId,
  parentId,
  service,
  open,
  onOpenChange,
}: CustomerServiceDialogProps) {
  const isEdit = !!service
  const createService = useCreateCustomerService()
  const updateService = useUpdateCustomerService()

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
    observacoes: '',
  })

  React.useEffect(() => {
    if (service) {
      setFormData({
        acesso: service.acesso,
        tarifario: service.tarifario,
        operadora: service.operadora,
        valor: String(service.valor),
        moeda: service.moeda,
        conta: service.conta,
        cvp: service.cvp,
        dataFim: service.dataFim ?? '',
        numClient: service.numClient,
        numServico: service.numServico,
        observacoes: service.observacoes,
      })
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
        observacoes: '',
      })
    }
  }, [service, open])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const valor = parseFloat(formData.valor)
    if (isNaN(valor)) {
      toast.error('O valor deve ser um número válido')
      return
    }

    const payload = {
      customerId,
      parentId: parentId ?? service?.parentId,
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
      observacoes: formData.observacoes,
    }

    try {
      if (isEdit) {
        await updateService.mutateAsync({ id: service.id, updates: payload, customerId })
        toast.success('Serviço atualizado com sucesso')
      } else {
        await createService.mutateAsync(payload)
        toast.success('Serviço criado com sucesso')
      }
      onOpenChange(false)
    } catch {
      toast.error(isEdit ? 'Erro ao atualizar serviço' : 'Erro ao criar serviço')
    }
  }

  const isPending = createService.isPending || updateService.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Serviço' : parentId ? 'Criar Sub-serviço' : 'Criar Serviço'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Altere os dados do serviço abaixo.'
              : parentId
                ? 'Preencha os dados do sub-serviço.'
                : 'Preencha os dados do novo serviço.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acesso">Acesso (ID)</Label>
              <Input
                id="acesso"
                value={formData.acesso}
                onChange={e => handleChange('acesso', e.target.value)}
                placeholder="Ex: ACC-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tarifario">Tarifário</Label>
              <Input
                id="tarifario"
                value={formData.tarifario}
                onChange={e => handleChange('tarifario', e.target.value)}
                placeholder="Ex: Empresarial Plus"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operadora">Operadora</Label>
              <Input
                id="operadora"
                value={formData.operadora}
                onChange={e => handleChange('operadora', e.target.value)}
                placeholder="Ex: MEO"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={e => handleChange('valor', e.target.value)}
                placeholder="Ex: 20.32"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="moeda">Moeda</Label>
              <Select
                value={formData.moeda}
                onValueChange={value => handleChange('moeda', value)}
              >
                <SelectTrigger id="moeda">
                  <SelectValue placeholder="Selecionar moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta">Conta</Label>
              <Input
                id="conta"
                value={formData.conta}
                onChange={e => handleChange('conta', e.target.value)}
                placeholder="Ex: CT-10001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvp">CVP</Label>
              <Input
                id="cvp"
                value={formData.cvp}
                onChange={e => handleChange('cvp', e.target.value)}
                placeholder="Ex: CVP-2001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim</Label>
              <DatePicker
                id="dataFim"
                value={formData.dataFim}
                onChange={v => handleChange('dataFim', v)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numClient">Número de Cliente</Label>
              <Input
                id="numClient"
                value={formData.numClient}
                onChange={e => handleChange('numClient', e.target.value)}
                placeholder="Ex: NC-5001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numServico">Número de Serviço</Label>
              <Input
                id="numServico"
                value={formData.numServico}
                onChange={e => handleChange('numServico', e.target.value)}
                placeholder="Ex: NS-8001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('observacoes', e.target.value)}
              placeholder="Notas adicionais sobre o serviço..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'A guardar...' : isEdit ? 'Guardar Alterações' : 'Criar Serviço'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
