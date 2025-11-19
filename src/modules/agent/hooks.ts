import { subscribeToChannel, unsubscribeFromChannel } from '@/lib/integrations/pusher'
import { sendEscrowMessage } from '@/lib/internal/auth'
import { CHAT_CHANNEL_PREFIX } from '@/modules/shared.constants'
import { useCallback, useEffect, useState } from 'react'

interface ChatMessage {
  id: string
  sender: string
  senderName: string
  message: string
  timestamp: Date
  escrowId: string
}

interface UseEscrowChatProps {
  escrowId: string
  principal?: string
}

export function useEscrowChat({ escrowId, principal }: UseEscrowChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const connectToChat = useCallback(() => {
    if (!escrowId) return

    const channelName = `${CHAT_CHANNEL_PREFIX}${escrowId}`
    
    const channelInstance = subscribeToChannel(channelName)

    const handleChatMessage = (data: { id: string; message: string; sender: string; timestamp: string; [key: string]: unknown }) => {
      setMessages(prev => {
        if (prev.some(msg => msg.id === data.id)) return prev
        
        const newMessage: ChatMessage = {
          id: data.id,
          sender: data.sender,
          senderName: data.sender, // Will be updated by component
          message: data.message,
          timestamp: new Date(data.timestamp),
          escrowId: escrowId
        }
        
        return [...prev, newMessage]
      })
    }

    const handleConnectionStatus = () => {
      setIsConnected(true)
    }

    if (channelInstance) {
      channelInstance.bind('new-message', handleChatMessage)
      channelInstance.bind('pusher:subscription_succeeded', handleConnectionStatus)
      channelInstance.bind('pusher:subscription_error', () => {
        setIsConnected(false)
      })
    }

    return () => {
      if (channelInstance) {
        channelInstance.unbind_all()
      }
      unsubscribeFromChannel(channelName)
      setIsConnected(false)
    }
  }, [escrowId])

  const disconnectFromChat = useCallback(() => {
    if (escrowId) {
      const channelName = `${CHAT_CHANNEL_PREFIX}${escrowId}`
      unsubscribeFromChannel(channelName)
      setIsConnected(false)
    }
  }, [escrowId])

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || !principal) return

    try {
      await sendEscrowMessage(escrowId, {
        sender: principal,
        senderName: 'You',
        message: message.trim(),
        timestamp: new Date().toISOString(),
        escrowId
      })
      return true
    } catch {
      return false
    }
  }, [principal, escrowId])

  const loadMessageHistory = useCallback(async () => {
    try {
      
      const sampleMessages: ChatMessage[] = [
        {
          id: '1',
          sender: 'system',
          senderName: 'System',
          message: 'Escrow chat started. All participants can communicate here.',
          timestamp: new Date(Date.now() - 60000),
          escrowId
        }
      ]
      setMessages(sampleMessages)
    } catch {
    }
  }, [escrowId])

  const getSenderName = (senderPrincipal: string): string => {
    return senderPrincipal.slice(0, 8) + '...'
  }

  useEffect(() => {
    connectToChat()
    loadMessageHistory()

    return () => {
      disconnectFromChat()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escrowId]) // Only depend on escrowId to prevent infinite loops

  return {
    messages,
    isConnected,
    sendMessage,
    loadMessageHistory,
    getSenderName
  }
}

