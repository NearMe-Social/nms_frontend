import { createRouter, createWebHistory } from 'vue-router'
<<<<<<< HEAD
=======
import { useAuthStore } from '@/stores/auth'
// import Login from '@/views/auth/LoginPage.vue'
// import Register from '@/views/auth/RegisterPage.vue'
>>>>>>> Development
import HomePage from '@/views/user/HomePage.vue'
import UserProfile from '@/views/user/UserProfile.vue'
import PrivateChat from '@/views/user/PrivateChat.vue'
import Notifications from '@/views/user/Notifications.vue'
import Settings from '@/views/user/Settings.vue'
import PermissionRequest from '@/views/user/PermissionRequest.vue'
import DiscussionDetail from '@/views/user/DiscussionDetail.vue'
<<<<<<< HEAD
=======
import CreateDiscussion from '@/views/user/CreateDiscussion.vue'
>>>>>>> Development
import NearbyView from '@/views/NearbyView.vue'
import CreatePostPage from '@/views/CreatePostPage.vue'
import DiscussionsPage from '@/views/DiscussionsPage.vue'

const routes = [
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: Login,
  // },
  {
    path: '/register',
    redirect: '/',
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
<<<<<<< HEAD
    path: '/create-post',
    name: 'CreatePostPage',
    component: CreatePostPage,
    meta: { requiresAuth: true },
=======
    path: '/discussion/new',
    name: 'CreateDiscussion',
    component: CreateDiscussion,
    meta: { requiresAuth: true },
  },
  {
    path: '/create-post',
    name: 'CreatePostPage',
    component: CreatePostPage,
>>>>>>> Development
  },
  {
    path: '/discussions',
    name: 'DiscussionsPage',
    component: DiscussionsPage,
<<<<<<< HEAD
    meta: { requiresAuth: true },
=======
>>>>>>> Development
  },

  {
    path: '/',
    name: 'HomePage',
    component: HomePage,
   // meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
  },
  {
    path: '/chat',
    name: 'PrivateChat',
    component: PrivateChat,
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: Notifications,
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
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

<<<<<<< HEAD
=======
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Redirect authenticated users away from login/register pages
  if ((to.name === 'Login' || to.name === 'Register') && auth.isLoggedIn) {
    next({ name: 'HomePage' })
    return
  }

  // Protect routes that require authentication
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

>>>>>>> Development
export default router
