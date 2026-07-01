import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase/client'
import { fetchMe } from '@/lib/api/profile'
import { disconnectSocket } from '@/lib/socket'

export function useAuth() {
  const { user, isLoading, setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        try {
          const profile = await fetchMe()
          setUser(profile)
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

  return { user, isLoading, logout }
}
