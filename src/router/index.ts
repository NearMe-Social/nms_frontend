import { createRouter, createWebHistory } from 'vue-router'
import NearbyView from '@/views/NearbyView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/nearby',
    },
    {
      path: '/nearby',
      name: 'nearby',
      component: NearbyView,
    },
  ],
})

export default router
