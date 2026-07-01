import { create } from 'zustand'
import type { Profile } from '@/types/database'

export type CallType = 'audio' | 'video'
export type CallStatus = 'idle' | 'incoming' | 'outgoing' | 'active' | 'ended'

interface CallState {
  status: CallStatus
  callType: CallType | null
  conversationId: string | null
  remoteUser: Profile | null
  localStream: any | null
  remoteStream: any | null
  isMuted: boolean
  isCameraOff: boolean
  isSpeakerOn: boolean

  setIncomingCall: (caller: Profile, conversationId: string, callType: CallType) => void
  setOutgoingCall: (callee: Profile, conversationId: string, callType: CallType) => void
  setCallActive: () => void
  setLocalStream: (stream: any | null) => void
  setRemoteStream: (stream: any | null) => void
  toggleMute: () => void
  toggleCamera: () => void
  toggleSpeaker: () => void
  endCall: () => void
}

export const useCallStore = create<CallState>((set) => ({
  status: 'idle',
  callType: null,
  conversationId: null,
  remoteUser: null,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isCameraOff: false,
  isSpeakerOn: true,

  setIncomingCall: (caller, conversationId, callType) =>
    set({ status: 'incoming', remoteUser: caller, conversationId, callType }),

  setOutgoingCall: (callee, conversationId, callType) =>
    set({ status: 'outgoing', remoteUser: callee, conversationId, callType }),

  setCallActive: () => set({ status: 'active' }),

  setLocalStream: (localStream) => set({ localStream }),

  setRemoteStream: (remoteStream) => set({ remoteStream }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  toggleCamera: () => set((state) => ({ isCameraOff: !state.isCameraOff })),

  toggleSpeaker: () => set((state) => ({ isSpeakerOn: !state.isSpeakerOn })),

  endCall: () =>
    set({
      status: 'idle',
      callType: null,
      conversationId: null,
      remoteUser: null,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: true,
    }),
}))
