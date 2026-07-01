import React, { useRef, useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, RefreshControl, Modal } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import BottomSheet from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import Toast from 'react-native-toast-message'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { PostCard } from '@/components/feed/PostCard'
import { PostActions } from '@/components/feed/PostActions'
import { CreatePostSheet } from '@/components/feed/CreatePostSheet'
import { StoriesBar } from '@/components/stories/StoriesBar'
import { StoryViewer } from '@/components/stories/StoryViewer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { fetchFeed, likePost, unlikePost, savePost, unsavePost, createPost, fetchComments, createComment } from '@/lib/api/posts'
import { fetchStories } from '@/lib/api/stories'
import { useAuthStore } from '@/store/authStore'
import type { PostWithDetails, CommentWithDetails, StoryGroup } from '@/types/database'
import { Logo } from '@/components/ui/Logo'

export default function FeedScreen() {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const commentsRef = useRef<BottomSheet>(null)
  const createPostRef = useRef<BottomSheet>(null)
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const [storyGroupIndex, setStoryGroupIndex] = useState<number | null>(null)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({})

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => fetchFeed(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.length === 10 ? pages.length : undefined,
  })

  const { data: storyGroups = [] } = useInfiniteQuery({
    queryKey: ['stories'],
    queryFn: () => fetchStories(),
    initialPageParam: 0,
    getNextPageParam: () => undefined,
    select: (d) => d.pages[0] as StoryGroup[],
  })

  const { data: comments = [], isLoading: commentsLoading } = useInfiniteQuery({
    queryKey: ['comments', activePostId],
    queryFn: () => fetchComments(activePostId!),
    initialPageParam: 0,
    getNextPageParam: () => undefined,
    enabled: !!activePostId,
    select: (d) => d.pages.flat() as CommentWithDetails[],
  })

  const likeMutation = useMutation({
    mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
      liked ? likePost(postId) : unlikePost(postId),
  })

  const saveMutation = useMutation({
    mutationFn: ({ postId, saved }: { postId: string; saved: boolean }) =>
      saved ? savePost(postId) : unsavePost(postId),
  })

  const createPostMutation = useMutation({
    mutationFn: ({ content, mediaUrl }: { content: string; mediaUrl?: string }) => createPost(content, mediaUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      Toast.show({ type: 'success', text1: 'Post created!' })
    },
  })

  const commentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => createComment(postId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', activePostId] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })

  const posts = data?.pages.flat() ?? []

  function handleLike(postId: string) {
    const post = posts.find((p) => p.id === postId)
    const currentlyLiked = likedPosts[postId] ?? post?.is_liked ?? false
    setLikedPosts((prev) => ({ ...prev, [postId]: !currentlyLiked }))
    likeMutation.mutate({ postId, liked: !currentlyLiked })
  }

  function handleSave(postId: string) {
    const post = posts.find((p) => p.id === postId)
    const currentlySaved = savedPosts[postId] ?? post?.is_saved ?? false
    setSavedPosts((prev) => ({ ...prev, [postId]: !currentlySaved }))
    saveMutation.mutate({ postId, saved: !currentlySaved })
  }

  function handleComment(postId: string) {
    setActivePostId(postId)
    commentsRef.current?.expand()
  }

  const renderPost = useCallback(({ item }: { item: PostWithDetails }) => (
    <PostCard
      post={{
        ...item,
        is_liked: likedPosts[item.id] ?? item.is_liked,
        is_saved: savedPosts[item.id] ?? item.is_saved,
      }}
      onLike={handleLike}
      onSave={handleSave}
      onComment={handleComment}
      onProfilePress={(username) => router.push(`/(main)/profile/${username}`)}
      onPress={(postId) => router.push(`/(main)/feed/${postId}`)}
    />
  ), [likedPosts, savedPosts])

  if (isLoading) return <LoadingSpinner />

  return (
    <ScreenContainer edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-dark-border">
        <Logo width={100} height={30} />
        <TouchableOpacity onPress={() => createPostRef.current?.expand()} className="bg-purple-600 rounded-full w-8 h-8 items-center justify-center">
          <Text className="text-white text-xl font-light">+</Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        estimatedItemSize={350}
        ListHeaderComponent={
          storyGroups.length > 0 ? (
            <StoriesBar
              storyGroups={storyGroups}
              onStoryPress={(idx) => setStoryGroupIndex(idx)}
              onAddStory={() => {}}
              currentUserId={user?.id}
            />
          ) : null
        }
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#9333EA" />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20">
            <Text className="text-gray-500 text-base">No posts yet. Follow some people!</Text>
          </View>
        }
      />

      {storyGroupIndex !== null && (
        <Modal visible animationType="fade" statusBarTranslucent>
          <StoryViewer
            groups={storyGroups}
            initialGroupIndex={storyGroupIndex}
            onClose={() => setStoryGroupIndex(null)}
          />
        </Modal>
      )}

      <PostActions
        postId={activePostId ?? ''}
        comments={comments}
        isLoading={commentsLoading}
        onSubmitComment={(content) => activePostId && commentMutation.mutate({ postId: activePostId, content })}
        currentUser={{ avatar_url: user?.avatar_url ?? null, full_name: user?.full_name ?? null, username: user?.username ?? '' }}
        bottomSheetRef={commentsRef}
      />

      <CreatePostSheet
        bottomSheetRef={createPostRef}
        onSubmit={(content, mediaUrl) => createPostMutation.mutate({ content, mediaUrl })}
        isLoading={createPostMutation.isPending}
      />
    </ScreenContainer>
  )
}
