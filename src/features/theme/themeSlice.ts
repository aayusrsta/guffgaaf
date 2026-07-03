import { createSlice } from '@reduxjs/toolkit'
import type { ThemeMode } from '../../types'

const saved = (localStorage.getItem('orbit-theme') as ThemeMode) ?? 'light'

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: saved as ThemeMode },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('orbit-theme', state.mode)
      document.documentElement.setAttribute('data-theme', state.mode)
    },
  },
})

export const { toggleTheme } = themeSlice.actions
export default themeSlice.reducer
