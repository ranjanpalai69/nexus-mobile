import React, { useState } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { OtpInput } from '@/components/ui/OtpInput'
import { resetPasswordApi } from '@/lib/utils/otp'

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type FormData = z.infer<typeof schema>

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  })

  async function onSubmit({ password }: FormData) {
    if (code.length !== 6) {
      Alert.alert('Missing code', 'Please enter the 6-digit code from your email')
      return
    }
    setLoading(true)
    try {
      await resetPasswordApi(email, code, password)
      Alert.alert('Success', 'Password reset! Please log in.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ])
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-dark-bg">
      <View className="flex-1 px-6 pt-20 pb-10">
        <TouchableOpacity onPress={() => router.back()} className="mb-8">
          <Text className="text-purple-400 text-base">← Back</Text>
        </TouchableOpacity>

        <View className="items-center mb-8">
          <Logo width={140} height={40} />
        </View>
        <Text className="text-white font-bold text-3xl mb-2">Reset Password</Text>
        <Text className="text-gray-400 text-base mb-8">Enter the code from your email and choose a new password.</Text>

        <Text className="text-gray-400 text-sm mb-3 font-medium">Verification Code</Text>
        <OtpInput value={code} onChange={setCode} length={6} />

        <View className="mt-6">
          <Controller control={control} name="password" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="New Password" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} secureTextEntry />
          )} />
          <Controller control={control} name="confirm" render={({ field: { onChange, value, onBlur } }) => (
            <Input label="Confirm Password" value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirm?.message} secureTextEntry />
          )} />
        </View>

        <Button title="Reset Password" onPress={handleSubmit(onSubmit)} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  )
}
