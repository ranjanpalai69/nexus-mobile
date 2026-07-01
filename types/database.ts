export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Profile {
  id: string
  email: string
  username: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  website: string | null
  location: string | null
  phone: string | null
  is_verified: boolean
  is_private: boolean
  email_notifications: boolean
  push_notifications: boolean
  online_status: boolean
  last_seen: string
  followers_count: number
  following_count: number
  posts_count: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string | null
  is_deleted: boolean
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
}

export interface PostMedia {
  id: string
  post_id: string
  url: string
  type: 'image' | 'video'
  thumbnail_url: string | null
  duration_seconds: number | null
  width: number | null
  height: number | null
  size_bytes: number | null
  order_index: number
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  likes_count: number
  replies_count: number
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Conversation {
  id: string
  name: string | null
  is_group: boolean
  avatar_url: string | null
  created_by: string | null
  last_message_at: string
  last_message_preview: string | null
  created_at: string
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  is_admin: boolean
  last_read_at: string
  joined_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string | null
  content: string | null
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system'
  media_url: string | null
  file_name: string | null
  file_size: number | null
  duration_seconds: number | null
  is_deleted: boolean
  reply_to_id: string | null
  created_at: string
  updated_at: string
}

export interface AppNotification {
  id: string
  recipient_id: string
  actor_id: string | null
  type: 'like_post' | 'like_comment' | 'comment' | 'reply' | 'follow' | 'mention' | 'message'
  reference_id: string | null
  reference_type: 'post' | 'comment' | 'message' | 'conversation' | 'user' | null
  message: string | null
  is_read: boolean
  created_at: string
}

export interface Story {
  id: string
  user_id: string
  media_url: string
  media_type: 'image' | 'video'
  caption: string | null
  views_count: number
  expires_at: string
  created_at: string
}

export interface StoryAuthor {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  is_verified: boolean
}

export interface StoryWithAuthor extends Story {
  author: StoryAuthor
  viewed?: boolean
}

export interface StoryGroup {
  user: StoryAuthor
  stories: StoryWithAuthor[]
  hasUnviewed: boolean
}

export interface PostWithDetails extends Post {
  author: Profile
  media: PostMedia[]
  is_liked?: boolean
  is_saved?: boolean
  is_following_author?: boolean
}

export interface CommentWithDetails extends Comment {
  author: Profile
  is_liked?: boolean
  replies?: CommentWithDetails[]
}

export interface ConversationWithDetails extends Conversation {
  participants: (ConversationParticipant & { profile: Profile })[]
  last_message?: Message & { sender?: Profile }
  unread_count?: number
  last_message_sender_id?: string | null
}

export interface MessageWithSender extends Message {
  sender: Profile | null
  reply_to?: Message & { sender?: Profile }
}

export interface NotificationWithActor extends AppNotification {
  actor?: Profile
  post_id?: string | null
}
