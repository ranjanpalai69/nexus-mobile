import React from 'react'
import { View, type ViewProps } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
}

export function ScreenContainer({ children, style, edges = ['top'], ...rest }: ScreenContainerProps) {
  return (
    <SafeAreaView className="flex-1 bg-dark-bg" edges={edges}>
      <View className="flex-1" style={style} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  )
}
