import  api  from './api'
import type { Transaction, TransactionForm, TransactionStats, PaginatedResponse } from '@/types/transaction'

export const transactionsService = {
  
  async getAll(page = 1, limit = 50): Promise<PaginatedResponse<Transaction>> {
    const response = await api.get('/transactions', {
      params: { page, limit }
    })
    return response.data
  },

 
  async getById(id: number): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`)
    return response.data
  },

  
  async searchBySourceId(sourceId: string): Promise<Transaction[]> {
    const response = await api.get('/transactions/search', {
      params: { sourceId }
    })
    return response.data
  },

 
  async create(transaction: TransactionForm): Promise<Transaction> {
    const response = await api.post('/transactions', transaction)
    return response.data
  },

 
  async update(id: number, transaction: Partial<TransactionForm>): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, transaction)
    return response.data
  },

 
  async delete(id: number): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },

 
  async uploadPdf(file: File): Promise<Transaction[]> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/transactions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  
  async getStats(): Promise<TransactionStats[]> {
    const response = await api.get('/transactions/stats')
    return response.data
  },

 
  async exportToCsv(): Promise<Blob> {
    const response = await api.get('/transactions/export/csv', {
      responseType: 'blob'
    })
    return response.data
  }
}