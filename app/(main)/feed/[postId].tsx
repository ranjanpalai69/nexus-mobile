import { useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { fetchPost, likePost, unlikePost, fetchComments, createComment } from '@/lib/api/posts'
import { useAuthStore } from '@/store/authStore'
import { PostCard } from '@/components/feed/PostCard'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatRelativeTime } from '@/lib/utils/helpers'
import type { CommentWithDetails } from '@/types/database'

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>()
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [comment, setComment] = useState('')

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  })

  const { data: comments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
  })

  const likeMutation = useMutation({
    mutationFn: ({ liked }: { liked: boolean }) =>
      liked ? unlikePost(postId) : likePost(postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['post', postId] }),
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => createComment(postId, content),
    onSuccess: () => {
      setComment('')
      qc.invalidateQueries({ queryKey: ['comments', postId] })
    },
  })

  if (isLoading || !post) return <LoadingSpinner />

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0F0A1E' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#2A1F45' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={{ color: '#F9FAFB', fontWeight: '700', fontSize: 17, marginLeft: 12 }}>Post</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <PostCard
          post={post}
          onLike={() => likeMutation.mutate({ liked: post.is_liked })}
          onSave={() => {}}
          onComment={() => {}}
          onProfilePress={(username) => router.push(`/(main)/profile/${username}`)}
        />

        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Text style={{ color: '#6B7280', fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {comments?.length ?? 0} Comments
          </Text>

          {(comments ?? []).map((c: CommentWithDetails) => (
            <View key={c.id} style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <Avatar uri={c.author?.avatar_url} name={c.author?.full_name} username={c.author?.username ?? ''} size={36} />
              <View style={{ flex: 1, backgroundColor: '#1A1030', borderRadius: 12, padding: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: '#F9FAFB', fontWeight: '600', fontSize: 13 }}>{c.author?.full_name || c.author?.username}</Text>
                  <Text style={{ color: '#6B7280', fontSize: 11 }}>{formatRelativeTime(c.created_at)}</Text>
                </View>
                <Text style={{ color: '#D1D5DB', fontSize: 14, lineHeight: 19 }}>{c.content}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Comment input */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#2A1F45', gap: 10 }}>
        <Avatar uri={user?.avatar_url} name={user?.full_name} username={user?.username ?? ''} size={34} />
        <TextInput
          style={{ flex: 1, backgroundColor: '#1A1030', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, color: '#F9FAFB', fontSize: 14 }}
          placeholder="Add a comment..."
          placeholderTextColor="#4A3F6B"
          value={comment}
          onChangeText={setComment}
        />
        <TouchableOpacity
          onPress={() => commentMutation.mutate(comment.trim())}
          disabled={!comment.trim() || commentMutation.isPending}
          style={{ padding: 8 }}
        >
          <Ionicons name="send" size={20} color={comment.trim() ? '#9333EA' : '#4A3F6B'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
