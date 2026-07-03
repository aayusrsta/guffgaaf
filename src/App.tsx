import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { store } from './app/store'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { fetchMe } from './features/auth/authSlice'
import { connectSocket } from './api/socket'
import { AppShell } from './components/layout/AppShell'
import { FeedPage }           from './pages/FeedPage'
import { ExplorePage }        from './pages/ExplorePage'
import { MessagesPage }       from './pages/MessagesPage'
import { ProfilePage }        from './pages/ProfilePage'
import { UserProfilePage }    from './pages/UserProfilePage'
import { NotificationsPage }  from './pages/NotificationsPage'
import { LoginPage }          from './pages/auth/LoginPage'
import { SignupPage }         from './pages/auth/SignupPage'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const { user, token, loading } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe()).then((result) => {
        if (fetchMe.fulfilled.match(result) && token) {
          connectSocket(token)
        }
      })
    }
  }, [token, user, dispatch])

  if (token && !user && loading !== false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 28, color: 'var(--accent)' }}>◉</span>
      </div>
    )
  }

  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      >
        <Route index                      element={<FeedPage />} />
        <Route path="explore"             element={<ExplorePage />} />
        <Route path="messages"            element={<MessagesPage />} />
        <Route path="notifications"       element={<NotificationsPage />} />
        <Route path="profile"             element={<ProfilePage />} />
        <Route path="user/:username"      element={<UserProfilePage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const basename = import.meta.env.PROD ? '/guffgaaf' : ''
  return (
    <Provider store={store}>
      <BrowserRouter basename={basename}>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  )
}
