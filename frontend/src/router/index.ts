import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/records'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true, layout: 'empty' }
    },
    {
      path: '/records',
      name: 'Records',
      component: () => import('@/views/RecordsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/records/new',
      name: 'NewRecord',
      component: () => import('@/views/RecordsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/records/:id/edit',
      name: 'EditRecord',
      component: () => import('@/views/RecordsView.vue'),
      meta: { requiresAuth: true },
      props: true
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    
    {
      path: '/:pathMatch(.*)*',
      redirect: '/records'
    }
  ]
})

// Guard de autenticación
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    next('/records')
  } else {
    next()
  }
})

export default router