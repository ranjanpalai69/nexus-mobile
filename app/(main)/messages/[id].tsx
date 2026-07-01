import { useCallback, useRef, useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { router, useLocalSearchParams } from 'expo-router'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { fetchMessages } from '@/lib/api/messages'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { getSocket } from '@/lib/socket'
import { useSocket } from '@/hooks/useSocket'
import { useCall } from '@/hooks/useCall'
import { MessageBubble } from '@/components/messages/MessageBubble'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { MessageWithSender, Profile } from '@/types/database'

export default function ConversationScreen() {
  useSocket()
  const { id } = useLocalSearchParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { messages, setMessages, addMessage, setActiveConversation, clearConversationUnread, conversations } = useChatStore()
  const { startCall } = useCall()

  const conv = conversations.find((c) => c.id === id)
  const other = conv?.participants?.find((p: Profile) => p.id !== user?.id)

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['messages', id],
    queryFn: ({ pageParam = 0 }) => fetchMessages(id, pageParam as number),
    getNextPageParam: (last, all) => (last.length < 20 ? undefined : all.length),
    initialPageParam: 0,
  })

  useEffect(() => {
    setActiveConversation(id)
    clearConversationUnread(id)
    return () => setActiveConversation(null)
  }, [id])

  useEffect(() => {
    const all = data?.pages.flat() ?? []
    if (all.length > 0) setMessages(id, all)
  }, [data])

  const localMessages = messages[id] ?? []

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const socket = getSocket(user!.id)
      socket.emit('message:send', { conversationId: id, content, to: other?.id })
    },
  })

  const handleSend = () => {
    const text = input.trim()
    if (!text || !user) return
    setInput('')
    sendMutation.mutate(text)
  }

  const handleTyping = (text: string) => {
    setInput(text)
    if (!typing) {
      setTyping(true)
      getSocket(user!.id).emit('typing:start', { conversationId: id, to: other?.id })
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      setTyping(false)
      getSocket(user!.id).emit('typing:stop', { conversationId: id, to: other?.id })
    }, 1500)
  }

  const isTyping = useChatStore((s) => s.typingUsers.some((t) => t.conversationId === id && t.userId === other?.id))

  const renderItem = useCallback(({ item, index }: { item: MessageWithSender; index: number }) => {
    const prev = localMessages[index - 1]
    const showTime = !prev || new Date(item.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000
    return <MessageBubble message={item} isOwn={item.sender_id === user?.id} showTime={showTime} />
  }, [localMessages, user?.id])

  if (isLoading) return <LoadingSpinner />

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0F0A1E' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#2A1F45', gap: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Avatar uri={other?.avatar_url} name={other?.full_name} username={other?.username ?? ''} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#F9FAFB', fontWeight: '700', fontSize: 15 }}>{other?.full_name || other?.username}</Text>
          {isTyping && <Text style={{ color: '#9333EA', fontSize: 12 }}>typing...</Text>}
        </View>
        <TouchableOpacity onPress={() => other && startCall(other.id, id, 'audio')} style={{ padding: 8 }}>
          <Ionicons name="call-outline" size={22} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => other && startCall(other.id, id, 'video')} style={{ padding: 8 }}>
          <Ionicons name="videocam-outline" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <FlashList
        data={localMessages}
        renderItem={renderItem}
        estimatedItemSize={60}
        keyExtractor={(item) => item.id}
        inverted
        onEndReached={() => { if (hasNextPage) fetchNextPage() }}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12 }}
      />

      {/* Input */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#2A1F45', gap: 10 }}>
        <TextInput
          style={{ flex: 1, backgroundColor: '#1A1030', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: '#F9FAFB', fontSize: 15, maxHeight: 100 }}
          placeholder="Message..."
          placeholderTextColor="#4A3F6B"
          value={input}
          onChangeText={handleTyping}
          multiline
          returnKeyType="default"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!input.trim()}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: input.trim() ? '#9333EA' : '#2A1F45', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="send" size={18} color={input.trim() ? '#fff' : '#4A3F6B'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
