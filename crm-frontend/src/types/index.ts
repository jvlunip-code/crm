export type Customer = {
  id: number
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'inactive'
  createdAt: string
}

export type Service = {
  id: number
  name: string
  description: string
  price: number
  billingCycle: 'monthly' | 'yearly'
  status: 'active' | 'inactive'
  features: string[]
  createdAt: string
}

export type Notification = {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  status: 'unread' | 'read'
  createdAt: string
}

export type Event = {
  id: number
  action: string
  entityType: 'customer' | 'service' | 'notification' | 'system'
  entityId: number
  description: string
  performedBy: string
  createdAt: string
}

export type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export type User = {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
}

/**
 * Moeda — Tipo de moeda utilizada nos serviços
 */
export type Moeda = 'EUR'

/**
 * Serviço do Cliente — Representa um serviço contratado por um cliente.
 * Um serviço pode ter sub-serviços associados através do campo parentId.
 */
export type CustomerService = {
  /** Identificador único do serviço (gerado automaticamente) */
  id: number
  /** Identificador do cliente associado */
  customerId: number
  /** Identificador do serviço pai (opcional — para sub-serviços) */
  parentId?: number
  /** ID de acesso */
  acesso: string
  /** Tarifário */
  tarifario: string
  /** Operadora */
  operadora: string
  /** Valor do serviço (ex: 20.32) */
  valor: number
  /** Moeda (predefinido: EUR) */
  moeda: Moeda
  /** Conta */
  conta: string
  /** CVP */
  cvp: string
  /** Data de fim do serviço */
  dataFim: string | null
  /** Número de cliente */
  numClient: string
  /** Número de serviço */
  numServico: string
  /** Observações */
  observacoes: string
  /** Data de criação */
  createdAt: string
}

export type CustomerNote = {
  id: number
  customerId: number
  content: string
  createdBy: string
  createdAt: string
  updatedAt?: string
}

export type CustomerDocument = {
  id: number
  customerId: number
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export type CustomerAddress = {
  id: number
  customerId: number
  street: string
  postalCode: string
  district: string
  municipality: string
  parish: string
  country: string
}
