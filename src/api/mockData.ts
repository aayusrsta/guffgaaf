import type { User, Orbit, Post, Conversation, Message } from '../types'

export const CURRENT_USER_ID = 'u1'

export const mockUsers: User[] = [
  {
    id: 'u1',
    username: 'nova_kai',
    displayName: 'Kai Nakamura',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=kai&backgroundColor=b6e3f4',
    cover: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=900&auto=format',
    bio: 'Designer & developer. Building things that matter. 🌊',
    followers: 1240,
    following: 380,
    orbitIds: ['o1', 'o2', 'o4'],
    isOnline: true,
    isVerified: true,
  },
  {
    id: 'u2',
    username: 'aurora_dev',
    displayName: 'Aurora Chen',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=aurora&backgroundColor=ffd5dc',
    bio: 'Full-stack engineer. Coffee addict. Open source lover.',
    followers: 3820,
    following: 210,
    orbitIds: ['o1', 'o3'],
    isOnline: true,
    isVerified: true,
  },
  {
    id: 'u3',
    username: 'pixel_rex',
    displayName: 'Rex Oduya',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=rex&backgroundColor=c0aede',
    bio: 'Motion designer. I make things move beautifully.',
    followers: 892,
    following: 450,
    orbitIds: ['o2', 'o5'],
    isOnline: false,
  },
  {
    id: 'u4',
    username: 'zenith_mar',
    displayName: 'Marina Voss',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=marina&backgroundColor=d1f4cc',
    bio: 'Product strategist. Turning ideas into reality.',
    followers: 2100,
    following: 620,
    orbitIds: ['o1', 'o4', 'o5'],
    isOnline: true,
  },
  {
    id: 'u5',
    username: 'echo_lane',
    displayName: 'Lane Park',
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=lane&backgroundColor=ffdfbf',
    bio: 'Photographer & visual storyteller. Seoul based.',
    followers: 5640,
    following: 190,
    orbitIds: ['o3', 'o5'],
    isOnline: false,
    isVerified: true,
  },
]

export const mockOrbits: Orbit[] = [
  { id: 'o1', name: 'Design Systems', slug: 'design-systems', description: 'Typography, color, components, and everything in between.', gradient: ['#6366F1', '#8B5CF6'], memberCount: 12400, postCount: 3200 },
  { id: 'o2', name: 'Creative Dev', slug: 'creative-dev', description: 'Where code meets art. WebGL, GSAP, creative experiments.', gradient: ['#EC4899', '#F97316'], memberCount: 8900, postCount: 1800 },
  { id: 'o3', name: 'Photography', slug: 'photography', description: 'Share your lens. All styles, all skill levels.', gradient: ['#14B8A6', '#06B6D4'], memberCount: 21000, postCount: 8400 },
  { id: 'o4', name: 'Product Thinking', slug: 'product-thinking', description: 'Strategy, UX research, roadmaps, and building great products.', gradient: ['#F59E0B', '#EF4444'], memberCount: 6700, postCount: 2100 },
  { id: 'o5', name: 'Motion Design', slug: 'motion-design', description: 'Animation principles, tools, workflows, and inspiration.', gradient: ['#10B981', '#3B82F6'], memberCount: 9300, postCount: 2700 },
]

export const mockPosts: Post[] = [
  {
    id: 'p1',
    author: mockUsers[1],
    orbit: mockOrbits[0],
    content: 'Just shipped our new design token system — 3 months of work, hundreds of variables consolidated into something actually maintainable. The key insight: tokens should describe intent, not appearance. \n\n`color.button.primary` not `color.blue.500`. Sounds obvious but it changes everything.',
    reactions: [
      { type: 'love', count: 84, reactedBy: ['u1'] },
      { type: 'spark', count: 47, reactedBy: [] },
      { type: 'think', count: 23, reactedBy: [] },
      { type: 'wow', count: 12, reactedBy: [] },
      { type: 'haha', count: 3, reactedBy: [] },
    ],
    comments: [
      { id: 'c1', author: mockUsers[0], content: 'This is exactly the mental shift our team needed. Bookmarked.', createdAt: '2025-06-30T09:10:00Z', likes: 8 },
      { id: 'c2', author: mockUsers[3], content: 'How do you handle multi-brand token overrides?', createdAt: '2025-06-30T09:25:00Z', likes: 3 },
    ],
    createdAt: '2025-06-30T08:45:00Z',
  },
  {
    id: 'p2',
    author: mockUsers[4],
    orbit: mockOrbits[2],
    content: 'Golden hour at Namsan Tower. No filters, straight out of camera. Sometimes the light just does everything for you.',
    image: 'https://images.unsplash.com/photo-1539812550716-d03c199e9688?w=800&auto=format',
    reactions: [
      { type: 'love', count: 312, reactedBy: [] },
      { type: 'wow', count: 89, reactedBy: ['u1'] },
      { type: 'spark', count: 41, reactedBy: [] },
      { type: 'think', count: 5, reactedBy: [] },
      { type: 'haha', count: 2, reactedBy: [] },
    ],
    comments: [
      { id: 'c3', author: mockUsers[2], content: 'The color grading is unreal. What body are you shooting on?', createdAt: '2025-06-30T07:15:00Z', likes: 12 },
    ],
    createdAt: '2025-06-30T06:30:00Z',
  },
  {
    id: 'p3',
    author: mockUsers[2],
    orbit: mockOrbits[4],
    content: 'Hot take: most UI animations are 30% too slow. We\'ve normalized sluggish interfaces because it looks "polished." Real polish is snappy, intentional, and never makes you wait. Your 400ms ease-in-out is not cinematic. It\'s just slow.',
    reactions: [
      { type: 'spark', count: 156, reactedBy: ['u1'] },
      { type: 'love', count: 72, reactedBy: [] },
      { type: 'think', count: 98, reactedBy: [] },
      { type: 'haha', count: 34, reactedBy: [] },
      { type: 'wow', count: 18, reactedBy: [] },
    ],
    comments: [
      { id: 'c4', author: mockUsers[1], content: 'Counterpoint: 150ms is too fast for layout shifts. Context matters.', createdAt: '2025-06-30T05:40:00Z', likes: 45 },
      { id: 'c5', author: mockUsers[3], content: 'Agreed on the principle but accessibility needs to be part of this conversation.', createdAt: '2025-06-30T06:00:00Z', likes: 31 },
    ],
    createdAt: '2025-06-30T05:00:00Z',
  },
  {
    id: 'p4',
    author: mockUsers[3],
    orbit: mockOrbits[3],
    content: 'Running user interviews this week and a pattern keeps emerging: users don\'t struggle with features — they struggle with not knowing where they are in the product. Navigation isn\'t just wayfinding. It\'s your product\'s emotional architecture.',
    reactions: [
      { type: 'think', count: 203, reactedBy: ['u1'] },
      { type: 'love', count: 88, reactedBy: [] },
      { type: 'spark', count: 61, reactedBy: [] },
      { type: 'wow', count: 27, reactedBy: [] },
      { type: 'haha', count: 4, reactedBy: [] },
    ],
    comments: [],
    createdAt: '2025-06-30T03:15:00Z',
  },
  {
    id: 'p5',
    author: mockUsers[0],
    orbit: mockOrbits[1],
    content: 'Been experimenting with GSAP + WebGL for generative backgrounds. The trick is keeping the math simple but composing many simple layers — each wave sine curve is trivial, but 6 of them offset at different frequencies feels alive.',
    image: 'https://images.unsplash.com/photo-1642427749670-f20e2e76ed8c?w=800&auto=format',
    reactions: [
      { type: 'love', count: 134, reactedBy: [] },
      { type: 'wow', count: 67, reactedBy: [] },
      { type: 'spark', count: 89, reactedBy: [] },
      { type: 'think', count: 31, reactedBy: [] },
      { type: 'haha', count: 7, reactedBy: [] },
    ],
    comments: [
      { id: 'c6', author: mockUsers[2], content: 'Open sourcing this? 👀', createdAt: '2025-06-30T02:00:00Z', likes: 22 },
    ],
    createdAt: '2025-06-30T01:30:00Z',
  },
]

const makeMsg = (id: string, convId: string, senderId: string, content: string, minsAgo: number): Message => ({
  id, conversationId: convId, senderId, content, read: true,
  createdAt: new Date(Date.now() - minsAgo * 60000).toISOString(),
})

export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participant: mockUsers[1],
    unreadCount: 2,
    messages: [
      makeMsg('m1', 'conv1', 'u2', 'Hey! Did you see the new Figma variables update?', 45),
      makeMsg('m2', 'conv1', 'u1', 'Yes! Finally proper scoping. Been waiting for this forever.', 42),
      makeMsg('m3', 'conv1', 'u2', 'Right? Our token workflow is going to be so much cleaner. Want to pair on migrating our system this week?', 40),
      makeMsg('m4', 'conv1', 'u1', 'Absolutely. Wednesday afternoon works for me.', 38),
      makeMsg('m5', 'conv1', 'u2', 'Perfect. I\'ll set up a Figma file. Also — loved your post about intent-based naming btw', 10),
      makeMsg('m6', 'conv1', 'u2', 'Really shifted how I think about it', 9),
    ],
    get lastMessage() { return this.messages[this.messages.length - 1] },
  },
  {
    id: 'conv2',
    participant: mockUsers[3],
    unreadCount: 0,
    messages: [
      makeMsg('m7', 'conv2', 'u4', 'Your navigation post was spot on. Saved it for our next team sync.', 180),
      makeMsg('m8', 'conv2', 'u1', 'Glad it resonated! What\'s your current approach to onboarding new users?', 175),
      makeMsg('m9', 'conv2', 'u4', 'Progressive disclosure mostly. Show only what\'s needed, reveal complexity as trust builds.', 170),
      makeMsg('m10', 'conv2', 'u1', 'Smart. We tried that — the drop-off at step 3 went from 60% to 28%.', 168),
    ],
    get lastMessage() { return this.messages[this.messages.length - 1] },
  },
  {
    id: 'conv3',
    participant: mockUsers[2],
    unreadCount: 0,
    messages: [
      makeMsg('m11', 'conv3', 'u3', 'Yo, that generative wave thing is absolutely wild. Tutorial incoming?', 360),
      makeMsg('m12', 'conv3', 'u1', 'Haha maybe! Still cleaning up the code. It\'s kind of a mess rn.', 355),
      makeMsg('m13', 'conv3', 'u3', 'Mess code that makes art > clean code that makes nothing 😄', 350),
    ],
    get lastMessage() { return this.messages[this.messages.length - 1] },
  },
]
