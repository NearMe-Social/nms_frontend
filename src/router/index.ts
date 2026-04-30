import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/auth/LoginPage.vue'
import Register from '@/views/auth/RegisterPage.vue'
import HomePage from '@/views/user/HomePage.vue'
import UserProfile from '@/views/user/UserProfile.vue'
import PrivateChat from '@/views/user/PrivateChat.vue'
import Notifications from '@/views/user/Notifications.vue'
import Settings from '@/views/user/Settings.vue'
import PermissionRequest from '@/views/user/PermissionRequest.vue'
import DiscussionDetail from '@/views/user/DiscussionDetail.vue'
import CreateDiscussion from '@/views/user/CreateDiscussion.vue'
import NearbyView from '@/views/NearbyView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
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
    path: '/discussion/new',
    name: 'CreateDiscussion',
    component: CreateDiscussion,
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
  {
    path: '/nearby',
    name: 'nearby',
    component: NearbyView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Redirect authenticated users away from login/register pages
  if ((to.name === 'Login' || to.name === 'Register') && auth.isLoggedIn) {
    next({ name: 'HomePage' })
    return
  }

  // Protect routes that require authentication
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
