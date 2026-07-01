import { useCallback } from 'react'
import { View, RefreshControl } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchMe, fetchUserPosts, updateProfile } from '@/lib/api/profile'
import { useAuthStore } from '@/store/authStore'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { PostCard } from '@/components/feed/PostCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { likePost, unlikePost } from '@/lib/api/posts'
import type { PostWithDetails } from '@/types/database'

export default function MyProfileScreen() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const { data: profile, isLoading: loadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchMe,
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch: refetchPosts, isRefetching } =
    useInfiniteQuery({
      queryKey: ['userPosts', user?.username],
      queryFn: ({ pageParam = 0 }) => fetchUserPosts(user?.username ?? '', pageParam as number),
      getNextPageParam: (last, all) => (last.length < 10 ? undefined : all.length),
      initialPageParam: 0,
      enabled: !!user?.username,
    })

  const likeMutation = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? unlikePost(id) : likePost(id),
  })

  const posts = data?.pages.flat() ?? []

  const handleRefresh = useCallback(() => {
    refetchProfile()
    refetchPosts()
  }, [])

  const renderItem = useCallback(({ item }: { item: PostWithDetails }) => (
    <PostCard
      post={item}
      onLike={(id) => likeMutation.mutate({ id, liked: item.is_liked })}
      onSave={() => {}}
      onComment={(id) => router.push(`/(main)/feed/${id}`)}
      onProfilePress={() => {}}
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
            isOwn
            onFollow={() => {}}
            onFollowersPress={() => {}}
            onFollowingPress={() => {}}
            onEditPress={() => router.push('/(main)/profile/settings')}
          />
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#9333EA" />}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage() }}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
