import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const base = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api`,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('guffgaaf-token')
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

export interface ApiUser {
  id: string
  username: string
  displayName: string
  avatar: string | null
  cover: string | null
  bio: string | null
  isVerified: boolean
  isOnline: boolean
  createdAt: string
  followers: number
  following: number
  posts: number
  isFollowing?: boolean
}

export interface ApiPost {
  id: string
  author: Pick<ApiUser, 'id' | 'username' | 'displayName' | 'avatar' | 'isVerified' | 'isOnline'>
  content: string
  image: string | null
  orbitTag: string | null
  tags: string[]
  reactions: { type: string; count: number }[]
  myReaction: string | null
  commentCount: number
  createdAt: string
}

export interface ApiComment {
  id: string
  author: Pick<ApiUser, 'id' | 'username' | 'displayName' | 'avatar'>
  content: string
  createdAt: string
}

export interface StoryItem {
  id: string
  type: 'text' | 'image'
  content: string | null
  mediaUrl: string | null
  bgColor: string | null
  textColor: string | null
  expiresAt: string
  createdAt: string
  viewed: boolean
  viewCount: number
  replyCount: number
}

export interface StoryGroup {
  author: Pick<ApiUser, 'id' | 'username' | 'displayName' | 'avatar'>
  stories: StoryItem[]
}

export interface ApiConversation {
  id: string
  participant: ApiUser | null
  lastMessage: { id: string; content: string; senderId: string; createdAt: string } | null
  unreadCount: number
  updatedAt: string
}

export interface StoryContext {
  storyId:   string
  type:      'text' | 'image'
  mediaUrl:  string | null
  bgColor:   string | null
  textColor: string | null
  content:   string | null
}

export interface ApiMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  storyContext: StoryContext | null
  read: boolean
  createdAt: string
  sender: Pick<ApiUser, 'id' | 'username' | 'displayName' | 'avatar'>
}

export interface ApiNotification {
  id: string
  type: string
  title: string
  body: string
  entityId: string | null
  entityType: string | null
  read: boolean
  createdAt: string
  triggerer: Pick<ApiUser, 'id' | 'username' | 'displayName' | 'avatar'> | null
}

export const orbitApi = createApi({
  reducerPath: 'orbitApi',
  baseQuery: base,
  tagTypes: ['Post', 'User', 'Story', 'Conversation', 'Notification'],
  endpoints: (b) => ({
    // ── Posts ──────────────────────────────────────────────────────
    getFeed: b.query<{ posts: ApiPost[]; nextCursor: string | null }, string | undefined>({
      query: (cursor) => `/posts/feed${cursor ? `?cursor=${cursor}` : ''}`,
      providesTags: (result) =>
        result ? [...result.posts.map(({ id }) => ({ type: 'Post' as const, id })), 'Post'] : ['Post'],
    }),
    getExplorePosts: b.query<{ posts: ApiPost[] }, void>({
      query: () => '/posts/explore',
      providesTags: ['Post'],
    }),
    createPost: b.mutation<ApiPost, FormData>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: ['Post'],
    }),
    deletePost: b.mutation<void, string>({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Post'],
    }),
    reactToPost: b.mutation<{ myReaction: string | null }, { postId: string; type: string }>({
      query: ({ postId, type }) => ({ url: `/posts/${postId}/react`, method: 'POST', body: { type } }),
      invalidatesTags: (_r, _e, { postId }) => [{ type: 'Post', id: postId }],
    }),
    getComments: b.query<ApiComment[], string>({
      query: (postId) => `/posts/${postId}/comments`,
    }),
    addComment: b.mutation<ApiComment, { postId: string; content: string }>({
      query: ({ postId, content }) => ({ url: `/posts/${postId}/comments`, method: 'POST', body: { content } }),
      invalidatesTags: (_r, _e, { postId }) => [{ type: 'Post', id: postId }],
    }),

    // ── Users ──────────────────────────────────────────────────────
    getSuggestedUsers: b.query<ApiUser[], void>({
      query: () => '/users/suggested',
      providesTags: ['User'],
    }),
    searchUsers: b.query<ApiUser[], string>({
      query: (q) => `/users/search?q=${encodeURIComponent(q)}`,
      providesTags: ['User'],
    }),
    getUser: b.query<ApiUser, string>({
      query: (username) => `/users/${username}`,
      providesTags: (_, __, username) => [{ type: 'User', id: username }],
    }),
    getUserPosts: b.query<ApiPost[], string>({
      query: (userId) => `/users/${userId}/posts`,
      providesTags: ['Post'],
    }),
    getFollowers: b.query<ApiUser[], string>({
      query: (userId) => `/users/${userId}/followers`,
      providesTags: ['User'],
    }),
    getFollowing: b.query<ApiUser[], string>({
      query: (userId) => `/users/${userId}/following`,
      providesTags: ['User'],
    }),
    followUser: b.mutation<{ following: boolean }, string>({
      query: (id) => ({ url: `/users/${id}/follow`, method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    unfollowUser: b.mutation<{ following: boolean }, string>({
      query: (id) => ({ url: `/users/${id}/follow`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    updateProfile: b.mutation<ApiUser, { displayName?: string; bio?: string; username?: string }>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),

    // ── Stories ────────────────────────────────────────────────────
    getStoriesFeed: b.query<StoryGroup[], void>({
      query: () => '/stories/feed',
      providesTags: ['Story'],
    }),
    createStory: b.mutation<void, FormData>({
      query: (body) => ({ url: '/stories', method: 'POST', body }),
      invalidatesTags: ['Story'],
    }),
    viewStory: b.mutation<void, string>({
      query: (id) => ({ url: `/stories/${id}/view`, method: 'POST' }),
    }),
    replyToStory: b.mutation<{ ok: boolean; convId: string }, { id: string; content: string }>({
      query: ({ id, content }) => ({ url: `/stories/${id}/reply`, method: 'POST', body: { content } }),
      invalidatesTags: ['Conversation'],
    }),

    // ── Messages ───────────────────────────────────────────────────
    getConversations: b.query<ApiConversation[], void>({
      query: () => '/messages/conversations',
      providesTags: ['Conversation'],
    }),
    openConversation: b.mutation<ApiConversation, string>({
      query: (userId) => ({ url: '/messages/conversations', method: 'POST', body: { userId } }),
      invalidatesTags: ['Conversation'],
    }),
    getMessages: b.query<{ messages: ApiMessage[]; nextCursor: string | null }, string>({
      query: (convId) => `/messages/conversations/${convId}/messages`,
    }),

    // ── Notifications ──────────────────────────────────────────────
    getNotifications: b.query<ApiNotification[], void>({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationsRead: b.mutation<void, void>({
      query: () => ({ url: '/notifications/read', method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
  }),
})

export const {
  useGetFeedQuery,
  useGetExplorePostsQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useReactToPostMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useGetSuggestedUsersQuery,
  useSearchUsersQuery,
  useGetUserQuery,
  useGetUserPostsQuery,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useUpdateProfileMutation,
  useGetStoriesFeedQuery,
  useCreateStoryMutation,
  useViewStoryMutation,
  useReplyToStoryMutation,
  useGetConversationsQuery,
  useOpenConversationMutation,
  useGetMessagesQuery,
  useGetNotificationsQuery,
  useMarkNotificationsReadMutation,
} = orbitApi
