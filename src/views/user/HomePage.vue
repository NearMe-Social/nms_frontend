<template>
  <div class="min-h-screen bg-[#f4f7fb]">
    <Navbar />
    <div class="flex w-full gap-4 xl:gap-6">
      <AppSidebar class="hidden md:flex" />

      <main class="flex-1 flex flex-col gap-4 min-w-0 px-4 py-5 md:px-6">

        <!-- Header -->
        <div class="flex flex-wrap items-end justify-between gap-3 animate-fade-down">
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Nearby Feed
            </h1>
            <p class="mt-1 text-sm text-slate-400 font-medium">
              See what's happening <span class="text-teal-500 font-semibold">right now</span> in your immediate circle.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                type="button"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ease-in-out"
                :class="sortMode === 'latest' ? 'bg-gray-800 text-white scale-105 shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:scale-105'"
                @click="setSort('latest')"
              >
                Latest
              </button>
              <button
                type="button"
                class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ease-in-out"
                :class="sortMode === 'active' ? 'bg-gray-800 text-white scale-105 shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:scale-105'"
                @click="setSort('active')"
              >
                Most Active
              </button>
            </div>
            <RouterLink
              to="/create-post"
              class="hidden md:flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl no-underline transition-all duration-200 shadow-sm shadow-teal-200 hover:shadow-teal-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <Plus class="w-3.5 h-3.5" /> Create Post
            </RouterLink>
          </div>
        </div>

        <!-- LOADING SKELETON -->
        <div v-if="loading" class="flex flex-col gap-4 animate-fade-up">
          <div
            v-for="n in 4"
            :key="n"
            class="bg-white rounded-[18px] p-5 flex flex-col gap-4 shadow-sm ring-1 ring-slate-200/70 animate-pulse"
          >
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-full bg-gray-200 shrink-0"></div>
              <div class="flex-1 flex flex-col gap-2">
                <div class="h-3 bg-gray-200 rounded-full w-1/4"></div>
                <div class="h-2.5 bg-gray-100 rounded-full w-1/3"></div>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="h-3 bg-gray-200 rounded-full w-1/3"></div>
              <div class="h-3 bg-gray-100 rounded-full w-full"></div>
              <div class="h-3 bg-gray-100 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>

        <!-- ERROR STATE -->
        <div
          v-else-if="error"
          class="animate-fade-up rounded-[18px] bg-white p-8 text-center ring-1 ring-rose-100 flex flex-col items-center gap-3"
        >
          <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center animate-bounce">
            <AlertCircle class="w-6 h-6 text-red-400" />
          </div>
          <p class="text-sm font-bold text-rose-600">{{ error }}</p>
          <button
            @click="loadPosts"
            class="text-xs font-bold text-teal-600 hover:underline hover:text-teal-700 transition-colors duration-200"
          >
            Try again
          </button>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-else-if="posts.length === 0"
          class="animate-fade-up rounded-[18px] bg-white p-12 text-center ring-1 ring-slate-200/70 flex flex-col items-center gap-4"
        >
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center animate-bounce">
            <MapPin class="w-7 h-7 text-gray-300" />
          </div>
          <div>
            <p class="text-base font-black text-gray-700">No posts nearby</p>
            <p class="text-sm text-gray-400 mt-1 font-medium">Be the first to share something in your area!</p>
          </div>
          <RouterLink
            to="/create-post"
            class="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl no-underline hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
          >
            <Plus class="w-4 h-4" /> Create Post
          </RouterLink>
        </div>

        <!-- POSTS -->
        <TransitionGroup
          v-else
          name="post"
          tag="section"
          class="flex flex-col gap-4"
        >
          <div
            v-for="post in posts"
            :key="post.post_id"
            class="bg-white rounded-[18px] p-5 md:p-6 flex flex-col gap-4 shadow-sm ring-1 ring-slate-200/70 hover:shadow-lg hover:-translate-y-1 hover:ring-teal-200 transition-all duration-300 ease-in-out cursor-pointer group"
            @click="navigateToPost(post.post_id)"
            @keydown.enter="navigateToPost(post.post_id)"
            role="link"
            tabindex="0"
          >
            <!-- Post header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <RouterLink :to="profileRoute(post.user?.user_id)" class="shrink-0" @click.stop>
                  <img
                    :src="post.user?.profile_image || `https://i.pravatar.cc/150?u=${post.user?.username || post.post_id}`"
                    class="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-teal-300 transition-all duration-300 group-hover:scale-105"
                  />
                </RouterLink>
                <div class="min-w-0">
                  <RouterLink
                    :to="profileRoute(post.user?.user_id)"
                    class="text-sm font-bold text-gray-800 hover:text-teal-700 no-underline transition-colors duration-200"
                    @click.stop
                  >
                    {{ post.user?.username || 'Neighbor' }}
                  </RouterLink>
                  <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span class="text-xs bg-teal-50 text-teal-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors duration-200 group-hover:bg-teal-100">
                      <MapPin class="w-3 h-3" /> {{ post.visibility_radius }}m
                    </span>
                    <span class="text-xs text-gray-400 font-medium">{{ timeAgo(post.created_at) }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <span
                  v-if="!isExpired(post.expires_at)"
                  class="text-xs bg-orange-50 text-orange-500 font-semibold border border-orange-200 px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-200 hover:bg-orange-100"
                >
                  <Clock class="w-3 h-3" /> {{ timeLeft(post.expires_at) }}
                </span>
                <span
                  v-else
                  class="text-xs bg-gray-100 text-gray-400 font-medium px-2 py-1 rounded-full flex items-center gap-1"
                >
                  <Clock class="w-3 h-3" /> Expired
                </span>
                <PostOptionsMenu
                  :post-id="post.post_id"
                  :user-id="post.user?.user_id"
                  @click.stop
                />
              </div>
            </div>

            <!-- Post content -->
            <div>
              <h2
                class="text-base font-black text-gray-900 group-hover:text-teal-700 transition-colors duration-200 leading-snug"
              >
                {{ post.title }}
              </h2>

              <div v-if="post.image_url" class="mt-3 overflow-hidden rounded-xl bg-gray-100">
                <img
                  :src="post.image_url"
                  alt="Post image"
                  class="post-display-image"
                />
              </div>

              <p
                class="mt-1.5 text-sm text-gray-600 leading-relaxed line-clamp-3 font-medium"
              >
                {{ post.content }}
              </p>
            </div>

            <!-- Post footer -->
            <div class="flex items-center justify-between pt-3 border-t border-gray-100">
              <div class="flex gap-1">
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-red-50 hover:text-red-400 hover:scale-105 active:scale-95 transition-all duration-200 font-semibold"
                  @click.stop
                >
                  <Heart class="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                  <span class="text-xs font-bold">{{ post.reactions?.length ?? post.reactions_count ?? 0 }}</span>
                </button>
                <button
                  type="button"
                  class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-teal-50 hover:text-teal-500 hover:scale-105 active:scale-95 transition-all duration-200"
                  @click.stop
                >
                  <MessageCircle class="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                  <span class="text-xs font-bold">{{ post.comments?.length ?? post.comments_count ?? 0 }}</span>
                </button>
              </div>
              <button
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200"
                @click.stop
              >
                <Share2 class="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
              </button>
            </div>

          </div>
        </TransitionGroup>

      </main>

      <!-- RIGHT PANEL -->
      <aside class="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col gap-4 py-5 pr-4 md:pr-6 animate-fade-up">

        <div class="flex items-center gap-2">
          <!-- <Zap class="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" /> -->
          <p class="text-xs font-black uppercase tracking-widest text-gray-400">Quick Info</p>
        </div>

        <!-- Live posts count -->
        <div class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p class="text-xs font-black text-teal-600 uppercase tracking-wide">Nearby Posts</p>
          <div class="flex items-end gap-2">
            <p class="text-3xl font-black text-gray-800">{{ posts.length }}</p>
            <p class="text-xs text-gray-400 mb-1 font-semibold">posts loaded</p>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-1.5">
            <div
              class="bg-teal-500 h-1.5 rounded-full transition-all duration-700 ease-out"
              :style="{ width: `${Math.min(posts.length * 5, 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- Active posts count -->
        <div class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p class="text-xs font-black text-orange-500 uppercase tracking-wide">Active Posts</p>
          <p class="text-2xl font-black text-gray-800">{{ activePosts }}</p>
          <p class="text-xs text-gray-400 font-medium">Still within expiry time</p>
        </div>

        <!-- Sort mode -->
        <div class="bg-white rounded-[18px] p-5 shadow-sm ring-1 ring-slate-200/70 flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p class="text-xs font-black text-blue-500 uppercase tracking-wide">Sorted By</p>
          <p class="text-sm font-black text-gray-800">
            {{ sortMode === 'active' ? 'Most Active' : 'Latest Posts' }}
          </p>
          <p class="text-xs text-gray-400 font-medium">Switch using the buttons above</p>
        </div>

        <!-- Create post CTA -->
        <RouterLink
          to="/create-post"
          class="bg-teal-600 hover:bg-teal-700 text-white rounded-[18px] p-5 flex flex-col gap-2 no-underline transition-all duration-300 shadow-sm shadow-teal-200 hover:shadow-teal-300 hover:shadow-lg group hover:-translate-y-1"
        >
          <Plus class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <p class="text-sm font-black">Share something nearby</p>
          <p class="text-xs text-teal-200 font-medium">Let your neighbors know!</p>
        </RouterLink>

      </aside>
    </div>

    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import PostOptionsMenu from '@/components/PostOptionsMenu.vue'
import { postApi, type ApiPost } from '@/services/api'
import {
  MapPin, MessageCircle, Plus, Heart,
  Share2, Clock, AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const posts = ref<ApiPost[]>([])
const loading = ref(true)
const error = ref('')
const sortMode = ref<'latest' | 'active'>('latest')

const activePosts = computed(() =>
  posts.value.filter(p => !isExpired(p.expires_at)).length
)

function navigateToPost(postId: number) {
  router.push(`/posts/${postId}`)
}

function profileRoute(userId?: number | null) {
  return userId ? `/users/${userId}` : '/profile'
}

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

function isExpired(value: string) {
  return new Date(value).getTime() < Date.now()
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
  
  const targetDate = new Date(value).getTime();
  if (isNaN(targetDate)) return 'Expired';
  
  const diffMs = targetDate - Date.now();
  if (diffMs <= 0) return 'Expired';
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  
  if (days > 30) return '30d+ left'; 
  if (days > 0) return `${days}d left`;
  return `${hours}h left`;
}

onMounted(loadPosts)
</script>

<style scoped>
.animate-fade-down {
  animation: fadeDown 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
}
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.post-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.post-leave-active {
  transition: all 0.3s ease;
  position: absolute;
  width: 100%;
}
.post-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
.post-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
.post-move {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-display-image {
  width: 100%;
  max-height: 400px; 
  object-fit: cover; 
  display: block;
  transition: transform 0.3s ease;
}
.post-display-image:hover {
  transform: scale(1.02);
}
</style>