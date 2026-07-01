import React from 'react'
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, Alert } from 'react-native'
import { MotiView } from 'moti'
import { useCall } from '@/hooks/useCall'
import { useCallStore } from '@/store/callStore'
import { Avatar } from '@/components/ui/Avatar'
import { COLORS } from '@/constants/theme'

const { width, height } = Dimensions.get('window')

export function CallOverlay() {
  const { status, callType, remoteUser, isMuted, isCameraOff, acceptCall, rejectCall, hangUp, toggleMute, toggleCamera } = useCall()
  const localStream = useCallStore((s) => s.localStream)
  const remoteStream = useCallStore((s) => s.remoteStream)

  if (status === 'idle' || status === 'ended') return null

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={StyleSheet.absoluteFill}
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0F0A1E' }]}>
        {remoteUser && (
          <View className="flex-1 items-center justify-center">
            <Avatar
              uri={remoteUser.avatar_url}
              name={remoteUser.full_name}
              username={remoteUser.username}
              size={120}
            />
            <Text className="text-white text-2xl font-bold mt-4">
              {remoteUser.full_name ?? remoteUser.username}
            </Text>
            <Text className="text-gray-400 text-base mt-1">
              {status === 'incoming' ? 'Incoming ' : status === 'outgoing' ? 'Calling...' : 'Connected'}
              {callType === 'video' ? ' video call' : ' audio call'}
            </Text>
          </View>
        )}

        <View className="pb-16 px-8">
          {status === 'incoming' ? (
            <View className="flex-row justify-around">
              <TouchableOpacity
                onPress={rejectCall}
                style={styles.actionBtn}
                className="bg-red-600"
              >
                <Text className="text-white text-2xl">✕</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={acceptCall}
                style={styles.actionBtn}
                className="bg-green-600"
              >
                <Text className="text-white text-2xl">📞</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View className="flex-row justify-around mb-8">
                <TouchableOpacity onPress={toggleMute} style={[styles.controlBtn, isMuted ? styles.controlActive : styles.controlInactive]}>
                  <Text className="text-white text-xl">{isMuted ? '🔇' : '🎙️'}</Text>
                  <Text className="text-white text-xs mt-1">{isMuted ? 'Unmute' : 'Mute'}</Text>
                </TouchableOpacity>
                {callType === 'video' && (
                  <TouchableOpacity onPress={toggleCamera} style={[styles.controlBtn, isCameraOff ? styles.controlActive : styles.controlInactive]}>
                    <Text className="text-white text-xl">{isCameraOff ? '📷' : '📷'}</Text>
                    <Text className="text-white text-xs mt-1">{isCameraOff ? 'Show' : 'Hide'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={hangUp} style={[styles.actionBtn, { alignSelf: 'center' }]} className="bg-red-600">
                <Text className="text-white text-2xl">✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  actionBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtn: {
    width: 64,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlActive: { backgroundColor: '#374151' },
  controlInactive: { backgroundColor: '#1A1030' },
})
