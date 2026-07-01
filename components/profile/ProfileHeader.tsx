import React from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/database'
import { formatCount } from '@/lib/utils/helpers'
import { GRADIENT_COLORS } from '@/constants/theme'

const { width } = Dimensions.get('window')

interface ProfileHeaderProps {
  profile: Profile & { is_following?: boolean }
  isOwn: boolean
  onFollow: () => void
  onFollowersPress: () => void
  onFollowingPress: () => void
  onMessagePress?: () => void
  onEditPress?: () => void
}

export function ProfileHeader({ profile, isOwn, onFollow, onFollowersPress, onFollowingPress, onMessagePress, onEditPress }: ProfileHeaderProps) {
  return (
    <View>
      <View style={{ width, height: 140 }}>
        {profile.cover_url ? (
          <Image source={{ uri: profile.cover_url }} style={{ width, height: 140 }} contentFit="cover" />
        ) : (
          <LinearGradient colors={GRADIENT_COLORS as unknown as string[]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width, height: 140 }} />
        )}
      </View>

      <View className="px-4 -mt-12 mb-4">
        <View className="flex-row items-end justify-between mb-3">
          <Avatar uri={profile.avatar_url} name={profile.full_name} username={profile.username} size={80} showRing />
          {isOwn ? (
            <Button title="Edit Profile" variant="outline" size="sm" onPress={onEditPress} style={{ height: 36 }} />
          ) : (
            <View className="flex-row gap-2">
              {onMessagePress && (
                <Button title="Message" variant="outline" size="sm" onPress={onMessagePress} style={{ height: 36 }} />
              )}
              <Button
                title={profile.is_following ? 'Following' : 'Follow'}
                variant={profile.is_following ? 'outline' : 'gradient'}
                size="sm"
                onPress={onFollow}
                style={{ height: 36 }}
              />
            </View>
          )}
        </View>

        <Text className="text-white text-xl font-bold">{profile.full_name ?? profile.username}</Text>
        <Text className="text-gray-500 text-sm mb-2">@{profile.username}</Text>

        {profile.bio && <Text className="text-gray-300 text-sm mb-3">{profile.bio}</Text>}

        {profile.location && (
          <Text className="text-gray-500 text-xs mb-1">📍 {profile.location}</Text>
        )}

        <View className="flex-row gap-6 mt-3">
          <TouchableOpacity onPress={onFollowersPress} className="items-center">
            <Text className="text-white font-bold text-base">{formatCount(profile.followers_count)}</Text>
            <Text className="text-gray-500 text-xs">Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onFollowingPress} className="items-center">
            <Text className="text-white font-bold text-base">{formatCount(profile.following_count)}</Text>
            <Text className="text-gray-500 text-xs">Following</Text>
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-white font-bold text-base">{formatCount(profile.posts_count)}</Text>
            <Text className="text-gray-500 text-xs">Posts</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
