import { API_BASE } from '@/constants/config'
import { supabase } from '@/lib/supabase/client'
import type { StoryGroup } from '@/types/database'

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export async function fetchStories(): Promise<StoryGroup[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/stories`, { headers })
  if (!res.ok) throw new Error('Failed to fetch stories')
  return res.json()
}

export async function viewStory(storyId: string): Promise<void> {
  const headers = await authHeaders()
  await fetch(`${API_BASE}/api/stories/${storyId}/view`, { method: 'POST', headers })
}

export async function likeStory(storyId: string): Promise<void> {
  const headers = await authHeaders()
  await fetch(`${API_BASE}/api/stories/${storyId}/like`, { method: 'POST', headers })
}

export async function createStory(mediaUrl: string, mediaType: 'image' | 'video', caption?: string): Promise<void> {
  const headers = await authHeaders()
  await fetch(`${API_BASE}/api/stories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ media_url: mediaUrl, media_type: mediaType, caption }),
  })
}
