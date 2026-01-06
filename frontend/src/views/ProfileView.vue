<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-2">Mi Perfil</h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          Gestiona tu información personal
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title>
            <v-icon class="mr-2">mdi-account-circle</v-icon>
            Información Personal
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="updateProfile">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.name"
                    label="Nombre completo"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="profile.email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-text-field
                    v-model="profile.position"
                    label="Cargo"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-text-field
                    v-model="profile.phone"
                    label="Teléfono"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-btn 
                    color="primary" 
                    type="submit"
                    :loading="saving"
                  >
                    <v-icon left>mdi-content-save</v-icon>
                    Guardar Cambios
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title>
            <v-icon class="mr-2">mdi-shield-account</v-icon>
            Cuenta
          </v-card-title>
          
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>Rol</v-list-item-title>
                <v-list-item-subtitle>Administrador</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Miembro desde</v-list-item-title>
                <v-list-item-subtitle>Enero 2024</v-list-item-subtitle>
              </v-list-item>
              
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-last-login</v-icon>
                </template>
                <v-list-item-title>Último acceso</v-list-item-title>
                <v-list-item-subtitle>Hace 2 horas</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        
        <v-card elevation="2">
          <v-card-title>
            <v-icon class="mr-2">mdi-key</v-icon>
            Cambiar Contraseña
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="changePassword">
              <v-text-field
                v-model="password.current"
                label="Contraseña actual"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-2"
              />
              
              <v-text-field
                v-model="password.new"
                label="Nueva contraseña"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-2"
              />
              
              <v-text-field
                v-model="password.confirm"
                label="Confirmar contraseña"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-4"
              />
              
              <v-btn 
                color="primary" 
                variant="outlined"
                block
                type="submit"
              >
                Cambiar Contraseña
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Profile {
  name: string
  email: string
  position: string
  phone: string
}

const profile = ref<Profile>({
  name: '',
  email: '',
  position: '',
  phone: ''
})

const password = ref({
  current: '',
  new: '',
  confirm: ''
})

const saving = ref(false)

const loadProfile = () => {
  // Cargar datos del usuario del localStorage
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      profile.value.name = user.name || 'Usuario'
      profile.value.email = user.email || ''
    } catch (error) {
      console.error('Error cargando perfil:', error)
    }
  }
}

const updateProfile = () => {
  saving.value = true
  
  // Simular guardado
  setTimeout(() => {
    // Actualizar localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        user.name = profile.value.name
        user.email = profile.value.email
        localStorage.setItem('user', JSON.stringify(user))
      } catch (error) {
        console.error('Error actualizando perfil:', error)
      }
    }
    
    saving.value = false
    alert('Perfil actualizado correctamente')
  }, 1000)
}

const changePassword = () => {
  if (password.value.new !== password.value.confirm) {
    alert('Las contraseñas no coinciden')
    return
  }
  
  if (password.value.new.length < 6) {
    alert('La contraseña debe tener al menos 6 caracteres')
    return
  }
  
  alert('Contraseña cambiada exitosamente')
  password.value = { current: '', new: '', confirm: '' }
}

onMounted(() => {
  loadProfile()
})
</script>