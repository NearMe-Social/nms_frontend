import { createRouter, createWebHistory } from 'vue-router'
import { getPostAuthPath, useAuthStore } from '@/stores/auth'

import Login from '@/views/auth/LoginPage.vue'
import Register from '@/views/auth/RegisterPage.vue'
import SelectProfile from '@/views/auth/SelectProfilePage.vue'
import HomePage from '@/views/user/HomePage.vue'
import UserProfile from '@/views/user/UserProfile.vue'
import EditProfile from '@/views/user/EditProfile.vue'
import PrivateChat from '@/views/user/PrivateChat.vue'
import Notifications from '@/views/user/Notifications.vue'
import Settings from '@/views/user/Settings.vue'
import PermissionRequest from '@/views/user/PermissionRequest.vue'
import DiscussionDetail from '@/views/user/DiscussionDetail.vue'
import CreateDiscussion from '@/views/user/CreateDiscussion.vue'
import NearbyView from '@/views/NearbyView.vue'
import CreatePostPage from '@/views/CreatePostPage.vue'
import DiscussionsPage from '@/views/DiscussionsPage.vue'
import ReportPostPage from '@/views/ReportPostPage.vue'
import ReportUserPage from '@/views/ReportUserPage.vue'
import ReportCommentPage from '@/views/ReportCommentPage.vue'
import AdminReportsPage from '@/views/admin/AdminReportsPage.vue'
import AdminLayout from '@/views/admin/AdminLayout.vue'
import AdminDashboard from '@/views/admin/AdminDashboard.vue'
import AdminReportDetail from '@/views/admin/AdminReportDetail.vue'
import AdminUsersPage from '@/views/admin/AdminUsersPage.vue'
import AdminModerationPage from '@/views/admin/AdminModerationPage.vue'
import OtpPage from '@/views/auth/OtpPage.vue'

const routes = [
  // Authentication routes
  // /login - Hit auth login endpoint
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  // /register - User registration
  {
    path: '/register',
    name: 'Register',
    component: Register,
  },
  // End of authentication routes

  // User and application routes
  {
    path: '/auth/google/callback',
    name: 'GoogleCallback',
    component: () => import('@/views/auth/GoogleCallback.vue'),
  },
  {
    path: '/select-profile',
    name: 'SelectProfile',
    component: SelectProfile,
    meta: { requiresAuth: true },
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
    path: '/posts/:postId',
    name: 'PostDetail',
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
    path: '/create-post',
    name: 'CreatePostPage',
    component: CreatePostPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/report/post',
    name: 'ReportPost',
    component: ReportPostPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/report/user',
    name: 'ReportUser',
    component: ReportUserPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/report/comment',
    name: 'ReportComment',
    component: ReportCommentPage,
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
    path: '/users/:userId',
    name: 'PublicUserProfile',
    component: UserProfile,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile/edit',
    name: 'EditProfile',
    component: EditProfile,
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
    name: 'Nearby',
    component: NearbyView,
    meta: { requiresAuth: true },
  },
  // Admin routes
  {
    path: '/verify-otp',
    name: 'OtpPage',
    component: OtpPage,
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard,
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: AdminReportsPage,
      },
      {
        path: 'reports/:id',
        name: 'AdminReportDetail',
        component: AdminReportDetail,
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsersPage,
      },
      {
        path: 'moderation',
        name: 'AdminModeration',
        component: AdminModerationPage,
      },
    ],
  },
  {
    path: '/admin/dashboard',
    redirect: '/admin',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // If already logged in, don't allow user to go back to login/register
  if ((to.name === 'Login' || to.name === 'Register') && auth.isLoggedIn) {
    next({ name: 'HomePage' })
    return
  }

  if (auth.isLoggedIn && auth.user?.role !== 'ADMIN') {
    const onboardingPath = getPostAuthPath(auth.user)
    const isOnboardingPage =
      to.path === '/select-profile' || to.path === '/permission-request'

    if (onboardingPath !== '/' && to.path !== onboardingPath) {
      next(onboardingPath)
      return
    }

    if (onboardingPath === '/' && isOnboardingPage) {
      next({ name: 'HomePage' })
      return
    }
  }

  // Check login first
  // http://localhost:5173/login?redirect=/admin or any admin path redirects here
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // Check admin access
  const isAdminRoute = to.meta.requiresAdmin || to.path.startsWith('/admin')

  if (isAdminRoute) {
    const userRole = auth.user?.role

    if (userRole !== 'ADMIN') {
      next({ name: 'HomePage' })
      return
    }
  }

  next()
})
// End of beforeEach navigation guard

export default router
