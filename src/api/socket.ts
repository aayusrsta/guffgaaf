import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket
  socket = io(import.meta.env.VITE_API_URL ?? '/', {
    auth: { token },
    transports: ['websocket'],
  })
  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
