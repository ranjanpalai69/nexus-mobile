import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Animated } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar } from '@/components/ui/Avatar'
import type { StoryGroup } from '@/types/database'
import { formatRelativeTime } from '@/lib/utils/helpers'
import { viewStory, likeStory } from '@/lib/api/stories'

const { width, height } = Dimensions.get('window')
const STORY_DURATION = 5000

interface StoryViewerProps {
  groups: StoryGroup[]
  initialGroupIndex: number
  onClose: () => void
}

export function StoryViewer({ groups, initialGroupIndex, onClose }: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex)
  const [storyIndex, setStoryIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const progress = useRef(new Animated.Value(0)).current
  const animRef = useRef<Animated.CompositeAnimation | null>(null)

  const currentGroup = groups[groupIndex]
  const currentStory = currentGroup?.stories[storyIndex]

  useEffect(() => {
    if (!currentStory) return
    viewStory(currentStory.id).catch(() => {})
    setLiked(false)
    progress.setValue(0)
    animRef.current?.stop()
    animRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    })
    animRef.current.start(({ finished }) => {
      if (finished) advance()
    })
    return () => animRef.current?.stop()
  }, [groupIndex, storyIndex])

  function advance() {
    const group = groups[groupIndex]
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex(storyIndex + 1)
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1)
      setStoryIndex(0)
    } else {
      onClose()
    }
  }

  function goBack() {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1)
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1)
      const prevGroup = groups[groupIndex - 1]
      setStoryIndex(prevGroup.stories.length - 1)
    }
  }

  function handleLike() {
    if (!currentStory) return
    setLiked(true)
    likeStory(currentStory.id).catch(() => {})
  }

  if (!currentGroup || !currentStory) return null

  return (
    <View style={StyleSheet.absoluteFill}>
      <Image source={{ uri: currentStory.media_url }} style={styles.bg} contentFit="cover" />
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.progressRow}>
          {currentGroup.stories.map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width:
                      i < storyIndex
                        ? '100%'
                        : i === storyIndex
                        ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.header}>
          <Avatar
            uri={currentGroup.user.avatar_url}
            name={currentGroup.user.full_name}
            username={currentGroup.user.username}
            size={36}
          />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={styles.username}>{currentGroup.user.full_name || currentGroup.user.username}</Text>
            <Text style={styles.time}>{formatRelativeTime(currentStory.created_at)}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <TouchableOpacity style={styles.leftTap} onPress={goBack} activeOpacity={1} />
      <TouchableOpacity style={styles.rightTap} onPress={advance} activeOpacity={1} />

      {currentStory.caption && (
        <View style={styles.captionRow}>
          <Text style={styles.caption}>{currentStory.caption}</Text>
        </View>
      )}

      <View style={styles.bottomActions}>
        <TouchableOpacity onPress={handleLike} style={styles.likeBtn}>
          <Text style={{ fontSize: 28, color: liked ? '#E91E8C' : '#fff' }}>{liked ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bg: { width, height, position: 'absolute' },
  overlay: { backgroundColor: 'rgba(0,0,0,0.3)' },
  safe: { position: 'absolute', top: 0, left: 0, right: 0 },
  progressRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 12, paddingTop: 8 },
  progressTrack: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 2, backgroundColor: '#fff', borderRadius: 2 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10 },
  username: { color: '#fff', fontSize: 14, fontWeight: '600' },
  time: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  closeBtn: { padding: 8 },
  closeText: { color: '#fff', fontSize: 18, fontWeight: '300' },
  leftTap: { position: 'absolute', left: 0, top: 100, width: width * 0.35, bottom: 120 },
  rightTap: { position: 'absolute', right: 0, top: 100, width: width * 0.65, bottom: 120 },
  captionRow: { position: 'absolute', bottom: 100, left: 0, right: 0, paddingHorizontal: 16 },
  caption: { color: '#fff', fontSize: 15, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  bottomActions: { position: 'absolute', bottom: 40, right: 16 },
  likeBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
})
