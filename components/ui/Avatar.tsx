import React from 'react'
import { View, Text } from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENT_COLORS } from '@/constants/theme'
import { getInitials } from '@/lib/utils/helpers'

interface AvatarProps {
  uri?: string | null
  name?: string | null
  username?: string
  size?: number
  showRing?: boolean
}

export function Avatar({ uri, name, username = '', size = 40, showRing = false }: AvatarProps) {
  const initials = getInitials(name ?? null, username)

  const content = uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
    />
  ) : (
    <LinearGradient
      colors={GRADIENT_COLORS as unknown as string[]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ color: '#fff', fontSize: size * 0.35, fontWeight: '600' }}>{initials}</Text>
    </LinearGradient>
  )

  if (showRing) {
    return (
      <LinearGradient
        colors={GRADIENT_COLORS as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size + 4, height: size + 4, borderRadius: (size + 4) / 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={{ width: size + 2, height: size + 2, borderRadius: (size + 2) / 2, backgroundColor: '#0F0A1E', alignItems: 'center', justifyContent: 'center' }}>
          {content}
        </View>
      </LinearGradient>
    )
  }

  return content
}
