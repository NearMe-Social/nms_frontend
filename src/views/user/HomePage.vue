<template>
  <div class="min-h-screen bg-[#f4f7fb]">
    <Navbar />

    <div class="flex w-full gap-4 xl:gap-6">
      <AppSidebar class="hidden md:flex" />

      <main class="flex-1 flex flex-col gap-4 min-w-0 px-4 py-5 md:px-6">
        <div class="flex md:hidden items-center justify-between gap-2">
          <div class="flex gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-semibold"
              :class="sortMode === 'latest' ? 'bg-gray-800 text-white' : 'border bg-white text-gray-500 border-gray-200'"
              @click="setSort('latest')"
            >
              Latest
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-semibold"
              :class="sortMode === 'active' ? 'bg-gray-800 text-white' : 'border bg-white text-gray-500 border-gray-200'"
              @click="setSort('active')"
            >
              Active
            </button>
          </div>
          <RouterLink to="/create-post" class="bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1 no-underline">
            <Plus class="w-3 h-3" /> Post
          </RouterLink>
        </div>

        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">Nearby Feed</h1>
            <p class="mt-2 text-sm font-medium text-slate-400">See what's happening right now in your immediate circle.</p>
          </div>

          <div class="hidden md:flex gap-2">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-semibold"
              :class="sortMode === 'latest' ? 'bg-gray-800 text-white' : 'border bg-white text-gray-500 border-gray-200'"
              @click="setSort('latest')"
            >
              Latest
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-semibold"
              :class="sortMode === 'active' ? 'bg-gray-800 text-white' : 'border bg-white text-gray-500 border-gray-200'"
              @click="setSort('active')"
            >
              Active
            </button>
          </div>
        </div>

        <p v-if="loading" class="rounded-[18px] bg-white p-5 text-sm font-semibold text-gray-500 ring-1 ring-slate-200/70">
          Loading posts...
        </p>
        <p v-else-if="error" class="rounded-[18px] bg-white p-5 text-sm font-semibold text-rose-600 ring-1 ring-rose-100">
          {{ error }}
        </p>

        <section v-else-if="posts.length > 0" class="flex flex-col gap-4">
          <RouterLink
            v-for="post in posts"
            :key="post.post_id"
            to="/discussion"
            class="bg-white rounded-[18px] p-5 md:p-6 flex flex-col gap-4 shadow-sm ring-1 ring-slate-200/70 hover:shadow-md transition-shadow no-underline"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <RouterLink to="/profile" @click.stop>
                  <img
                    :src="post.user?.profile_image || `https://i.pravatar.cc/150?u=${post.user?.username || post.post_id}`"
                    class="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover"
                  />
                </RouterLink>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ post.user?.username || 'Neighbor' }}</p>
                  <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <MapPin class="w-3 h-3" /> {{ post.visibility_radius }}m visibility
                    </span>
                    <span class="text-xs text-gray-400">{{ timeAgo(post.created_at) }}</span>
                  </div>
                </div>
              </div>
              <span class="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
                <Clock class="w-3 h-3" /> {{ timeLeft(post.expires_at) }}
              </span>
            </div>

            <div>
              <h2 class="text-base font-bold text-gray-900">{{ post.title }}</h2>
              <p class="mt-2 text-sm text-gray-700 leading-relaxed">{{ post.content }}</p>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <div class="flex gap-1">
                <button type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                  <Heart class="w-4 h-4" /> {{ post.reactions?.length ?? post.reactions_count ?? 0 }}
                </button>
                <button type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                  <MessageCircle class="w-4 h-4" /> {{ post.comments?.length ?? post.comments_count ?? 0 }}
                </button>
              </div>
              <button type="button" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                <Share2 class="w-4 h-4" />
              </button>
            </div>
          </RouterLink>
        </section>

        <section v-else class="rounded-[18px] bg-white p-8 text-center text-sm font-semibold text-gray-500 ring-1 ring-slate-200/70">
          No posts yet. Share the first local update.
          <RouterLink to="/create-post" class="ml-2 text-teal-700">Create post</RouterLink>
        </section>
      </main>

      <aside class="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col gap-4 py-5 pr-4 md:pr-6">
        <div class="flex items-center gap-2">
          <Zap class="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <p class="text-xs font-bold uppercase tracking-widest text-gray-400">Feed Summary</p>
        </div>

        <div class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-2">
          <p class="text-xs font-semibold text-teal-600 uppercase tracking-wide">Live posts</p>
          <p class="text-3xl font-black text-gray-800">{{ posts.length }}</p>
          <p class="text-xs text-gray-400">Loaded from backend</p>
        </div>

        <div class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-1">
          <p class="text-xs font-semibold text-red-500 uppercase tracking-wide">Sorting</p>
          <p class="text-sm font-semibold text-gray-800">{{ sortMode === 'active' ? 'Most active' : 'Latest posts' }}</p>
          <p class="text-xs text-gray-400">Controlled by the posts API</p>
        </div>
      </aside>
    </div>

    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-4 py-3 z-50 shadow-lg">
      <RouterLink to="/" class="flex flex-col items-center gap-1 text-teal-600">
        <MapPin class="w-5 h-5" />
        <span class="text-xs font-semibold">Feed</span>
      </RouterLink>
      <RouterLink to="/chat" class="flex flex-col items-center gap-1 text-gray-400">
        <MessageCircle class="w-5 h-5" />
        <span class="text-xs">Chat</span>
      </RouterLink>
      <RouterLink to="/create-post" class="flex flex-col items-center gap-1 text-gray-400 no-underline">
        <div class="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center -mt-5 shadow-lg">
          <Plus class="w-5 h-5 text-white" />
        </div>
        <span class="text-xs mt-1">Post</span>
      </RouterLink>
      <RouterLink to="/notifications" class="flex flex-col items-center gap-1 text-gray-400">
        <Bell class="w-5 h-5" />
        <span class="text-xs">Alerts</span>
      </RouterLink>
      <RouterLink to="/profile" class="flex flex-col items-center gap-1 text-gray-400">
        <User class="w-5 h-5" />
        <span class="text-xs">Profile</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { postApi, type ApiPost } from '@/services/api'
import { MapPin, Bell, MessageCircle, Plus, User, Heart, Share2, Clock, Zap } from 'lucide-vue-next'

const posts = ref<ApiPost[]>([])
const loading = ref(true)
const error = ref('')
const sortMode = ref<'latest' | 'active'>('latest')

async function loadPosts() {
  loading.value = true
  error.value = ''
  try {
    posts.value = await postApi.list(sortMode.value)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load posts.'
  } finally {
    loading.value = false
  }
}

function setSort(sort: 'latest' | 'active') {
  sortMode.value = sort
  void loadPosts()
}

function timeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function timeLeft(value: string) {
  const diffMs = new Date(value).getTime() - Date.now()
  if (diffMs <= 0) return 'expired'
  const minutes = Math.ceil(diffMs / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.ceil(minutes / 60)
  return `${hours}h`
}

onMounted(loadPosts)
</script>
