export interface Transaction {
  id: number
  sourceId: string
  fecha: string
  categoria: string
  monto: number
  estado: string
  descripcion: string
  createdAt?: string
  updatedAt?: string
}

export interface TransactionForm {
  sourceId: string
  fecha: string
  categoria: string
  monto: number
  estado: string
  descripcion: string
}

export interface TransactionStats {
  categoria: string
  total: number
  monto_total: number
  monto_promedio: number
  estado: string
  cancelados: number
  pendientes: number
  activos: number
  completados: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}