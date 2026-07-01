import { useState, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { searchUsers, fetchSuggestions } from '@/lib/api/profile'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Profile } from '@/types/database'

export default function ExploreScreen() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('')

  const { data: suggestions, isLoading: loadingSuggestions } = useQuery({
    queryKey: ['suggestions'],
    queryFn: fetchSuggestions,
    enabled: !active,
  })

  const { data: results, isLoading: loadingSearch } = useQuery({
    queryKey: ['search', active],
    queryFn: () => searchUsers(active),
    enabled: active.length >= 2,
  })

  const isLoading = active.length >= 2 ? loadingSearch : loadingSuggestions
  const items: Profile[] = active.length >= 2 ? (results ?? []) : (suggestions ?? [])

  const renderUser = useCallback(({ item }: { item: Profile }) => (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}
      onPress={() => router.push(`/(main)/profile/${item.username}`)}
      activeOpacity={0.7}
    >
      <Avatar uri={item.avatar_url} name={item.full_name} username={item.username} size={48} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: '#F9FAFB', fontWeight: '600', fontSize: 15 }}>{item.full_name || item.username}</Text>
          {item.is_verified && (
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#9333EA', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>✓</Text>
            </View>
          )}
        </View>
        <Text style={{ color: '#6B7280', fontSize: 13 }}>@{item.username}</Text>
        {item.bio && <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }} numberOfLines={1}>{item.bio}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#4A3F6B" />
    </TouchableOpacity>
  ), [])

  return (
    <View style={{ flex: 1, backgroundColor: '#0F0A1E' }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#2A1F45' }}>
        <Text style={{ color: '#F9FAFB', fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Explore</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1030', borderRadius: 12, paddingHorizontal: 12, gap: 8 }}>
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            style={{ flex: 1, color: '#F9FAFB', fontSize: 15, paddingVertical: 12 }}
            placeholder="Search people..."
            placeholderTextColor="#4A3F6B"
            value={query}
            onChangeText={(t) => { setQuery(t); if (t.length >= 2) setActive(t); else setActive('') }}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setActive('') }}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlashList
          data={items}
          renderItem={renderUser}
          estimatedItemSize={72}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            items.length > 0 ? (
              <Text style={{ color: '#6B7280', fontSize: 12, fontWeight: '600', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {active.length >= 2 ? 'Results' : 'Suggested'}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ color: '#4A3F6B', fontSize: 15 }}>
                {active.length >= 2 ? 'No results found' : 'No suggestions yet'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}
