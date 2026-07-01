import React, { useState, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { ScreenContainer } from '@/components/ui/ScreenContainer'
import { Avatar } from '@/components/ui/Avatar'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { searchUsers, fetchSuggestions } from '@/lib/api/profile'
import type { Profile } from '@/types/database'
import { formatCount } from '@/lib/utils/helpers'

function UserRow({ profile, onPress }: { profile: Profile; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center px-4 py-3 gap-3" activeOpacity={0.7}>
      <Avatar uri={profile.avatar_url} name={profile.full_name} username={profile.username} size={48} />
      <View className="flex-1">
        <View className="flex-row items-center gap-1">
          <Text className="text-white font-semibold text-sm">{profile.full_name ?? profile.username}</Text>
          {profile.is_verified && <Text className="text-purple-400 text-xs">?</Text>}
        </View>
        <Text className="text-gray-500 text-xs">@{profile.username} · {formatCount(profile.followers_count)} followers</Text>
      </View>
    </TouchableOpacity>
  )
}

export default function ExploreScreen() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: fetchSuggestions,
    staleTime: 60_000,
  })

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(timer)
  }, [query])

  const isSearching = debouncedQuery.length >= 2
  const displayData = isSearching ? searchResults : suggestions
  const isLoading = isSearching ? searchLoading : suggestionsLoading

  const renderUser = useCallback(({ item }: { item: Profile }) => (
    <UserRow profile={item} onPress={() => router.push(`/(main)/profile/${item.username}`)} />
  ), [])

  return (
    <ScreenContainer edges={['top']}>
      <View className="px-4 pt-2 pb-3">
        <Text className="text-white font-bold text-2xl mb-3">Explore</Text>
        <View className="flex-row items-center bg-dark-card border border-dark-border rounded-xl px-3 gap-2">
          <Text className="text-gray-500 text-lg">??</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search people..."
            placeholderTextColor="#6B7280"
            className="flex-1 text-white text-base py-3"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setDebouncedQuery('') }}>
              <Text className="text-gray-500 text-lg">?</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!isSearching && (
        <Text className="text-gray-400 text-sm font-semibold px-4 pb-2">Suggested for you</Text>
      )}

      {isLoading ? (
        <LoadingSpinner size="small" />
      ) : (
        <FlashList
          data={displayData}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          estimatedItemSize={70}
          ListEmptyComponent={
            <View className="items-center pt-16">
              <Text className="text-gray-500 text-base">
                {isSearching ? `No results for "${debouncedQuery}"` : 'No suggestions right now'}
              </Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  )
}
