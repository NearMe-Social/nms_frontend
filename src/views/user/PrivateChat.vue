<template>
  <div class="chat-page">
    <Navbar />

    <div class="chat-shell">
      <AppSidebar class="hidden md:flex" />

      <main class="workspace" :class="{ 'list-collapsed': isListCollapsed && !isMobileOrTablet }">
        <Transition name="slide">
          <section
            v-if="showConversationPanel"
            class="conversation-list"
            :class="{ collapsed: isListCollapsed && !isMobileOrTablet }"
            :aria-expanded="!isListCollapsed"
          >
            <div class="list-header" :class="{ collapsed: isListCollapsed && !isMobileOrTablet }">
              <div v-if="!isListCollapsed || isMobileOrTablet">
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
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Search conversations..."
                  aria-label="Search conversations"
                />
              </label>

              <div v-if="loadingConversations" class="state-message">
                <div class="skeleton-list">
                  <div v-for="i in 5" :key="i" class="skeleton-item">
                    <div class="skeleton-avatar"></div>
                    <div class="skeleton-lines">
                      <div class="skeleton-line"></div>
                      <div class="skeleton-line short"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else-if="error" class="state-message error">
                <AlertCircle class="icon" />
                <p>{{ error }}</p>
                <button @click="loadConversations" class="retry-btn">Try Again</button>
              </div>

              <div v-else-if="conversations.length === 0" class="state-message">
                <MessagesSquare class="icon" />
                <p>No conversations yet</p>
                <p class="hint">Start a conversation from a nearby user profile.</p>
              </div>

              <div v-else-if="filteredConversations.length === 0" class="state-message">
                <SearchX class="icon" />
                <p>No conversations match</p>
                <p class="hint">Try a different search term</p>
              </div>

              <div v-else class="conversation-items">
                <button
                  v-for="conversation in filteredConversations"
                  :key="conversation.id"
                  type="button"
                  class="conversation-card"
                  :class="{ active: activeConversation && conversation.id === activeConversation.id }"
                  @click="selectConversation(conversation.id)"
                >
                  <div class="avatar-wrap">
                    <UserAvatar
                      :src="conversation.avatar"
                      :username="conversation.name"
                      :alt="conversation.name"
                      class="chat-avatar"
                    />
                    <span :class="conversation.online ? 'online' : 'offline'" />
                  </div>
                  <div class="conversation-copy">
                    <div class="conversation-topline">
                      <strong>{{ conversation.name }}</strong>
                      <span class="time">{{ conversation.time }}</span>
                    </div>
                    <div class="conversation-preview">
                      <p>{{ conversation.preview }}</p>
                      <span v-if="conversation.unread" class="unread-count">{{ conversation.unread }}</span>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </section>
        </Transition>

        <Transition name="fade-slide">
          <section v-if="showActiveChat && activeConversation" class="active-chat">
            <header class="chat-header">
              <button
                v-if="isMobileOrTablet && activeConversationId && !showConversationList"
                type="button"
                class="icon-btn back-btn"
                title="Back to conversations"
                @click="showConversationList = true"
              >
                <ArrowLeft class="icon" />
              </button>

              <button
                v-else-if="isListCollapsed"
                type="button"
                class="icon-btn"
                title="Show conversations"
                @click="isListCollapsed = false"
              >
                <PanelLeftOpen class="icon" />
              </button>

              <div class="contact-avatar">
                <UserAvatar
                  :src="activeConversation.avatar"
                  :username="activeConversation.name"
                  :alt="activeConversation.name"
                  class="chat-avatar"
                />
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
              <div v-if="loadingMessages" class="thread-state">
                <span class="loading-dot" />
                Loading messages...
              </div>

              <div v-else-if="messages.length === 0" class="thread-state">
                <MessagesSquare class="icon" />
                <span>No messages yet. Say hello.</span>
              </div>

              <template v-else v-for="group in groupedMessages" :key="group.date">
                <div class="date-pill">{{ group.label }}</div>

                <article
                  v-for="message in group.messages"
                  :key="message.id"
                  :id="`message-${message.id}`"
                  class="message-row"
                  :class="[
                    message.sender === 'me' ? 'mine' : 'theirs',
                    { highlighted: message.id === targetMessageId },
                  ]"
                >
                  <UserAvatar
                    v-if="message.sender === 'them'"
                    :src="activeConversation.avatar"
                    :username="activeConversation.name"
                    :alt="activeConversation.name"
                    class="message-avatar"
                  />

                  <div class="message-stack">
                    <div class="bubble">
                      <p>{{ message.text }}</p>
                    </div>
                    <span class="message-meta">
                      {{ message.time }}
                      <template v-if="message.sender === 'me'">
                        <CheckCheck class="tiny-icon" :class="{ seen: message.readAt }" />
                        {{ message.readAt ? 'Seen' : 'Sent' }}
                      </template>
                    </span>
                  </div>
                </article>
              </template>

              <div v-if="typingConversationId === activeConversation.id" class="typing-row">
                <UserAvatar
                  :src="activeConversation.avatar"
                  :username="activeConversation.name"
                  :alt="activeConversation.name"
                  class="message-avatar"
                />
                <div class="typing-bubble" aria-live="polite">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </section>

            <footer class="composer">
              <textarea
                ref="composerRef"
                v-model="draft"
                rows="1"
                placeholder="Type your message..."
                aria-label="Message input"
                @input="handleTypingInput"
                @keydown="handleComposerKeydown"
              />
              <button
                type="button"
                class="send-btn"
                :disabled="!canSend"
                :aria-label="canSend ? 'Send message' : 'Type a message to send'"
                @click="sendMessage"
              >
                <Send class="icon" />
              </button>
            </footer>
          </section>

          <section v-else-if="!isMobileOrTablet" class="active-chat empty-chat">
            <div class="empty-state">
              <MessagesSquare class="empty-icon" />
              <h2>No conversation selected</h2>
              <p>Choose a conversation from the list to start messaging.</p>
            </div>
          </section>
        </Transition>
      </main>
    </div>

    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'
import Navbar from '@/components/Navbar.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { conversationApi, messageApi, type ApiConversation, type ApiMessage } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useChatSocketStore } from '@/stores/chatSocket'
import {
  AlertCircle,
  ArrowLeft,
  CheckCheck,
  Info,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
  Search,
  SearchX,
  Send,
  ShieldCheck,
  Video,
} from 'lucide-vue-next'

type ChatSender = 'me' | 'them'

interface ChatMessage {
  id: number
  sender: ChatSender
  text: string
  time: string
  readAt: string | null
  createdAt: Date
}

interface Conversation {
  id: number
  participantId: number | null
  name: string
  avatar: string | null
  online: boolean
  presence: string
  preview: string
  time: string
  unread?: number
}

const auth = useAuthStore()
const chatSocket = useChatSocketStore()
const route = useRoute()
const conversations = ref<Conversation[]>([])
const activeConversationId = ref<number | null>(null)
const isListCollapsed = ref(false)
const searchTerm = ref('')
const threadRef = ref<HTMLElement | null>(null)
const composerRef = ref<HTMLTextAreaElement | null>(null)
const draft = ref('')
const messages = ref<ChatMessage[]>([])
const loadingConversations = ref(false)
const loadingMessages = ref(false)
const error = ref('')
const typingConversationId = ref<number | null>(null)
const showConversationList = ref(true)
const isMobileOrTablet = ref(false)

let typingTimeout: ReturnType<typeof setTimeout> | null = null
let socketListenerStops: Array<() => void> = []
let messageRequestId = 0

// Group messages by date
const groupedMessages = computed(() => {
  const groups: { date: string; label: string; messages: ChatMessage[] }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const message of messages.value) {
    const messageDate = new Date(message.createdAt)
    messageDate.setHours(0, 0, 0, 0)
    let label = ''

    if (messageDate.getTime() === today.getTime()) {
      label = 'Today'
    } else if (messageDate.getTime() === yesterday.getTime()) {
      label = 'Yesterday'
    } else {
      label = messageDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const dateKey = messageDate.toISOString().split('T')[0]
    let group = groups.find(g => g.date === dateKey)
    if (!group) {
      group = { date: dateKey, label, messages: [] }
      groups.push(group)
    }
    group.messages.push(message)
  }

  return groups
})

const activeConversation = computed(
  (): Conversation | null =>
    conversations.value.find((conversation) => conversation.id === activeConversationId.value) ??
    null,
)
const showConversationPanel = computed(
  () =>
    !isMobileOrTablet.value ||
    showConversationList.value ||
    activeConversationId.value === null,
)
const showActiveChat = computed(
  () => !isMobileOrTablet.value || !showConversationList.value,
)
const targetMessageId = computed(() => {
  const messageId = Number(route.query.messageId)
  return Number.isInteger(messageId) && messageId > 0 ? messageId : null
})

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

function checkScreenSize() {
  const mobile = window.innerWidth <= 900
  isMobileOrTablet.value = mobile

  if (mobile) {
    isListCollapsed.value = false
    if (!activeConversationId.value) {
      showConversationList.value = true
    }
  } else {
    showConversationList.value = true
  }
}

async function selectConversation(id: number) {
  const previousConversationId = activeConversationId.value
  if (previousConversationId && previousConversationId !== id) {
    stopTyping(previousConversationId)
    leaveConversation(previousConversationId)
  }

  activeConversationId.value = id
  showConversationList.value = !isMobileOrTablet.value
  messages.value = []
  typingConversationId.value = null

  const conversation = conversations.value.find(c => c.id === id)
  if (conversation?.unread) {
    conversation.unread = 0
  }

  await loadMessages(id)
  joinConversation(id)
  void nextTick(() => {
    if (!scrollToTargetMessage()) {
      scrollToBottom()
    }
    autoResizeTextarea()
  })
}

function scrollToTargetMessage() {
  if (!targetMessageId.value) return false
  const target = document.getElementById(`message-${targetMessageId.value}`)
  if (!target) return false
  target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  return true
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDateForPreview(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return formatTime(date)
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: 'short' })
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

async function sendMessage() {
  const text = draft.value.trim()
  const conversationId = activeConversationId.value
  if (!text || !conversationId) return

  draft.value = ''
  autoResizeTextarea()

  if (chatSocket.connected) {
    chatSocket.emit(
      'sendMessage',
      { conversationId, content: text },
      (response: { success?: boolean; message?: ApiMessage; error?: string }) => {
        if (response?.error) {
          error.value = response.error
          draft.value = text
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
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

function autoResizeTextarea() {
  const textarea = composerRef.value
  if (!textarea) return
  textarea.style.height = 'auto'
  textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
}

function handleTypingInput() {
  autoResizeTextarea()
  const conversationId = activeConversationId.value
  if (!conversationId || !chatSocket.connected) return

  chatSocket.emit('typingStarted', { conversationId })

  if (typingTimeout) clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    stopTyping(conversationId)
  }, 1200)
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
    avatar: user?.profile_image || null,
    online: false,
    presence: 'Offline',
    preview: latestMessage?.content || 'No messages yet',
    time: latestMessage
      ? formatDateForPreview(new Date(latestMessage.created_at))
      : formatDateForPreview(new Date(conversation.updated_at)),
    unread: conversation.unread_count ?? 0,
  }
}

function toChatMessage(message: ApiMessage): ChatMessage {
  return {
    id: message.message_id,
    sender: message.sender_id === currentUserId() ? 'me' : 'them',
    text: message.content,
    time: formatTime(new Date(message.created_at)),
    readAt: message.read_at,
    createdAt: new Date(message.created_at),
  }
}

async function loadConversations() {
  loadingConversations.value = true
  error.value = ''

  try {
    const data = await conversationApi.list()
    conversations.value = data.map(toConversation)

    const targetConversationId = Number(route.query.conversationId)
    const targetUserId = Number(route.query.userId)

    if (
      Number.isInteger(targetConversationId) &&
      targetConversationId > 0 &&
      conversations.value.some((conversation) => conversation.id === targetConversationId)
    ) {
      await selectConversation(targetConversationId)
    } else if (Number.isInteger(targetUserId) && targetUserId > 0) {
      await openConversationWith(targetUserId)
    } else if (
      conversations.value.length > 0 &&
      !activeConversationId.value &&
      !isMobileOrTablet.value
    ) {
      await selectConversation(conversations.value[0]!.id)
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load conversations.'
  } finally {
    loadingConversations.value = false
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
  const requestId = ++messageRequestId
  loadingMessages.value = true

  try {
    const page = await messageApi.list(conversationId, 0, 50)
    if (
      requestId !== messageRequestId ||
      conversationId !== activeConversationId.value
    ) {
      return
    }

    messages.value = page.data.map(toChatMessage)
    await messageApi.markSeen(conversationId)
    if (
      requestId !== messageRequestId ||
      conversationId !== activeConversationId.value
    ) {
      return
    }

    chatSocket.markConversationRead(conversationId)
    emitSeen(conversationId)
  } catch (err: unknown) {
    if (
      requestId !== messageRequestId ||
      conversationId !== activeConversationId.value
    ) {
      return
    }

    error.value = err instanceof Error ? err.message : 'Failed to load messages.'
    messages.value = []
  } finally {
    if (requestId === messageRequestId) {
      loadingMessages.value = false
    }
  }
}

function upsertMessage(message: ApiMessage) {
  updateConversationPreview(message)

  if (message.conversation_id !== activeConversationId.value) {
    if (!conversations.value.some((item) => item.id === message.conversation_id)) {
      void refreshConversationsSilently()
    } else {
      // Increment unread count if not active conversation
      const conv = conversations.value.find(c => c.id === message.conversation_id)
      if (conv && conv.id !== activeConversationId.value) {
        conv.unread = (conv.unread || 0) + 1
      }
    }
    return
  }

  const mapped = toChatMessage(message)
  const existingIndex = messages.value.findIndex((item) => item.id === mapped.id)

  if (existingIndex >= 0) {
    messages.value.splice(existingIndex, 1, mapped)
  } else {
    messages.value.push(mapped)
  }

  void nextTick(scrollToBottom)
}

function updateConversationPreview(message: ApiMessage) {
  const conversation = conversations.value.find((item) => item.id === message.conversation_id)
  if (!conversation) return

  conversation.preview = message.content
  conversation.time = formatDateForPreview(new Date(message.created_at))

  const index = conversations.value.findIndex((item) => item.id === message.conversation_id)
  if (index > 0) {
    conversations.value.splice(index, 1)
    conversations.value.unshift(conversation)
  }
}

async function refreshConversationsSilently() {
  try {
    const data = await conversationApi.list()
    conversations.value = data.map(toConversation)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to refresh conversations.'
  }
}

function markConversationSeen(conversationId: number, readAt: string) {
  if (conversationId !== activeConversationId.value) return

  messages.value = messages.value.map((message) =>
    message.sender === 'me' ? { ...message, readAt } : message,
  )
}

function emitSeen(conversationId: number) {
  if (!chatSocket.connected) return
  chatSocket.emit('markSeen', { conversationId })
}

function stopTyping(conversationId = activeConversationId.value) {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }

  if (!conversationId || !chatSocket.connected) return
  chatSocket.emit('typingStopped', { conversationId })
}

function registerSocketListeners() {
  chatSocket.connect()
  socketListenerStops.forEach((stop) => stop())
  socketListenerStops = [
    chatSocket.on('connect', () => {
      if (activeConversationId.value) joinConversation(activeConversationId.value)
    }),
    chatSocket.on('typingStarted', (event: { conversationId: number; userId: number }) => {
      if (event.userId === currentUserId()) return
      typingConversationId.value = event.conversationId
    }),
    chatSocket.on('typingStopped', (event: { conversationId: number; userId: number }) => {
      if (event.userId === currentUserId()) return
      if (typingConversationId.value === event.conversationId) {
        typingConversationId.value = null
      }
    }),
    chatSocket.on(
      'messagesSeen',
      (event: { conversationId: number; userId: number; readAt: string }) => {
        if (event.userId === currentUserId()) return
        markConversationSeen(event.conversationId, event.readAt)
      },
    ),
  ]

  if (chatSocket.connected && activeConversationId.value) {
    joinConversation(activeConversationId.value)
  }
}

function joinConversation(conversationId: number) {
  if (!chatSocket.connected) return
  chatSocket.emit('joinConversation', conversationId)
}

function leaveConversation(conversationId: number) {
  if (!chatSocket.connected) return
  chatSocket.emit('leaveConversation', conversationId)
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  registerSocketListeners()
  void loadConversations()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  stopTyping()
  if (activeConversationId.value) leaveConversation(activeConversationId.value)
  socketListenerStops.forEach((stop) => stop())
  socketListenerStops = []
})

watch(activeConversationId, () => {
  draft.value = ''
})

watch(
  () => chatSocket.messageEventId,
  () => {
    const message = chatSocket.lastMessage
    if (!message) return

    upsertMessage(message)
    if (
      message.conversation_id === activeConversationId.value &&
      message.sender_id !== currentUserId()
    ) {
      chatSocket.markConversationRead(message.conversation_id)
      void messageApi.markSeen(message.conversation_id)
      emitSeen(message.conversation_id)
    }
  },
)
</script>

<style scoped>

.chat-page {
  min-height: 100vh;
  background: #f4f7fb;
  color: #1a3a4f;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chat-shell {
  display: flex;
  min-width: 0;
  min-height: calc(100vh - 64px);
}

.workspace {
  position: relative;
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  min-width: 0;
  height: calc(100dvh - 64px);
  padding: 18px clamp(14px, 2vw, 24px);
  transition: grid-template-columns 0.25s ease;
}

.workspace.list-collapsed {
  grid-template-columns: 64px minmax(0, 1fr);
}

.conversation-list,
.active-chat {
  min-height: 0;
  overflow: hidden;
  border: 1px solid #e1eaf0;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(20, 45, 70, 0.045);
}

.conversation-list {
  display: flex;
  flex-direction: column;
}

.conversation-list.collapsed {
  overflow: visible;
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
  padding: 20px 20px 16px;
  border-bottom: 1px solid #eef3f8;
}

.list-header.collapsed {
  height: 100%;
  justify-content: center;
  padding: 14px 0;
  border-bottom: 0;
}

.eyebrow {
  margin: 0;
  color: #0f766e;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h1 {
  margin: 4px 0 0;
  font-size: 1.65rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1a4a5f 0%, #0f766e 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a4a5f;
}

.collapse-btn,
.icon-btn,
.send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn,
.icon-btn {
  width: 40px;
  height: 40px;
  background: #f0f6fa;
  color: #4a6f83;
}

.collapse-btn:hover,
.icon-btn:hover {
  background: #e4f5f4;
  color: #0f766e;
  transform: scale(1.02);
}

.icon {
  width: 18px;
  height: 18px;
}

.list-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px 20px;
  flex: 1;
  min-height: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 40px;
  background: #f5fafd;
  padding: 10px 16px;
  border: 1px solid #e2edf4;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #0f766e;
  background: white;
  box-shadow: 0 2px 12px rgba(15, 118, 110, 0.1);
}

.search-box input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 0.9rem;
  color: #1a4a5f;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item {
  display: flex;
  gap: 14px;
  padding: 12px;
  border-radius: 20px;
}

.skeleton-avatar {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(90deg, #eef3f8 25%, #f5fafd 50%, #eef3f8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
}

.skeleton-line {
  height: 14px;
  background: linear-gradient(90deg, #eef3f8 25%, #f5fafd 50%, #eef3f8 75%);
  background-size: 200% 100%;
  border-radius: 7px;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 60%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;
  color: #6b8da3;
}

.state-message .icon {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

.state-message.error {
  color: #e53e3e;
}

.retry-btn {
  margin-top: 8px;
  padding: 8px 20px;
  border-radius: 40px;
  background: #0f766e;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: #0d5c56;
  transform: translateY(-1px);
}

.hint {
  font-size: 0.8rem;
  opacity: 0.7;
}

.conversation-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  padding-right: 4px;
}

.conversation-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  border: 1px solid transparent;
  border-radius: 20px;
  background: transparent;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.conversation-card:hover {
  background: #f8fcfd;
  transform: translateX(4px);
  border-color: #e2edf4;
}

.conversation-card.active {
  background: #eef8fb;
  border-color: #cce7e5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.avatar-wrap,
.contact-avatar {
  position: relative;
}

.chat-avatar {
  display: block;
  width: 52px;
  height: 52px;
  border-radius: 18px;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.avatar-wrap span,
.contact-avatar span {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 14px;
  height: 14px;
  border: 2px solid white;
  border-radius: 999px;
}

.online {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.offline {
  background: #94a3b8;
}

.conversation-copy {
  min-width: 0;
}

.conversation-topline {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.conversation-topline strong {
  overflow: hidden;
  font-size: 0.95rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1a4a5f;
}

.time {
  font-size: 0.7rem;
  color: #8aaec2;
  flex-shrink: 0;
}

.conversation-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.conversation-preview p {
  overflow: hidden;
  margin: 0;
  font-size: 0.8rem;
  color: #7c9ab0;
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
  background: #0f766e;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
}

.active-chat {
  display: flex;
  flex-direction: column;
  background: white;
}

.chat-header {
  gap: 14px;
  padding: 14px 24px;
  border-bottom: 1px solid #eef3f8;
}

.back-btn {
  display: none;
}

.contact-copy {
  flex: 1;
  min-width: 0;
}

.contact-copy p {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: #8aaec2;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.privacy-strip {
  justify-content: space-between;
  padding: 10px 24px;
  background: #fbfeff;
  border-bottom: 1px solid #eef3f8;
  font-size: 0.7rem;
  font-weight: 500;
  color: #7c9ab0;
}

.privacy-strip span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.thread {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  background: #f9fdfe;
}

.thread-state {
  display: flex;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #7c9ab0;
  font-size: 0.86rem;
}

.loading-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #0f766e;
  animation: loading-pulse 1s ease-in-out infinite;
}

@keyframes loading-pulse {
  50% {
    opacity: 0.35;
    transform: scale(0.8);
  }
}

.date-pill {
  width: fit-content;
  margin: 0 auto 20px;
  padding: 6px 16px;
  border-radius: 40px;
  background: #eef3f8;
  font-size: 0.7rem;
  font-weight: 600;
  color: #5c7f94;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.message-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: messageAppear 0.2s ease-out;
}

.message-row.highlighted .bubble {
  box-shadow: 0 0 0 3px rgba(15, 138, 124, 0.2);
}

.typing-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.typing-row .message-avatar {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border-radius: 12px;
  font-size: 0.95rem;
}

.typing-bubble {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  background: #fff;
  padding: 13px 15px;
  box-shadow: 0 8px 20px rgba(15, 45, 70, 0.05);
}

.typing-bubble span {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  animation: typing-pulse 1s infinite ease-in-out;
  background: #7890a2;
}

.typing-bubble span:nth-child(2) {
  animation-delay: 0.12s;
}

@keyframes messageAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-row.theirs {
  justify-content: flex-start;
}

.message-row.mine {
  justify-content: flex-end;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.message-stack {
  max-width: 70%;
}

.bubble {
  padding: 10px 16px;
  border-radius: 24px;
  line-height: 1.45;
  font-size: 0.9rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.theirs .bubble {
  background: white;
  border: 1px solid #eef3f8;
  border-bottom-left-radius: 8px;
  color: #1a3a4f;
}

.mine .bubble {
  background: #0f766e;
  border-bottom-right-radius: 8px;
  color: white;
}

.bubble p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-meta {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  font-size: 0.65rem;
  color: #8aaec2;
}

.mine .message-meta {
  justify-content: flex-end;
}

.tiny-icon {
  width: 14px;
  height: 14px;
}

.tiny-icon.seen {
  color: #10b981;
}

.typing-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.typing-bubble {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 14px 18px;
  background: white;
  border-radius: 24px;
  border-bottom-left-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.typing-bubble span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #9bb8ca;
  animation: typingPulse 1.2s infinite ease-in-out;
}

.typing-bubble span:nth-child(2) { animation-delay: 0.15s; }
.typing-bubble span:nth-child(3) { animation-delay: 0.3s; }

@keyframes typingPulse {
  0%, 60%, 100% { opacity: 0.4; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}

.composer {
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eef3f8;
  background: white;
}

.composer textarea {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 18px;
  border: 1px solid #e2edf4;
  border-radius: 40px;
  background: #fafdfe;
  font: inherit;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  transition: all 0.2s;
}

.composer textarea:focus {
  border-color: #0f766e;
  background: white;
  box-shadow: 0 2px 8px rgba(15, 118, 110, 0.1);
}

.send-btn {
  width: 48px;
  height: 48px;
  background: #0f766e;
  color: white;
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.empty-chat {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 40px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
  color: #cbdde6;
}

.empty-state h2 {
  margin-bottom: 12px;
  font-size: 1.4rem;
  background: none;
  -webkit-text-fill-color: #1a4a5f;
}

.empty-state p {
  color: #8aaec2;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

@media (max-width: 900px) {
  .workspace,
  .workspace.list-collapsed {
    display: block;
    height: calc(100dvh - 64px);
    overflow: hidden;
    padding: 12px;
  }

  .conversation-list,
  .active-chat {
    position: absolute;
    inset: 12px;
    width: auto;
    height: auto;
    min-height: 0;
    border-radius: 18px;
  }

  .collapse-btn {
    display: none;
  }

  .active-chat {
    min-height: 0;
  }

  .back-btn {
    display: inline-flex;
  }

  .message-stack {
    max-width: 85%;
  }

  .thread {
    padding: 20px 16px;
  }

  .chat-header,
  .privacy-strip,
  .composer {
    padding-left: 16px;
    padding-right: 16px;
  }
}

@media (max-width: 767px) {
  .workspace,
  .workspace.list-collapsed {
    height: calc(100dvh - 64px - 68px);
    padding-bottom: 8px;
  }
}

@media (max-width: 640px) {
  .workspace {
    padding: 8px;
  }

  .conversation-list,
  .active-chat {
    inset: 8px;
  }

  .chat-actions {
    display: none;
  }

  .conversation-card {
    padding: 10px 12px;
  }

  .chat-avatar {
    width: 48px;
    height: 48px;
  }

  .bubble {
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .message-stack {
    max-width: 90%;
  }

  .empty-icon {
    width: 60px;
    height: 60px;
  }

  .privacy-strip > span:last-child {
    display: none;
  }

  .chat-header {
    gap: 10px;
  }

  .contact-copy h2 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.thread::-webkit-scrollbar,
.conversation-items::-webkit-scrollbar {
  width: 4px;
}

.thread::-webkit-scrollbar-track,
.conversation-items::-webkit-scrollbar-track {
  background: #eef3f8;
  border-radius: 4px;
}

.thread::-webkit-scrollbar-thumb,
.conversation-items::-webkit-scrollbar-thumb {
  background: #c5d9e5;
  border-radius: 4px;
}

.thread::-webkit-scrollbar-thumb:hover {
  background: #a8c2d2;
}
</style>
