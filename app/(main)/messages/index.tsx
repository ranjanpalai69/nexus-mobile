import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, RefreshControl } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { ConversationItem } from '@/components/messages/ConversationItem'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { fetchConversations } from '@/lib/api/messages'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import type { ConversationWithDetails } from '@/types/database'

export default function MessagesScreen() {
  const user = useAuthStore((s) => s.user)
  const { setConversations } = useChatStore()
  const conversations = useChatStore((s) => s.conversations)

  const { isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const data = await fetchConversations()
      setConversations(data)
      return data
    },
  })

  const renderConversation = useCallback(({ item }: { item: ConversationWithDetails }) => (
    <ConversationItem
      conversation={item}
      currentUserId={user?.id ?? ''}
      onPress={() => router.push(`/(main)/messages/${item.id}`)}
    />
  ), [user?.id])

  if (isLoading && conversations.length === 0) return <LoadingSpinner />

  return (
    <ScreenContainer edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-dark-border">
        <Text className="text-white font-bold text-xl">Messages</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/explore')} className="w-8 h-8 items-center justify-center">
          <Text className="text-xl">??</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        estimatedItemSize={76}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9333EA" />}
        ListEmptyComponent={
          <View className="flex-1 items-center pt-20">
            <Text className="text-gray-500 text-base">No conversations yet</Text>
            <TouchableOpacity onPress={() => router.push('/(main)/explore')} className="mt-4">
              <Text className="text-purple-400">Find people to message</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </ScreenContainer>
  )
}
