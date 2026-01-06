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

export interface User {
  id: number
  email: string
  name: string
  role: string
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials)
    const { access_token, user } = response.data
    
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    
    return response.data
  }

  async register(userData: {
    name: string
    email: string
    password: string
  }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData)
    const { access_token, user } = response.data
    
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    
    return response.data
  }

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  async refreshToken(): Promise<string> {
    const response = await api.post('/auth/refresh')
    const { access_token } = response.data
    
    localStorage.setItem('token', access_token)
    return access_token
  }
}

export default new AuthService()