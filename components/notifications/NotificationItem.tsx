import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import type { NotificationWithActor } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils/helpers'

interface NotificationItemProps {
  notification: NotificationWithActor
  onPress: (notification: NotificationWithActor) => void
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'like_post':
    case 'like_comment': return '♥'
    case 'comment': return '💬'
    case 'reply': return '↩️'
    case 'follow': return '👤'
    case 'mention': return '@'
    case 'message': return '✉️'
    default: return '🔔'
  }
}

function getNotificationText(notification: NotificationWithActor): string {
  const actor = notification.actor?.full_name ?? notification.actor?.username ?? 'Someone'
  switch (notification.type) {
    case 'like_post': return `${actor} liked your post`
    case 'like_comment': return `${actor} liked your comment`
    case 'comment': return `${actor} commented on your post`
    case 'reply': return `${actor} replied to your comment`
    case 'follow': return `${actor} started following you`
    case 'mention': return `${actor} mentioned you`
    case 'message': return `${actor} sent you a message`
    default: return notification.message ?? 'New notification'
  }
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className={`flex-row items-center px-4 py-3 gap-3 ${!notification.is_read ? 'bg-purple-500/5' : ''}`}
      activeOpacity={0.7}
    >
      <View className="relative">
        <Avatar
          uri={notification.actor?.avatar_url}
          name={notification.actor?.full_name ?? null}
          username={notification.actor?.username ?? ''}
          size={44}
        />
        <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-dark-card items-center justify-center">
          <Text style={{ fontSize: 10 }}>{getNotificationIcon(notification.type)}</Text>
        </View>
      </View>
      <View className="flex-1">
        <Text className="text-gray-200 text-sm leading-5">{getNotificationText(notification)}</Text>
        <Text className="text-gray-500 text-xs mt-0.5">{formatRelativeTime(notification.created_at)}</Text>
      </View>
      {!notification.is_read && (
        <View className="w-2 h-2 rounded-full bg-purple-500" />
      )}
    </TouchableOpacity>
  )
}
