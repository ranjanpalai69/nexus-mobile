import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Avatar } from '@/components/ui/Avatar'
import type { StoryGroup } from '@/types/database'
import { GRADIENT_COLORS } from '@/constants/theme'

interface StoriesBarProps {
  storyGroups: StoryGroup[]
  onStoryPress: (groupIndex: number) => void
  onAddStory?: () => void
  currentUserId?: string
}

export function StoriesBar({ storyGroups, onStoryPress, onAddStory, currentUserId }: StoriesBarProps) {
  return (
    <View className="bg-dark-bg border-b border-dark-border">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, gap: 12 }}>
        <TouchableOpacity onPress={onAddStory} className="items-center gap-1" style={{ width: 64 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#1A1030', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#2A1F45', borderStyle: 'dashed' }}>
            <Text style={{ fontSize: 28, color: '#9333EA' }}>+</Text>
          </View>
          <Text className="text-gray-400 text-xs" numberOfLines={1}>Your Story</Text>
        </TouchableOpacity>

        {storyGroups.map((group, index) => (
          <TouchableOpacity key={group.user.id} onPress={() => onStoryPress(index)} className="items-center gap-1" style={{ width: 64 }}>
            {group.hasUnviewed ? (
              <LinearGradient
                colors={GRADIENT_COLORS as unknown as string[]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' }}
              >
                <View style={{ width: 63, height: 63, borderRadius: 31.5, backgroundColor: '#0F0A1E', alignItems: 'center', justifyContent: 'center' }}>
                  <Avatar uri={group.user.avatar_url} name={group.user.full_name} username={group.user.username} size={58} />
                </View>
              </LinearGradient>
            ) : (
              <View style={{ width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: '#2A1F45', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar uri={group.user.avatar_url} name={group.user.full_name} username={group.user.username} size={58} />
              </View>
            )}
            <Text className="text-gray-300 text-xs" numberOfLines={1} style={{ width: 64, textAlign: 'center' }}>
              {group.user.full_name?.split(' ')[0] ?? group.user.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}
