import React, { useRef, useCallback } from 'react'
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import { Avatar } from '@/components/ui/Avatar'
import type { CommentWithDetails } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils/helpers'
import { COLORS } from '@/constants/theme'

interface PostActionsProps {
  postId: string
  comments: CommentWithDetails[]
  isLoading: boolean
  onSubmitComment: (content: string) => void
  currentUser: { avatar_url: string | null; full_name: string | null; username: string }
  bottomSheetRef: React.RefObject<BottomSheet>
}

export function PostActions({ comments, isLoading, onSubmitComment, currentUser, bottomSheetRef }: PostActionsProps) {
  const [text, setTextState] = React.useState('')
  const snapPoints = React.useMemo(() => ['50%', '90%'], [])

  function handleSubmit() {
    if (!text.trim()) return
    onSubmitComment(text.trim())
    setTextState('')
  }

  const renderComment = useCallback(({ item }: { item: CommentWithDetails }) => (
    <View className="flex-row px-4 py-3 gap-3">
      <Avatar uri={item.author.avatar_url} name={item.author.full_name} username={item.author.username} size={36} />
      <View className="flex-1">
        <Text className="text-white text-sm font-semibold">{item.author.full_name || item.author.username}</Text>
        <Text className="text-gray-300 text-sm mt-0.5">{item.content}</Text>
        <Text className="text-gray-600 text-xs mt-1">{formatRelativeTime(item.created_at)}</Text>
      </View>
    </View>
  ), [])

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: '#1A1030' }}
      handleIndicatorStyle={{ backgroundColor: '#6B7280' }}
    >
      <Text className="text-white font-semibold text-base px-4 py-2">Comments</Text>
      <BottomSheetScrollView>
        {isLoading ? (
          <ActivityIndicator color={COLORS.purple} className="mt-8" />
        ) : (
          <FlashList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            estimatedItemSize={70}
            scrollEnabled={false}
          />
        )}
      </BottomSheetScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-row items-center px-4 py-3 gap-3 border-t border-dark-border">
          <Avatar uri={currentUser.avatar_url} name={currentUser.full_name} username={currentUser.username} size={32} />
          <TextInput
            value={text}
            onChangeText={setTextState}
            placeholder="Add a comment..."
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-sm py-2"
            multiline
          />
          {text.trim() && (
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.7}>
              <Text className="text-purple-400 font-semibold">Post</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  )
}
