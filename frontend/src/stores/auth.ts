import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService, { type LoginCredentials } from '@/services/auth.service'
import type { User } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(authService.getToken())
  const user = ref<User | null>(authService.getCurrentUser())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const userEmail = computed(() => user.value?.email || '')
  const userName = computed(() => user.value?.name || '')

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      token.value = response.access_token
      user.value = response.user
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Error de autenticación'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    authService.logout()
    token.value = null
    user.value = null
  }

  const initialize = () => {
    if (token.value) {
     
      console.log('Usuario autenticado:', user.value)
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    userEmail,
    userName,
    login,
    logout,
    initialize,
    clearError
  }
})