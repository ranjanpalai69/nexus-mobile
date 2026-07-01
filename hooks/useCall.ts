import { useEffect, useRef, useCallback } from 'react'
import { Alert } from 'react-native'
import {
  mediaDevices,
  RTCPeerConnection,
  RTCIceCandidate,
} from 'react-native-webrtc'
import { getSocket } from '@/lib/socket'
import { useCallStore } from '@/store/callStore'
import { useAuthStore } from '@/store/authStore'

// react-native-webrtc RTCPeerConnection doesn't fully match browser types; use any for internal PC ref
type PC = InstanceType<typeof RTCPeerConnection>

export function useCall() {
  const user = useAuthStore((s) => s.user)
  const {
    status,
    callType,
    conversationId,
    remoteUser,
    isMuted,
    isCameraOff,
    localStream,
    remoteStream,
    setCallActive,
    setLocalStream,
    setRemoteStream,
    toggleMute,
    toggleCamera,
    endCall,
  } = useCallStore()

  const pcRef = useRef<PC | null>(null)

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    endCall()
  }, [endCall])

  const acceptCall = useCallback(async () => {
    if (!user?.id || !conversationId) return
    try {
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      })
      setLocalStream(stream)

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      }) as unknown as any

      pcRef.current = pc
      ;(stream as any).getTracks().forEach((track: any) => pc.addTrack(track, stream))

      pc.ontrack = (event: any) => setRemoteStream(event.streams[0])

      const socket = getSocket(user.id)
      pc.onicecandidate = (event: any) => {
        if (event.candidate) {
          socket.emit('call:ice', { conversationId, candidate: event.candidate, to: remoteUser?.id })
        }
      }

      socket.emit('call:accept', { conversationId, to: remoteUser?.id })

      socket.on('call:offer', async (data: { offer: any }) => {
        await pc.setRemoteDescription(data.offer)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('call:answer', { conversationId, answer, to: remoteUser?.id })
        setCallActive()
      })

      socket.on('call:ice', async (data: { candidate: any }) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch {}
      })
    } catch {
      Alert.alert('Call failed', 'Could not access camera/microphone')
      cleanup()
    }
  }, [user, conversationId, callType, remoteUser, setLocalStream, setRemoteStream, setCallActive, cleanup])

  const rejectCall = useCallback(() => {
    if (!user?.id || !conversationId) return
    const socket = getSocket(user.id)
    socket.emit('call:reject', { conversationId, to: remoteUser?.id })
    cleanup()
  }, [user, conversationId, remoteUser, cleanup])

  const startCall = useCallback(
    async (targetUserId: string, targetConversationId: string, type: 'audio' | 'video') => {
      if (!user?.id) return
      try {
        const stream = await mediaDevices.getUserMedia({ audio: true, video: type === 'video' })
        setLocalStream(stream)

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        }) as unknown as any

        pcRef.current = pc
        ;(stream as any).getTracks().forEach((track: any) => pc.addTrack(track, stream))

        pc.ontrack = (event: any) => setRemoteStream(event.streams[0])

        const socket = getSocket(user.id)
        pc.onicecandidate = (event: any) => {
          if (event.candidate) {
            socket.emit('call:ice', { conversationId: targetConversationId, candidate: event.candidate, to: targetUserId })
          }
        }

        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: type === 'video' })
        await pc.setLocalDescription(offer)

        socket.emit('call:invite', { conversationId: targetConversationId, offer, to: targetUserId, callType: type })

        socket.on('call:answer', async (data: { answer: any }) => {
          await pc.setRemoteDescription(data.answer)
          setCallActive()
        })

        socket.on('call:ice', async (data: { candidate: any }) => {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
          } catch {}
        })

        socket.on('call:reject', () => {
          Alert.alert('Call rejected', 'The call was declined')
          cleanup()
        })
      } catch {
        Alert.alert('Call failed', 'Could not start call')
        cleanup()
      }
    },
    [user, setLocalStream, setRemoteStream, setCallActive, cleanup]
  )

  const hangUp = useCallback(() => {
    if (!user?.id || !conversationId) return
    const socket = getSocket(user.id)
    socket.emit('call:end', { conversationId, to: remoteUser?.id })
    cleanup()
  }, [user, conversationId, remoteUser, cleanup])

  return {
    status,
    callType,
    conversationId,
    remoteUser,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    acceptCall,
    rejectCall,
    startCall,
    hangUp,
    toggleMute,
    toggleCamera,
  }
}
