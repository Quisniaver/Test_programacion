import axios from 'axios'


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_URL,  
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para JWT - TU backend usa JwtAuthGuard
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Error en request interceptor:', error)
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url)
    
    if (error.response?.status === 401) {
 
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    if (error.response?.status === 403) {
      alert('No tienes permisos para esta acción')
    }
    
    return Promise.reject(error)
  }
)

export default api