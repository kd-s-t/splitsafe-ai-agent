import { incrementUnreadCount } from '@/lib/redux/store/notificationsSlice';
import { store } from '@/lib/redux/store/store';
// Server-side Pusher is not available in client-side React app
// Only use pusher-js for client-side
import PusherClient, { Channel } from 'pusher-js';
import { toast } from 'sonner';

// Client-side Pusher configuration
// Note: Server-side Pusher (with secret) is only used in the backend API
// This client only uses pusher-js for client-side subscriptions
// Vite uses import.meta.env for VITE_ prefixed vars
const clientPusherKey = import.meta.env.VITE_PUSHER_KEY || 
  (typeof process !== 'undefined' ? process.env?.VITE_PUSHER_KEY : '');
const clientPusherCluster = import.meta.env.VITE_PUSHER_CLUSTER || 
  (typeof process !== 'undefined' ? process.env?.VITE_PUSHER_CLUSTER : '');

// Only create Pusher client if we have valid keys (non-empty strings)
export const pusherClient = clientPusherKey && clientPusherCluster && clientPusherKey.trim() !== '' && clientPusherCluster.trim() !== ''
  ? new PusherClient(clientPusherKey, { 
      cluster: clientPusherCluster,
      enabledTransports: ['ws', 'wss'], // Use WebSocket transports
      disabledTransports: ['xhr_streaming', 'xhr_polling'], // Disable XHR transports that cause CORS issues
    })
  : null;

// Log warning if Pusher is not configured (but only in development)
if (typeof window !== 'undefined' && !pusherClient && (process.env?.NODE_ENV === 'development' || import.meta.env?.MODE === 'development')) {
  console.warn('Pusher is not configured. Real-time features will be disabled. Set VITE_PUSHER_KEY and VITE_PUSHER_CLUSTER environment variables to enable.');
}



// Centralized channel management
const subscribedChannels = new Map<string, Channel>();

// Track recent notifications to prevent duplicates
// const recentNotifications = new Set<string>();
const recentEventData = new Map<string, { timestamp: number; data: unknown }>();

// Track bound events to prevent multiple bindings
const boundEvents = new Set<string>();

// Helper function to subscribe to channels with event listeners
export const subscribeToChannel = (channelName: string) => {
  // Check if Pusher is available
  if (!pusherClient) {
    console.warn('Pusher not configured - real-time features disabled');
    return null;
  }

  // Avoid duplicate subscriptions
  if (subscribedChannels.has(channelName)) {
    return subscribedChannels.get(channelName);
  }

  const channel = pusherClient.subscribe(channelName);
  
  // Store channel reference
  subscribedChannels.set(channelName, channel);
  
  // Bind to all escrow events (only for user channels)
  if (channelName.startsWith('user-')) {
    // Single generic listener for all escrow events
    const escrowEvents = [
      'escrow-initiated', 'escrow-updated', 'escrow-approved',
      'escrow-cancel', 'escrow-decline', 'escrow-refund', 'escrow-release'
    ];
    
    // Milestone events
    const milestoneEvents = [
      'milestone-created', 'milestone-approved', 'milestone-declined',
      'contract-signed', 'contract-approved', 'milestone-completed',
      'milestone-released', 'proof-of-work-submitted', 'milestone-payment-released'
    ];
    
    // Voucher events
    const voucherEvents = [
      'voucher-redeemed'
    ];
    
    // Bind escrow events
    escrowEvents.forEach(eventType => {
      const bindingKey = `${channelName}-${eventType}`;
      
      // Prevent multiple bindings of the same event
      if (boundEvents.has(bindingKey)) {
        return;
      }
      
      channel.bind(eventType, async (data: unknown) => {
        await handleEscrowEvent(eventType, data);
      });
      
      boundEvents.add(bindingKey);
    });
    
    // Bind milestone events
    milestoneEvents.forEach(eventType => {
      const bindingKey = `${channelName}-${eventType}`;
      
      // Prevent multiple bindings of the same event
      if (boundEvents.has(bindingKey)) {
        return;
      }
      
      channel.bind(eventType, async (data: unknown) => {
        await handleMilestoneEvent(eventType, data);
      });
      
      boundEvents.add(bindingKey);
    });
    
    // Bind voucher events
    voucherEvents.forEach(eventType => {
      const bindingKey = `${channelName}-${eventType}`;
      
      // Prevent multiple bindings of the same event
      if (boundEvents.has(bindingKey)) {
        return;
      }
      
      channel.bind(eventType, async (data: unknown) => {
        await handleVoucherEvent(eventType, data);
      });
      
      boundEvents.add(bindingKey);
    });
  }
  
  // Chat events are handled directly by components, not globally
  
  return channel;
};

// Browser notification utilities
const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
  return false;
};

export const showBrowserNotification = async (title: string, body: string, options?: NotificationOptions) => {
  // Check if notifications are supported and permitted
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Browser notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log('Notification permission denied');
      return;
    }
  }

  // Show browser notification
  const notification = new Notification(title, {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'splitsafe-notification', // This prevents multiple notifications from stacking
    requireInteraction: false,
    silent: false,
    ...options
  });

  // Auto-close notification after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);

  // Handle notification click
  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
};

// Notification functions for different app events
export const showWithdrawalNotification = async (title: string, body: string, data?: Record<string, unknown>) => {
  // Show toast notification
  toast.success(title, {
    description: body,
    duration: 5000,
  });

  // Show browser notification (only if app is not in focus)
  if (document.hidden) {
    showBrowserNotification(title, body, {
      tag: `withdrawal-${Date.now()}`,
      data: { type: 'withdrawal', ...data }
    });
  }

  // Play notification sound
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

export const showVoucherNotification = async (title: string, body: string, data?: Record<string, unknown>) => {
  // Show toast notification
  toast.success(title, {
    description: body,
    duration: 5000,
  });

  // Show browser notification (only if app is not in focus)
  if (document.hidden) {
    showBrowserNotification(title, body, {
      tag: `voucher-${Date.now()}`,
      data: { type: 'voucher', ...data }
    });
  }

  // Note: Sound removed from voucher notifications
};

// Export the permission request function for use in components
export { requestNotificationPermission };

// Update unread count from Motoko backend


// Global event handler for all milestone events
const handleMilestoneEvent = async (eventType: string, data: unknown) => {
  const eventData = data as { id?: string; milestoneId?: string; transactionId?: string; timestamp?: string; [key: string]: unknown };
  
  // Create unique notification ID to prevent duplicates
  const eventKey = `${eventType}-${eventData.milestoneId || eventData.id}-${eventData.timestamp || Date.now()}`;
  
  // Prevent duplicate processing
  if (recentEventData.has(eventKey)) {
    return;
  }
  
  // Store this event data and clean up after 2 seconds
  recentEventData.set(eventKey, { timestamp: Date.now(), data });
  setTimeout(() => {
    recentEventData.delete(eventKey);
  }, 2000);
  
  // Dispatch custom event for transaction page refresh
  const customEvent = new CustomEvent('milestone-event', {
    detail: {
      type: eventType,
      isCrossUserEvent: true,
      ...eventData
    }
  });
  window.dispatchEvent(customEvent);

  // Update unread count (without principal - will be handled by the notifications hook)
  // await handleCountUpdate(eventType);
  
  const title = getMilestoneEventTitle(eventType);
  const body = getMilestoneEventBody(eventType, eventData);
  
  // Show toast notification
  if (title && body) {
    toast.success(title, {
      description: body,
      duration: 5000,
    });
  }
  
  // Show browser notification (only if app is not in focus)
  if (title && body && document.hidden) {
    showBrowserNotification(title, body, {
      tag: `milestone-${eventType}-${eventData.milestoneId || eventData.id}`,
      data: { type: 'milestone', eventType, ...eventData }
    });
  }
  
  // Play notification sound
  try {
    // Simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};

// Global event handler for all escrow events
const handleEscrowEvent = async (eventType: string, data: unknown) => {
  const eventData = data as { id?: string; timestamp?: string; [key: string]: unknown };
  
  // Create unique notification ID to prevent duplicates
  // Include timestamp to make each event unique, even for the same escrow ID
  const eventKey = `${eventType}-${eventData.id}-${eventData.timestamp || Date.now()}`;
  // const eventDataString = JSON.stringify(data);
  
  
  // SIMPLIFIED DUPLICATE PREVENTION - Only check recentEventData, not processing flag
  if (recentEventData.has(eventKey)) {
    return;
  }
  
  // Store this event data and clean up after 2 seconds (reduced from 5)
  recentEventData.set(eventKey, { timestamp: Date.now(), data });
  setTimeout(() => {
    recentEventData.delete(eventKey);
  }, 2000);
  
  // Dispatch custom event for transaction page refresh
  const customEvent = new CustomEvent('escrow-event', {
    detail: {
      type: eventType,
      isCrossUserEvent: true, // Flag to indicate this is from another user's action
      ...eventData
    }
  });
  window.dispatchEvent(customEvent);

  // Update unread count based on event type
  
  if (eventType === 'escrow-initiated') {
    // For new escrow events, increment the count immediately
    store.dispatch(incrementUnreadCount());
  } else {
    // For other events, fetch the latest count from backend (without principal - will be handled by the notifications hook)
    // await handleCountUpdate(eventType);
  }
  
  const title = getEventTitle(eventType, eventData);
  const body = getEventBody(eventType, eventData);
  
  
  // FORCE TOAST ONLY - NO BROWSER NOTIFICATIONS - FIXED VERSION
  
  // Use different toast types based on event type
  if (eventType === 'escrow-cancel' || eventType === 'escrow-decline') {
    // Red for cancel/decline
    toast.error(title, {
      description: body,
      duration: 5000,
    });
  } else if (eventType === 'escrow-release') {
    // Green for release
    toast.success(title, {
      description: body,
      duration: 5000,
    });
  } else if (eventType === 'escrow-initiated') {
    // Yellow for initiate - using custom style with action button
    toast(title, {
      description: body,
      duration: 8000, // Longer duration for initiate
      style: {
        background: '#fbbf24', // yellow-400
        color: '#000000',
        border: '1px solid #f59e0b'
      },
      action: {
        label: 'View',
        onClick: () => {
          // Navigate to specific transaction page
          if (eventData.id) {
            window.location.href = `/transactions/${eventData.id}`;
          } else {
            window.location.href = '/transactions';
          }
        }
      }
    });
  } else if (eventType === 'escrow-approved') {
    // Blue for approve
    toast.info(title, {
      description: body,
      duration: 5000,
    });
  } else {
    // Default blue for other events
    toast.info(title, {
      description: body,
      duration: 5000,
    });
  }
  
  // Show browser notification (only if app is not in focus)
  if (title && body && document.hidden) {
    showBrowserNotification(title, body, {
      tag: `escrow-${eventType}-${eventData.id}`,
      data: { type: 'escrow', eventType, ...eventData }
    });
  }
  
  // Play notification sound using Web Audio API
  try {
    
    // Check if AudioContext is available
    if (typeof window === 'undefined' || !window.AudioContext && !(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) {
      return;
    }
    
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Resume audio context if it's suspended (required for user interaction)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Create a pleasant notification sound
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
  } catch {
    
    // Fallback: Try HTML5 Audio with data URL
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      await audio.play();
    } catch {
    }
  }
};

// Helper functions for milestone notifications
const getMilestoneEventTitle = (
  eventType: string
): string => {
  switch (eventType) {
    case 'milestone-created':
      return '🎯 New Milestone Escrow';
    case 'milestone-approved':
      return '✅ Milestone Approved';
    case 'milestone-declined':
      return '❌ Milestone Declined';
    case 'contract-signed':
      return '📝 Contract Signed';
    case 'contract-approved':
      return '✅ Contract Approved';
    case 'milestone-completed':
      return '🏆 Milestone Completed';
    case 'milestone-released':
      return '💰 Milestone Released';
    case 'proof-of-work-submitted':
      return '📋 Proof of Work Submitted';
    case 'milestone-payment-released':
      return '💸 Payment Released';
    default:
      return '📊 Milestone Update';
  }
};

const getMilestoneEventBody = (
  eventType: string,
  eventData: { 
    title?: string; 
    milestoneId?: string; 
    monthNumber?: number; 
    recipientName?: string;
    amount?: string;
    message?: string;
    [key: string]: unknown 
  }
): string => {
  const title = eventData.title || 'Milestone Escrow';
  const amount = eventData.amount || '0';
  
  switch (eventType) {
    case 'milestone-created':
      return `${title} - ${amount} BTC`;
    case 'milestone-approved':
      return `${eventData.recipientName || 'A recipient'} approved ${title}`;
    case 'milestone-declined':
      return `${eventData.recipientName || 'A recipient'} declined ${title}`;
    case 'contract-signed':
      return `${eventData.recipientName || 'A recipient'} signed the contract for ${title}`;
    case 'contract-approved':
      return `Contract approved for ${eventData.recipientName || 'recipient'} in ${title}`;
    case 'milestone-completed':
      return `Milestone ${eventData.monthNumber || 'N/A'} completed for ${title}`;
    case 'milestone-released':
      return `Milestone ${eventData.monthNumber || 'N/A'} payment released for ${title}`;
    case 'proof-of-work-submitted':
      return `${eventData.recipientName || 'A recipient'} submitted proof of work for milestone ${eventData.monthNumber || 'N/A'}`;
    case 'milestone-payment-released':
      return `Payment released for milestone ${eventData.monthNumber || 'N/A'} of ${title}`;
    default:
      return eventData.message || `${title} - ${amount} BTC`;
  }
};

// Helper functions for notifications
const getEventTitle = (eventType: string, data: { status?: string; readyForRelease?: boolean; [key: string]: unknown }): string => {
  switch (eventType) {
    case 'escrow-initiated': return 'New Escrow Request';
    case 'escrow-updated': 
      // Check if escrow is ready for release
      if (data?.status === 'ready_for_release' || data?.readyForRelease) {
        return 'Ready for Release';
      }
      return 'Escrow Updated';
    case 'escrow-approved': return 'Escrow Approved';
    case 'escrow-cancel': return 'Escrow Cancelled';
    case 'escrow-decline': return 'Escrow Declined';
    case 'escrow-refund': return 'Escrow Refunded';
    case 'escrow-release': return 'Escrow Released';
    default: return 'Escrow Notification';
  }
};

const getEventBody = (eventType: string, data: { amount?: string; title?: string; from?: string; [key: string]: unknown }): string => {
  const amount = data.amount || '0';
  const title = data.title || 'Escrow';
  
  switch (eventType) {
    case 'escrow-initiated': return `${data.from} sent you a new escrow request: ${title} (${amount} BTC)`;
    case 'escrow-updated': 
      // Check if escrow is ready for release
      if (data?.status === 'ready_for_release' || data?.readyForRelease) {
        return `Escrow "${title}" is ready for release! All approvals received.`;
      }
      return `Escrow "${title}" has been updated`;
    case 'escrow-approved': return `Escrow "${title}" has been approved`;
    case 'escrow-cancel': return `Escrow "${title}" has been cancelled`;
    case 'escrow-decline': return `Escrow "${title}" has been declined`;
    case 'escrow-refund': return `Escrow "${title}" has been refunded`;
    case 'escrow-release': return `Escrow "${title}" has been released`;
    default: return `Escrow "${title}" status updated`;
  }
};

// Global event handler for voucher events
const handleVoucherEvent = async (eventType: string, data: unknown) => {
  const eventData = data as { 
    voucherId?: string; 
    voucherCode?: string; 
    redeemerId?: string; 
    creatorId?: string;
    amount?: string;
    timestamp?: string; 
    [key: string]: unknown 
  };
  
  // Create unique notification ID to prevent duplicates
  const eventKey = `${eventType}-${eventData.voucherId || eventData.voucherCode}-${eventData.timestamp || Date.now()}`;
  
  // Prevent duplicate processing
  if (recentEventData.has(eventKey)) {
    return;
  }
  
  // Store this event data and clean up after 2 seconds
  recentEventData.set(eventKey, { timestamp: Date.now(), data });
  setTimeout(() => {
    recentEventData.delete(eventKey);
  }, 2000);
  
  // Dispatch custom event for voucher page refresh
  const customEvent = new CustomEvent('voucher-event', {
    detail: {
      type: eventType,
      isCrossUserEvent: true,
      ...eventData
    }
  });
  window.dispatchEvent(customEvent);

  const title = getVoucherEventTitle(eventType);
  const body = getVoucherEventBody(eventType, eventData);
  
  // Show toast notification
  if (title && body) {
    toast.success(title, {
      description: body,
      duration: 5000,
    });
  }
  
  // Show browser notification (only if app is not in focus)
  if (title && body && document.hidden) {
    showBrowserNotification(title, body, {
      tag: `voucher-${eventType}-${eventData.voucherId || eventData.voucherCode}`,
      data: { type: 'voucher', eventType, ...eventData }
    });
  }
  
  // Note: Sound removed from voucher event notifications
};

// Helper functions for voucher notifications
const getVoucherEventTitle = (eventType: string): string => {
  switch (eventType) {
    case 'voucher-redeemed':
      return '🎫 Voucher Redeemed';
    default:
      return '🎫 Voucher Update';
  }
};

const getVoucherEventBody = (
  eventType: string,
  eventData: { 
    voucherCode?: string; 
    amount?: string; 
    redeemerId?: string;
    creatorId?: string;
    [key: string]: unknown 
  }
): string => {
  switch (eventType) {
    case 'voucher-redeemed':
      return `Voucher ${eventData.voucherCode || 'Unknown'} for ${eventData.amount || 'Unknown'} BTC has been redeemed successfully.`;
    default:
      return 'Voucher status has been updated.';
  }
};

// Chat messages are handled directly by components on transaction pages

// Helper function to unsubscribe from channels
export const unsubscribeFromChannel = (channelName: string) => {
  if (subscribedChannels.has(channelName)) {
    subscribedChannels.delete(channelName);
  }
  if (pusherClient) {
    pusherClient.unsubscribe(channelName);
  }
};

// Helper function to get a channel (for components that need direct access)
export const getChannel = (channelName: string) => {
  return subscribedChannels.get(channelName);
};

// Helper function to trigger events (server-side only)
// This should be called from the backend API, not from the client
export const triggerEvent = async (
  channel: string,
  event: string,
  data: Record<string, unknown>
) => {
  // In a client-side React app, events are triggered via backend API calls
  // This function is kept for type compatibility but should not be used directly
  console.warn('triggerEvent should be called from the backend API, not the client');
  throw new Error('triggerEvent is only available on the server-side. Use backend API instead.');
};
