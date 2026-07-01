import React, { useState } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { signupApi } from '@/lib/utils/otp'

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  username: z.string().min(3, 'Min 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
})
type FormData = z.infer<typeof schema>

export default function SignupScreen() {
  const [loading, setLoading] = useState(false)
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', username: '', email: '', password: '' },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await signupApi(data)
      router.push({ pathname: '/(auth)/verify-email', params: { email: data.email } })
    } catch (err) {
      Alert.alert('Signup Failed', err instanceof Error ? err.message : 'Please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-dark-bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-16 pb-10">
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Text className="text-purple-400 text-base">← Back</Text>
          </TouchableOpacity>

          <View className="items-center mb-8">
            <Logo width={140} height={40} />
          </View>
          <Text className="text-white font-bold text-2xl mb-1">Create account</Text>
          <Text className="text-gray-400 text-sm mb-8">Join the Nexus community</Text>

          <Controller control={control} name="fullName" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Full Name" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.fullName?.message} autoComplete="name" />
          )} />
          <Controller control={control} name="username" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Username" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.username?.message} autoCapitalize="none" autoCorrect={false} />
          )} />
          <Controller control={control} name="email" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Email" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          )} />
          <Controller control={control} name="password" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Password" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} secureTextEntry />
          )} />

          <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} style={{ marginTop: 8 }} />

          <View className="flex-row justify-center mt-6 gap-1">
            <Text className="text-gray-400">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text className="text-purple-400 font-semibold">Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
