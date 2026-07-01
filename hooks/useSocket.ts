import { useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useCallStore } from '@/store/callStore'
import { useNotificationStore } from '@/store/notificationStore'
import type { MessageWithSender, ConversationWithDetails, NotificationWithActor } from '@/types/database'

export function useSocket() {
  const user = useAuthStore((s) => s.user)
  const socketRef = useRef<Socket | null>(null)
  const { addMessage, updateOrAddConversation, setTyping, setUserOnline, incrementConversationUnread } = useChatStore()
  const { setIncomingCall } = useCallStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    if (!user?.id) return

    const socket = getSocket(user.id)
    socketRef.current = socket

    socket.emit('join', { userId: user.id })

    socket.on('message:new', (data: { message: MessageWithSender; conversation: ConversationWithDetails }) => {
      addMessage(data.message.conversation_id, data.message)
      updateOrAddConversation(data.message.conversation_id, {
        last_message_preview: data.message.content ?? 'Media',
        last_message_at: data.message.created_at,
      })
      if (data.message.sender_id !== user.id) {
        incrementConversationUnread(data.message.conversation_id)
      }
    })

    socket.on('typing:start', (data: { userId: string; conversationId: string }) => {
      setTyping(data.userId, data.conversationId, true)
    })

    socket.on('typing:stop', (data: { userId: string; conversationId: string }) => {
      setTyping(data.userId, data.conversationId, false)
    })

    socket.on('user:online', (data: { userId: string }) => {
      setUserOnline(data.userId, true)
    })

    socket.on('user:offline', (data: { userId: string }) => {
      setUserOnline(data.userId, false)
    })

    socket.on('notification:new', (notification: NotificationWithActor) => {
      addNotification(notification)
    })

    socket.on('call:incoming', (data: { callerId: string; callerName: string; callerAvatar: string | null; callType: 'audio' | 'video'; conversationId: string }) => {
      setIncomingCall(
        {
          id: data.callerId,
          username: data.callerName,
          full_name: data.callerName,
          avatar_url: data.callerAvatar,
          email: '',
          bio: null,
          cover_url: null,
          website: null,
          location: null,
          phone: null,
          is_verified: false,
          is_private: false,
          email_notifications: true,
          push_notifications: true,
          online_status: true,
          last_seen: new Date().toISOString(),
          followers_count: 0,
          following_count: 0,
          posts_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        data.conversationId,
        data.callType
      )
    })

    return () => {
      socket.off('message:new')
      socket.off('typing:start')
      socket.off('typing:stop')
      socket.off('user:online')
      socket.off('user:offline')
      socket.off('notification:new')
      socket.off('call:incoming')
    }
  }, [user?.id])

  return socketRef.current
}
