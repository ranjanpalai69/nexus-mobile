import React, { useCallback } from 'react'
import { View, TouchableOpacity, Text, RefreshControl, Dimensions } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { fetchUserPosts } from '@/lib/api/profile'
import { supabase } from '@/lib/supabase/client'
import type { PostWithDetails } from '@/types/database'

const { width } = Dimensions.get('window')
const GRID_SIZE = (width - 4) / 3

export default function OwnProfileScreen() {
  const user = useAuthStore((s) => s.user)

  const { data: posts = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['userPosts', user?.username],
    queryFn: () => fetchUserPosts(user!.username),
    enabled: !!user,
  })

  const renderPost = useCallback(({ item }: { item: PostWithDetails }) => {
    const media = item.media?.[0]
    return (
      <TouchableOpacity
        onPress={() => router.push(`/(main)/feed/${item.id}`)}
        style={{ width: GRID_SIZE, height: GRID_SIZE, margin: 1 }}
      >
        {media ? (
          <Image source={{ uri: media.url }} style={{ width: GRID_SIZE, height: GRID_SIZE }} contentFit="cover" />
        ) : (
          <View style={{ width: GRID_SIZE, height: GRID_SIZE, backgroundColor: '#1A1030', alignItems: 'center', justifyContent: 'center' }}>
            <Text className="text-gray-600 text-xs text-center px-2" numberOfLines={3}>{item.content}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }, [])

  if (!user || isLoading) return <LoadingSpinner />

  return (
    <ScreenContainer edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-dark-border">
        <Text className="text-white font-bold text-xl">Profile</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/profile/settings')}>
          <Text className="text-2xl">??</Text>
        </TouchableOpacity>
      </View>
      <FlashList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        estimatedItemSize={GRID_SIZE}
        numColumns={3}
        ListHeaderComponent={
          <ProfileHeader
            profile={{ ...user, is_following: false }}
            isOwn
            onFollow={() => {}}
            onFollowersPress={() => {}}
            onFollowingPress={() => {}}
            onEditPress={() => router.push('/(main)/profile/settings')}
          />
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9333EA" />}
      />
    </ScreenContainer>
  )
}
