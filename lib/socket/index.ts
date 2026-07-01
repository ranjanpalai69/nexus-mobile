import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from '@/constants/config'

let socket: Socket | null = null

export function getSocket(userId: string): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: '/api/socket',
      auth: { userId },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socket.on('connect', () => console.debug('[socket] connected', socket?.id))
    socket.on('disconnect', (reason) => console.debug('[socket] disconnected', reason))
    socket.on('connect_error', (err) => console.warn('[socket] error', err.message))
  } else if (!socket.connected) {
    socket.auth = { userId }
    socket.connect()
  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export { socket }
