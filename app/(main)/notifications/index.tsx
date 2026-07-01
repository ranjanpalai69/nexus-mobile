import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, RefreshControl } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { fetchNotifications } from '@/lib/api/profile'
import { useNotificationStore } from '@/store/notificationStore'
import type { NotificationWithActor } from '@/types/database'

export default function NotificationsScreen() {
  const { setNotifications, markAllRead, notifications } = useNotificationStore()

  const { isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const data = await fetchNotifications()
      setNotifications(data)
      return data
    },
  })

  function handleNotificationPress(notification: NotificationWithActor) {
    if (notification.type === 'follow') {
      if (notification.actor?.username) {
        router.push(`/(main)/profile/${notification.actor.username}`)
      }
    } else if (notification.reference_type === 'post' && notification.reference_id) {
      router.push(`/(main)/feed/${notification.reference_id}`)
    } else if (notification.reference_type === 'conversation' && notification.reference_id) {
      router.push(`/(main)/messages/${notification.reference_id}`)
    }
  }

  const renderNotification = useCallback(({ item }: { item: NotificationWithActor }) => (
    <NotificationItem notification={item} onPress={handleNotificationPress} />
  ), [])

  if (isLoading && notifications.length === 0) return <LoadingSpinner />

  return (
    <ScreenContainer edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-dark-border">
        <Text className="text-white font-bold text-xl">Notifications</Text>
        {notifications.some((n) => !n.is_read) && (
          <TouchableOpacity onPress={markAllRead}>
            <Text className="text-purple-400 text-sm">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlashList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        estimatedItemSize={72}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9333EA" />}
        ListEmptyComponent={
          <View className="flex-1 items-center pt-20">
            <Text className="text-gray-500 text-base">No notifications yet</Text>
          </View>
        }
      />
    </ScreenContainer>
  )
}
