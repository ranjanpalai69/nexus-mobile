import React, { useState } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { forgotPasswordApi } from '@/lib/utils/otp'

const schema = z.object({ email: z.string().email('Invalid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit({ email }: FormData) {
    setLoading(true)
    try {
      await forgotPasswordApi(email)
      setSent(true)
    } catch {
      Alert.alert('Error', 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    const email = getValues('email')
    return (
      <View className="flex-1 bg-dark-bg px-6 pt-20 pb-10">
        <Text className="text-white font-bold text-3xl mb-2">Check your email</Text>
        <Text className="text-gray-400 text-base mb-6">
          We sent a 6-digit code to <Text className="text-purple-400">{email}</Text>
        </Text>
        <Button title="Enter reset code" onPress={() => router.push({ pathname: '/(auth)/reset-password', params: { email } })} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-dark-bg">
      <View className="flex-1 px-6 pt-20 pb-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Text className="text-purple-400 text-base">← Back</Text>
        </TouchableOpacity>

        <Text className="text-white font-bold text-3xl mb-2">Forgot password?</Text>
        <Text className="text-gray-400 text-base mb-8">Enter your email and we'll send you a code.</Text>

        <Controller control={control} name="email" render={({ field: { onChange, value, onBlur } }) => (
          <Input label="Email" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        )} />

        <Button title="Send Reset Code" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  )
}
