<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import {
  Bell,
  CircleHelp,
  MapPinned,
  MessageSquareMore,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from 'lucide-vue-next'

const visibilityOptions = [50, 100, 200]
const durationOptions = ['1h', '3h', '12h', '24h'] as const

const title = ref('')
const content = ref('')
const visibilityRadius = ref(100)
const allowResponses = ref(true)
const pinToMap = ref(false)
const selectedDuration = ref<(typeof durationOptions)[number]>('12h')
const submitting = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)
const selectedImageUrl = ref('')
const selectedImageName = ref('')
let activeObjectUrl: string | null = null
const router = useRouter()

const isReadyToSubmit = computed(
  () =>
    title.value.trim().length > 0 &&
    content.value.trim().length > 0 &&
    visibilityRadius.value > 0 &&
    !submitting.value,
)

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
  <div class="min-h-screen bg-[#f4f7fb] text-slate-700">
    <Navbar />

    <div class="flex min-w-0">
      <AppSidebar class="hidden md:flex" />

      <div class="w-full min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 lg:text-4xl">
              Share a Spark
            </h1>
            <p class="mt-2 text-sm text-slate-500">
              Compose a local update with privacy, duration, and neighborhood reach.
            </p>
          </div>

          <span class="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 ring-1 ring-cyan-100">
            <Sparkles class="h-4 w-4" />
            New Interaction
          </span>
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main class="min-w-0">
            <section class="rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
              <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div class="flex items-center gap-3">
                  <img
                    src="https://i.pravatar.cc/150?img=11"
                    alt="Alex Rivera"
                    class="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p class="text-sm font-bold text-slate-900">Alex Rivera</p>
                    <p class="text-xs font-medium text-cyan-700">Posting to Oak Ridge Commons</p>
                  </div>
                </div>

                <button class="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                  <ShieldCheck class="h-4 w-4 text-cyan-700" />
                  Privacy: Neighbors Only
                </button>
              </div>

              <div class="mt-5 space-y-5">
                <label class="block">
                  <span class="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Title</span>
                  <input
                    id="post-title"
                    v-model="title"
                    type="text"
                    placeholder="Give your post a clear title"
                    class="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white"
                  />
                </label>

                <label class="block">
                  <span class="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Content</span>
                  <textarea
                    id="post-content"
                    v-model="content"
                    rows="11"
                    placeholder="What's happening in our corner today?"
                    class="mt-2 min-h-[290px] w-full resize-none rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white"
                  />
                </label>

                <div class="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_1fr] 2xl:grid-cols-[minmax(300px,1.15fr)_1fr_1fr]">
                  <div class="rounded-[18px] border-2 border-dashed border-slate-300 bg-slate-50/70 p-5 text-center">
                    <input ref="imageInput" type="file" accept="image/*" class="hidden" @change="handleImageChange" />
                    <div class="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200">
                      <UploadCloud class="h-5 w-5" />
                    </div>
                    <p class="mt-4 text-sm font-bold text-slate-800">Drop images or click to upload</p>
                    <p class="mt-1 text-xs text-slate-500">Optional media for your post</p>
                    <button
                      type="button"
                      class="mt-4 rounded-full bg-cyan-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-cyan-800"
                      @click="openImagePicker"
                    >
                      Choose image
                    </button>

                    <div v-if="selectedImageUrl" class="mt-4 overflow-hidden rounded-2xl bg-white text-left ring-1 ring-slate-200">
                      <img :src="selectedImageUrl" alt="Selected image preview" class="h-36 w-full object-cover" />
                      <div class="flex items-center justify-between gap-3 px-3 py-2">
                        <p class="truncate text-xs font-bold text-slate-700">{{ selectedImageName }}</p>
                        <button type="button" class="text-xs font-bold text-rose-600" @click="clearSelectedImage">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-[18px] bg-white p-4 ring-1 ring-slate-200">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Visibility Radius</p>
                        <p class="mt-1 text-xs text-slate-500">Choose how far your post reaches.</p>
                      </div>
                      <CircleHelp class="h-4 w-4 shrink-0 text-amber-600" />
                    </div>

                    <div class="mt-4 space-y-3">
                      <input
                        v-model.number="visibilityRadius"
                        type="range"
                        min="50"
                        max="500"
                        step="50"
                        class="w-full"
                      />
                      <div class="grid grid-cols-4 gap-2">
                        <button
                          v-for="option in visibilityOptions"
                          :key="option"
                          type="button"
                          class="rounded-full px-3 py-2 text-xs font-bold transition"
                          :class="visibilityRadius === option ? 'bg-cyan-100 text-cyan-900 ring-2 ring-cyan-700' : 'bg-slate-100 text-slate-500'"
                          @click="visibilityRadius = option"
                        >
                          {{ option }}m
                        </button>
                      </div>
                    </div>

                    <p class="mt-4 text-xs leading-5 text-cyan-700">
                      Current radius: <span class="font-bold">{{ visibilityRadius }}m</span>
                    </p>
                  </div>

                  <div class="rounded-[18px] bg-white p-4 ring-1 ring-slate-200">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Ephemeral Duration</p>
                        <p class="mt-1 text-xs text-slate-500">Choose how long this spark stays visible.</p>
                      </div>
                      <CircleHelp class="h-4 w-4 shrink-0 text-amber-600" />
                    </div>

                    <div class="mt-4 grid grid-cols-4 gap-2">
                      <button
                        v-for="option in durationOptions"
                        :key="option"
                        type="button"
                        class="rounded-full px-3 py-2 text-xs font-bold transition"
                        :class="selectedDuration === option ? 'bg-cyan-100 text-cyan-900 ring-2 ring-cyan-700' : 'bg-slate-100 text-slate-500'"
                        @click="selectedDuration = option"
                      >
                        {{ option }}
                      </button>
                    </div>

                    <p class="mt-4 text-xs leading-5 text-amber-700">
                      Post will vanish automatically for privacy.
                    </p>
                  </div>

                  <div class="rounded-[18px] bg-white p-4 ring-1 ring-slate-200">
                    <p class="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Community Settings</p>
                    <div class="mt-4 space-y-3">
                      <label class="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                        <span class="inline-flex items-center gap-2">
                          <MessageSquareMore class="h-4 w-4 text-slate-500" />
                          Allow responses
                        </span>
                        <button type="button" class="h-7 w-12 rounded-full p-1 transition" :class="allowResponses ? 'bg-cyan-700' : 'bg-slate-200'" @click="allowResponses = !allowResponses">
                          <span class="block h-5 w-5 rounded-full bg-white transition" :class="allowResponses ? 'translate-x-5' : ''" />
                        </button>
                      </label>
                      <label class="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                        <span class="inline-flex items-center gap-2">
                          <MapPinned class="h-4 w-4 text-slate-500" />
                          Pin to block map
                        </span>
                        <button type="button" class="h-7 w-12 rounded-full p-1 transition" :class="pinToMap ? 'bg-cyan-700' : 'bg-slate-200'" @click="pinToMap = !pinToMap">
                          <span class="block h-5 w-5 rounded-full bg-white transition" :class="pinToMap ? 'translate-x-5' : ''" />
                        </button>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    class="text-xs font-bold text-slate-500 transition hover:text-slate-800"
                    @click="() => {
                      title = ''
                      content = ''
                      visibilityRadius = 100
                      allowResponses = true
                      pinToMap = false
                      selectedDuration = '12h'
                      clearSelectedImage()
                    }"
                  >
                    Discard Draft
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-bold shadow-lg transition"
                    :class="isReadyToSubmit ? 'bg-cyan-800 text-white shadow-cyan-800/20 hover:bg-cyan-900' : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none'"
                    :disabled="!isReadyToSubmit"
                    @click="submitPost"
                  >
                    <PlayCircle v-if="!submitting" class="h-4 w-4" />
                    <span v-else class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {{ submitting ? 'Publishing...' : 'Release Spark' }}
                  </button>
                </div>
              </div>
            </section>
          </main>

          <aside class="grid min-w-0 gap-5 md:grid-cols-3 xl:block xl:space-y-5">
            <section class="rounded-[18px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
              <h2 class="flex items-center gap-2 text-sm font-black text-cyan-950">
                <Sparkles class="h-4 w-4 text-cyan-700" />
                Post Etiquette
              </h2>
              <div class="mt-4 space-y-4">
                <article class="flex gap-3">
                  <span class="text-sm font-black text-cyan-800">01</span>
                  <p class="text-xs leading-5 text-slate-600"><span class="font-bold text-slate-900">Keep it local.</span> Focus on things that matter nearby.</p>
                </article>
                <article class="flex gap-3">
                  <span class="text-sm font-black text-cyan-800">02</span>
                  <p class="text-xs leading-5 text-slate-600"><span class="font-bold text-slate-900">Privacy first.</span> Avoid exposing private details.</p>
                </article>
                <article class="flex gap-3">
                  <span class="text-sm font-black text-cyan-800">03</span>
                  <p class="text-xs leading-5 text-slate-600"><span class="font-bold text-slate-900">Be useful.</span> Share context people can act on.</p>
                </article>
              </div>
            </section>

            <section class="overflow-hidden rounded-[18px] bg-white shadow-sm ring-1 ring-slate-200/70">
              <div class="bg-cyan-950 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white">Radius Impact</div>
              <div class="relative flex h-48 items-center justify-center bg-slate-200">
                <div class="absolute inset-0 opacity-40" style="background-image: linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px); background-size: 28px 28px;"></div>
                <div class="relative flex h-24 w-24 items-center justify-center rounded-full border border-cyan-500 bg-cyan-100/50">
                  <div class="h-3 w-3 rounded-full bg-cyan-800 shadow-[0_0_0_14px_rgba(14,116,144,0.13)]"></div>
                </div>
              </div>
              <div class="px-5 py-4 text-xs leading-5 text-slate-600">
                Your post will be visible to <span class="font-bold text-cyan-800">142 verified neighbors</span> within {{ visibilityRadius }}m.
              </div>
            </section>

            <section class="rounded-[18px] bg-amber-100 px-5 py-5 shadow-sm ring-1 ring-amber-200/70">
              <h3 class="flex items-center gap-2 text-sm font-black text-amber-900">
                <Bell class="h-4 w-4" />
                Why ephemeral?
              </h3>
              <p class="mt-3 text-xs leading-5 text-amber-950/75">
                Temporary posts keep the commons real-time and reduce the permanent footprint of daily neighborhood updates.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>
