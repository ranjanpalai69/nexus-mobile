import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { MessageBubble } from '@/components/messages/MessageBubble'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { fetchMessages } from '@/lib/api/messages'
import { getSocket } from '@/lib/socket'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { useCall } from '@/hooks/useCall'
import type { MessageWithSender } from '@/types/database'
import { getPresignedUrl } from '@/lib/api/posts'

let typingTimer: ReturnType<typeof setTimeout>

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const { messages: storeMessages, setMessages, addMessage, setTyping, typingUsers, clearConversationUnread, conversations } = useChatStore()
  const { startCall } = useCall()
  const [text, setText] = useState('')
  const flashRef = useRef<FlashList<MessageWithSender>>(null)

  const conversation = conversations.find((c) => c.id === id)
  const otherParticipant = conversation?.participants.find((p) => p.user_id !== user?.id)
  const otherUser = otherParticipant?.profile

  const messages = storeMessages[id] ?? []
  const isTyping = typingUsers.some((t) => t.conversationId === id && t.userId !== user?.id)

  const { isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const data = await fetchMessages(id)
      setMessages(id, data.reverse())
      return data
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (!user?.id) return
    const socket = getSocket(user.id)
    socket.emit('conversation:join', { conversationId: id })
    clearConversationUnread(id)
    return () => {
      socket.emit('conversation:leave', { conversationId: id })
    }
  }, [id, user?.id])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flashRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages.length])

  function handleTextChange(val: string) {
    setText(val)
    if (!user?.id) return
    const socket = getSocket(user.id)
    socket.emit('typing:start', { conversationId: id })
    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      socket.emit('typing:stop', { conversationId: id })
    }, 1500)
  }

  async function sendMessage() {
    if (!text.trim() || !user?.id) return
    const socket = getSocket(user.id)
    const tempId = `temp-${Date.now()}`
    const tempMsg: MessageWithSender = {
      id: tempId,
      conversation_id: id,
      sender_id: user.id,
      content: text.trim(),
      type: 'text',
      media_url: null,
      file_name: null,
      file_size: null,
      duration_seconds: null,
      is_deleted: false,
      reply_to_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender: user as MessageWithSender['sender'],
    }
    addMessage(id, tempMsg)
    socket.emit('message:send', { conversationId: id, content: text.trim(), type: 'text' })
    setText('')
    socket.emit('typing:stop', { conversationId: id })
  }

  async function sendImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
    if (result.canceled || !result.assets[0] || !user?.id) return
    try {
      const { url, key } = await getPresignedUrl(`msg-${Date.now()}.jpg`, 'image/jpeg')
      const blob = await fetch(result.assets[0].uri).then((r) => r.blob())
      await fetch(url, { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/jpeg' } })
      const socket = getSocket(user.id)
      socket.emit('message:send', { conversationId: id, type: 'image', media_url: key })
    } catch {
      Alert.alert('Error', 'Failed to send image')
    }
  }

  function handleCall(type: 'audio' | 'video') {
    if (!otherUser) return
    startCall(otherUser.id, id, type)
  }

  const renderMessage = useCallback(({ item }: { item: MessageWithSender }) => (
    <MessageBubble message={item} isOwn={item.sender_id === user?.id} />
  ), [user?.id])

  if (isLoading && messages.length === 0) return <LoadingSpinner />

  const headerName = otherUser?.full_name ?? otherUser?.username ?? conversation?.name ?? 'Chat'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0A1E' }} edges={['top']}>
      <View className="flex-row items-center px-4 py-3 border-b border-dark-border gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-purple-400 text-base mr-1">←</Text>
        </TouchableOpacity>
        {otherUser && (
          <TouchableOpacity onPress={() => router.push(`/(main)/profile/${otherUser.username}`)} className="flex-row items-center gap-2 flex-1">
            <Avatar uri={otherUser.avatar_url} name={otherUser.full_name} username={otherUser.username} size={36} />
            <View>
              <Text className="text-white font-semibold text-sm">{headerName}</Text>
            </View>
          </TouchableOpacity>
        )}
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => handleCall('audio')} className="w-8 h-8 items-center justify-center">
            <Text className="text-xl">📞</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCall('video')} className="w-8 h-8 items-center justify-center">
            <Text className="text-xl">📹</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <FlashList
          ref={flashRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          estimatedItemSize={60}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListFooterComponent={
            isTyping ? (
              <View className="px-4 py-2">
                <Text className="text-gray-500 text-sm italic">{otherUser?.username} is typing...</Text>
              </View>
            ) : null
          }
        />
        <View className="flex-row items-end px-3 py-3 gap-2 border-t border-dark-border">
          <TouchableOpacity onPress={sendImage} className="w-9 h-9 items-center justify-center">
            <Text className="text-xl">🖼️</Text>
          </TouchableOpacity>
          <TextInput
            value={text}
            onChangeText={handleTextChange}
            placeholder="Message..."
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-sm bg-dark-card rounded-2xl px-4 py-2.5 max-h-28"
            multiline
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!text.trim()}
            className="w-9 h-9 items-center justify-center bg-purple-600 rounded-full"
            style={{ opacity: text.trim() ? 1 : 0.4 }}
          >
            <Text className="text-white text-sm">▶</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}