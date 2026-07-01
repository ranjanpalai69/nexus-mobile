import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as ImagePicker from 'expo-image-picker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/store/authStore'
import { updateProfile } from '@/lib/api/profile'
import { getPresignedUrl } from '@/lib/api/posts'
import { supabase } from '@/lib/supabase/client'

const schema = z.object({
  full_name: z.string().max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(200).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  location: z.string().max(100).optional(),
})
type FormData = z.infer<typeof schema>

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user)
  const { updateProfile: updateStore, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [avatarUri, setAvatarUri] = useState<string | null>(null)

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      username: user?.username ?? '',
      bio: user?.bio ?? '',
      website: user?.website ?? '',
      location: user?.location ?? '',
    },
  })

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 })
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri)
    }
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      let avatar_url = user?.avatar_url
      if (avatarUri) {
        const { url, key } = await getPresignedUrl(`avatar-${user?.id}-${Date.now()}.jpg`, 'image/jpeg')
        const blob = await fetch(avatarUri).then((r) => r.blob())
        await fetch(url, { method: 'PUT', body: blob, headers: { 'Content-Type': 'image/jpeg' } })
        avatar_url = key
      }
      const updated = await updateProfile({ ...data, avatar_url })
      updateStore(updated)
      Alert.alert('Success', 'Profile updated!')
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut()
          logout()
          router.replace('/(auth)/login')
        }
      },
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0A1E' }} edges={['top']}>
      <View className="flex-row items-center px-4 py-3 border-b border-dark-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-purple-400 text-base">? Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-semibold text-lg">Edit Profile</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View className="items-center mb-6">
            <TouchableOpacity onPress={pickAvatar}>
              <Avatar
                uri={avatarUri ?? user?.avatar_url}
                name={user?.full_name ?? null}
                username={user?.username ?? ''}
                size={88}
              />
              <View className="absolute bottom-0 right-0 bg-purple-600 rounded-full w-7 h-7 items-center justify-center">
                <Text className="text-white text-xs">??</Text>
              </View>
            </TouchableOpacity>
            <Text className="text-gray-500 text-xs mt-2">Tap to change photo</Text>
          </View>

          <Controller control={control} name="full_name" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Full Name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.full_name?.message} />
          )} />
          <Controller control={control} name="username" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Username" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.username?.message} autoCapitalize="none" autoCorrect={false} />
          )} />
          <Controller control={control} name="bio" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Bio" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.bio?.message} multiline numberOfLines={3} />
          )} />
          <Controller control={control} name="website" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Website" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.website?.message} keyboardType="url" autoCapitalize="none" />
          )} />
          <Controller control={control} name="location" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Location" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.location?.message} />
          )} />

          <Button title="Save Changes" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: 8 }} />

          <View className="mt-8 pt-6 border-t border-dark-border">
            <Button title="Sign Out" variant="outline" onPress={handleLogout} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
