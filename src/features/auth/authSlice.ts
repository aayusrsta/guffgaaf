import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { api } from '../../api/client'
import { connectSocket, disconnectSocket } from '../../api/socket'

export interface AuthUser {
  id: string
  username: string
  displayName: string
  email: string
  avatar: string | null
  cover: string | null
  bio: string | null
  isVerified: boolean
  isOnline: boolean
  followers: number
  following: number
  posts: number
}

interface AuthState {
  user:    AuthUser | null
  token:   string | null
  loading: boolean
  error:   string | null
}

const storedToken = localStorage.getItem('guffgaaf-token')

const initialState: AuthState = {
  user:    null,
  token:   storedToken,
  loading: false,
  error:   null,
}

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data as AuthUser
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.error ?? 'Failed to load user')
  }
})

export const login = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', payload)
      return res.data as { token: string; user: AuthUser }
    } catch (e: any) {
      return rejectWithValue(e.response?.data ?? { error: 'Login failed' })
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout').catch(() => {})
  localStorage.removeItem('guffgaaf-token')
  disconnectSocket()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload
      localStorage.setItem('guffgaaf-token', action.payload)
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user    = action.payload
        state.loading = false
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user    = null
        state.token   = null
        state.loading = false
        localStorage.removeItem('guffgaaf-token')
      })
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token   = action.payload.token
        state.user    = action.payload.user
        state.loading = false
        localStorage.setItem('guffgaaf-token', action.payload.token)
        connectSocket(action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error   = (action.payload as any)?.error ?? 'Login failed'
      })
      .addCase(logout.fulfilled, (state) => {
        state.user  = null
        state.token = null
      })
  },
})

export const { setToken, setUser, clearError } = authSlice.actions
export default authSlice.reducer
