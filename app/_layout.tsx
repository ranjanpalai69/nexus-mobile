import '../global.css'
import React, { useEffect } from 'react'
import { Stack } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useSocket } from '@/hooks/useSocket'
import { registerForPushNotifications, sendTokenToServer } from '@/lib/notifications'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase/client'
import { fetchMe } from '@/lib/api/profile'
import { disconnectSocket } from '@/lib/socket'
import { CallOverlay } from '@/components/call/CallOverlay'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
})

function SocketSetup() {
  useSocket()
  return null
}

function AuthSetup() {
  const { setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        try {
          const profile = await fetchMe()
          setUser(profile)
          const token = await registerForPushNotifications()
          if (token) sendTokenToServer(token, profile.id)
        } catch {
          setLoading(false)
        }
      } else {
        setUser(null)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await fetchMe()
          setUser(profile)
          const token = await registerForPushNotifications()
          if (token) sendTokenToServer(token, profile.id)
        } catch {
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        logout()
        disconnectSocket()
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return null
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <StatusBar style="light" />
            <AuthSetup />
            <SocketSetup />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0A1E' } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(main)" />
            </Stack>
            <CallOverlay />
            <Toast />
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
