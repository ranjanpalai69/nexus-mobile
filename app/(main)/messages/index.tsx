import { useEffect } from 'react'
import { View, Text, RefreshControl } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { fetchConversations } from '@/lib/api/messages'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { ConversationItem } from '@/components/messages/ConversationItem'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useSocket } from '@/hooks/useSocket'
import type { ConversationWithDetails } from '@/types/database'

export default function MessagesScreen() {
  useSocket()
  const user = useAuthStore((s) => s.user)
  const { conversations, setConversations } = useChatStore()

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  })

  useEffect(() => {
    if (data) setConversations(data)
  }, [data])

  if (isLoading) return <LoadingSpinner />

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0A1E' }}>
      <View style={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2A1F45' }}>
        <Text style={{ color: '#F9FAFB', fontSize: 22, fontWeight: '700' }}>Messages</Text>
      </View>

      <FlashList
        data={conversations}
        renderItem={({ item }: { item: ConversationWithDetails }) => (
          <ConversationItem
            conversation={item}
            currentUserId={user?.id ?? ''}
            onPress={() => router.push(`/(main)/messages/${item.id}`)}
          />
        )}
        estimatedItemSize={80}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9333EA" />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#1A1030', marginLeft: 80 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ color: '#4A3F6B', fontSize: 32, marginBottom: 12 }}>💬</Text>
            <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>No conversations yet</Text>
            <Text style={{ color: '#4A3F6B', fontSize: 14, marginTop: 4 }}>Find people in Explore to start chatting</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
