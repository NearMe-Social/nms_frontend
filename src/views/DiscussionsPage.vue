<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import PostOptionsMenu from '@/components/PostOptionsMenu.vue'
import { postApi, type ApiPost } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import {
  Clock3,
  Heart,
  MapPin,
  MessageSquare,
  PencilLine,
  Plus,
  Search,
  Share2,
  Sparkles,
} from 'lucide-vue-next'

type PostStatus = 'published'

type MyPost = {
  id: number
  title: string
  body: string
  status: PostStatus
  visibility: number
  timeLabel: string
  likes: number
  comments: number
  shares: number
  category: string
  image?: string
  featured?: boolean
}

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
] as const

const auth = useAuthStore()
const activeTab = ref<(typeof tabs)[number]['key']>('all')
const searchTerm = ref('')
const posts = ref<ApiPost[]>([])
const loading = ref(true)
const error = ref('')

const myPosts = computed<MyPost[]>(() => {
  const userId = auth.user?.userId ?? auth.user?.user_id

  return posts.value
    .filter((post) => !userId || post.user?.user_id === userId)
    .map((post, index) => ({
      id: post.post_id,
      title: post.title,
      body: post.content,
      status: 'published',
      visibility: post.visibility_radius,
      timeLabel: timeAgo(post.created_at),
      likes: post.reactions?.length ?? post.reactions_count ?? 0,
      comments: post.comments?.length ?? post.comments_count ?? 0,
      shares: 0,
      category: post.status,
      featured: index === 0,
    }))
})

const filteredPosts = computed(() => {
  const needle = searchTerm.value.trim().toLowerCase()

  return myPosts.value.filter((post) => {
    const matchesTab = activeTab.value === 'all' || post.status === activeTab.value
    const matchesSearch =
      needle.length === 0 ||
      post.title.toLowerCase().includes(needle) ||
      post.body.toLowerCase().includes(needle) ||
      post.category.toLowerCase().includes(needle)

    return matchesTab && matchesSearch
  })
})

const stats = computed(() => {
  const totalEngagement = myPosts.value.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0)
  return {
    views: String(myPosts.value.length),
    activeNeighbors: myPosts.value.length,
    engagement: totalEngagement,
  }
})

async function loadPosts() {
  loading.value = true
  error.value = ''
  try {
    posts.value = await postApi.list('latest')
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load your posts.'
  } finally {
    loading.value = false
  }
}

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`
  return `${Math.floor(hours / 24)} days ago`
}

onMounted(loadPosts)
</script>

<template>
  <div class="min-h-screen bg-[#f4f7fb] text-slate-700">
    <Navbar />

    <div class="flex min-w-0">
      <AppSidebar class="hidden md:flex" />

      <div class="w-full min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <div class="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <main class="min-w-0">
            <section class="mb-6 rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0">
                  <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">
                    My Posts
                  </h1>
                  <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Manage your active neighborhood updates and quick notices in the Oakwood Creek circle.
                  </p>
                </div>

                <RouterLink
                  to="/create-post"
                  class="inline-flex shrink-0 items-center gap-2 rounded-full bg-cyan-800 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-900/15 transition hover:bg-cyan-900"
                >
                  <Plus class="h-4 w-4" />
                  Create Post
                </RouterLink>
              </div>

              <div class="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                <div class="flex min-w-64 flex-1 items-center gap-3 rounded-full bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                  <Search class="h-4 w-4 text-slate-400" />
                  <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="Search neighbors, posts, and places"
                    class="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>

                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    type="button"
                    class="rounded-full px-4 py-2 text-xs font-bold transition"
                    :class="activeTab === tab.key ? 'bg-cyan-800 text-white shadow-sm' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200 hover:text-cyan-800'"
                    @click="activeTab = tab.key"
                  >
                    {{ tab.label }}
                  </button>
                </div>
              </div>
            </section>

            <p v-if="loading" class="rounded-[18px] bg-white p-5 text-sm font-semibold text-slate-500 ring-1 ring-slate-200/70">
              Loading your posts...
            </p>
            <p v-else-if="error" class="rounded-[18px] bg-white p-5 text-sm font-semibold text-rose-600 ring-1 ring-rose-100">
              {{ error }}
            </p>

            <section v-else class="grid auto-rows-fr gap-5 lg:grid-cols-2">
              <article
                v-for="post in filteredPosts"
                :key="post.id"
                class="overflow-hidden rounded-[18px] bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-lg"
                :class="post.featured ? 'lg:col-span-2' : ''"
              >
                <div v-if="post.image" class="relative">
                  <img :src="post.image" :alt="post.title" class="h-48 w-full object-cover sm:h-56" />
                  <span class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-cyan-800 shadow-sm">
                    {{ post.category }}
                  </span>
                </div>

                <div class="p-5 sm:p-6">
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <h2 class="text-lg font-black leading-tight text-slate-900">{{ post.title }}</h2>
                      <p class="mt-2 text-sm leading-6 text-slate-600">{{ post.body }}</p>
                    </div>
                    <div class="flex gap-2 shrink-0">
                      <button class="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-cyan-800">
                        <PencilLine class="h-4 w-4" />
                      </button>
                      <PostOptionsMenu :post-id="post.id" />
                    </div>
                  </div>

                  <div class="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                    <span class="inline-flex items-center gap-1.5">
                      <Clock3 class="h-4 w-4" />
                      {{ post.timeLabel }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <MapPin class="h-4 w-4" />
                      {{ post.visibility }}m
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <Heart class="h-4 w-4" />
                      {{ post.likes }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <MessageSquare class="h-4 w-4" />
                      {{ post.comments }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <Share2 class="h-4 w-4" />
                      {{ post.shares }}
                    </span>
                  </div>
                </div>
              </article>

              <RouterLink
                to="/create-post"
                class="flex min-h-[260px] flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500 transition hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-900"
              >
                <span class="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-800">
                  <Plus class="h-5 w-5" />
                </span>
                <span class="mt-4 text-sm font-black">New ephemeral post</span>
                <span class="mt-1 max-w-48 text-xs leading-5">Share a 24-hour update with nearby neighbors.</span>
              </RouterLink>
            </section>

            <section class="mt-6 rounded-[18px] bg-cyan-950 p-6 text-white shadow-lg shadow-cyan-950/15">
              <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div>
                  <p class="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/70">Your civic impact</p>
                  <p class="mt-3 max-w-2xl text-sm leading-6 text-cyan-50/85">
                    In the last 30 days, your posts helped neighbors avoid road closures, recover belongings, and discover nearby events.
                  </p>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p class="text-2xl font-black">{{ stats.views }}</p>
                    <p class="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cyan-100/60">Views</p>
                  </div>
                  <div>
                    <p class="text-2xl font-black">{{ stats.activeNeighbors }}</p>
                    <p class="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cyan-100/60">Neighbors</p>
                  </div>
                  <div>
                    <p class="text-2xl font-black">{{ stats.engagement }}</p>
                    <p class="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-cyan-100/60">Actions</p>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <aside class="grid min-w-0 gap-5 md:grid-cols-2 2xl:block 2xl:space-y-5">
            <section class="rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-black text-slate-900">Regional active</h2>
                <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">3</span>
              </div>
              <div class="mt-4 space-y-4">
                <article class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Open today</p>
                  <h3 class="mt-2 text-sm font-black text-slate-900">Weekend Community Yoga</h3>
                  <p class="mt-2 text-xs leading-5 text-slate-500">North lawn, Saturday at 8 AM.</p>
                </article>
                <article class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Alerting</p>
                  <h3 class="mt-2 text-sm font-black text-slate-900">Road repair update</h3>
                  <p class="mt-2 text-xs leading-5 text-slate-500">Elm Street delays expected this evening.</p>
                </article>
              </div>
            </section>

            <section class="rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-black text-slate-900">Today’s feedback</h2>
                <Sparkles class="h-4 w-4 text-cyan-700" />
              </div>
              <p class="mt-4 text-xs leading-5 text-slate-500">
                Your repair notice is useful because it includes time, place, and a clear action for neighbors.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>
