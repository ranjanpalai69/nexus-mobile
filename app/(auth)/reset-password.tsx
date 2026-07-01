import { useRef, useState, useEffect } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { OtpInput } from '@/components/ui/OtpInput'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LOGO_WHITE, API_URL } from '@/constants/config'

const pwSchema = z.object({
  password: z.string().min(8, 'Min 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type PwForm = z.infer<typeof pwSchema>

export default function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>()
  const [step, setStep] = useState<'otp' | 'password'>('otp')
  const [otp, setOtp] = useState('')
  const [validating, setValidating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [successFlash, setSuccessFlash] = useState(false)
  const autoFired = useRef(false)
  const validatedOtp = useRef('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const flashOpacity = useRef(new Animated.Value(0)).current

  const { control, handleSubmit, formState: { errors } } = useForm<PwForm>({ resolver: zodResolver(pwSchema) })

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    const complete = otp.length === 6
    if (!complete) { autoFired.current = false; return }
    if (autoFired.current) return
    autoFired.current = true
    validateOtp(otp)
  }, [otp])

  const showSuccessFlash = () => {
    setSuccessFlash(true)
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(400),
      Animated.timing(flashOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setSuccessFlash(false)
      setStep('password')
    })
  }

  const validateOtp = async (code: string) => {
    setValidating(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/validate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'reset', code }),
      })
      if (!res.ok) {
        Toast.show({ type: 'error', text1: 'Invalid or expired code' })
        setOtp('')
        autoFired.current = false
        return
      }
      validatedOtp.current = code
      showSuccessFlash()
    } catch {
      Toast.show({ type: 'error', text1: 'Connection error.' })
      setOtp('')
      autoFired.current = false
    } finally {
      setValidating(false)
    }
  }

  const startCooldown = () => {
    setCooldown(60)
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (resending || cooldown > 0) return
    setResending(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'reset' }),
      })
      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Code resent!' })
        startCooldown()
        setOtp('')
        autoFired.current = false
      } else {
        Toast.show({ type: 'error', text1: 'Failed to resend.' })
      }
    } finally {
      setResending(false)
    }
  }

  const handleReset = async ({ password }: PwForm) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: validatedOtp.current, password }),
      })
      const result = await res.json()
      if (!res.ok) {
        if (result.error?.includes('expired') || result.error?.includes('invalid')) {
          Toast.show({ type: 'error', text1: 'Code expired. Please restart.' })
          setStep('otp')
          setOtp('')
          validatedOtp.current = ''
          autoFired.current = false
        } else {
          Toast.show({ type: 'error', text1: result.error || 'Reset failed' })
        }
        return
      }
      Toast.show({ type: 'success', text1: 'Password reset! Please sign in.' })
      router.replace('/(auth)/login')
    } catch {
      Toast.show({ type: 'error', text1: 'Connection error.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 32 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Image source={{ uri: LOGO_WHITE }} style={{ width: 140, height: 40 }} contentFit="contain" />
          <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 8 }}>
            {step === 'otp' ? 'Enter reset code' : 'New password'}
          </Text>
          {step === 'otp' && (
            <Text style={{ color: '#7C6FAD', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
              Code sent to{'\n'}
              <Text style={{ color: '#9333EA', fontWeight: '600' }}>{email}</Text>
            </Text>
          )}
        </View>

        {step === 'otp' ? (
          <View style={{ alignItems: 'center', gap: 24 }}>
            <OtpInput value={otp} onChange={setOtp} length={6} disabled={validating} />
            {successFlash && (
              <Animated.Text style={{ color: '#22C55E', fontWeight: '700', opacity: flashOpacity }}>
                Code verified!
              </Animated.Text>
            )}
            {validating ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color="#9333EA" />
                <Text style={{ color: '#7C6FAD' }}>Verifying...</Text>
              </View>
            ) : (
              <Button title="Verify Code" onPress={() => validateOtp(otp)} disabled={otp.length < 6} />
            )}
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#7C6FAD', fontSize: 14 }}>Didn't receive the code?</Text>
              <TouchableOpacity onPress={handleResend} disabled={resending || cooldown > 0}>
                <Text style={{ color: cooldown > 0 ? '#4A3F6B' : '#9333EA', fontWeight: '700', fontSize: 14 }}>
                  {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <Controller control={control} name="password"
              render={({ field: { onChange, value } }) => (
                <Input label="New Password" value={value} onChangeText={onChange} placeholder="Min 8 characters"
                  secureTextEntry error={errors.password?.message}
                  icon={<Ionicons name="lock-closed-outline" size={18} color="#7C6FAD" />} />
              )} />
            <Controller control={control} name="confirm"
              render={({ field: { onChange, value } }) => (
                <Input label="Confirm Password" value={value} onChangeText={onChange} placeholder="Repeat password"
                  secureTextEntry error={errors.confirm?.message}
                  icon={<Ionicons name="lock-closed-outline" size={18} color="#7C6FAD" />} />
              )} />
            <Button title="Reset Password" onPress={handleSubmit(handleReset)} loading={loading} />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}
