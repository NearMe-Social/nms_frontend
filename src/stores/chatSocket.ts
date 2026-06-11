import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { API_URL, type ApiMessage } from '@/services/api'

export const useChatSocketStore = defineStore('chatSocket', () => {
  const socket = shallowRef<Socket | null>(null)
  const connected = shallowRef(false)
  const lastMessage = shallowRef<ApiMessage | null>(null)
  const messageEventId = ref(0)
  const unreadConversationIds = ref<number[]>([])
  const onlineUserIds = ref<number[]>([])

  const isConnected = computed(() => connected.value)

  function currentUserId() {
    let user: { userId?: number; user_id?: number } | null = null

    try {
      user = JSON.parse(localStorage.getItem('auth_user') || 'null')
    } catch {
      user = null
    }

    return user?.userId ?? user?.user_id ?? null
  }

  function connect() {
    const token = localStorage.getItem('token')
    if (!token) {
      disconnect()
      return
    }

    if (socket.value) return

    socket.value = io(`${API_URL.replace(/\/+$/, '')}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.value.on('connect', () => {
      connected.value = true
    })

    socket.value.on('disconnect', () => {
      connected.value = false
      onlineUserIds.value = []
    })

    socket.value.on('connect_error', () => {
      connected.value = false
      onlineUserIds.value = []
    })

    socket.value.on('presenceSnapshot', (event: { onlineUserIds?: number[] }) => {
      onlineUserIds.value = normalizeUserIds(event?.onlineUserIds)
    })

    socket.value.on('presenceChanged', (event: { userId?: number; online?: boolean }) => {
      const userId = Number(event?.userId)
      if (!Number.isInteger(userId) || userId <= 0) return

      if (event.online) {
        if (!onlineUserIds.value.includes(userId)) {
          onlineUserIds.value = [...onlineUserIds.value, userId]
        }
        return
      }

      onlineUserIds.value = onlineUserIds.value.filter((id) => id !== userId)
    })

    socket.value.on('newMessage', (message: ApiMessage) => {
      lastMessage.value = message
      messageEventId.value += 1

      if (message.sender_id === currentUserId()) return

      if (!unreadConversationIds.value.includes(message.conversation_id)) {
        unreadConversationIds.value = [message.conversation_id, ...unreadConversationIds.value]
      }
    })
  }

  function disconnect() {
    if (!socket.value) {
      connected.value = false
      onlineUserIds.value = []
      return
    }

    socket.value.removeAllListeners()
    socket.value.disconnect()
    socket.value = null
    connected.value = false
    onlineUserIds.value = []
  }

  function emit(event: string, ...args: unknown[]) {
    socket.value?.emit(event, ...args)
  }

  function markConversationRead(conversationId: number) {
    unreadConversationIds.value = unreadConversationIds.value.filter((id) => id !== conversationId)
  }

  function refreshPresence(userIds: number[]) {
    const requestedUserIds = normalizeUserIds(userIds)
    if (!socket.value?.connected || requestedUserIds.length === 0) return

    socket.value.emit(
      'getPresence',
      { userIds: requestedUserIds },
      (response: { onlineUserIds?: number[] }) => {
        onlineUserIds.value = normalizeUserIds(response?.onlineUserIds)
      },
    )
  }

  function normalizeUserIds(userIds?: number[]) {
    if (!Array.isArray(userIds)) return []

    return Array.from(
      new Set(userIds.map(Number).filter((userId) => Number.isInteger(userId) && userId > 0)),
    )
  }

  function on<TArgs extends unknown[]>(event: string, handler: (...args: TArgs) => void) {
    const listener = handler as (...args: unknown[]) => void

    socket.value?.on(event, listener)

    return () => {
      socket.value?.off(event, listener)
    }
  }

  return {
    socket,
    connected,
    lastMessage,
    messageEventId,
    unreadConversationIds,
    onlineUserIds,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    markConversationRead,
    refreshPresence,
  }
})
