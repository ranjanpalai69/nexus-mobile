import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { useNotificationStore } from '@/store/notificationStore'
import { useChatStore } from '@/store/chatStore'

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
}

export default function MainLayout() {
  const unreadNotifs = useNotificationStore((s) => s.unreadCount)
  const conversations = useChatStore((s) => s.conversations)
  const unreadMessages = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1A1030', borderTopColor: '#2A1F45', borderTopWidth: 1, height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: '#9333EA',
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon emoji="💬" focused={focused} />
              {unreadMessages > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: '#9333EA', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{unreadMessages > 99 ? '99+' : unreadMessages}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon emoji="🔔" focused={focused} />
              {unreadNotifs > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: '#E91E8C', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{unreadNotifs > 99 ? '99+' : unreadNotifs}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
