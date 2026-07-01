import { useEffect, useRef, useCallback } from 'react'
import { Alert } from 'react-native'
import { getSocket } from '@/lib/socket'
import { useCallStore } from '@/store/callStore'
import { useAuthStore } from '@/store/authStore'

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

  const pcRef = useRef<RTCPeerConnection | null>(null)

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
      const { mediaDevices } = await import('react-native-webrtc')
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      })
      setLocalStream(stream)

      const { RTCPeerConnection } = await import('react-native-webrtc')
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0])
      }

      const socket = getSocket(user.id)
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('call:ice', { conversationId, candidate: event.candidate, to: remoteUser?.id })
        }
      }

      socket.emit('call:accept', { conversationId, to: remoteUser?.id })

      socket.on('call:offer', async (data: { offer: RTCSessionDescriptionInit }) => {
        await pc.setRemoteDescription(data.offer)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        socket.emit('call:answer', { conversationId, answer, to: remoteUser?.id })
        setCallActive()
      })

      socket.on('call:ice', async (data: { candidate: RTCIceCandidateInit }) => {
        try {
          const { RTCIceCandidate } = await import('react-native-webrtc')
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        } catch {}
      })
    } catch (err) {
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
        const { mediaDevices } = await import('react-native-webrtc')
        const stream = await mediaDevices.getUserMedia({ audio: true, video: type === 'video' })
        setLocalStream(stream)

        const { RTCPeerConnection } = await import('react-native-webrtc')
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        })
        pcRef.current = pc

        stream.getTracks().forEach((track) => pc.addTrack(track, stream))

        pc.ontrack = (event) => setRemoteStream(event.streams[0])

        const socket = getSocket(user.id)
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('call:ice', { conversationId: targetConversationId, candidate: event.candidate, to: targetUserId })
          }
        }

        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: type === 'video' })
        await pc.setLocalDescription(offer)

        socket.emit('call:invite', { conversationId: targetConversationId, offer, to: targetUserId, callType: type })

        socket.on('call:answer', async (data: { answer: RTCSessionDescriptionInit }) => {
          await pc.setRemoteDescription(data.answer)
          setCallActive()
        })

        socket.on('call:ice', async (data: { candidate: RTCIceCandidateInit }) => {
          try {
            const { RTCIceCandidate } = await import('react-native-webrtc')
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
          } catch {}
        })

        socket.on('call:reject', () => {
          Alert.alert('Call rejected', `${targetUserId} declined the call`)
          cleanup()
        })
      } catch (err) {
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
