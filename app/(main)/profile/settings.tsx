import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { updateProfile } from '@/lib/api/profile'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Profile } from '@/types/database'

type Form = {
  full_name: string
  bio: string
  website: string
  location: string
}

export default function SettingsScreen() {
  const qc = useQueryClient()
  const { user, logout, updateProfile: updateStore } = useAuthStore()

  const { control, handleSubmit, formState: { isDirty } } = useForm<Form>({
    defaultValues: {
      full_name: user?.full_name ?? '',
      bio: user?.bio ?? '',
      website: user?.website ?? '',
      location: user?.location ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: Partial<Profile>) => updateProfile(data),
    onSuccess: (updated) => {
      updateStore(updated)
      qc.invalidateQueries({ queryKey: ['profile', 'me'] })
      Toast.show({ type: 'success', text1: 'Profile updated!' })
    },
    onError: () => Toast.show({ type: 'error', text1: 'Failed to update profile' }),
  })

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          logout()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0A1E' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#2A1F45' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <Text style={{ color: '#F9FAFB', fontWeight: '700', fontSize: 18, marginLeft: 12 }}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Controller control={control} name="full_name"
          render={({ field: { onChange, value } }) => (
            <Input label="Full Name" value={value} onChangeText={onChange} placeholder="Your name"
              icon={<Ionicons name="person-outline" size={18} color="#7C6FAD" />} />
          )} />

        <Controller control={control} name="bio"
          render={({ field: { onChange, value } }) => (
            <Input label="Bio" value={value} onChangeText={onChange} placeholder="Tell people about yourself"
              multiline numberOfLines={3}
              icon={<Ionicons name="document-text-outline" size={18} color="#7C6FAD" />} />
          )} />

        <Controller control={control} name="website"
          render={({ field: { onChange, value } }) => (
            <Input label="Website" value={value} onChangeText={onChange} placeholder="https://yoursite.com"
              keyboardType="url"
              icon={<Ionicons name="link-outline" size={18} color="#7C6FAD" />} />
          )} />

        <Controller control={control} name="location"
          render={({ field: { onChange, value } }) => (
            <Input label="Location" value={value} onChangeText={onChange} placeholder="Where you're from"
              icon={<Ionicons name="location-outline" size={18} color="#7C6FAD" />} />
          )} />

        <Button
          title="Save Changes"
          onPress={handleSubmit((data) => mutation.mutate(data))}
          loading={mutation.isPending}
          disabled={!isDirty}
          style={{ marginTop: 8 }}
        />

        <View style={{ height: 1, backgroundColor: '#2A1F45', marginVertical: 16 }} />

        <TouchableOpacity
          onPress={handleLogout}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#1A1030', borderRadius: 12 }}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={{ color: '#EF4444', fontSize: 15, fontWeight: '600' }}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
