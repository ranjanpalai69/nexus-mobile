import { useEffect } from 'react'
import { View, Text, RefreshControl } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '@/lib/api/profile'
import { useNotificationStore } from '@/store/notificationStore'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { NotificationWithActor } from '@/types/database'

export default function NotificationsScreen() {
  const { notifications, setNotifications, markAllRead } = useNotificationStore()

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  })

  useEffect(() => {
    if (data) {
      setNotifications(data)
      markAllRead()
    }
  }, [data])

  if (isLoading) return <LoadingSpinner />

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0A1E' }}>
      <View style={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2A1F45' }}>
        <Text style={{ color: '#F9FAFB', fontSize: 22, fontWeight: '700' }}>Notifications</Text>
      </View>

      <FlashList
        data={notifications}
        renderItem={({ item }: { item: NotificationWithActor }) => <NotificationItem notification={item} />}
        estimatedItemSize={72}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9333EA" />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#1A1030' }} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ color: '#4A3F6B', fontSize: 32, marginBottom: 12 }}>🔔</Text>
            <Text style={{ color: '#6B7280', fontSize: 16, fontWeight: '600' }}>No notifications</Text>
            <Text style={{ color: '#4A3F6B', fontSize: 14, marginTop: 4 }}>We'll notify you when something happens</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
