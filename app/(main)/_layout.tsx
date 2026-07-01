import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNotificationStore } from '@/store/notificationStore'
import { useChatStore } from '@/store/chatStore'
import { CallOverlay } from '@/components/call/CallOverlay'

function TabIcon({ name, focused, badge }: { name: keyof typeof Ionicons.glyphMap; focused: boolean; badge?: number }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={name} size={24} color={focused ? '#9333EA' : '#4A3F6B'} />
      {!!badge && badge > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: '#E91E8C', borderRadius: 8,
          minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </View>
  )
}

export default function MainLayout() {
  const unreadNotifications = useNotificationStore((s) => s.unreadCount)
  const conversations = useChatStore((s) => s.conversations)
  const unreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0)

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0F0A1E',
            borderTopColor: '#2A1F4A',
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: '#9333EA',
          tabBarInactiveTintColor: '#4A3F6B',
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="feed/index"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="explore/index"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'search' : 'search-outline'} focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="messages/index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} focused={focused} badge={unreadMessages} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications/index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? 'notifications' : 'notifications-outline'} focused={focused} badge={unreadNotifications} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />,
          }}
        />
        {/* Hidden screens — navigated to programmatically */}
        <Tabs.Screen name="feed/[postId]" options={{ href: null }} />
        <Tabs.Screen name="messages/[id]" options={{ href: null }} />
        <Tabs.Screen name="profile/[username]" options={{ href: null }} />
        <Tabs.Screen name="profile/settings" options={{ href: null }} />
      </Tabs>
      <CallOverlay />
    </>
  )
}
