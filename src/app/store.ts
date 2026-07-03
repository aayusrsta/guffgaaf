import { configureStore } from '@reduxjs/toolkit'
import { orbitApi }          from '../api/orbitApi'
import authReducer           from '../features/auth/authSlice'
import messagesReducer       from '../features/messages/messagesSlice'
import notificationsReducer  from '../features/notifications/notificationsSlice'
import themeReducer          from '../features/theme/themeSlice'

export const store = configureStore({
  reducer: {
    [orbitApi.reducerPath]: orbitApi.reducer,
    auth:          authReducer,
    messages:      messagesReducer,
    notifications: notificationsReducer,
    theme:         themeReducer,
  },
  middleware: (getDefault) => getDefault().concat(orbitApi.middleware),
})

export type RootState   = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
