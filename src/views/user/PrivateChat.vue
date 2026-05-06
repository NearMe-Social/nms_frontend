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
                :class="{ active: conversation.id === activeConversation.id }"
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

        <section class="active-chat">
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
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import Navbar from '@/components/Navbar.vue'
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
  name: string
  avatar: string
  online: boolean
  presence: string
  preview: string
  time: string
  unread?: number
}

const conversations: Conversation[] = [
  {
    id: 1,
    name: 'Amina Johnson',
    avatar: 'https://i.pravatar.cc/200?img=47',
    online: true,
    presence: 'Active now',
    preview: 'Perfect. I’m online for the next hour.',
    time: '09:19',
    unread: 2,
  },
  {
    id: 2,
    name: 'Sokha Lim',
    avatar: 'https://i.pravatar.cc/200?img=32',
    online: false,
    presence: 'Seen 12 minutes ago',
    preview: 'Thanks for the road repair update.',
    time: 'Yesterday',
  },
  {
    id: 3,
    name: 'Maya Chen',
    avatar: 'https://i.pravatar.cc/200?img=5',
    online: true,
    presence: 'Active now',
    preview: 'Is the meetup still happening?',
    time: 'Tue',
  },
  {
    id: 4,
    name: 'Dara Vann',
    avatar: 'https://i.pravatar.cc/200?img=12',
    online: false,
    presence: 'Seen yesterday',
    preview: 'I found the contact number.',
    time: 'Mon',
  },
]

const activeConversationId = ref(1)
const isListCollapsed = ref(false)
const searchTerm = ref('')
const threadRef = ref<HTMLElement | null>(null)
const composerRef = ref<HTMLTextAreaElement | null>(null)
const draft = ref('')
const messages = ref<ChatMessage[]>([])

const conversationMessages: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      sender: 'them',
      text: 'Hey, I saw your update about the west gate lighting. Do you want to compare notes before we message the board?',
      time: '09:12',
    },
    {
      id: 2,
      sender: 'me',
      text: 'Absolutely. I walked by last night and the darker section is still near the pedestrian path.',
      time: '09:14',
    },
    {
      id: 3,
      sender: 'them',
      text: 'Yes please. I can also ask maintenance whether the fixtures need replacement.',
      time: '09:16',
    },
    {
      id: 4,
      sender: 'me',
      text: 'Great. I’ll draft a short summary and send it over here first.',
      time: '09:18',
    },
  ],
  2: [
    {
      id: 1,
      sender: 'them',
      text: 'Thanks for posting about the road repair. Saved me a detour.',
      time: '08:40',
    },
  ],
  3: [
    {
      id: 1,
      sender: 'them',
      text: 'Is the meetup still happening near the north lawn?',
      time: '10:03',
    },
  ],
  4: [
    {
      id: 1,
      sender: 'them',
      text: 'I found the contact number for the building manager.',
      time: 'Yesterday',
    },
  ],
}

const activeConversation = computed(
  (): Conversation =>
    conversations.find((conversation) => conversation.id === activeConversationId.value) ??
    conversations[0]!,
)
const filteredConversations = computed(() => {
  const needle = searchTerm.value.trim().toLowerCase()
  if (!needle) return conversations

  return conversations.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(needle) ||
      conversation.preview.toLowerCase().includes(needle),
  )
})
const messageCount = computed(() => messages.value.length)
const canSend = computed(() => draft.value.trim().length > 0)

function selectConversation(id: number) {
  activeConversationId.value = id
  messages.value = [...(conversationMessages[id] ?? [])]
  void nextTick(scrollToBottom)
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function sendMessage() {
  const text = draft.value.trim()
  if (!text) return

  messages.value.push({
    id: Date.now(),
    sender: 'me',
    text,
    time: formatTime(),
  })

  conversationMessages[activeConversationId.value] = [...messages.value]
  draft.value = ''
  void nextTick(scrollToBottom)
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

onMounted(() => {
  selectConversation(activeConversationId.value)
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
