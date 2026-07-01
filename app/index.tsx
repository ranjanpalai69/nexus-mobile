import { Redirect } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function Index() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <LoadingSpinner />
  if (user) return <Redirect href="/(main)/feed" />
  return <Redirect href="/(auth)/login" />
}
