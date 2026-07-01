export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? 'https://nexus-ezh1.onrender.com'
export const API_URL = API_BASE
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://uutcbsqcrsyvwzycnybu.supabase.co'
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'https://nexus-ezh1.onrender.com'
export const GRADIENT_COLORS = ['#FF5C00', '#E91E8C', '#9333EA', '#06B6D4'] as const

// Local bundled logo assets — no network needed, works offline
export const LOGO_WHITE = require('../assets/logo-white.png') as number
export const LOGO_BLACK = require('../assets/logo-black.png') as number
