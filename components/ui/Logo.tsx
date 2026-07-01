import { Image } from 'expo-image'
import { useColorScheme } from 'react-native'

const LOGO_WHITE = require('@/assets/logo-white.png') as number
const LOGO_BLACK = require('@/assets/logo-black.png') as number

interface LogoProps {
  width?: number
  height?: number
  forceTheme?: 'light' | 'dark'
}

export function Logo({ width = 140, height = 40, forceTheme }: LogoProps) {
  const scheme = useColorScheme()
  const isDark = forceTheme ? forceTheme === 'dark' : scheme !== 'light'
  const src = isDark ? LOGO_WHITE : LOGO_BLACK

  return (
    <Image
      source={src}
      style={{ width, height }}
      contentFit="contain"
    />
  )
}
