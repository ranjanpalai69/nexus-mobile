import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import type { ConversationWithDetails } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils/helpers'

interface ConversationItemProps {
  conversation: ConversationWithDetails
  currentUserId: string
  onPress: () => void
}

export function ConversationItem({ conversation, currentUserId, onPress }: ConversationItemProps) {
  const other = conversation.participants.find((p) => p.user_id !== currentUserId)
  const name = conversation.is_group
    ? (conversation.name ?? 'Group')
    : (other?.profile.full_name ?? other?.profile.username ?? 'Unknown')
  const avatar = conversation.is_group ? conversation.avatar_url : other?.profile.avatar_url
  const username = other?.profile.username ?? ''
  const unread = (conversation.unread_count ?? 0) > 0

  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center px-4 py-3 gap-3" activeOpacity={0.7}>
      <Avatar uri={avatar} name={name} username={username} size={52} />
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between">
          <Text className="text-white font-semibold text-sm" numberOfLines={1}>{name}</Text>
          <Text className="text-gray-500 text-xs ml-2 shrink-0">
            {conversation.last_message_at ? formatRelativeTime(conversation.last_message_at) : ''}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text className={`text-sm flex-1 ${unread ? 'text-white font-medium' : 'text-gray-500'}`} numberOfLines={1}>
            {conversation.last_message_preview ?? 'No messages yet'}
          </Text>
          {unread && (
            <View className="ml-2 bg-purple-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
              <Text className="text-white text-xs font-bold">{conversation.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}
