export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  nif: string | null;
  iban: string | null;
  decisor: string | null;
  segment: string | null;
  status: 'active' | 'inactive';
  tags: Tag[];
  createdAt: string;
};

export type TagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';

/** Finder-style customer label. `customerCount` only comes from the tags list. */
export type Tag = {
  id: number;
  name: string;
  color: TagColor;
  customerCount?: number;
};

export type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive';
  features: string[];
  createdAt: string;
};

export type NotificationFlag = 'red' | 'orange' | 'yellow' | 'green';

export type ServiceEndingMetadata = {
  schemaVersion: number;
  serviceId: number;
  serviceAcesso: string;
  customerId: number;
  customerName: string;
  serviceDataFim: string;
  flag: NotificationFlag;
  generatedAt: string;
};

export type ServiceEndingNotification = {
  id: number;
  type: 'SERVICO';
  subtype: 'SERVICO_A_TERMINAR';
  metadata: ServiceEndingMetadata;
  dedupKey: string;
  isRead: boolean;
  readAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
};

export type Notification = ServiceEndingNotification;

export type Event = {
  id: number;
  action: string;
  entityType: 'customer' | 'service' | 'notification' | 'system';
  entityId: number;
  description: string;
  performedBy: string;
  createdAt: string;
};

export type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

export type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
};

/**
 * Moeda — Tipo de moeda utilizada nos serviços
 */
export type Moeda = 'EUR';

/**
 * Serviço do Cliente — Representa um serviço contratado por um cliente.
 * Um serviço pode ter sub-serviços associados através do campo parentId.
 */
export type CustomerService = {
  /** Identificador único do serviço (gerado automaticamente) */
  id: number;
  /** Identificador do cliente associado */
  customerId: number;
  /** Identificador do serviço pai (opcional — para sub-serviços) */
  parentId?: number;
  /** ID de acesso */
  acesso: string;
  /** Tarifário */
  tarifario: string;
  /** Operadora */
  operadora: string;
  /** Valor do serviço (ex: 20.32) */
  valor: number;
  /** Moeda (predefinido: EUR) */
  moeda: Moeda;
  /** Conta */
  conta: string;
  /** CVP */
  cvp: string;
  /** Data de fim do serviço */
  dataFim: string | null;
  /** Número de cliente */
  numClient: string;
  /** Número de serviço */
  numServico: string;
  /** Morada */
  morada: string;
  /** Observações */
  observacoes: string;
  /** Data de criação */
  createdAt: string;
};

export type CustomerNote = {
  id: number;
  customerId: number;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
};

export type CustomerDocument = {
  id: number;
  customerId: number;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
};

export type CustomerAddress = {
  id: number;
  customerId: number;
  street: string;
  postalCode: string;
  district: string;
  municipality: string;
  parish: string;
  country: string;
};

export type DashboardSummary = {
  asOf: string;
  customers: { total: number; active: number; inactive: number };
  services: { total: number; active: number; activeValue: number };
  // Services by end date, using the notification flag windows (days from today).
  ending: { expired: number; within90: number; within180: number; within270: number };
  endingByMonth: { month: string; count: number }[];
  topOperators: { operadora: string; count: number }[];
  notifications: { unread: number };
};

/** Row of the cross-customer services list (sub-services are rows too). */
export type ServiceListItem = CustomerService & {
  customerName: string;
  customerCompany: string;
};

export type ServiceEndingFilter = 'expired' | '90' | '180' | '270';
