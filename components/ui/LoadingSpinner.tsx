import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { COLORS } from '@/constants/theme'

export function LoadingSpinner({ size = 'large' }: { size?: 'small' | 'large' }) {
  return (
    <View className="flex-1 items-center justify-center bg-dark-bg">
      <ActivityIndicator size={size} color={COLORS.purple} />
    </View>
  )
}
