<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login - Sistema de Transacciones</v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="username"
                label="Usuario"
                prepend-icon="mdi-account"
                type="text"
                :error-messages="usernameErrors"
                @input="clearErrors"
                required
              />
              
              <v-text-field
                v-model="password"
                label="Contraseña"
                prepend-icon="mdi-lock"
                type="password"
                :error-messages="passwordErrors"
                @input="clearErrors"
                required
              />
              
              <v-alert
                v-if="loginError"
                type="error"
                variant="tonal"
                class="mb-4"
              >
                {{ loginError }}
              </v-alert>
              
              <v-card-actions>
                <v-spacer />
                <v-btn 
                  color="primary" 
                  type="submit"
                  :loading="loading"
                  :disabled="loading"
                >
                  Iniciar Sesión
                </v-btn>
              </v-card-actions>
            </v-form>
            
            <div class="text-center mt-4">
              <p class="text-caption text-grey">
                Usuario de prueba: <strong>admin</strong><br>
                Contraseña: <strong>1234</strong>
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('admin') 
const password = ref('1234')
const loading = ref(false)
const loginError = ref('')

const usernameErrors = computed(() => {
  if (!username.value) return ['Usuario requerido']
  return []
})

const passwordErrors = computed(() => {
  if (!password.value) return ['Contraseña requerida']
  return []
})

const clearErrors = () => {
  loginError.value = ''
}

const handleLogin = async () => {
  if (usernameErrors.value.length || passwordErrors.value.length) {
    return
  }

  loading.value = true
  loginError.value = ''

  const result = await authStore.login({
    username: username.value,
    password: password.value
  })

  if (result.success) {
    router.push('/dashboard')
  } else {
    loginError.value = result.error || 'Error de autenticación'
  }

  loading.value = false
}
</script>