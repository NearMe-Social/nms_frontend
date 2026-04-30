<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import { Bell, ChevronDown, CircleHelp, MapPinned, MessageSquareMore, PlayCircle, ShieldCheck, Sparkles, UploadCloud } from 'lucide-vue-next'

const navItems = [
  { label: 'Home', href: '/spark' },
  { label: 'Create Post', href: '/create-post', active: true },
  { label: 'My Posts', href: '/discussions' },
  { label: 'Radius', href: '/nearby' },
]

const visibilityOptions = [50, 100, 200]

const title = ref('')
const content = ref('')
const visibilityRadius = ref(100)
const allowResponses = ref(true)
const pinToMap = ref(false)
const selectedDuration = ref<'1h' | '3h' | '12h' | '24h'>('12h')
const submitting = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const selectedImageUrl = ref('')
const selectedImageName = ref('')
let activeObjectUrl: string | null = null
const router = useRouter()

const isReadyToSubmit = computed(() => title.value.trim().length > 0 && content.value.trim().length > 0 && visibilityRadius.value > 0 && !submitting.value)

function openImagePicker() {
  imageInput.value?.click()
}

function clearSelectedImage() {
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl)
    activeObjectUrl = null
  }

  selectedImageUrl.value = ''
  selectedImageName.value = ''

  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

function handleImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    clearSelectedImage()
    return
  }

  clearSelectedImage()
  activeObjectUrl = URL.createObjectURL(file)
  selectedImageUrl.value = activeObjectUrl
  selectedImageName.value = file.name
}

function submitPost() {
  if (!isReadyToSubmit.value) return
  submitting.value = true
  window.setTimeout(() => {
    submitting.value = false
    title.value = ''
    content.value = ''
    visibilityRadius.value = 100
    allowResponses.value = true
    pinToMap.value = false
    selectedDuration.value = '12h'
    clearSelectedImage()
    router.push('/discussions')
  }, 900)
}

onBeforeUnmount(() => {
  clearSelectedImage()
})
</script>

<template>
  <div class="min-h-screen bg-[#f3f6fb] text-slate-700">
    <Navbar />

    <div class="mx-auto w-full max-w-[1480px] px-4 py-6 lg:px-6">
      <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_290px]">
        <aside class="hidden lg:flex flex-col justify-between rounded-[28px] bg-white/80 px-5 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur">
          <div class="space-y-8">
            <div>
              <p class="text-xl font-extrabold tracking-tight text-slate-800">Nearme</p>
              <p class="mt-1 text-sm text-slate-500">The Secure Commons</p>
            </div>

            <nav class="space-y-1.5">
              <a
                v-for="item in navItems"
                :key="item.label"
                :href="item.href"
                class="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition"
                :class="item.active ? 'bg-cyan-50 text-cyan-900 shadow-sm' : 'text-slate-500 hover:bg-slate-100'"
              >
                <span>{{ item.label }}</span>
              </a>
            </nav>
          </div>

          <div class="space-y-3">
            <RouterLink
              to="/discussions"
              class="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-900 shadow-sm transition hover:bg-cyan-100"
            >
              My Post
            </RouterLink>
            <button class="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-700/20 transition hover:bg-cyan-800">
              <Sparkles class="h-4 w-4" />
              New Interaction
            </button>
          </div>
        </aside>

        <main class="min-w-0">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 class="text-[clamp(1.9rem,3vw,2.6rem)] font-extrabold tracking-tight text-slate-800">Create a Post</h1>
              <p class="mt-2 max-w-2xl text-slate-500">Prepare a community update with title, content, and visibility radius.</p>
            </div>
            <span class="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-800">
              <Sparkles class="h-3.5 w-3.5" />
              Draft Composer
            </span>
          </div>

          <section class="rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-6">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div class="flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?img=11" alt="Alex Rivera" class="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p class="font-semibold text-slate-800">Alex Rivera</p>
                  <p class="text-sm text-cyan-700">Posting to Oak Ridge Commons</p>
                </div>
              </div>

              <button class="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100">
                <ShieldCheck class="h-4 w-4" />
                Privacy: Neighbors Only
                <ChevronDown class="h-4 w-4" />
              </button>
            </div>

            <div class="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
              <div class="space-y-5">
                <div class="space-y-2">
                  <label class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500" for="post-title">Title</label>
                  <input
                    id="post-title"
                    v-model="title"
                    type="text"
                    placeholder="Give your post a clear title"
                    class="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white"
                  />
                </div>

                <div class="space-y-2">
                  <label class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500" for="post-content">Content</label>
                  <textarea
                    id="post-content"
                    v-model="content"
                    rows="10"
                    placeholder="What's happening in our corner today?"
                    class="min-h-[260px] w-full resize-none rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white"
                  />
                </div>
              </div>

              <div class="space-y-4">
                <div class="rounded-[24px] border-2 border-dashed border-slate-300 bg-slate-50/60 px-5 py-8 text-center">
                  <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageChange" />
                  <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                    <UploadCloud class="h-5 w-5 text-cyan-700" />
                  </div>
                  <p class="mt-4 text-base font-semibold text-slate-700">Drop images or click to upload</p>
                  <p class="mt-1 text-sm text-slate-500">Optional media for your post</p>
                  <button
                    type="button"
                    class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800"
                    @click="openImagePicker"
                  >
                    Choose image
                  </button>

                  <div v-if="selectedImageUrl" class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm">
                    <img :src="selectedImageUrl" alt="Selected image preview" class="h-44 w-full object-cover" />
                    <div class="flex items-center justify-between gap-3 px-3 py-2">
                      <p class="truncate text-sm font-medium text-slate-700">{{ selectedImageName }}</p>
                      <button type="button" class="text-sm font-semibold text-rose-600 transition hover:text-rose-700" @click="clearSelectedImage">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div class="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Visibility Radius</p>
                      <p class="mt-1 text-sm text-slate-500">Choose how far this post should reach.</p>
                    </div>
                    <div class="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-800">{{ visibilityRadius }} m</div>
                  </div>

                  <div class="mt-4 flex gap-2">
                    <button
                      v-for="option in visibilityOptions"
                      :key="option"
                      type="button"
                      class="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition"
                      :class="visibilityRadius === option ? 'border-2 border-cyan-700 bg-cyan-100 text-cyan-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                      @click="visibilityRadius = option"
                    >
                      {{ option }}m
                    </button>
                  </div>

                  <div class="mt-3 flex justify-between text-xs font-medium text-slate-400">
                    <span>Close range</span>
                    <span>Wider reach</span>
                  </div>
                </div>

                <div class="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
                  <p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Ephemeral Duration</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <button v-for="option in ['1h', '3h', '12h', '24h']" :key="option" class="rounded-xl px-4 py-2 text-sm font-semibold transition" :class="selectedDuration === option ? 'border-2 border-cyan-700 bg-cyan-100 text-cyan-900' : 'bg-slate-200 text-slate-600'" @click="selectedDuration = option as '1h' | '3h' | '12h' | '24h'">{{ option }}</button>
                  </div>
                  <p class="mt-3 flex items-center gap-2 text-xs text-amber-700">
                    <CircleHelp class="h-3.5 w-3.5" />
                    Post will vanish automatically for privacy.
                  </p>
                </div>

                <div class="rounded-[24px] bg-white p-4 ring-1 ring-slate-200">
                  <p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Community Settings</p>
                  <div class="mt-4 space-y-4">
                    <label class="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                      <span class="flex items-center gap-2 text-sm font-medium text-slate-700"><MessageSquareMore class="h-4 w-4" /> Allow responses</span>
                      <button type="button" class="h-6 w-10 rounded-full p-1 transition" :class="allowResponses ? 'bg-cyan-700' : 'bg-slate-200'" @click="allowResponses = !allowResponses">
                        <span class="block h-4 w-4 rounded-full bg-white transition" :class="allowResponses ? '' : 'translate-x-4'" />
                      </button>
                    </label>
                    <label class="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                      <span class="flex items-center gap-2 text-sm font-medium text-slate-700"><MapPinned class="h-4 w-4" /> Pin to block map</span>
                      <button type="button" class="h-6 w-10 rounded-full p-1 transition" :class="pinToMap ? 'bg-cyan-700' : 'bg-slate-200'" @click="pinToMap = !pinToMap">
                        <span class="block h-4 w-4 rounded-full bg-white transition" :class="pinToMap ? '' : 'translate-x-4'" />
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button class="text-sm font-semibold text-slate-500 transition hover:text-slate-700">Discard Draft</button>
              <button
                class="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition"
                :class="isReadyToSubmit ? 'bg-cyan-700 text-white shadow-cyan-700/20 hover:bg-cyan-800' : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'"
                :disabled="!isReadyToSubmit"
                @click="submitPost"
              >
                <PlayCircle v-if="!submitting" class="h-4 w-4" />
                <span v-else class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {{ submitting ? 'Publishing...' : 'Release Spark' }}
              </button>
            </div>
          </section>
        </main>

        <aside class="space-y-5">
          <section class="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
            <h2 class="flex items-center gap-2 text-lg font-semibold text-cyan-900">
              <Sparkles class="h-4 w-4" />
              Post Etiquette
            </h2>
            <div class="mt-4 space-y-4">
              <article class="flex gap-3">
                <div class="min-w-8 text-lg font-extrabold text-cyan-800">01</div>
                <p class="text-sm leading-6 text-slate-600"><span class="font-semibold text-slate-800">Keep it local.</span> Focus on things that matter within our immediate neighborhood.</p>
              </article>
              <article class="flex gap-3">
                <div class="min-w-8 text-lg font-extrabold text-cyan-800">02</div>
                <p class="text-sm leading-6 text-slate-600"><span class="font-semibold text-slate-800">Privacy first.</span> Avoid identifying faces of strangers or private details.</p>
              </article>
              <article class="flex gap-3">
                <div class="min-w-8 text-lg font-extrabold text-cyan-800">03</div>
                <p class="text-sm leading-6 text-slate-600"><span class="font-semibold text-slate-800">Be a neighbor.</span> Keep the tone warm and constructive.</p>
              </article>
            </div>
          </section>

          <section class="overflow-hidden rounded-[24px] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
            <div class="bg-cyan-900 px-5 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white">Radius Impact</div>
            <div class="relative flex h-52 items-center justify-center bg-slate-200">
              <div class="absolute inset-0 opacity-25" style="background-image: linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px); background-size: 28px 28px;"></div>
              <div class="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-600/60 bg-cyan-100/40">
                <div class="h-3 w-3 rounded-full bg-cyan-800 shadow-[0_0_0_12px_rgba(14,116,144,0.12)]"></div>
              </div>
            </div>
            <div class="px-5 py-4 text-sm text-slate-600">
              Your post will be visible to <span class="font-semibold text-cyan-800">142 verified neighbors</span> within your selected radius.
            </div>
          </section>

          <section class="rounded-[24px] bg-amber-100 px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <h3 class="flex items-center gap-2 text-lg font-semibold text-amber-900">
              <Bell class="h-4 w-4" />
              Why Ephemeral?
            </h3>
            <p class="mt-3 text-sm leading-6 text-amber-950/70">
              Temporary posts reduce the digital footprint of our daily lives, making the commons feel more real-time and less like a permanent record.
            </p>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
