<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" elevation="1" density="compact">
      <!-- Botón menú hamburguesa -->
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      
      <v-app-bar-title>
        <span class="font-weight-bold">Sistema de Registros</span>
      </v-app-bar-title>
      
      <v-spacer />
      
      <!-- Notificaciones -->
      <v-btn icon>
        <v-badge dot color="error">
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
      
      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="ml-2">
            <v-avatar size="32" class="mr-2">
              <v-img v-if="user.avatar" :src="user.avatar" />
              <span v-else class="text-h6">{{ userInitials }}</span>
            </v-avatar>
            <span class="text-capitalize">{{ user.name }}</span>
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        
        <v-list density="compact">
          <v-list-item @click="goToProfile">
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Mi Perfil</v-list-item-title>
          </v-list-item>
          
          <v-list-item @click="goToSettings">
            <template v-slot:prepend>
              <v-icon>mdi-cog</v-icon>
            </template>
            <v-list-item-title>Configuración</v-list-item-title>
          </v-list-item>
          
          <v-divider />
          
          <v-list-item @click="logout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Cerrar Sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" color="surface" :permanent="mdAndUp">
      <v-list density="compact" nav class="py-0">
        <!-- Logo/Header -->
        <v-list-item class="px-2" @click="drawer = false">
          <template v-slot:prepend>
            <v-icon color="primary" size="32">mdi-database</v-icon>
          </template>
          <v-list-item-title class="text-h6 font-weight-bold">
            CRM
          </v-list-item-title>
        </v-list-item>
        
        <v-divider class="my-2" />
        
        <!-- Sección Principal -->
        <v-list-group value="main">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-view-dashboard" title="Principal" />
          </template>
          
          <v-list-item 
            to="/dashboard" 
            prepend-icon="mdi-monitor-dashboard"
            title="Dashboard"
            :active="$route.path === '/dashboard'"
          />
          
          <v-list-item 
            to="/records" 
            prepend-icon="mdi-table"
            title="Registros"
            :active="$route.path === '/records'"
          />
          
          <v-list-item 
            to="/analytics" 
            prepend-icon="mdi-chart-bar"
            title="Analíticas"
            :active="$route.path === '/analytics'"
          />
        </v-list-group>
        
        <!-- Sección Gestión -->
        <v-list-group value="management">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cog" title="Gestión" />
          </template>
          
          <v-list-item 
            to="/categories" 
            prepend-icon="mdi-tag"
            title="Categorías"
          />
          
          <v-list-item 
            to="/users" 
            prepend-icon="mdi-account-group"
            title="Usuarios"
          />
          
          <v-list-item 
            to="/reports" 
            prepend-icon="mdi-file-document"
            title="Reportes"
          />
        </v-list-group>
        
        <!-- Quick Actions -->
        <v-divider class="my-4" />
        
        <v-list-item 
          prepend-icon="mdi-plus-circle"
          title="Nuevo Registro"
          color="primary"
          @click="createNewRecord"
        />
        
        <v-list-item 
          prepend-icon="mdi-download"
          title="Exportar Datos"
          @click="exportData"
        />
      </v-list>
      
      <!-- Footer del Drawer -->
      <template v-slot:append>
        <div class="pa-4">
          <v-btn 
            block 
            color="primary" 
            variant="tonal"
            @click="toggleTheme"
            prepend-icon="mdi-theme-light-dark"
          >
            {{ theme === 'light' ? 'Modo Oscuro' : 'Modo Claro' }}
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="fill-height pa-4">
        <!-- Breadcrumbs -->
        <v-breadcrumbs v-if="breadcrumbs.length > 1" :items="breadcrumbs" class="pa-0 mb-4" />
        
        <!-- Router View -->
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app color="surface" height="48" class="px-4">
      <span class="text-caption text-disabled">
        &copy; {{ new Date().getFullYear() }} Sistema de Registros • v1.0.0
      </span>
      <v-spacer />
      <span class="text-caption text-disabled">
        {{ user.email }} • {{ user.role || 'Usuario' }}
      </span>
    </v-footer>

    <!-- Snackbar Global -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const { mdAndUp } = useDisplay()
const authStore = useAuthStore()

const drawer = ref(mdAndUp.value)
const theme = ref('light')
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const user = computed(() => ({
  name: authStore.userName || 'Usuario',
  email: authStore.userEmail || 'usuario@example.com',
  avatar: null,
  role: 'Administrador'
}))

const userInitials = computed(() => {
  const name = user.value.name
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter(p => p)
  const crumbs = [{ title: 'Inicio', disabled: false, href: '/' }]
  
  pathArray.forEach((path, index) => {
    const routeTo = '/' + pathArray.slice(0, index + 1).join('/')
    const title = path.charAt(0).toUpperCase() + path.slice(1)
    
    crumbs.push({
      title: title,
      disabled: index === pathArray.length - 1,
      href: routeTo
    })
  })
  
  return crumbs
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToSettings = () => {
  router.push('/settings')
}

const createNewRecord = () => {
  router.push('/records/new')
}

const exportData = () => {
  snackbar.value = {
    show: true,
    message: 'Descargando datos...',
    color: 'info'
  }
}

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  // Aquí implementarías el cambio de tema global
}

// Ajustar drawer en responsive
watch(mdAndUp, (newVal) => {
  drawer.value = newVal
})

// Mostrar snackbar basado en query params
watch(() => route.query.message, (message) => {
  if (message) {
    snackbar.value = {
      show: true,
      message: message as string,
      color: route.query.type as string || 'success'
    }
  }
})
</script>

<style scoped>
.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.v-list-item--active .v-list-item-title {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}

.v-list-group__items .v-list-item {
  padding-left: 40px !important;
}
</style>