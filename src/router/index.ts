import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { pinia } from '@/main'

// Auth pages
// import Login from "@/views/LoginPage.vue"
// import Register from "@/views/RegisterPage.vue"

// User pages
import HomePage from '@/views/user/HomePage.vue'
import UserProfile from '@/views/user/UserProfile.vue'
import PrivateChat from '@/views/user/PrivateChat.vue'
import Notifications from '@/views/user/Notifications.vue'
import Settings from '@/views/user/Settings.vue'
import PermissionRequest from '@/views/user/PermissionRequest.vue'
import DiscussionDetail from '@/views/user/DiscussionDetail.vue'

const routes = [
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: Login,
  // },
  // {
  //   path: '/register',
  //   name: 'Register',
  //   component: Register,
  // },
  {
    path: '/permission-request',
    name: 'PermissionRequest',
    component: PermissionRequest,
    meta: { requiresAuth: true },
  },
  {
    path: '/discussion',
    name: 'DiscussionDetail',
    component: DiscussionDetail,
    meta: { requiresAuth: true },
  },

  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true },
  },
  {
    path: '/chat',
    name: 'PrivateChat',
    component: PrivateChat,
    meta: { requiresAuth: true },
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


// router.beforeEach((to, from, next) => {
//   const auth = useAuthStore(pinia)

//   if (to.meta.requiresAuth && !auth.isLoggedIn) {
//     next({ name: 'Login' })
//   } 
//   else if (
//     (to.name === 'Login' || to.name === 'Register') &&
//     auth.isLoggedIn
//   ) {
//     next({ name: 'HomePage' })
//   } 
//   else {
//     next()
//   }
// })

export default router