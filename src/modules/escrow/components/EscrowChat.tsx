"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/auth-context'
import { useUser } from '@/hooks/useUser'
import { subscribeToChannel, unsubscribeFromChannel, pusherClient } from '@/lib/integrations/pusher'
import { getEscrowMessages, sendEscrowMessage } from '@/lib/internal/auth'
import AgentChatMessage from '@/modules/agent/components/AgentChatMessage'
import { ANIMALS, CHAT_CHANNEL_PREFIX } from '@/modules/shared.constants'
import { ChatMessage } from '@/modules/shared.types'
import { MessageCircle, Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Participant {
  principal: string
  name: string
}

interface EscrowChatProps {
  escrowId: string
  participants: Participant[]
  className?: string
  escrowStatus?: string
}

export default function EscrowChat({ escrowId, participants, className, escrowStatus }: EscrowChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { principal } = useAuth()
  const { name: currentUserName } = useUser()
  const [isTabFocused, setIsTabFocused] = useState(true)
  const [blinkInterval, setBlinkInterval] = useState<NodeJS.Timeout | null>(null)
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    const messagesContainer = messagesContainerRef.current
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  // Initial scroll to bottom when messages are first loaded
  useEffect(() => {
    if (messages.length > 0 && !hasInitiallyScrolled) {
      // Teleport to bottom immediately on first load
      scrollToBottom()
      setHasInitiallyScrolled(true)
    }
  }, [messages, hasInitiallyScrolled])

  // Removed scroll detection - no auto-scroll behavior

  // Tab focus detection
  useEffect(() => {
    const handleFocus = () => {
      setIsTabFocused(true)
      // Stop blinking when tab is focused
      if (blinkInterval) {
        clearInterval(blinkInterval)
        setBlinkInterval(null)
        document.title = document.title.replace(/^🔔 /, '')
      }
    }

    const handleBlur = () => {
      setIsTabFocused(false)
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      if (blinkInterval) {
        clearInterval(blinkInterval)
      }
    }
  }, [blinkInterval])

  // Sound notification
  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch {
      // Silent error handling for notification sound
    }
  }

  // Tab blinking
  const startTabBlinking = useCallback(() => {
    if (blinkInterval) return // Already blinking
    
    const originalTitle = document.title
    let isBlinking = false
    
    const interval = setInterval(() => {
      if (isBlinking) {
        document.title = originalTitle
      } else {
        document.title = `🔔 ${originalTitle}`
      }
      isBlinking = !isBlinking
    }, 1000)
    
    setBlinkInterval(interval)
  }, [blinkInterval])

  const getSenderName = useCallback((senderPrincipal: string | { toText?: () => string }): string => {
    const principalString = typeof senderPrincipal === 'string' 
      ? senderPrincipal 
      : (senderPrincipal?.toText?.() || String(senderPrincipal))
    
    console.log('🔍 getSenderName called with:', principalString)
    console.log('🔍 participants array:', participants)
    
    // Find the participant by principal to get their name
    const participant = participants.find(p => {
      const participantPrincipal = typeof p.principal === 'string' ? p.principal : (p.principal as { toText?: () => string })?.toText?.()
      return participantPrincipal === principalString
    })
    console.log('🔍 found participant:', participant)
    if (participant && participant.name && participant.name !== 'Unknown') {
      return participant.name
    }
    
    // Generate a consistent animal name based on principal hash
    
    // Create a simple hash from the principal string
    let hash = 0
    for (let i = 0; i < principalString.length; i++) {
      const char = principalString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // Use absolute value and modulo to get a consistent index
    const animalIndex = Math.abs(hash) % ANIMALS.length
    const animalName = ANIMALS[animalIndex]
    return animalName
  }, [participants])

  const getChatPlaceholder = (status?: string): string => {
    switch (status) {
      case 'released':
        return "Chat disabled - escrow is completed";
      case 'cancelled':
        return "Chat disabled - escrow is cancelled";
      case 'refund':
        return "Chat disabled - escrow is refunded";
      default:
        return "No messages yet. Start the conversation!";
    }
  }

  const loadMessageHistory = useCallback(async (escrowId: string) => {
    try {
      const data = await getEscrowMessages(escrowId)
      const history = data.messages || []
      
      // Convert timestamp strings back to Date objects and use name field if available
      const formattedMessages = history.map((msg: { sender: string; timestamp: string; name?: string; [key: string]: unknown }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
        senderName: (msg.name as string) || getSenderName(msg.sender)
      }))
      
      setMessages(formattedMessages)
    } catch (error) {
      console.error('Failed to load message history:', error)
      // Fallback to sample message on error
      setSampleMessages()
    }
  }, [getSenderName])

  const setSampleMessages = () => {
    const sampleMessages: ChatMessage[] = []
    setMessages(sampleMessages)
  }

  // Initialize Pusher connection using centralized client
  useEffect(() => {
    if (!escrowId) return

    setIsConnected(false)

    const channelName = `${CHAT_CHANNEL_PREFIX}${escrowId}`
    
    // Use centralized Pusher client
    const channelInstance = subscribeToChannel(channelName)
    
    // If Pusher is not available, show offline mode
    if (!channelInstance) {
      setIsConnected(false)
      console.warn('Pusher not configured - chat will work in offline mode')
      return
    }

     // Listen for chat messages directly on this channel (scoped to this escrow)
     const handleChatMessage = (data: { id: string; message: string; sender: string; timestamp: string; name?: string; senderName?: string; [key: string]: unknown }) => {
       
       console.log('🔔 Received message data:', data)
       console.log('🔔 Data keys:', Object.keys(data))
       console.log('🔔 Name field:', data.name)
       console.log('🔔 SenderName field:', data.senderName)
       
       // Use the name field from the received data, fallback to getSenderName if not available
       const updatedData: ChatMessage = {
         id: data.id,
         sender: data.sender,
         senderName: (data.name as string) || getSenderName(data.sender),
         message: data.message,
         timestamp: new Date(data.timestamp),
         escrowId: escrowId
       }
       
       console.log('🔔 Updated message data:', updatedData)
       
       // Force update by replacing the entire messages array to clear any cached data
       setMessages(prev => {
         const newMessages = [...prev, updatedData]
         console.log('🔔 Setting new messages array:', newMessages)
         return newMessages
       })
       
       // Play sound and blink tab if not focused
       playNotificationSound()
       if (!isTabFocused) {
         startTabBlinking()
       }
     }

     // Listen for connection status
     const handleConnectionStatus = () => {
       setIsConnected(true)
     }

     // Bind directly to the channel for chat messages (scoped to this escrow only)
     if (channelInstance) {
       channelInstance.bind('new-message', handleChatMessage)
       channelInstance.bind('pusher:subscription_succeeded', handleConnectionStatus)
       channelInstance.bind('pusher:subscription_error', () => {
         console.error('🔔 Failed to subscribe to chat channel')
         setIsConnected(false)
       })
     }

    // Load message history
    loadMessageHistory(escrowId)

     // Cleanup function
     return () => {
       if (channelInstance) {
         channelInstance.unbind_all()
       }
       unsubscribeFromChannel(channelName)
       setIsConnected(false)
     }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escrowId]) // Only depend on escrowId to prevent infinite loops

  const sendMessage = async () => {
    if (!newMessage.trim() || !principal || isSending) return
    
    setIsSending(true)

    const messageData = {
      sender: typeof principal === 'string' ? principal : principal.toText(),
      senderName: currentUserName || getSenderName(principal),
      message: newMessage.trim(),
      name: currentUserName || getSenderName(principal),
      timestamp: new Date().toISOString(),
      escrowId
    }
    console.log('🔍 messageData:', messageData)

    try {
      // Send to backend API to broadcast to all participants
      await sendEscrowMessage(escrowId, messageData)
      
      setNewMessage('')
      // Scroll to bottom after successfully sending message
      setTimeout(() => {
        scrollToBottom()
      }, 100)
      // Focus back to input field
      setTimeout(() => {
        inputRef.current?.focus()
      }, 150)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card className={`flex-1 min-w-0 border-0 ${className || ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          Escrow Chat
          <div className={`ml-auto h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Communicate with other participants in this escrow
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col h-96 chat-container">
          {/* Messages Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="opacity-50 text-[#6B6B6B]">No messages were exchanged during this escrow.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <AgentChatMessage
                    key={`${msg.id}-${msg.senderName}-${msg.timestamp.getTime()}`}
                    message={msg}
                    currentUser={typeof principal === 'string' ? principal : (principal?.toText() || '')}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input - Only show if escrow is active */}
          {escrowStatus !== 'released' && escrowStatus !== 'cancelled' && escrowStatus !== 'refund' && escrowStatus !== 'refunded' && (
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected || isSending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={getChatPlaceholder(escrowStatus)}
                  disabled={!isConnected || isSending}
                  className="flex-1"
                />
              </div>
              {!isConnected && (
                <p className="text-xs text-muted-foreground mt-2">
                  {pusherClient ? 'Connecting to chat...' : 'Real-time chat unavailable - messages will be saved locally'}
                </p>
              )}
            </div>
          )}
          
          {/* Chat disabled message for completed escrows */}
          {(escrowStatus === 'released' || escrowStatus === 'cancelled' || escrowStatus === 'refund' || escrowStatus === 'refunded') && (
            <div className="border-t p-4">
              <div className="text-center text-muted-foreground py-4">
                <MessageCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm opacity-75">
                  {escrowStatus === 'cancelled' && "Chat disabled - escrow is cancelled"}
                  {escrowStatus === 'released' && "Chat disabled - escrow is completed"}
                  {escrowStatus === 'refund' && "Chat disabled - escrow is refunded"}
                  {escrowStatus === 'refunded' && "Chat disabled - escrow is refunded"}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
