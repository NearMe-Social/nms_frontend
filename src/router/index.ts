import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/user/HomePage.vue'
import UserProfile from '@/views/user/UserProfile.vue'
import PrivateChat from '@/views/user/PrivateChat.vue'
import Notifications from '@/views/user/Notifications.vue'
import Settings from '@/views/user/Settings.vue'
import PermissionRequest from '@/views/user/PermissionRequest.vue'
import DiscussionDetail from '@/views/user/DiscussionDetail.vue'
import NearbyView from '@/views/NearbyView.vue'
import CreatePostPage from '@/views/CreatePostPage.vue'
import DiscussionsPage from '@/views/DiscussionsPage.vue'

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
    path: '/create-post',
    name: 'CreatePostPage',
    component: CreatePostPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/discussions',
    name: 'DiscussionsPage',
    component: DiscussionsPage,
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

export default router
