import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { GRADIENT_COLORS } from '@/constants/theme'

interface ButtonProps extends TouchableOpacityProps {
  title: string
  variant?: 'gradient' | 'outline' | 'ghost'
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ title, variant = 'gradient', loading, size = 'md', disabled, style, ...rest }: ButtonProps) {
  const sizeClasses = {
    sm: 'py-2 px-4',
    md: 'py-3 px-6',
    lg: 'py-4 px-8',
  }
  const textSize = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' }

  const isDisabled = disabled || loading

  if (variant === 'gradient') {
    return (
      <TouchableOpacity disabled={isDisabled} {...rest} style={[{ opacity: isDisabled ? 0.5 : 1 }, style as never]}>
        <LinearGradient
          colors={GRADIENT_COLORS as unknown as string[]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`rounded-xl items-center justify-center ${sizeClasses[size]}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className={`text-white font-semibold ${textSize[size]}`}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        disabled={isDisabled}
        className={`rounded-xl items-center justify-center border border-purple-500 ${sizeClasses[size]}`}
        style={[{ opacity: isDisabled ? 0.5 : 1 }, style as never]}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color="#9333EA" size="small" />
        ) : (
          <Text className={`text-purple-400 font-semibold ${textSize[size]}`}>{title}</Text>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      disabled={isDisabled}
      className={`rounded-xl items-center justify-center ${sizeClasses[size]}`}
      style={[{ opacity: isDisabled ? 0.5 : 1 }, style as never]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#9CA3AF" size="small" />
      ) : (
        <Text className={`text-gray-400 font-semibold ${textSize[size]}`}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}
