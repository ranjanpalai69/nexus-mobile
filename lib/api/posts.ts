import { API_BASE } from '@/constants/config'
import { supabase } from '@/lib/supabase/client'
import type { PostWithDetails, CommentWithDetails } from '@/types/database'

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export async function fetchFeed(page = 0): Promise<PostWithDetails[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/posts?page=${page}&limit=10`, { headers })
  if (!res.ok) throw new Error('Failed to fetch feed')
  return res.json()
}

export async function fetchPost(postId: string): Promise<PostWithDetails> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/posts/${postId}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch post')
  return res.json()
}

export async function likePost(postId: string): Promise<void> {
  const headers = await authHeaders()
  await fetch(`${API_BASE}/api/posts/${postId}/like`, { method: 'POST', headers })
}

export async function unlikePost(postId: string): Promise<void> {
  const headers = await authHeaders()
  await fetch(`${API_BASE}/api/posts/${postId}/like`, { method: 'DELETE', headers })
}

export async function savePost(postId: string): Promise<void> {
  const headers = await authHeaders()
  await fetch(`${API_BASE}/api/posts/${postId}/save`, { method: 'POST', headers })
}

export async function unsavePost(postId: string): Promise<void> {
  const headers = await authHeaders()
  await fetch(`${API_BASE}/api/posts/${postId}/save`, { method: 'DELETE', headers })
}

export async function fetchComments(postId: string): Promise<CommentWithDetails[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, { headers })
  if (!res.ok) throw new Error('Failed to fetch comments')
  return res.json()
}

export async function createComment(postId: string, content: string): Promise<CommentWithDetails> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content }),
  })
  if (!res.ok) throw new Error('Failed to create comment')
  return res.json()
}

export async function createPost(content: string, mediaUrl?: string): Promise<PostWithDetails> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content, media: mediaUrl ? [{ url: mediaUrl, type: 'image' }] : [] }),
  })
  if (!res.ok) throw new Error('Failed to create post')
  return res.json()
}

export async function getPresignedUrl(fileName: string, fileType: string): Promise<{ url: string; key: string }> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/upload/presigned`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileName, fileType }),
  })
  if (!res.ok) throw new Error('Failed to get presigned URL')
  return res.json()
}
