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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpsertCustomerAddress } from '@/hooks/use-customer-address'
import type { CustomerAddress } from '@/types'
import { toast } from 'sonner'

const POSTAL_CODE_API_KEY = 'ptapi697cea59bfaa18.59936789'

interface CustomerAddressDialogProps {
  customerId: number
  address?: CustomerAddress | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerAddressDialog({
  customerId,
  address,
  open,
  onOpenChange,
}: CustomerAddressDialogProps) {
  const upsertAddress = useUpsertCustomerAddress()

  const [formData, setFormData] = React.useState({
    postalCode: '',
    street: '',
    municipality: '',
    parish: '',
    district: '',
    country: 'Portugal',
  })

  const [isFetchingPostalCode, setIsFetchingPostalCode] = React.useState(false)
  const abortControllerRef = React.useRef<AbortController | null>(null)

  React.useEffect(() => {
    if (address) {
      setFormData({
        postalCode: address.postalCode,
        street: address.street,
        municipality: address.municipality,
        parish: address.parish,
        district: address.district,
        country: address.country,
      })
    } else {
      setFormData({
        postalCode: '',
        street: '',
        municipality: '',
        parish: '',
        district: '',
        country: 'Portugal',
      })
    }
  }, [address, open])

  const applyPostalCodeMask = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 7)
    if (digits.length <= 4) return digits
    return `${digits.slice(0, 4)}-${digits.slice(4)}`
  }

  const fetchPostalCodeData = React.useCallback(async (digits: string) => {
    if (digits.length !== 7) return

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    setIsFetchingPostalCode(true)
    try {
      const res = await fetch(
        `https://api.duminio.com/ptcp/v2/${POSTAL_CODE_API_KEY}/${digits}`,
        { signal: controller.signal },
      )
      if (!res.ok) throw new Error('Código postal não encontrado')

      const data = await res.json()
      if (controller.signal.aborted) return

      const entries = Array.isArray(data) ? data : [data]
      const first = entries[0]
      if (!first) return

      setFormData(prev => ({
        ...prev,
        municipality: first.Concelho ?? '',
        parish: first.Localidade ?? first.Freguesia ?? '',
        district: first.Distrito ?? '',
      }))
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
    } finally {
      if (!controller.signal.aborted) {
        setIsFetchingPostalCode(false)
      }
    }
  }, [])

  const handlePostalCodeChange = (value: string) => {
    const masked = applyPostalCodeMask(value)
    const digits = masked.replace(/\D/g, '')
    setFormData(prev => ({ ...prev, postalCode: masked }))
    fetchPostalCodeData(digits)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await upsertAddress.mutateAsync({
        customerId,
        street: formData.street,
        postalCode: formData.postalCode,
        municipality: formData.municipality,
        parish: formData.parish,
        district: formData.district,
        country: formData.country,
      })
      toast.success('Morada guardada com sucesso')
      onOpenChange(false)
    } catch {
      toast.error('Erro ao guardar morada')
    }
  }

  const isPending = upsertAddress.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{address ? 'Editar Morada' : 'Adicionar Morada'}</DialogTitle>
          <DialogDescription>
            {address
              ? 'Altere os dados da morada abaixo.'
              : 'Preencha os dados da morada. Introduza o código postal para preencher automaticamente.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Morada</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={e => handleChange('street', e.target.value)}
              placeholder="Ex: Rua Augusta, 100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Código Postal</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={e => handlePostalCodeChange(e.target.value)}
              placeholder="0000-000"
              maxLength={8}
              required
            />
            {isFetchingPostalCode && (
              <p className="text-muted-foreground text-xs">A procurar...</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipality">Concelho</Label>
              <Input
                id="municipality"
                value={formData.municipality}
                onChange={e => handleChange('municipality', e.target.value)}
                placeholder="Ex: Lisboa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parish">Freguesia ou Localidade</Label>
              <Input
                id="parish"
                value={formData.parish}
                onChange={e => handleChange('parish', e.target.value)}
                placeholder="Ex: Santa Maria Maior"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="district">Distrito</Label>
            <Input
              id="district"
              value={formData.district}
              onChange={e => handleChange('district', e.target.value)}
              placeholder="Ex: Lisboa"
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
              {isPending ? 'A guardar...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
