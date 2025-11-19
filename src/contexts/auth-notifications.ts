import { toast } from 'sonner'
import { AUTH_CONSTANTS } from './constants'

export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    const { frequencies, duration, gain, endGain } = AUTH_CONSTANTS.NOTIFICATION_SOUND;
    
    oscillator.frequency.setValueAtTime(frequencies[0], audioContext.currentTime)
    oscillator.frequency.setValueAtTime(frequencies[1], audioContext.currentTime + 0.1)
    oscillator.frequency.setValueAtTime(frequencies[2], audioContext.currentTime + 0.2)
    
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(endGain, audioContext.currentTime + duration)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  } catch (error) {
    console.log('🔊 Could not play notification sound:', error)
  }
}

export const testNotification = () => {
  playNotificationSound()
  toast.success('🧪 Test Notification!', {
    description: 'This is a test notification with sound',
    duration: AUTH_CONSTANTS.TOAST_CONFIG.duration,
    position: AUTH_CONSTANTS.TOAST_CONFIG.position
  })
}
