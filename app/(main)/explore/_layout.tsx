import { Stack } from 'expo-router'

export default function ExploreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0A1E' } }}>
      <Stack.Screen name="index" />
    </Stack>
  )
}
