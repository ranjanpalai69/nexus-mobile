import { API_BASE } from '@/constants/config'
import { supabase } from '@/lib/supabase/client'
import type { Profile, PostWithDetails, NotificationWithActor } from '@/types/database'

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export async function fetchProfile(username: string): Promise<Profile & { is_following?: boolean; is_followed_by?: boolean }> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/users/${username}`, { headers })
  if (!res.ok) throw new Error('Profile not found')
  return res.json()
}

export async function fetchMe(): Promise<Profile> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/users/me`, { headers })
  if (!res.ok) throw new Error('Failed to fetch profile')
  return res.json()
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/users/me`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(updates),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export async function fetchUserPosts(username: string, page = 0): Promise<PostWithDetails[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/users/${username}/posts?page=${page}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch user posts')
  return res.json()
}

export async function followUser(username: string): Promise<void> {
  const headers = await authHeaders()
  await fetch(`${API_BASE}/api/users/${username}/follow`, { method: 'POST', headers })
}

export async function unfollowUser(username: string): Promise<void> {
  const headers = await authHeaders()
  await fetch(`${API_BASE}/api/users/${username}/follow`, { method: 'DELETE', headers })
}

export async function fetchFollowers(username: string): Promise<Profile[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/users/${username}/followers`, { headers })
  if (!res.ok) throw new Error('Failed to fetch followers')
  return res.json()
}

export async function fetchFollowing(username: string): Promise<Profile[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/users/${username}/following`, { headers })
  if (!res.ok) throw new Error('Failed to fetch following')
  return res.json()
}

export async function fetchNotifications(): Promise<NotificationWithActor[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/notifications`, { headers })
  if (!res.ok) throw new Error('Failed to fetch notifications')
  return res.json()
}

export async function searchUsers(query: string): Promise<Profile[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&type=users`, { headers })
  if (!res.ok) throw new Error('Search failed')
  const data = await res.json()
  return data.users ?? data
}

export async function fetchSuggestions(): Promise<Profile[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/users/suggestions`, { headers })
  if (!res.ok) return []
  return res.json()
}

export async function startConversation(userId: string) {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ participantIds: [userId] }),
  })
  if (!res.ok) throw new Error('Failed to start conversation')
  return res.json()
}
