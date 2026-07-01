import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0A1E' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[username]" />
      <Stack.Screen name="settings" />
    </Stack>
  )
}
