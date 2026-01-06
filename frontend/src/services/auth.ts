import api from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: number
    email: string
    name: string
  }
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials)
      const { access_token, user } = response.data
      
      // Guardar token y usuario
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error de autenticación')
    }
  }

  async register(userData: any) {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error en registro')
    }
  }

  async logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  }
}

export default new AuthService()