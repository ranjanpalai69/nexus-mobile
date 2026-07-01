import React, { forwardRef } from 'react'
import { TextInput, Text, View, type TextInputProps } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
}

export const Input = forwardRef<TextInput, InputProps>(({ label, error, ...rest }, ref) => {
  return (
    <View className="w-full mb-4">
      {label && <Text className="text-gray-400 text-sm mb-1 font-medium">{label}</Text>}
      <TextInput
        ref={ref}
        className={`bg-dark-card border rounded-xl px-4 py-3 text-white text-base ${
          error ? 'border-red-500' : 'border-dark-border'
        }`}
        placeholderTextColor="#6B7280"
        {...rest}
      />
      {error && <Text className="text-red-400 text-xs mt-1">{error}</Text>}
    </View>
  )
})

Input.displayName = 'Input'
