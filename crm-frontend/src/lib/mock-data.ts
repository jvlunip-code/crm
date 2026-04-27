import type { Customer, Service, Event, CustomerService, CustomerNote, CustomerDocument } from '@/types'

const STORAGE_VERSION = '6' // Increment this to force a data refresh

const STORAGE_KEYS = {
  CUSTOMERS: 'crm_customers',
  SERVICES: 'crm_services',
  EVENTS: 'crm_events',
  CUSTOMER_SERVICES: 'crm_customer_services',
  CUSTOMER_NOTES: 'crm_customer_notes',
  CUSTOMER_DOCUMENTS: 'crm_customer_documents',
  VERSION: 'crm_data_version',
}

// Initial Customers Data
const initialCustomers: Customer[] = [
  { id: 1, name: 'John Smith', email: 'john.smith@techcorp.com', phone: '+1 (555) 123-4567', company: 'TechCorp Solutions', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-01-15T10:30:00Z' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@innovate.io', phone: '+1 (555) 234-5678', company: 'Innovate Digital', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-02-20T14:45:00Z' },
  { id: 3, name: 'Michael Chen', email: 'mchen@cloudventures.com', phone: '+1 (555) 345-6789', company: 'CloudVentures Inc', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-03-10T09:15:00Z' },
  { id: 4, name: 'Emily Rodriguez', email: 'emily.r@datastream.co', phone: '+1 (555) 456-7890', company: 'DataStream Analytics', nif: null, iban: null, decisor: null, segment: null, status: 'inactive', createdAt: '2024-01-25T16:20:00Z' },
  { id: 5, name: 'David Park', email: 'dpark@nexusgroup.com', phone: '+1 (555) 567-8901', company: 'Nexus Group', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-04-05T11:00:00Z' },
  { id: 6, name: 'Lisa Anderson', email: 'l.anderson@bizpro.com', phone: '+1 (555) 678-9012', company: 'BizPro Consulting', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-02-14T08:30:00Z' },
  { id: 7, name: 'James Wilson', email: 'jwilson@alphatech.io', phone: '+1 (555) 789-0123', company: 'AlphaTech Systems', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-03-22T13:45:00Z' },
  { id: 8, name: 'Maria Garcia', email: 'maria.g@globalsoft.com', phone: '+1 (555) 890-1234', company: 'GlobalSoft Industries', nif: null, iban: null, decisor: null, segment: null, status: 'inactive', createdAt: '2024-01-30T15:10:00Z' },
  { id: 9, name: 'Robert Taylor', email: 'rtaylor@velocity.co', phone: '+1 (555) 901-2345', company: 'Velocity Partners', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-04-12T10:20:00Z' },
  { id: 10, name: 'Jennifer Lee', email: 'jlee@summit.io', phone: '+1 (555) 012-3456', company: 'Summit Enterprises', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-02-28T12:00:00Z' },
  { id: 11, name: 'Christopher Brown', email: 'c.brown@primeware.com', phone: '+1 (555) 111-2222', company: 'PrimeWare Solutions', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-03-18T09:30:00Z' },
  { id: 12, name: 'Amanda Martinez', email: 'amartinez@fusiontech.io', phone: '+1 (555) 222-3333', company: 'FusionTech Labs', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-01-08T14:15:00Z' },
  { id: 13, name: 'Daniel Kim', email: 'dkim@horizonsoft.com', phone: '+1 (555) 333-4444', company: 'HorizonSoft Inc', nif: null, iban: null, decisor: null, segment: null, status: 'inactive', createdAt: '2024-04-01T11:45:00Z' },
  { id: 14, name: 'Jessica White', email: 'j.white@apex.co', phone: '+1 (555) 444-5555', company: 'Apex Digital', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-02-09T16:30:00Z' },
  { id: 15, name: 'Ryan Thompson', email: 'rthompson@zenith.io', phone: '+1 (555) 555-6666', company: 'Zenith Technologies', nif: null, iban: null, decisor: null, segment: null, status: 'active', createdAt: '2024-03-05T08:00:00Z' },
]

// Initial Services Data
const initialServices: Service[] = [
  { id: 1, name: 'Starter Plan', description: 'Perfect for small teams getting started', price: 29.99, billingCycle: 'monthly', status: 'active', features: ['5 Users', '10GB Storage', 'Email Support', 'Basic Analytics'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Professional Plan', description: 'Best for growing businesses', price: 79.99, billingCycle: 'monthly', status: 'active', features: ['25 Users', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'API Access'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 3, name: 'Enterprise Plan', description: 'For large organizations with complex needs', price: 299.99, billingCycle: 'monthly', status: 'active', features: ['Unlimited Users', '1TB Storage', '24/7 Support', 'Custom Analytics', 'API Access', 'Dedicated Manager'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 4, name: 'Starter Annual', description: 'Starter plan with annual billing', price: 299.99, billingCycle: 'yearly', status: 'active', features: ['5 Users', '10GB Storage', 'Email Support', 'Basic Analytics', '2 Months Free'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 5, name: 'Professional Annual', description: 'Professional plan with annual billing', price: 799.99, billingCycle: 'yearly', status: 'active', features: ['25 Users', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'API Access', '2 Months Free'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 6, name: 'Basic Plan', description: 'Essential features for individuals', price: 9.99, billingCycle: 'monthly', status: 'active', features: ['1 User', '1GB Storage', 'Email Support'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 7, name: 'Team Plan', description: 'Collaboration features for teams', price: 149.99, billingCycle: 'monthly', status: 'active', features: ['50 Users', '250GB Storage', 'Priority Support', 'Advanced Analytics', 'API Access', 'Team Collaboration'], createdAt: '2024-02-01T00:00:00Z' },
  { id: 8, name: 'Legacy Plan', description: 'Discontinued plan', price: 49.99, billingCycle: 'monthly', status: 'inactive', features: ['10 Users', '25GB Storage', 'Email Support', 'Basic Analytics'], createdAt: '2023-06-01T00:00:00Z' },
]

// Initial Events Data
const initialEvents: Event[] = [
  { id: 1, action: 'create', entityType: 'customer', entityId: 1, description: 'Customer John Smith was created', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 2, action: 'update', entityType: 'service', entityId: 2, description: 'Professional Plan price was updated', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 3, action: 'config', entityType: 'system', entityId: 0, description: 'User Admin logged in', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 4, action: 'create', entityType: 'notification', entityId: 1, description: 'New notification sent to John Smith', performedBy: 'System', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: 5, action: 'delete', entityType: 'customer', entityId: 99, description: 'Customer Test User was deleted', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: 6, action: 'deactivate', entityType: 'customer', entityId: 4, description: 'Customer Emily Rodriguez status changed to inactive', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: 7, action: 'create', entityType: 'service', entityId: 7, description: 'New service Team Plan was created', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  { id: 8, action: 'update', entityType: 'customer', entityId: 2, description: 'Payment received from Sarah Johnson - $799.99', performedBy: 'System', createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
  { id: 9, action: 'config', entityType: 'system', entityId: 0, description: 'Customer report exported to CSV', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
  { id: 10, action: 'update', entityType: 'notification', entityId: 4, description: 'Notification marked as read', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString() },
  { id: 11, action: 'config', entityType: 'system', entityId: 0, description: 'System backup completed successfully', performedBy: 'System', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: 12, action: 'create', entityType: 'customer', entityId: 15, description: 'Customer Ryan Thompson was created', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
  { id: 13, action: 'activate', entityType: 'service', entityId: 3, description: 'Enterprise Plan was activated', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() },
  { id: 14, action: 'update', entityType: 'customer', entityId: 5, description: 'Customer David Park contact info updated', performedBy: 'Admin', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 15, action: 'create', entityType: 'notification', entityId: 8, description: 'Monthly report notification sent', performedBy: 'System', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
]

// Dados iniciais de Serviços do Cliente
const initialCustomerServices: CustomerService[] = [
  { id: 1, customerId: 1, acesso: 'ACC-001', tarifario: 'Empresarial Plus', operadora: 'MEO', valor: 45.99, moeda: 'EUR', conta: 'CT-10001', cvp: 'CVP-2001', dataFim: '2025-01-15', numClient: 'NC-5001', numServico: 'NS-8001', morada: '', observacoes: 'Contrato renovado anualmente', createdAt: '2024-01-15T10:30:00Z' },
  { id: 2, customerId: 1, acesso: 'ACC-002', tarifario: 'Dados Móveis 50GB', operadora: 'Vodafone', valor: 29.50, moeda: 'EUR', conta: 'CT-10001', cvp: 'CVP-2002', dataFim: '2025-06-01', numClient: 'NC-5001', numServico: 'NS-8002', morada: '', observacoes: '', createdAt: '2024-02-01T09:00:00Z' },
  { id: 3, customerId: 1, parentId: 1, acesso: 'ACC-001-A', tarifario: 'Extensão VoIP', operadora: 'MEO', valor: 12.00, moeda: 'EUR', conta: 'CT-10001', cvp: 'CVP-2001', dataFim: '2025-01-15', numClient: 'NC-5001', numServico: 'NS-8003', morada: '', observacoes: 'Sub-serviço VoIP do acesso principal', createdAt: '2024-01-20T14:00:00Z' },
  { id: 4, customerId: 2, acesso: 'ACC-003', tarifario: 'Fibra Negócio 1Gbps', operadora: 'NOS', valor: 89.99, moeda: 'EUR', conta: 'CT-10002', cvp: 'CVP-3001', dataFim: '2025-02-20', numClient: 'NC-5002', numServico: 'NS-8004', morada: '', observacoes: 'Instalação concluída', createdAt: '2024-02-20T14:45:00Z' },
  { id: 5, customerId: 3, acesso: 'ACC-004', tarifario: 'Empresarial Standard', operadora: 'MEO', valor: 35.00, moeda: 'EUR', conta: 'CT-10003', cvp: 'CVP-4001', dataFim: '2025-03-10', numClient: 'NC-5003', numServico: 'NS-8005', morada: '', observacoes: 'Cliente com desconto fidelização', createdAt: '2024-03-10T09:15:00Z' },
  { id: 6, customerId: 5, acesso: 'ACC-005', tarifario: 'Corporate Premium', operadora: 'Vodafone', valor: 120.00, moeda: 'EUR', conta: 'CT-10005', cvp: 'CVP-5001', dataFim: '2025-04-05', numClient: 'NC-5005', numServico: 'NS-8006', morada: '', observacoes: 'VIP - suporte prioritário', createdAt: '2024-04-05T11:00:00Z' },
  { id: 7, customerId: 6, acesso: 'ACC-006', tarifario: 'PME Essencial', operadora: 'NOS', valor: 25.00, moeda: 'EUR', conta: 'CT-10006', cvp: 'CVP-6001', dataFim: '2025-02-14', numClient: 'NC-5006', numServico: 'NS-8007', morada: '', observacoes: '', createdAt: '2024-02-14T08:30:00Z' },
  { id: 8, customerId: 7, acesso: 'ACC-007', tarifario: 'Dados Ilimitados', operadora: 'MEO', valor: 55.00, moeda: 'EUR', conta: 'CT-10007', cvp: 'CVP-7001', dataFim: '2025-03-22', numClient: 'NC-5007', numServico: 'NS-8008', morada: '', observacoes: 'Integração com sistemas existentes', createdAt: '2024-03-22T13:45:00Z' },
]

// Initial Customer Notes Data
const initialCustomerNotes: CustomerNote[] = [
  { id: 1, customerId: 1, content: 'Initial meeting went well. Customer is interested in scaling their team next quarter.', createdBy: 'Admin', createdAt: '2024-01-15T11:00:00Z' },
  { id: 2, customerId: 1, content: 'Follow-up call scheduled for next week to discuss enterprise features.', createdBy: 'Admin', createdAt: '2024-01-20T14:30:00Z' },
  { id: 3, customerId: 1, content: 'Customer requested API documentation. Sent via email.', createdBy: 'Support', createdAt: '2024-02-05T09:15:00Z' },
  { id: 4, customerId: 2, content: 'Onboarding completed successfully. Team is very responsive.', createdBy: 'Admin', createdAt: '2024-02-21T10:00:00Z' },
  { id: 5, customerId: 2, content: 'Discussed potential partnership opportunities.', createdBy: 'Admin', createdAt: '2024-03-10T16:00:00Z' },
  { id: 6, customerId: 3, content: 'Customer experiencing some performance issues. Engineering team investigating.', createdBy: 'Support', createdAt: '2024-03-12T11:30:00Z' },
  { id: 7, customerId: 3, content: 'Performance issues resolved. Customer satisfied with response time.', createdBy: 'Support', createdAt: '2024-03-14T15:45:00Z' },
  { id: 8, customerId: 5, content: 'VIP customer - ensure priority support for all requests.', createdBy: 'Admin', createdAt: '2024-04-05T12:00:00Z' },
  { id: 9, customerId: 6, content: 'Customer interested in annual billing discount.', createdBy: 'Sales', createdAt: '2024-02-20T13:20:00Z' },
  { id: 10, customerId: 7, content: 'Technical onboarding completed. Integration with their existing systems successful.', createdBy: 'Support', createdAt: '2024-03-25T10:30:00Z' },
]

// Initial Customer Documents Data
const initialCustomerDocuments: CustomerDocument[] = [
  { id: 1, customerId: 1, name: 'Service Agreement.pdf', type: 'pdf', size: 245000, url: '#', uploadedAt: '2024-01-15T10:30:00Z' },
  { id: 2, customerId: 1, name: 'NDA.pdf', type: 'pdf', size: 128000, url: '#', uploadedAt: '2024-01-15T10:35:00Z' },
  { id: 3, customerId: 1, name: 'Company Logo.png', type: 'image', size: 45000, url: '#', uploadedAt: '2024-01-20T09:00:00Z' },
  { id: 4, customerId: 2, name: 'Enterprise Contract.pdf', type: 'pdf', size: 312000, url: '#', uploadedAt: '2024-02-20T14:45:00Z' },
  { id: 5, customerId: 2, name: 'Requirements Document.docx', type: 'document', size: 89000, url: '#', uploadedAt: '2024-02-22T11:00:00Z' },
  { id: 6, customerId: 3, name: 'Service Agreement.pdf', type: 'pdf', size: 245000, url: '#', uploadedAt: '2024-03-10T09:15:00Z' },
  { id: 7, customerId: 5, name: 'Enterprise Contract.pdf', type: 'pdf', size: 356000, url: '#', uploadedAt: '2024-04-05T11:00:00Z' },
  { id: 8, customerId: 5, name: 'Security Audit Report.pdf', type: 'pdf', size: 892000, url: '#', uploadedAt: '2024-04-10T14:30:00Z' },
  { id: 9, customerId: 6, name: 'Service Agreement.pdf', type: 'pdf', size: 245000, url: '#', uploadedAt: '2024-02-14T08:30:00Z' },
  { id: 10, customerId: 7, name: 'Integration Specs.pdf', type: 'pdf', size: 156000, url: '#', uploadedAt: '2024-03-22T13:45:00Z' },
]

export function initializeStorage() {
  const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION)

  // If version mismatch, clear all data and reinitialize
  if (currentVersion !== STORAGE_VERSION) {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS)
    localStorage.removeItem(STORAGE_KEYS.SERVICES)
    localStorage.removeItem('crm_notifications')
    localStorage.removeItem(STORAGE_KEYS.EVENTS)
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_SERVICES)
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_NOTES)
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_DOCUMENTS)
    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION)
  }

  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers))
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(initialServices))
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initialEvents))
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMER_SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_SERVICES, JSON.stringify(initialCustomerServices))
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMER_NOTES)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_NOTES, JSON.stringify(initialCustomerNotes))
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMER_DOCUMENTS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_DOCUMENTS, JSON.stringify(initialCustomerDocuments))
  }
}

// API simulation helpers
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Customers API
export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
    return data ? JSON.parse(data) : []
  },
  getById: async (id: number): Promise<Customer | undefined> => {
    await delay(200)
    const customers = await customersApi.getAll()
    return customers.find(c => c.id === id)
  },
  create: async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    await delay(300)
    const customers = await customersApi.getAll()
    const newCustomer: Customer = {
      ...customer,
      id: Math.max(...customers.map(c => c.id), 0) + 1,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([...customers, newCustomer]))
    return newCustomer
  },
  update: async (id: number, updates: Partial<Customer>): Promise<Customer> => {
    await delay(300)
    const customers = await customersApi.getAll()
    const index = customers.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Customer not found')
    customers[index] = { ...customers[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers))
    return customers[index]
  },
  delete: async (id: number): Promise<void> => {
    await delay(300)
    const customers = await customersApi.getAll()
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers.filter(c => c.id !== id)))
  },
}

// Services API
export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.SERVICES)
    return data ? JSON.parse(data) : []
  },
  getById: async (id: number): Promise<Service | undefined> => {
    await delay(200)
    const services = await servicesApi.getAll()
    return services.find(s => s.id === id)
  },
  create: async (service: Omit<Service, 'id' | 'createdAt'>): Promise<Service> => {
    await delay(300)
    const services = await servicesApi.getAll()
    const newService: Service = {
      ...service,
      id: Math.max(...services.map(s => s.id), 0) + 1,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify([...services, newService]))
    return newService
  },
  update: async (id: number, updates: Partial<Service>): Promise<Service> => {
    await delay(300)
    const services = await servicesApi.getAll()
    const index = services.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Service not found')
    services[index] = { ...services[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services))
    return services[index]
  },
  delete: async (id: number): Promise<void> => {
    await delay(300)
    const services = await servicesApi.getAll()
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services.filter(s => s.id !== id)))
  },
}

// Events API
export const eventsApi = {
  getAll: async (): Promise<Event[]> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS)
    return data ? JSON.parse(data) : []
  },
  create: async (event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> => {
    await delay(200)
    const events = await eventsApi.getAll()
    const newEvent: Event = {
      ...event,
      id: Math.max(...events.map(e => e.id), 0) + 1,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify([newEvent, ...events]))
    return newEvent
  },
}

// API de Serviços do Cliente
export const customerServicesApi = {
  getByCustomerId: async (customerId: number): Promise<CustomerService[]> => {
    await delay(200)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_SERVICES)
    const services: CustomerService[] = data ? JSON.parse(data) : []
    return services.filter(s => s.customerId === customerId)
  },
  create: async (service: Omit<CustomerService, 'id' | 'createdAt'>): Promise<CustomerService> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_SERVICES)
    const services: CustomerService[] = data ? JSON.parse(data) : []
    const newService: CustomerService = {
      ...service,
      id: Math.max(...services.map(s => s.id), 0) + 1,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_SERVICES, JSON.stringify([...services, newService]))
    return newService
  },
  update: async (id: number, updates: Partial<CustomerService>): Promise<CustomerService> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_SERVICES)
    const services: CustomerService[] = data ? JSON.parse(data) : []
    const index = services.findIndex(s => s.id === id)
    if (index === -1) throw new Error('Service not found')
    services[index] = { ...services[index], ...updates }
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_SERVICES, JSON.stringify(services))
    return services[index]
  },
  delete: async (id: number): Promise<void> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_SERVICES)
    const services: CustomerService[] = data ? JSON.parse(data) : []
    // Eliminar o serviço e todos os sub-serviços associados
    const idsToDelete = new Set<number>([id])
    services.forEach(s => {
      if (s.parentId === id) idsToDelete.add(s.id)
    })
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_SERVICES, JSON.stringify(services.filter(s => !idsToDelete.has(s.id))))
  },
}

// Customer Notes API
export const customerNotesApi = {
  getByCustomerId: async (customerId: number): Promise<CustomerNote[]> => {
    await delay(200)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_NOTES)
    const notes: CustomerNote[] = data ? JSON.parse(data) : []
    return notes.filter(n => n.customerId === customerId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },
  create: async (note: Omit<CustomerNote, 'id' | 'createdAt'>): Promise<CustomerNote> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_NOTES)
    const notes: CustomerNote[] = data ? JSON.parse(data) : []
    const newNote: CustomerNote = {
      ...note,
      id: Math.max(...notes.map(n => n.id), 0) + 1,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_NOTES, JSON.stringify([...notes, newNote]))
    return newNote
  },
  update: async (id: number, updates: Partial<CustomerNote>): Promise<CustomerNote> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_NOTES)
    const notes: CustomerNote[] = data ? JSON.parse(data) : []
    const index = notes.findIndex(n => n.id === id)
    if (index === -1) throw new Error('Note not found')
    notes[index] = { ...notes[index], ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_NOTES, JSON.stringify(notes))
    return notes[index]
  },
  delete: async (id: number): Promise<void> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_NOTES)
    const notes: CustomerNote[] = data ? JSON.parse(data) : []
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_NOTES, JSON.stringify(notes.filter(n => n.id !== id)))
  },
}

// Customer Documents API
export const customerDocumentsApi = {
  getByCustomerId: async (customerId: number): Promise<CustomerDocument[]> => {
    await delay(200)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_DOCUMENTS)
    const documents: CustomerDocument[] = data ? JSON.parse(data) : []
    return documents.filter(d => d.customerId === customerId).sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
  },
  create: async (document: Omit<CustomerDocument, 'id' | 'uploadedAt'>): Promise<CustomerDocument> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_DOCUMENTS)
    const documents: CustomerDocument[] = data ? JSON.parse(data) : []
    const newDocument: CustomerDocument = {
      ...document,
      id: Math.max(...documents.map(d => d.id), 0) + 1,
      uploadedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_DOCUMENTS, JSON.stringify([...documents, newDocument]))
    return newDocument
  },
  delete: async (id: number): Promise<void> => {
    await delay(300)
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMER_DOCUMENTS)
    const documents: CustomerDocument[] = data ? JSON.parse(data) : []
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_DOCUMENTS, JSON.stringify(documents.filter(d => d.id !== id)))
  },
  upload: async (file: { name: string; size: number; type: string }, customerId: number): Promise<CustomerDocument> => {
    await delay(800 + Math.random() * 700)

    const inferType = (mimeType: string, fileName: string): string => {
      if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) return 'pdf'
      if (mimeType.startsWith('image/')) return 'image'
      if (mimeType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'document'
      if (mimeType.includes('sheet') || mimeType.includes('excel') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) return 'spreadsheet'
      return 'other'
    }

    return customerDocumentsApi.create({
      customerId,
      name: file.name,
      type: inferType(file.type, file.name),
      size: file.size,
      url: '#',
    })
  },
}

// Chart data generator
export function generateChartData(days: number) {
  const data = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    const baseDesktop = 150 + Math.floor((days - i) * 3)
    const baseMobile = 80 + Math.floor((days - i) * 2)

    data.push({
      date: date.toISOString().split('T')[0],
      desktop: baseDesktop + Math.floor(Math.random() * 50) - 25,
      mobile: baseMobile + Math.floor(Math.random() * 30) - 15,
    })
  }

  return data
}
