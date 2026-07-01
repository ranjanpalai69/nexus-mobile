import React, { useState } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { supabase } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit({ email, password }: FormData) {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        Alert.alert('Login Failed', error.message)
      }
    } catch {
      Alert.alert('Error', 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-dark-bg">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 px-6 pt-20 pb-10">
          <View className="items-center mb-10">
            <Logo width={160} height={46} />
            <Text className="text-gray-400 text-base mt-4">Welcome back</Text>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
              />
            )}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} className="items-end mb-6 -mt-2">
            <Text className="text-purple-400 text-sm">Forgot password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} />

          <View className="flex-row justify-center mt-6 gap-1">
            <Text className="text-gray-400">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-purple-400 font-semibold">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
