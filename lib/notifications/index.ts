import * as ExpoNotifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { API_BASE } from '@/constants/config'

ExpoNotifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null

  const { status: existingStatus } = await ExpoNotifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await ExpoNotifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  if (Platform.OS === 'android') {
    await ExpoNotifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: ExpoNotifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    })
  }

  const token = (await ExpoNotifications.getExpoPushTokenAsync()).data
  return token
}

export async function sendTokenToServer(token: string, userId: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/mobile-push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId }),
    })
  } catch (err) {
    console.warn('[push] failed to register token', err)
  }
}
