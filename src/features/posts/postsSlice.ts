import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ReactionType } from '../../types'
import { CURRENT_USER_ID } from '../../api/mockData'

interface PostsState {
  userReactions: Record<string, ReactionType | null>
}

const postsSlice = createSlice({
  name: 'posts',
  initialState: { userReactions: {} } as PostsState,
  reducers: {
    react(state, action: PayloadAction<{ postId: string; type: ReactionType }>) {
      const { postId, type } = action.payload
      const key = `${CURRENT_USER_ID}_${postId}`
      state.userReactions[key] = state.userReactions[key] === type ? null : type
    },
  },
})

export const { react } = postsSlice.actions
export default postsSlice.reducer
