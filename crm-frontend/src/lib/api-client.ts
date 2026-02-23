import type { Customer, CustomerService, CustomerDocument } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// CSRF token handling for Django session authentication
function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : null
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfToken = getCsrfToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
    (headers as Record<string, string>)['X-CSRFToken'] = csrfToken
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for session auth
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return response
}

// Pagination response type from DRF
export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// Transform functions for snake_case <-> camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

function transformKeys<T>(obj: unknown, transformer: (key: string) => string): T {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transformer)) as T
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        transformer(key),
        transformKeys(value, transformer),
      ])
    ) as T
  }
  return obj as T
}

function toFrontend<T>(data: unknown): T {
  return transformKeys<T>(data, snakeToCamel)
}

function toBackend<T>(data: unknown): T {
  return transformKeys<T>(data, camelToSnake)
}

// Customer API types for backend
type BackendCustomer = {
  id: number
  name: string
  email: string
  phone: string
  company: string
  status: 'active' | 'inactive'
  created_at: string
}

type BackendCustomerService = {
  id: number
  customer: number
  parent: number | null
  acesso: string
  tarifario: string
  operadora: string
  valor: string // Decimal comes as string from DRF
  moeda: 'EUR'
  conta: string
  cvp: string
  data_fim: string
  num_client: string
  num_servico: string
  observacoes: string
  created_at: string
  children?: BackendCustomerService[]
}

// Transform CustomerService from backend format
function transformCustomerService(service: BackendCustomerService, customerId: number): CustomerService {
  const transformed: CustomerService = {
    id: service.id,
    customerId: customerId,
    parentId: service.parent ?? undefined,
    acesso: service.acesso,
    tarifario: service.tarifario,
    operadora: service.operadora,
    valor: parseFloat(service.valor),
    moeda: service.moeda,
    conta: service.conta,
    cvp: service.cvp,
    dataFim: service.data_fim,
    numClient: service.num_client,
    numServico: service.num_servico,
    observacoes: service.observacoes,
    createdAt: service.created_at,
  }
  return transformed
}

// Flatten nested services (parent with children) into flat array
function flattenServices(services: BackendCustomerService[], customerId: number): CustomerService[] {
  const result: CustomerService[] = []
  for (const service of services) {
    result.push(transformCustomerService(service, customerId))
    if (service.children && service.children.length > 0) {
      for (const child of service.children) {
        result.push(transformCustomerService(child, customerId))
      }
    }
  }
  return result
}

// Customers API
export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    // Fetch all pages
    let allCustomers: Customer[] = []
    let url = '/customers/'

    while (url) {
      const response = await fetchWithAuth(url)
      const data: PaginatedResponse<BackendCustomer> = await response.json()
      allCustomers = [...allCustomers, ...data.results.map(c => toFrontend<Customer>(c))]

      // Handle next page URL (extract path from full URL)
      if (data.next) {
        const nextUrl = new URL(data.next)
        url = nextUrl.pathname + nextUrl.search
        // Remove /api prefix if present since fetchWithAuth adds it
        url = url.replace(/^\/api/, '')
      } else {
        url = ''
      }
    }

    return allCustomers
  },

  getById: async (id: number): Promise<Customer | undefined> => {
    try {
      const response = await fetchWithAuth(`/customers/${id}/`)
      const data: BackendCustomer = await response.json()
      return toFrontend<Customer>(data)
    } catch {
      return undefined
    }
  },

  create: async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> => {
    const response = await fetchWithAuth('/customers/', {
      method: 'POST',
      body: JSON.stringify(toBackend(customer)),
    })
    const data: BackendCustomer = await response.json()
    return toFrontend<Customer>(data)
  },

  update: async (id: number, updates: Partial<Customer>): Promise<Customer> => {
    const response = await fetchWithAuth(`/customers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(toBackend(updates)),
    })
    const data: BackendCustomer = await response.json()
    return toFrontend<Customer>(data)
  },

  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`/customers/${id}/`, {
      method: 'DELETE',
    })
  },
}

// Customer Services API
export const customerServicesApi = {
  getByCustomerId: async (customerId: number): Promise<CustomerService[]> => {
    let allServices: CustomerService[] = []
    let url = `/customers/${customerId}/services/`

    while (url) {
      const response = await fetchWithAuth(url)
      const data: PaginatedResponse<BackendCustomerService> = await response.json()
      allServices = [...allServices, ...flattenServices(data.results, customerId)]

      if (data.next) {
        const nextUrl = new URL(data.next)
        url = nextUrl.pathname + nextUrl.search
        url = url.replace(/^\/api/, '')
      } else {
        url = ''
      }
    }

    return allServices
  },

  create: async (service: Omit<CustomerService, 'id' | 'createdAt'>): Promise<CustomerService> => {
    const backendPayload = {
      parent: service.parentId ?? null,
      acesso: service.acesso,
      tarifario: service.tarifario,
      operadora: service.operadora,
      valor: service.valor.toString(),
      moeda: service.moeda,
      conta: service.conta,
      cvp: service.cvp,
      data_fim: service.dataFim,
      num_client: service.numClient,
      num_servico: service.numServico,
      observacoes: service.observacoes,
    }

    const response = await fetchWithAuth(`/customers/${service.customerId}/services/`, {
      method: 'POST',
      body: JSON.stringify(backendPayload),
    })
    const data: BackendCustomerService = await response.json()
    return transformCustomerService(data, service.customerId)
  },

  update: async (id: number, updates: Partial<CustomerService>, customerId: number): Promise<CustomerService> => {
    const backendPayload: Record<string, unknown> = {}

    if (updates.parentId !== undefined) backendPayload.parent = updates.parentId ?? null
    if (updates.acesso !== undefined) backendPayload.acesso = updates.acesso
    if (updates.tarifario !== undefined) backendPayload.tarifario = updates.tarifario
    if (updates.operadora !== undefined) backendPayload.operadora = updates.operadora
    if (updates.valor !== undefined) backendPayload.valor = updates.valor.toString()
    if (updates.moeda !== undefined) backendPayload.moeda = updates.moeda
    if (updates.conta !== undefined) backendPayload.conta = updates.conta
    if (updates.cvp !== undefined) backendPayload.cvp = updates.cvp
    if (updates.dataFim !== undefined) backendPayload.data_fim = updates.dataFim
    if (updates.numClient !== undefined) backendPayload.num_client = updates.numClient
    if (updates.numServico !== undefined) backendPayload.num_servico = updates.numServico
    if (updates.observacoes !== undefined) backendPayload.observacoes = updates.observacoes

    const response = await fetchWithAuth(`/customers/${customerId}/services/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(backendPayload),
    })
    const data: BackendCustomerService = await response.json()
    return transformCustomerService(data, customerId)
  },

  delete: async (id: number, customerId: number): Promise<void> => {
    await fetchWithAuth(`/customers/${customerId}/services/${id}/`, {
      method: 'DELETE',
    })
  },
}

// Customer Documents API
export const customerDocumentsApi = {
  getByCustomerId: async (customerId: number): Promise<CustomerDocument[]> => {
    const response = await fetchWithAuth(`/customers/${customerId}/documents/`)
    const data: CustomerDocument[] = await response.json()
    return data
  },

  upload: async (file: File, customerId: number): Promise<CustomerDocument> => {
    const csrfToken = getCsrfToken()
    const formData = new FormData()
    formData.append('file', file)

    const headers: HeadersInit = {}
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken
    }

    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/documents/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
      throw new Error(error.detail || error.file?.[0] || `HTTP ${response.status}`)
    }

    return response.json()
  },

  delete: async (id: number, customerId: number): Promise<void> => {
    await fetchWithAuth(`/customers/${customerId}/documents/${id}/`, {
      method: 'DELETE',
    })
  },

  getDownloadUrl: (customerId: number, documentId: number): string => {
    return `${API_BASE_URL}/customers/${customerId}/documents/${documentId}/download/`
  },
}

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetchWithAuth('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    return response.json()
  },

  logout: async () => {
    await fetchWithAuth('/auth/logout/', {
      method: 'POST',
    })
  },

  me: async () => {
    const response = await fetchWithAuth('/auth/me/')
    return response.json()
  },
}
