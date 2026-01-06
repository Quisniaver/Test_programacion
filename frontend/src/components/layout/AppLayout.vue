<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="primary" density="compact">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-toolbar-title>📊 Sistema de Transacciones</v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <!-- User Info -->
      <v-menu v-if="authStore.user" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props">
            <v-icon left>mdi-account</v-icon>
            {{ authStore.user.username }}
          </v-btn>
        </template>
        
        <v-list>
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
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          @click="drawer = false"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const drawer = ref(false)
const authStore = useAuthStore()
const router = useRouter()

const menuItems = computed(() => [
  { title: '📋 Transacciones', icon: 'mdi-table', to: '/records' },
  { title: '📤 Subir PDF', icon: 'mdi-upload', to: '/upload' },
  { title: '📊 Estadísticas', icon: 'mdi-chart-bar', to: '/stats' },
])

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.v-main {
  min-height: calc(100vh - 64px);
}
</style>