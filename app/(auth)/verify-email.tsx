import React, { useState } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { OtpInput } from '@/components/ui/OtpInput'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { verifyEmailApi, resendOtpApi } from '@/lib/utils/otp'
import { supabase } from '@/lib/supabase/client'

export default function VerifyEmailScreen() {
  const { email, password } = useLocalSearchParams<{ email: string; password: string }>()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleVerify(otp: string) {
    if (otp.length !== 6) return
    setLoading(true)
    try {
      await verifyEmailApi(email, otp)
      if (password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          router.replace('/(auth)/login')
        }
      } else {
        router.replace('/(auth)/login')
      }
    } catch (err) {
      Alert.alert('Verification Failed', err instanceof Error ? err.message : 'Invalid code')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      await resendOtpApi(email, 'email_verification')
      Alert.alert('Code sent', 'A new verification code has been sent to your email')
    } catch {
      Alert.alert('Error', 'Failed to resend code')
    } finally {
      setResending(false)
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
        <Text className="text-white font-bold text-3xl mb-2">Verify Email</Text>
        <Text className="text-gray-400 text-base mb-2">
          Enter the 6-digit code sent to
        </Text>
        <Text className="text-purple-400 text-base mb-10">{email}</Text>

        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={handleVerify}
          length={6}
        />

        <Button
          title={loading ? 'Verifying...' : 'Verify'}
          onPress={() => handleVerify(code)}
          loading={loading}
          disabled={code.length !== 6}
          style={{ marginTop: 32 }}
        />

        <View className="flex-row justify-center mt-6 gap-1">
          <Text className="text-gray-400">Didn't receive the code?</Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text className="text-purple-400 font-semibold">{resending ? 'Sending...' : 'Resend'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
