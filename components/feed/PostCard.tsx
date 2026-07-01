import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Avatar } from '@/components/ui/Avatar'
import type { PostWithDetails } from '@/types/database'
import { formatRelativeTime, formatCount } from '@/lib/utils/helpers'
import { GRADIENT_COLORS, COLORS } from '@/constants/theme'

const { width } = Dimensions.get('window')

interface PostCardProps {
  post: PostWithDetails
  onLike: (postId: string) => void
  onSave: (postId: string) => void
  onComment: (postId: string) => void
  onProfilePress: (username: string) => void
  onPress?: (postId: string) => void
}

export function PostCard({ post, onLike, onSave, onComment, onProfilePress, onPress }: PostCardProps) {
  const [localLiked, setLocalLiked] = useState(post.is_liked ?? false)
  const [localCount, setLocalCount] = useState(post.likes_count)

  function handleLike() {
    setLocalLiked(!localLiked)
    setLocalCount(localLiked ? localCount - 1 : localCount + 1)
    onLike(post.id)
  }

  const media = post.media?.[0]

  return (
    <View style={styles.container}>
      <TouchableOpacity
        className="flex-row items-center px-4 pt-4 pb-3"
        onPress={() => onProfilePress(post.author.username)}
        activeOpacity={0.7}
      >
        <Avatar uri={post.author.avatar_url} name={post.author.full_name} username={post.author.username} size={40} />
        <View className="ml-3 flex-1">
          <View className="flex-row items-center gap-1">
            <Text className="text-white font-semibold text-sm">{post.author.full_name || post.author.username}</Text>
            {post.author.is_verified && (
              <View className="w-4 h-4 rounded-full bg-purple-500 items-center justify-center">
                <Text className="text-white text-[8px] font-bold">✓</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-500 text-xs">@{post.author.username} · {formatRelativeTime(post.created_at)}</Text>
        </View>
      </TouchableOpacity>

      {post.content && (
        <TouchableOpacity onPress={() => onPress?.(post.id)} activeOpacity={0.9} className="px-4 pb-3">
          <Text className="text-gray-200 text-sm leading-5">{post.content}</Text>
        </TouchableOpacity>
      )}

      {media && (
        <TouchableOpacity onPress={() => onPress?.(post.id)} activeOpacity={0.95}>
          <Image
            source={{ uri: media.url }}
            style={{ width, height: width * 0.75 }}
            contentFit="cover"
          />
        </TouchableOpacity>
      )}

      <View className="flex-row items-center px-4 py-3 gap-5">
        <TouchableOpacity onPress={handleLike} className="flex-row items-center gap-1.5" activeOpacity={0.7}>
          <Text style={{ fontSize: 20, color: localLiked ? '#E91E8C' : COLORS.muted }}>
            {localLiked ? '♥' : '♡'}
          </Text>
          <Text className="text-gray-400 text-sm">{formatCount(localCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onComment(post.id)} className="flex-row items-center gap-1.5" activeOpacity={0.7}>
          <Text style={{ fontSize: 18, color: COLORS.muted }}>💬</Text>
          <Text className="text-gray-400 text-sm">{formatCount(post.comments_count)}</Text>
        </TouchableOpacity>

        <View className="flex-1" />

        <TouchableOpacity onPress={() => onSave(post.id)} activeOpacity={0.7}>
          <Text style={{ fontSize: 18, color: post.is_saved ? COLORS.purple : COLORS.muted }}>
            {post.is_saved ? '🔖' : '🔖'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F0A1E',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A1F45',
  },
})
