import React, { useRef, useEffect } from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { COLORS } from '@/constants/theme'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  length?: number
}

export function OtpInput({ value, onChange, onComplete, length = 6 }: OtpInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([])
  const digits = value.split('').slice(0, length)

  while (digits.length < length) digits.push('')

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value)
    }
  }, [value, length, onComplete])

  function handleChange(text: string, index: number) {
    const cleaned = text.replace(/[^0-9]/g, '')
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, length)
      onChange(pasted)
      const nextIndex = Math.min(pasted.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    const newDigits = [...digits]
    newDigits[index] = cleaned
    const newValue = newDigits.join('')
    onChange(newValue)

    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      const newDigits = [...digits]
      newDigits[index - 1] = ''
      onChange(newDigits.join(''))
    }
  }

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => { inputRefs.current[index] = ref }}
          style={[styles.input, digit ? styles.inputFilled : null]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          keyboardType="number-pad"
          maxLength={6}
          selectTextOnFocus
          caretHidden
          textAlign="center"
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  input: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputFilled: {
    borderColor: COLORS.purple,
  },
})
