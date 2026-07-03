import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AppNotification {
  id: string
  title: string
  body: string
  type: 'message' | 'reaction' | 'comment' | 'follow'
  timestamp: number
  read: boolean
  avatar?: string
}

interface NotificationsState {
  items: AppNotification[]
  unread: number
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unread: 0 } as NotificationsState,
  reducers: {
    push(state, action: PayloadAction<Omit<AppNotification, 'id' | 'timestamp' | 'read'>>) {
      const n: AppNotification = {
        ...action.payload,
        id: `n_${Date.now()}`,
        timestamp: Date.now(),
        read: false,
      }
      state.items = [n, ...state.items].slice(0, 30)
      state.unread += 1
    },
    markRead(state) {
      state.items = state.items.map((n) => ({ ...n, read: true }))
      state.unread = 0
    },
    dismiss(state, action: PayloadAction<string>) {
      state.items = state.items.filter((n) => n.id !== action.payload)
      state.unread = state.items.filter((n) => !n.read).length
    },
  },
})

export const { push, markRead, dismiss } = notificationsSlice.actions
export default notificationsSlice.reducer
