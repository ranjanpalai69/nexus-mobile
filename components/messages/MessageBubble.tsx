import React from 'react'
import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import type { MessageWithSender } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils/helpers'

interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
  showAvatar?: boolean
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  if (message.is_deleted) {
    return (
      <View className={`flex-row ${isOwn ? 'justify-end' : 'justify-start'} mb-2 px-4`}>
        <Text className="text-gray-600 text-sm italic">Message deleted</Text>
      </View>
    )
  }

  if (message.type === 'system') {
    return (
      <View className="items-center mb-3 px-4">
        <Text className="text-gray-600 text-xs">{message.content}</Text>
      </View>
    )
  }

  return (
    <View className={`flex-row ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5 px-4`}>
      <View style={{ maxWidth: '75%' }}>
        {message.reply_to && (
          <View className={`rounded-lg px-3 py-1.5 mb-1 border-l-2 border-purple-400 ${isOwn ? 'bg-purple-900/30' : 'bg-dark-card'}`}>
            <Text className="text-gray-400 text-xs" numberOfLines={1}>
              {message.reply_to.content ?? 'Media'}
            </Text>
          </View>
        )}
        <View className={`rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-purple-600 rounded-tr-sm' : 'bg-dark-card rounded-tl-sm'}`}>
          {message.type === 'image' && message.media_url && (
            <Image
              source={{ uri: message.media_url }}
              style={{ width: 200, height: 200, borderRadius: 12, marginBottom: message.content ? 6 : 0 }}
              contentFit="cover"
            />
          )}
          {message.content && (
            <Text className="text-white text-sm leading-5">{message.content}</Text>
          )}
          {message.type === 'audio' && (
            <View className="flex-row items-center gap-2 py-1">
              <Text className="text-2xl">🎵</Text>
              <View className="flex-1 h-1 bg-white/30 rounded-full">
                <View className="w-1/3 h-1 bg-white rounded-full" />
              </View>
              <Text className="text-white text-xs">{message.duration_seconds ?? 0}s</Text>
            </View>
          )}
        </View>
        <Text className={`text-gray-600 text-xs mt-0.5 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatRelativeTime(message.created_at)}
        </Text>
      </View>
    </View>
  )
}
