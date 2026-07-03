export type ReactionType = 'love' | 'spark' | 'haha' | 'wow' | 'think'

export type ThemeMode = 'light' | 'dark'

export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  cover?: string
  bio: string
  followers: number
  following: number
  orbitIds: string[]
  isOnline: boolean
  isVerified?: boolean
}

export interface Orbit {
  id: string
  name: string
  slug: string
  description: string
  gradient: [string, string]
  memberCount: number
  postCount: number
}

export interface Reaction {
  type: ReactionType
  count: number
  reactedBy: string[]
}

export interface Comment {
  id: string
  author: User
  content: string
  createdAt: string
  likes: number
}

export interface Post {
  id: string
  author: User
  orbit: Orbit
  content: string
  image?: string
  reactions: Reaction[]
  comments: Comment[]
  createdAt: string
  isPinned?: boolean
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  read: boolean
  type?: 'text' | 'image'
}

export interface Conversation {
  id: string
  participant: User
  messages: Message[]
  lastMessage?: Message
  unreadCount: number
}

// WebSocket events
export type WsEventType =
  | 'NEW_MESSAGE'
  | 'TYPING_START'
  | 'TYPING_STOP'
  | 'USER_ONLINE'
  | 'USER_OFFLINE'
  | 'NEW_POST'
  | 'REACTION_UPDATE'

export interface WsEvent<T = unknown> {
  type: WsEventType
  payload: T
}
