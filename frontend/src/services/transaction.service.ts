// src/services/transactions.service.ts
import api from './api'

export interface Transaction {
  id: number
  sourceId: string
  fecha: string
  categoria: string
  monto: number
  estado: string
  descripcion: string
}

export interface CreateTransactionDto {
  sourceId: string
  fecha: string
  categoria: string
  monto: number
  estado: string
  descripcion: string
}

export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

// Clase principal del servicio
class TransactionsService {

  async getAll(): Promise<Transaction[]> {
    try {
      console.log('Llamando a GET /transactions...')
      const response = await api.get('/transactions')
      console.log('Respuesta del backend:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Error obteniendo transacciones:', error)
      console.error('Error detalles:', {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      })
      throw new Error(error.response?.data?.message || 'Error al obtener transacciones')
    }
  }

  // Subir PDF para extraer y guardar transacciones
  async uploadPdf(file: File): Promise<Transaction[]> {
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Subiendo PDF...')
      const response = await api.post('/transactions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('PDF procesado, transacciones:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Error subiendo PDF:', error)
      throw new Error(error.response?.data?.message || 'Error al procesar PDF')
    }
  }

  // Crear nueva transacción
  async create(data: CreateTransactionDto): Promise<Transaction> {
    try {
      console.log('Creando transacción:', data)
      const response = await api.post('/transactions', data)
      console.log('Transacción creada:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Error creando transacción:', error)
      throw new Error(error.response?.data?.message || 'Error al crear transacción')
    }
  }

  // Actualizar transacción existente
  async update(id: number, data: UpdateTransactionDto): Promise<Transaction> {
    try {
      console.log(`Actualizando transacción ${id}:`, data)
      const response = await api.patch(`/transactions/${id}`, data)
      console.log('Transacción actualizada:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Error actualizando transacción:', error)
      throw new Error(error.response?.data?.message || 'Error al actualizar transacción')
    }
  }

  // Eliminar transacción
  async delete(id: number): Promise<void> {
    try {
      console.log(`Eliminando transacción ${id}`)
      await api.delete(`/transactions/${id}`)
      console.log('Transacción eliminada')
    } catch (error: any) {
      console.error('Error eliminando transacción:', error)
      throw new Error(error.response?.data?.message || 'Error al eliminar transacción')
    }
  }

  // Obtener una transacción por ID
  async getById(id: number): Promise<Transaction> {
    try {
      console.log(`Obteniendo transacción ${id}`)
      const response = await api.get(`/transactions/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Error obteniendo transacción:', error)
      throw new Error(error.response?.data?.message || 'Error al obtener transacción')
    }
  }

  // Verificar conexión con el backend
  async testConnection(): Promise<boolean> {
    try {
      await api.get('/transactions')
      return true
    } catch (error) {
      console.error('No se puede conectar al backend:', error)
      return false
    }
  }
}

// Crear y exportar UNA instancia del servicio
const transactionsServiceInstance = new TransactionsService()

export default transactionsServiceInstance