import { useCallback, useState } from 'react'
import { View, RefreshControl } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { fetchFeed, likePost, unlikePost, savePost, unsavePost } from '@/lib/api/posts'
import { fetchStories } from '@/lib/api/stories'
import { PostCard } from '@/components/feed/PostCard'
import { StoriesBar } from '@/components/stories/StoriesBar'
import { CreatePostSheet } from '@/components/feed/CreatePostSheet'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Image } from 'expo-image'
import { LOGO_WHITE } from '@/constants/config'
import type { PostWithDetails } from '@/types/database'

export default function FeedScreen() {
  const qc = useQueryClient()
  const [createVisible, setCreateVisible] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } =
    useInfiniteQuery({
      queryKey: ['feed'],
      queryFn: ({ pageParam = 0 }) => fetchFeed(pageParam as number),
      getNextPageParam: (last, all) => (last.length < 10 ? undefined : all.length),
      initialPageParam: 0,
    })

  const { data: stories } = useInfiniteQuery({
    queryKey: ['stories'],
    queryFn: () => fetchStories(),
    getNextPageParam: () => undefined,
    initialPageParam: 0,
  })

  const likeMutation = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? unlikePost(id) : likePost(id),
    onMutate: ({ id, liked }) => {
      qc.setQueryData(['feed'], (old: any) => ({
        ...old,
        pages: old.pages.map((page: PostWithDetails[]) =>
          page.map((p) => p.id === id ? { ...p, is_liked: !liked, likes_count: p.likes_count + (liked ? -1 : 1) } : p)
        ),
      }))
    },
  })

  const saveMutation = useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      saved ? unsavePost(id) : savePost(id),
    onMutate: ({ id, saved }) => {
      qc.setQueryData(['feed'], (old: any) => ({
        ...old,
        pages: old.pages.map((page: PostWithDetails[]) =>
          page.map((p) => p.id === id ? { ...p, is_saved: !saved } : p)
        ),
      }))
    },
  })

  const posts = data?.pages.flat() ?? []
  const storyGroups = stories?.pages.flat() ?? []

  const renderItem = useCallback(({ item }: { item: PostWithDetails }) => (
    <PostCard
      post={item}
      onLike={(id) => likeMutation.mutate({ id, liked: item.is_liked })}
      onSave={(id) => saveMutation.mutate({ id, saved: item.is_saved ?? false })}
      onComment={(id) => router.push(`/(main)/feed/${id}`)}
      onProfilePress={(username) => router.push(`/(main)/profile/${username}`)}
      onPress={(id) => router.push(`/(main)/feed/${id}`)}
    />
  ), [])

  if (isLoading) return <LoadingSpinner />

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0A1E' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#2A1F45' }}>
        <Image source={{ uri: LOGO_WHITE }} style={{ width: 100, height: 28 }} contentFit="contain" />
        <TouchableOpacity onPress={() => setCreateVisible(true)} style={{ backgroundColor: '#9333EA', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="add" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlashList
        data={posts}
        renderItem={renderItem}
        estimatedItemSize={350}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          storyGroups.length > 0 ? <StoriesBar stories={storyGroups} /> : null
        }
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9333EA" />}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage() }}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
      />

      <CreatePostSheet visible={createVisible} onClose={() => setCreateVisible(false)} onCreated={() => { setCreateVisible(false); refetch() }} />
    </View>
  )
}
