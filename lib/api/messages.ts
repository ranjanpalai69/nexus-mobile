import { API_BASE } from '@/constants/config'
import { supabase } from '@/lib/supabase/client'
import type { ConversationWithDetails, MessageWithSender } from '@/types/database'

async function authHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export async function fetchConversations(): Promise<ConversationWithDetails[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/messages`, { headers })
  if (!res.ok) throw new Error('Failed to fetch conversations')
  return res.json()
}

export async function fetchMessages(conversationId: string, page = 0): Promise<MessageWithSender[]> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/messages/${conversationId}?page=${page}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch messages')
  return res.json()
}

export async function startConversation(otherUserId: string): Promise<ConversationWithDetails> {
  const headers = await authHeaders()
  const res = await fetch(`${API_BASE}/api/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ participantIds: [otherUserId] }),
  })
  if (!res.ok) throw new Error('Failed to start conversation')
  return res.json()
}
