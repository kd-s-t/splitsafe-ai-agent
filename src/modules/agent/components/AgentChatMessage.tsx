"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChatMessageProps } from '@/modules/agent/types'
import { PROFILE_PICTURES } from '@/modules/shared.constants'
import { formatDistanceToNow } from 'date-fns'

export default function AgentChatMessage({ 
  message, 
  currentUser, 
  className 
}: ChatMessageProps) {
  
  const isCurrentUser = String(message.sender) === String(currentUser)

  // Generate a consistent avatar URL based on sender name using default profile pictures
  const getAvatarUrl = (senderName: string) => {
    // Use a simple hash to generate consistent profile picture selection
    let hash = 0
    for (let i = 0; i < senderName.length; i++) {
      hash = senderName.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    // Map hash to one of the available profile pictures
    const profilePictures = PROFILE_PICTURES
    
    const selectedIndex = Math.abs(hash) % profilePictures.length
    return `/profiles/${profilePictures[selectedIndex]}`
  }

  // Get initials for fallback
  const getInitials = (senderName: string) => {
    return senderName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }


  return (
    <div
      key={`${message.id}-${message.timestamp.getTime()}`}
      className={`flex gap-2 mb-4 ${
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      } ${className}`}
    >
      {/* Avatar */}
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage 
            src={getAvatarUrl(message.senderName) || undefined} 
            alt={message.senderName}
          />
          <AvatarFallback className="text-xs">
            {getInitials(message.senderName)}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={`max-w-[70%] ${
          isCurrentUser ? 'items-end' : 'items-start'
        } flex flex-col`}
      >
        {/* Message bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm ${
            isCurrentUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
        </div>
        
        {/* Message metadata */}
        <div className={`flex items-center gap-2 mt-1 px-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isCurrentUser && (
            <span className="text-xs text-gray-500 font-medium">
              {message.senderName}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>
      
      {/* Current user avatar (right side) - removed as requested */}
    </div>
  )
}
