<template>
  <div class="chat-page">
    <Navbar />

    <div class="chat-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace" :class="{ 'list-collapsed': isListCollapsed }">
        <section class="conversation-list" :aria-expanded="!isListCollapsed">
          <div class="list-header">
            <div>
              <p class="eyebrow">Private Chat</p>
              <h1>Messages</h1>
            </div>
            <button
              type="button"
              class="collapse-btn"
              :title="isListCollapsed ? 'Show conversations' : 'Collapse conversations'"
              @click="isListCollapsed = !isListCollapsed"
            >
              <PanelLeftClose v-if="!isListCollapsed" class="icon" />
              <PanelLeftOpen v-else class="icon" />
            </button>
          </div>

          <div v-if="!isListCollapsed" class="list-content">
            <label class="search-box">
              <Search class="icon" />
              <input v-model="searchTerm" type="text" placeholder="Search conversations..." />
            </label>

            <div class="conversation-items">
              <button
                v-for="conversation in filteredConversations"
                :key="conversation.id"
                type="button"
                class="conversation-card"
                :class="{ active: activeConversation && conversation.id === activeConversation.id }"
                @click="selectConversation(conversation.id)"
              >
                <div class="avatar-wrap">
                  <img :src="conversation.avatar" :alt="conversation.name" />
                  <span :class="conversation.online ? 'online' : 'offline'" />
                </div>
                <div class="conversation-copy">
                  <div class="conversation-topline">
                    <strong>{{ conversation.name }}</strong>
                    <span>{{ conversation.time }}</span>
                  </div>
                  <p>{{ conversation.preview }}</p>
                </div>
                <span v-if="conversation.unread" class="unread-count">{{ conversation.unread }}</span>
              </button>
            </div>
          </div>
        </section>

        <section v-if="activeConversation" class="active-chat">
          <header class="chat-header">
            <button
              v-if="isListCollapsed"
              type="button"
              class="icon-btn"
              title="Show conversations"
              @click="isListCollapsed = false"
            >
              <PanelLeftOpen class="icon" />
            </button>

            <div class="contact-avatar">
              <img :src="activeConversation.avatar" :alt="activeConversation.name" />
              <span :class="activeConversation.online ? 'online' : 'offline'" />
            </div>

            <div class="contact-copy">
              <h2>{{ activeConversation.name }}</h2>
              <p>{{ activeConversation.online ? 'Active now' : activeConversation.presence }}</p>
            </div>

            <div class="chat-actions">
              <button type="button" class="icon-btn" aria-label="Start voice call">
                <Phone class="icon" />
              </button>
              <button type="button" class="icon-btn" aria-label="Start video call">
                <Video class="icon" />
              </button>
              <button type="button" class="icon-btn" aria-label="Conversation info">
                <Info class="icon" />
              </button>
            </div>
          </header>

          <div class="privacy-strip">
            <span>
              <ShieldCheck class="icon" />
              Private one-to-one chat
            </span>
            <span>{{ messageCount }} message{{ messageCount === 1 ? '' : 's' }}</span>
          </div>

          <section ref="threadRef" class="thread">
            <div class="date-pill">Today</div>

            <article
              v-for="message in messages"
              :key="message.id"
              class="message-row"
              :class="message.sender === 'me' ? 'mine' : 'theirs'"
            >
              <img
                v-if="message.sender === 'them'"
                :src="activeConversation.avatar"
                :alt="activeConversation.name"
              />

              <div class="message-stack">
                <div class="bubble">
                  <p>{{ message.text }}</p>
                </div>
                <span class="message-meta">
                  {{ message.time }}
                  <CheckCheck v-if="message.sender === 'me'" class="tiny-icon" />
                </span>
              </div>
            </article>
          </section>

          <footer class="composer">
            <button type="button" class="composer-tool" aria-label="Attach file">
              <Paperclip class="icon" />
            </button>
            <textarea
              ref="composerRef"
              v-model="draft"
              rows="1"
              placeholder="Type your message..."
              @keydown="handleComposerKeydown"
            />
            <button
              type="button"
              class="send-btn"
              :disabled="!canSend"
              aria-label="Send message"
              @click="sendMessage"
            >
              <Send class="icon" />
            </button>
          </footer>
        </section>

        <section v-else class="active-chat empty-chat">
          <div class="empty-state">
            <h2>No conversations yet</h2>
            <p>Start a conversation from a nearby user profile.</p>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { io, type Socket } from 'socket.io-client'
import AppSidebar from '@/components/AppSidebar.vue'
import Navbar from '@/components/Navbar.vue'
import {
  conversationApi,
  messageApi,
  type ApiConversation,
  type ApiMessage,
} from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import {
  CheckCheck,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  Paperclip,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Video,
} from 'lucide-vue-next'

type ChatSender = 'me' | 'them'

type ChatMessage = {
  id: number
  sender: ChatSender
  text: string
  time: string
}

type Conversation = {
  id: number
  participantId: number | null
  name: string
  avatar: string
  online: boolean
  presence: string
  preview: string
  time: string
  unread?: number
}

const auth = useAuthStore()
const route = useRoute()
const conversations = ref<Conversation[]>([])
const activeConversationId = ref<number | null>(null)
const isListCollapsed = ref(false)
const searchTerm = ref('')
const threadRef = ref<HTMLElement | null>(null)
const composerRef = ref<HTMLTextAreaElement | null>(null)
const draft = ref('')
const messages = ref<ChatMessage[]>([])
const loading = ref(false)
const error = ref('')
const socket = ref<Socket | null>(null)
const socketConnected = ref(false)

const activeConversation = computed(
  (): Conversation | null =>
    conversations.value.find((conversation) => conversation.id === activeConversationId.value) ?? null,
)
const filteredConversations = computed(() => {
  const needle = searchTerm.value.trim().toLowerCase()
  if (!needle) return conversations.value

  return conversations.value.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(needle) ||
      conversation.preview.toLowerCase().includes(needle),
  )
})
const messageCount = computed(() => messages.value.length)
const canSend = computed(() => !!activeConversation.value && draft.value.trim().length > 0)

async function selectConversation(id: number) {
  activeConversationId.value = id
  await loadMessages(id)
  joinConversation(id)
  void nextTick(scrollToBottom)
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function sendMessage() {
  const text = draft.value.trim()
  const conversationId = activeConversationId.value
  if (!text || !conversationId) return

  draft.value = ''

  if (socket.value?.connected) {
    socket.value.emit(
      'sendMessage',
      { conversationId, content: text },
      (response: { success?: boolean; message?: ApiMessage; error?: string }) => {
        if (response?.error) {
          error.value = response.error
          return
        }
        if (response?.message) upsertMessage(response.message)
      },
    )
    return
  }

  try {
    const created = await messageApi.create(conversationId, text)
    upsertMessage(created)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to send message.'
    draft.value = text
  }
}

function handleComposerKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey) return
  event.preventDefault()
  sendMessage()
}

function scrollToBottom() {
  const thread = threadRef.value
  if (!thread) return
  thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' })
}

function currentUserId() {
  return auth.user?.userId ?? auth.user?.user_id ?? null
}

function toConversation(conversation: ApiConversation): Conversation {
  const me = currentUserId()
  const otherParticipant =
    conversation.participants?.find((participant) => participant.user_id !== me) ??
    conversation.participants?.[0]
  const user = otherParticipant?.user
  const latestMessage = [...(conversation.messages ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )[0]
  const name = user?.username || 'Neighbor'

  return {
    id: conversation.conversation_id,
    participantId: user?.user_id ?? otherParticipant?.user_id ?? null,
    name,
    avatar: user?.profile_image || `https://i.pravatar.cc/200?u=${encodeURIComponent(name)}`,
    online: false,
    presence: 'Offline',
    preview: latestMessage?.content || 'No messages yet',
    time: latestMessage ? formatTime(new Date(latestMessage.created_at)) : formatTime(new Date(conversation.updated_at)),
  }
}

function toChatMessage(message: ApiMessage): ChatMessage {
  return {
    id: message.message_id,
    sender: message.sender_id === currentUserId() ? 'me' : 'them',
    text: message.content,
    time: formatTime(new Date(message.created_at)),
  }
}

async function loadConversations() {
  loading.value = true
  error.value = ''

  try {
    const data = await conversationApi.list()
    conversations.value = data.map(toConversation)

    const targetUserId = Number(route.query.userId)

    if (Number.isInteger(targetUserId) && targetUserId > 0) {
      await openConversationWith(targetUserId)
    } else if (conversations.value.length > 0) {
      await selectConversation(activeConversationId.value ?? conversations.value[0]!.id)
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load conversations.'
  } finally {
    loading.value = false
  }
}

async function openConversationWith(userId: number) {
  const existing = conversations.value.find((conversation) => conversation.participantId === userId)

  if (existing) {
    await selectConversation(existing.id)
    return
  }

  const created = await conversationApi.create([userId])
  const conversation = toConversation(created)
  conversations.value = [conversation, ...conversations.value]
  await selectConversation(conversation.id)
}

async function loadMessages(conversationId: number) {
  try {
    const page = await messageApi.list(conversationId, 0, 50)
    messages.value = page.data.map(toChatMessage)
    await messageApi.markSeen(conversationId)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load messages.'
    messages.value = []
  }
}

function upsertMessage(message: ApiMessage) {
  if (message.conversation_id !== activeConversationId.value) return

  const mapped = toChatMessage(message)
  const existingIndex = messages.value.findIndex((item) => item.id === mapped.id)

  if (existingIndex >= 0) {
    messages.value.splice(existingIndex, 1, mapped)
  } else {
    messages.value.push(mapped)
  }

  updateConversationPreview(message)
  void nextTick(scrollToBottom)
}

function updateConversationPreview(message: ApiMessage) {
  const conversation = conversations.value.find((item) => item.id === message.conversation_id)
  if (!conversation) return

  conversation.preview = message.content
  conversation.time = formatTime(new Date(message.created_at))
}

function connectSocket() {
  const token = localStorage.getItem('token')
  if (!token) return

  socket.value = io(`${import.meta.env.VITE_API_URL}/chat`, {
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  socket.value.on('connect', () => {
    socketConnected.value = true
    if (activeConversationId.value) joinConversation(activeConversationId.value)
  })

  socket.value.on('disconnect', () => {
    socketConnected.value = false
  })

  socket.value.on('newMessage', (message: ApiMessage) => {
    upsertMessage(message)
  })
}

function joinConversation(conversationId: number) {
  if (!socket.value?.connected) return
  socket.value.emit('joinConversation', conversationId)
}

onMounted(() => {
  connectSocket()
  void loadConversations()
})

onUnmounted(() => {
  socket.value?.disconnect()
})

watch(activeConversationId, () => {
  draft.value = ''
})
</script>

<style scoped>
.chat-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #1f4054;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.chat-shell {
  display: flex;
  min-width: 0;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  min-width: 0;
  height: calc(100vh - 64px);
  padding: 18px clamp(14px, 2vw, 24px);
}

.workspace.list-collapsed {
  grid-template-columns: 64px minmax(0, 1fr);
}

.conversation-list,
.active-chat {
  min-height: 0;
  overflow: hidden;
  border: 1px solid #e3ebf2;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 45, 70, 0.04);
}

.conversation-list {
  display: flex;
  flex-direction: column;
}

.list-header,
.chat-header,
.privacy-strip,
.composer {
  display: flex;
  align-items: center;
}

.list-header {
  justify-content: space-between;
  gap: 12px;
  padding: 18px;
  border-bottom: 1px solid #e9f0f5;
}

.eyebrow {
  margin: 0;
  color: #0e6378;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0;
  color: #17364a;
  letter-spacing: 0;
}

h1 {
  margin-top: 3px;
  font-size: 1.55rem;
  font-weight: 900;
}

h2 {
  font-size: 1.05rem;
  font-weight: 900;
}

.collapse-btn,
.icon-btn,
.composer-tool,
.send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
}

.collapse-btn,
.icon-btn,
.composer-tool {
  width: 38px;
  height: 38px;
  background: #f3f7fa;
  color: #526b80;
}

.collapse-btn:hover,
.icon-btn:hover,
.composer-tool:hover {
  background: #e4f5f4;
  color: #0f766e;
}

.icon {
  width: 17px;
  height: 17px;
}

.list-content {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 999px;
  background: #f0f5f8;
  padding: 10px 13px;
  color: #7f93a5;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #29475b;
  font-size: 0.86rem;
}

.conversation-items {
  display: grid;
  gap: 8px;
  overflow-y: auto;
  padding-right: 2px;
}

.conversation-card {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 14px;
  background: transparent;
  padding: 12px;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.conversation-card:hover {
  background: #f6fafc;
}

.conversation-card.active {
  border-color: #cfecef;
  background: #eef8fb;
}

.avatar-wrap,
.contact-avatar {
  position: relative;
}

.avatar-wrap img,
.contact-avatar img {
  display: block;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  object-fit: cover;
}

.avatar-wrap span,
.contact-avatar span {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 12px;
  height: 12px;
  border: 2px solid #fff;
  border-radius: 999px;
}

.online {
  background: #0f8a7c;
}

.offline {
  background: #a7b4c2;
}

.conversation-copy {
  min-width: 0;
}

.conversation-topline {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.conversation-topline strong {
  overflow: hidden;
  color: #1e3a4f;
  font-size: 0.9rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-topline span,
.conversation-copy p,
.contact-copy p,
.privacy-strip,
.message-meta {
  color: #7890a2;
  font-size: 0.76rem;
  font-weight: 700;
}

.conversation-copy p {
  overflow: hidden;
  margin: 4px 0 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-count {
  display: inline-flex;
  min-width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #0f8a7c;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 900;
}

.active-chat {
  display: flex;
  flex-direction: column;
}

.chat-header {
  gap: 12px;
  border-bottom: 1px solid #e9f0f5;
  padding: 14px 18px;
}

.contact-copy {
  min-width: 0;
  flex: 1;
}

.contact-copy p {
  margin: 3px 0 0;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.privacy-strip {
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid #eef3f7;
  background: #f8fbff;
  padding: 10px 18px;
}

.privacy-strip span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.thread {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: #f4f7fb;
  padding: 22px 28px;
}

.date-pill {
  width: fit-content;
  margin: 0 auto 18px;
  border-radius: 999px;
  background: #e9eff5;
  padding: 6px 12px;
  color: #70869a;
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.message-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.message-row.theirs {
  justify-content: flex-start;
}

.message-row.mine {
  justify-content: flex-end;
}

.message-row > img {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 12px;
  object-fit: cover;
}

.message-stack {
  max-width: min(680px, 72%);
}

.bubble {
  border-radius: 18px;
  padding: 12px 15px;
  line-height: 1.55;
  box-shadow: 0 8px 20px rgba(15, 45, 70, 0.05);
}

.theirs .bubble {
  border-bottom-left-radius: 6px;
  background: #fff;
  color: #273f52;
}

.mine .bubble {
  border-bottom-right-radius: 6px;
  background: #0f8a7c;
  color: #fff;
}

.bubble p {
  margin: 0;
  white-space: pre-line;
}

.message-meta {
  display: flex;
  gap: 5px;
  margin-top: 5px;
}

.mine .message-meta {
  justify-content: flex-end;
}

.tiny-icon {
  width: 13px;
  height: 13px;
  color: #0f8a7c;
}

.composer {
  gap: 10px;
  border-top: 1px solid #e9f0f5;
  background: #fff;
  padding: 14px 18px;
}

.composer textarea {
  min-height: 44px;
  max-height: 120px;
  flex: 1;
  resize: none;
  border: 0;
  border-radius: 999px;
  outline: 0;
  background: #f0f5f8;
  padding: 12px 16px;
  color: #29475b;
  font: inherit;
}

.send-btn {
  width: 44px;
  height: 44px;
  background: #0f8a7c;
  color: #fff;
  box-shadow: 0 10px 20px rgba(15, 138, 124, 0.18);
}

.send-btn:disabled {
  cursor: not-allowed;
  background: #cbd7df;
  box-shadow: none;
}

.conversation-list[aria-expanded='false'] .list-header {
  height: 100%;
  flex-direction: column;
  justify-content: flex-start;
  padding: 14px 10px;
}

.conversation-list[aria-expanded='false'] .list-header > div {
  display: none;
}

@media (max-width: 900px) {
  .workspace,
  .workspace.list-collapsed {
    grid-template-columns: 1fr;
    height: auto;
    min-height: calc(100vh - 64px);
  }

  .conversation-list {
    max-height: 360px;
  }

  .conversation-list[aria-expanded='false'] {
    max-height: 68px;
  }

  .conversation-list[aria-expanded='false'] .list-header {
    height: auto;
    flex-direction: row;
    justify-content: flex-end;
  }

  .active-chat {
    min-height: calc(100vh - 180px);
  }

  .message-stack {
    max-width: 84%;
  }
}

@media (max-width: 640px) {
  .workspace {
    padding: 12px;
  }

  .chat-actions {
    display: none;
  }

  .thread {
    padding: 18px 12px;
  }
}
</style>
