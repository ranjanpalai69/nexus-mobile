import React, { useRef, useState, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image as RNImage, Alert, ActivityIndicator } from 'react-native'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import * as ImagePicker from 'expo-image-picker'
import { Button } from '@/components/ui/Button'
import { COLORS } from '@/constants/theme'
import { getPresignedUrl } from '@/lib/api/posts'

interface CreatePostSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>
  onSubmit: (content: string, mediaUrl?: string) => void
  isLoading: boolean
}

export function CreatePostSheet({ bottomSheetRef, onSubmit, isLoading }: CreatePostSheetProps) {
  const [content, setContent] = useState('')
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const snapPoints = React.useMemo(() => ['60%', '90%'], [])

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri)
    }
  }

  async function handleSubmit() {
    if (!content.trim() && !imageUri) return

    try {
      let mediaUrl: string | undefined

      if (imageUri) {
        setUploading(true)
        const fileName = `post-${Date.now()}.jpg`
        const { url, key } = await getPresignedUrl(fileName, 'image/jpeg')
        const blob = await fetch(imageUri).then((r) => r.blob())
        await fetch(url, { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/jpeg' } })
        mediaUrl = key
        setUploading(false)
      }

      onSubmit(content.trim(), mediaUrl)
      setContent('')
      setImageUri(null)
      bottomSheetRef.current?.close()
    } catch {
      setUploading(false)
      Alert.alert('Error', 'Failed to create post')
    }
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: '#1A1030' }}
      handleIndicatorStyle={{ backgroundColor: '#6B7280' }}
    >
      <BottomSheetScrollView>
        <View className="px-4 pt-2 pb-6">
          <Text className="text-white font-semibold text-lg mb-4">Create Post</Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="What's on your mind?"
            placeholderTextColor="#6B7280"
            className="text-white text-base min-h-[100px]"
            multiline
            autoFocus
          />
          {imageUri && (
            <View className="mt-3 relative">
              <RNImage source={{ uri: imageUri }} className="w-full h-48 rounded-xl" />
              <TouchableOpacity
                onPress={() => setImageUri(null)}
                className="absolute top-2 right-2 bg-black/60 rounded-full w-8 h-8 items-center justify-center"
              >
                <Text className="text-white text-lg">✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity onPress={pickImage} className="flex-row items-center gap-2 py-2 px-3 bg-dark-border rounded-xl">
              <Text className="text-2xl">🖼️</Text>
              <Text className="text-gray-300 text-sm">Photo</Text>
            </TouchableOpacity>
          </View>
          <Button
            title={uploading ? 'Uploading...' : 'Share'}
            onPress={handleSubmit}
            loading={isLoading || uploading}
            disabled={!content.trim() && !imageUri}
            style={{ marginTop: 16 }}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  )
}
