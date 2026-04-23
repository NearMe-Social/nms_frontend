import { createRouter, createWebHistory } from 'vue-router'
import DiscussionDetail from '../views/DiscussionDetail.vue'

const routes = [
  {
    path: '/',
    redirect: '/discussion/1'
  },
  {
    path: '/discussion/:id',
    name: 'DiscussionDetail',
    component: DiscussionDetail
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})