import React, { useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, RefreshControl, Dimensions, Alert } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { fetchProfile, fetchUserPosts, followUser, unfollowUser } from '@/lib/api/profile'
import { startConversation } from '@/lib/api/messages'
import type { PostWithDetails } from '@/types/database'

const { width } = Dimensions.get('window')
const GRID_SIZE = (width - 4) / 3

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const currentUser = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [following, setFollowing] = useState<boolean | null>(null)

  const { data: profile, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username),
    enabled: !!username,
  })

  const { data: posts = [] } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: () => fetchUserPosts(username),
    enabled: !!username,
  })

  const followMutation = useMutation({
    mutationFn: () => {
      const isFollowing = following ?? profile?.is_following ?? false
      return isFollowing ? unfollowUser(username) : followUser(username)
    },
    onMutate: () => {
      setFollowing((prev) => !(prev ?? profile?.is_following ?? false))
    },
    onError: () => {
      setFollowing(null)
      queryClient.invalidateQueries({ queryKey: ['profile', username] })
    },
  })

  async function handleMessage() {
    if (!profile) return
    try {
      const conv = await startConversation(profile.id)
      router.push(`/(main)/messages/${conv.id}`)
    } catch {
      Alert.alert('Error', 'Could not start conversation')
    }
  }

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
            <Text className="text-gray-600 text-xs px-2 text-center" numberOfLines={3}>{item.content}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }, [])

  if (isLoading || !profile) return <LoadingSpinner />

  const isOwn = currentUser?.id === profile.id
  const displayProfile = { ...profile, is_following: following ?? profile.is_following ?? false }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0A1E' }} edges={['top']}>
      <View className="flex-row items-center px-4 py-3 border-b border-dark-border">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-purple-400 text-base mr-3">← Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-semibold">@{username}</Text>
      </View>
      <FlashList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        estimatedItemSize={GRID_SIZE}
        numColumns={3}
        ListHeaderComponent={
          <ProfileHeader
            profile={displayProfile}
            isOwn={isOwn}
            onFollow={() => followMutation.mutate()}
            onFollowersPress={() => {}}
            onFollowingPress={() => {}}
            onMessagePress={!isOwn ? handleMessage : undefined}
          />
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9333EA" />}
      />
    </SafeAreaView>
  )
}