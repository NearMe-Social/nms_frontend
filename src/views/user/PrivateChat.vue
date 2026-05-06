<template>
  <div class="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
    <Navbar />

    <main class="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-3 py-3 sm:px-4 sm:py-6 md:px-6 lg:flex-row lg:px-8">
      <section class="chat-shell flex min-h-[calc(100dvh-104px)] w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:flex-[1.4] lg:rounded-3xl">
        <header class="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-4 sm:flex-nowrap sm:gap-4 sm:px-6">
          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-teal-200 hover:text-teal-600 hover:shadow-sm"
            @click="goBack"
            aria-label="Go back"
          >
            <ArrowLeft class="h-5 w-5" />
          </button>

          <div class="relative h-12 w-12 shrink-0">
            <img
              :src="contact.avatar"
              :alt="contact.name"
              class="h-12 w-12 rounded-full object-cover ring-4 ring-teal-50"
            />
            <span class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white" :class="contact.online ? 'bg-emerald-500' : 'bg-slate-300'" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex min-w-0 flex-wrap items-center gap-2">
              <h1 class="truncate text-lg font-bold text-slate-900 sm:text-xl">{{ contact.name }}</h1>
              <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold" :class="contact.online ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'">
                <span class="h-1.5 w-1.5 rounded-full" :class="contact.online ? 'bg-emerald-500' : 'bg-slate-400'" />
                {{ contact.online ? 'Online now' : contact.presence }}
              </span>
            </div>
            <p class="mt-1 truncate text-sm text-slate-500">{{ contact.subtitle }}</p>
          </div>

          <div class="hidden items-center gap-2 sm:flex">
            <button type="button" class="header-action-btn" aria-label="Start voice call">
              <Phone class="h-4 w-4" />
            </button>
            <button type="button" class="header-action-btn" aria-label="Start video call">
              <Video class="h-4 w-4" />
            </button>
            <button type="button" class="header-action-btn" aria-label="More options">
              <MoreVertical class="h-4 w-4" />
            </button>
          </div>
        </header>

        <div class="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-xs text-slate-500 sm:px-6">
          <div class="flex items-center gap-2">
            <ShieldCheck class="h-4 w-4 text-teal-600" />
            <span>Private one-to-one chat</span>
          </div>
          <span class="rounded-full bg-white px-3 py-1 font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
            {{ messageCount }} message{{ messageCount === 1 ? '' : 's' }}
          </span>
        </div>

        <section ref="threadRef" class="thread flex-1 min-h-0 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6">
          <div v-if="isLoading" class="space-y-4" aria-busy="true" aria-live="polite">
            <div class="flex items-start gap-3">
              <div class="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
              <div class="max-w-[85%] space-y-2 sm:max-w-[72%]">
                <div class="h-4 w-24 rounded-full bg-slate-200 animate-pulse" />
                <div class="h-16 rounded-3xl bg-slate-100 animate-pulse" />
              </div>
            </div>
            <div class="flex items-start justify-end gap-3">
              <div class="max-w-[85%] space-y-2 sm:max-w-[72%]">
                <div class="h-4 w-20 rounded-full bg-slate-200 animate-pulse ml-auto" />
                <div class="h-16 rounded-3xl bg-teal-50 animate-pulse" />
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
              <div class="max-w-[85%] space-y-2 sm:max-w-[72%]">
                <div class="h-4 w-28 rounded-full bg-slate-200 animate-pulse" />
                <div class="h-24 rounded-3xl bg-slate-100 animate-pulse" />
              </div>
            </div>
          </div>

          <div v-else-if="!messages.length" class="flex min-h-full items-center justify-center px-4 py-10">
            <div class="max-w-md rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-8 py-10 text-center shadow-sm">
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm ring-1 ring-slate-200">
                <MessageCircle class="h-7 w-7" />
              </div>
              <h2 class="mt-5 text-2xl font-bold text-slate-900">No messages yet</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500">
                Start the conversation with a friendly note, a quick question, or a follow-up about the neighborhood.
              </p>
              <button
                type="button"
                class="mt-6 inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                @click="focusComposer"
              >
                <PencilLine class="h-4 w-4" />
                Write the first message
              </button>
            </div>
          </div>

          <div v-else class="space-y-4">
            <article
              v-for="message in messages"
              :key="message.id"
              class="flex items-end gap-3"
              :class="message.sender === 'me' ? 'justify-end' : 'justify-start'"
            >
              <img
                v-if="message.sender === 'them'"
                :src="contact.avatar"
                :alt="contact.name"
                class="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
              />

              <div class="max-w-[88%] sm:max-w-[74%] lg:max-w-[68%]">
                <div
                  class="break-words rounded-3xl px-4 py-3 text-[0.95rem] leading-6 shadow-sm"
                  :class="message.sender === 'me' ? 'bg-gradient-to-br from-teal-600 to-teal-500 text-white rounded-br-md shadow-teal-600/15' : 'bg-white text-slate-800 rounded-bl-md border border-slate-200'"
                >
                  <p class="whitespace-pre-line break-words">{{ message.text }}</p>
                </div>

                <div class="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-400" :class="message.sender === 'me' ? 'justify-end' : 'justify-start'">
                  <span>{{ message.time }}</span>
                  <span v-if="message.sender === 'me'" class="inline-flex items-center gap-1 text-teal-600">
                    <CheckCheck class="h-3.5 w-3.5" />
                    {{ message.status }}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <footer class="border-t border-slate-200 bg-white px-3 py-3 sm:px-4">
          <div class="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-3 py-3 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-end sm:gap-2 sm:rounded-[1.75rem]">
            <div class="flex items-center gap-1 sm:justify-start">
              <button type="button" class="composer-icon-btn" aria-label="Attach file">
                <Paperclip class="h-4 w-4" />
              </button>
              <button type="button" class="composer-icon-btn" aria-label="Add photo">
                <ImageUp class="h-4 w-4" />
              </button>
              <button type="button" class="composer-icon-btn" aria-label="Add emoji">
                <SmilePlus class="h-4 w-4" />
              </button>
            </div>

            <div class="min-w-0">
              <label class="sr-only" for="chat-message">Type a message</label>
              <textarea
                id="chat-message"
                ref="composerRef"
                v-model="draft"
                rows="1"
                class="chat-input"
                placeholder="Write a message…"
                :disabled="isLoading"
                @keydown="handleComposerKeydown"
              />
              <div class="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                <span>Press Enter to send, Shift+Enter for a new line</span>
                <span>{{ draft.length }}/1000</span>
              </div>
            </div>

            <button
              type="button"
              class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              :class="canSend ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20' : 'bg-slate-200 text-slate-500'"
              :disabled="!canSend"
              @click="sendMessage"
            >
              <Send class="h-4 w-4" />
              Send
            </button>
          </div>
        </footer>
      </section>

      <aside class="hidden w-full max-w-sm min-w-0 lg:block lg:flex-[0.45]">
        <div class="sticky top-6 space-y-4">
          <article class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-3">
              <img :src="contact.avatar" :alt="contact.name" class="h-14 w-14 rounded-2xl object-cover" />
              <div class="min-w-0">
                <p class="truncate text-lg font-bold text-slate-900">{{ contact.name }}</p>
                <p class="text-sm text-slate-500">{{ contact.subtitle }}</p>
              </div>
            </div>

            <dl class="mt-5 grid gap-3 text-sm">
              <div class="rounded-2xl bg-slate-50 px-4 py-3">
                <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Last seen</dt>
                <dd class="mt-1 font-semibold text-slate-800">{{ contact.presence }}</dd>
              </div>
              <div class="rounded-2xl bg-slate-50 px-4 py-3">
                <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Shared circles</dt>
                <dd class="mt-1 font-semibold text-slate-800">{{ contact.sharedCircles }}</dd>
              </div>
              <div class="rounded-2xl bg-slate-50 px-4 py-3">
                <dt class="text-xs font-semibold uppercase tracking-wide text-slate-400">Conversation tone</dt>
                <dd class="mt-1 font-semibold text-slate-800">Friendly, private, one-to-one</dd>
              </div>
            </dl>
          </article>

          <article class="rounded-3xl border border-teal-100 bg-teal-50 p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Quick note</p>
            <p class="mt-3 text-sm leading-6 text-teal-950/80">
              This screen is ready for a real chat API later. For now, it uses mock messages and supports send, loading, and empty states.
            </p>
          </article>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import {
  ArrowLeft,
  CheckCheck,
  ImageUp,
  MessageCircle,
  MoreVertical,
  Paperclip,
  PencilLine,
  Phone,
  Send,
  ShieldCheck,
  SmilePlus,
  Video,
} from 'lucide-vue-next'

type ChatSender = 'me' | 'them'

type ChatMessage = {
  id: number
  sender: ChatSender
  text: string
  time: string
  status?: 'sent' | 'delivered' | 'read'
}

const router = useRouter()
const threadRef = ref<HTMLElement | null>(null)
const composerRef = ref<HTMLTextAreaElement | null>(null)
const draft = ref('')
const isLoading = ref(true)
const messages = ref<ChatMessage[]>([])

const contact = {
  name: 'Amina Johnson',
  initials: 'AJ',
  avatar: 'https://i.pravatar.cc/200?img=47',
  online: true,
  presence: 'Seen 2 minutes ago',
  subtitle: 'West Gate • Verified resident',
  sharedCircles: 'North Block, Transit Watch',
}

const mockMessages: ChatMessage[] = [
  {
    id: 1,
    sender: 'them',
    text: 'Hey, I saw your update about the west gate lighting. I live nearby too — do you want to compare notes before we message the board?',
    time: '09:12',
  },
  {
    id: 2,
    sender: 'me',
    text: 'Absolutely. I took a quick walk last night and the darker section is still right by the pedestrian path. I can send a photo if that helps.',
    time: '09:14',
    status: 'read',
  },
  {
    id: 3,
    sender: 'them',
    text: 'Yes please. I can also ask maintenance whether the current fixtures are dimming because of a wiring issue or if they just need replacement.',
    time: '09:16',
  },
  {
    id: 4,
    sender: 'me',
    text: 'Great. I’ll draft a short summary and send it over here so we can keep it private until we’re ready to post it.',
    time: '09:18',
    status: 'delivered',
  },
  {
    id: 5,
    sender: 'them',
    text: 'Perfect. I’m online for the next hour, so just drop the draft whenever it’s ready.',
    time: '09:19',
  },
]

const messageCount = computed(() => messages.value.length)
const canSend = computed(() => !isLoading.value && draft.value.trim().length > 0 && draft.value.length <= 1000)

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function scrollToBottom() {
  const thread = threadRef.value
  if (!thread) return

  thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' })
}

async function focusComposer() {
  await nextTick()
  composerRef.value?.focus()
}

function sendMessage() {
  const text = draft.value.trim()
  if (!text || !canSend.value) return

  messages.value.push({
    id: Date.now(),
    sender: 'me',
    text,
    time: formatTime(),
    status: 'sent',
  })

  draft.value = ''
  void nextTick(scrollToBottom)
}

function handleComposerKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey) return

  event.preventDefault()
  sendMessage()
}

function goBack() {
  router.back()
}

onMounted(() => {
  window.setTimeout(async () => {
    messages.value = [...mockMessages]
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }, 650)
})

watch(
  messages,
  async () => {
    await nextTick()
    scrollToBottom()
  },
  { deep: true },
)
</script>

<style scoped>
.header-action-btn,
.composer-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgb(226 232 240);
  background: white;
  color: rgb(71 85 105);
  transition: all 0.2s ease;
}

.header-action-btn {
  height: 2.75rem;
  width: 2.75rem;
}

.header-action-btn:hover,
.composer-icon-btn:hover {
  border-color: rgb(153 246 228);
  color: rgb(13 148 136);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.composer-icon-btn {
  height: 2.5rem;
  width: 2.5rem;
}

.chat-input {
  display: block;
  width: 100%;
  min-width: 0;
  resize: none;
  border: none;
  background: transparent;
  color: rgb(15 23 42);
  outline: none;
  padding: 0.25rem 0.25rem 0;
  min-height: 2.75rem;
  max-height: 8rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.chat-input::placeholder {
  color: rgb(148 163 184);
}

.thread {
  scroll-behavior: smooth;
}

.thread::-webkit-scrollbar {
  width: 10px;
}

.thread::-webkit-scrollbar-track {
  background: transparent;
}

.thread::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.35);
  border-radius: 9999px;
  border: 3px solid transparent;
  background-clip: content-box;
}

.thread::-webkit-scrollbar-thumb:hover {
  background: rgba(15, 118, 110, 0.4);
  border: 3px solid transparent;
  background-clip: content-box;
}
</style>
