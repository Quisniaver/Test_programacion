import api from './api'

export interface Record {
  id: number
  title: string
  description: string
  category: string
  amount: number
  date: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
  userId: number
}

export interface CreateRecordDto {
  title: string
  description: string
  category: string
  amount: number
  date: string
  status: 'active' | 'inactive' | 'pending'
}

export interface UpdateRecordDto extends Partial<CreateRecordDto> {}

class RecordsService {
  // Obtener todos los records
  async getAll(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    status?: string
    startDate?: string
    endDate?: string
  }): Promise<{ records: Record[]; total: number }> {
    const response = await api.get('/records', { params })
    return response.data
  }

  // Obtener un record por ID
  async getById(id: number): Promise<Record> {
    const response = await api.get(`/records/${id}`)
    return response.data
  }

  // Crear nuevo record
  async create(data: CreateRecordDto): Promise<Record> {
    const response = await api.post('/records', data)
    return response.data
  }

  // Actualizar record
  async update(id: number, data: UpdateRecordDto): Promise<Record> {
    const response = await api.patch(`/records/${id}`, data)
    return response.data
  }

  // Eliminar record
  async delete(id: number): Promise<void> {
    await api.delete(`/records/${id}`)
  }

  // Obtener categorías
  async getCategories(): Promise<string[]> {
    const response = await api.get('/records/categories')
    return response.data
  }

  // Obtener estadísticas
  async getStats(): Promise<{
    total: number
    totalAmount: number
    byCategory: { [key: string]: number }
    byStatus: { [key: string]: number }
  }> {
    const response = await api.get('/records/stats')
    return response.data
  }
}

export default new RecordsService()