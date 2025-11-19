// Notifications module hooks
import { useAuth } from '@/contexts/auth-context';
import {
    decrementUnreadCount,
    fetchUnreadCount,
    incrementUnreadCount,
    selectNotificationsError,
    selectNotificationsLoading,
    selectUnreadCount,
    setUnreadCount
} from '@/lib/redux/store/notificationsSlice';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store/store';
import { useEffect } from 'react';

export const useUnreadCount = () => {
  const dispatch = useAppDispatch();
  const { principal } = useAuth();
  
  const unreadCount = useAppSelector(selectUnreadCount);
  const isLoading = useAppSelector(selectNotificationsLoading);
  const error = useAppSelector(selectNotificationsError);

  const refreshUnreadCount = () => {
    if (principal) {
      dispatch(fetchUnreadCount(principal));
    }
  };

  const incrementCount = () => {
    dispatch(incrementUnreadCount());
  };

  const decrementCount = () => {
    dispatch(decrementUnreadCount());
  };

  const setCount = (count: number) => {
    dispatch(setUnreadCount(count));
  };

  // Fetch unread count when principal changes
  useEffect(() => {
    if (principal) {
      dispatch(fetchUnreadCount(principal));
    }
  }, [principal, dispatch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!principal) return;

    const interval = setInterval(() => {
      dispatch(fetchUnreadCount(principal));
    }, 30000);

    return () => clearInterval(interval);
  }, [principal, dispatch]);

  return {
    unreadCount,
    isLoading,
    error,
    refreshUnreadCount,
    incrementCount,
    decrementCount,
    setCount
  };
};

