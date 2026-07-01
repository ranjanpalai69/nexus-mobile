import { useCallback } from 'react'
import { View, RefreshControl } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { router, useLocalSearchParams } from 'expo-router'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchProfile, fetchUserPosts, followUser, unfollowUser, startConversation as startConv } from '@/lib/api/profile'
import { likePost, unlikePost } from '@/lib/api/posts'
import { startConversation } from '@/lib/api/messages'
import { useAuthStore } from '@/store/authStore'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { PostCard } from '@/components/feed/PostCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { PostWithDetails } from '@/types/database'

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const qc = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  const { data: profile, isLoading: loadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfile(username),
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch: refetchPosts, isRefetching } =
    useInfiniteQuery({
      queryKey: ['userPosts', username],
      queryFn: ({ pageParam = 0 }) => fetchUserPosts(username, pageParam as number),
      getNextPageParam: (last, all) => (last.length < 10 ? undefined : all.length),
      initialPageParam: 0,
      enabled: !!username,
    })

  const followMutation = useMutation({
    mutationFn: () =>
      profile?.is_following ? unfollowUser(username) : followUser(username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', username] })
    },
  })

  const likeMutation = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? unlikePost(id) : likePost(id),
  })

  const posts = data?.pages.flat() ?? []
  const isOwn = currentUser?.username === username

  const handleMessage = async () => {
    if (!profile) return
    const conv = await startConversation(profile.id)
    router.push(`/(main)/messages/${conv.id}`)
  }

  const renderItem = useCallback(({ item }: { item: PostWithDetails }) => (
    <PostCard
      post={item}
      onLike={(id) => likeMutation.mutate({ id, liked: item.is_liked })}
      onSave={() => {}}
      onComment={(id) => router.push(`/(main)/feed/${id}`)}
      onProfilePress={(uname) => router.push(`/(main)/profile/${uname}`)}
      onPress={(id) => router.push(`/(main)/feed/${id}`)}
    />
  ), [])

  if (loadingProfile || !profile) return <LoadingSpinner />

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0A1E' }}>
      <FlashList
        data={posts}
        renderItem={renderItem}
        estimatedItemSize={350}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <ProfileHeader
            profile={profile}
            isOwn={isOwn}
            onFollow={() => followMutation.mutate()}
            onFollowersPress={() => {}}
            onFollowingPress={() => {}}
            onMessagePress={handleMessage}
            onEditPress={() => router.push('/(main)/profile/settings')}
          />
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { refetchProfile(); refetchPosts() }} tintColor="#9333EA" />}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage() }}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
