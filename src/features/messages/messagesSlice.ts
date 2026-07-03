import { createSlice } from '@reduxjs/toolkit'

interface MessagesState {
  typingConvIds: string[]
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState: { typingConvIds: [] } as MessagesState,
  reducers: {
    setTyping: (state, action: { payload: { convId: string; typing: boolean }; type: string }) => {
      const { convId, typing } = action.payload
      if (typing) {
        if (!state.typingConvIds.includes(convId)) {
          state.typingConvIds.push(convId)
        }
      } else {
        state.typingConvIds = state.typingConvIds.filter((id) => id !== convId)
      }
    },
  },
})

export const { setTyping } = messagesSlice.actions
export default messagesSlice.reducer
