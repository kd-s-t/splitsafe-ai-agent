// Shared hooks across all modules
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/hooks/useUser";
import type { RootState } from "@/lib/redux/store/store";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { NormalizedTransaction } from "./shared.types";

/**
 * Hook to detect if the current viewport is mobile
 * @returns boolean indicating if the viewport is mobile (max-width: 768px)
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const mediaQuery = window.matchMedia("(max-width: 768px)");
      setIsMobile(mediaQuery.matches);
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for resize
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    mediaQuery.addEventListener("change", checkIsMobile);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", checkIsMobile);
  }, []);

  return isMobile;
}

/**
 * Hook to clean up modal body styles when modal closes
 * @param isOpen - boolean indicating if modal is open
 */
export const useModalCleanup = (isOpen: boolean) => {
  useEffect(() => {
    const cleanupBodyStyles = () => {
      // Reset any body styles that might have been set by modals
      document.body.style.pointerEvents = '';
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.bottom = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };

    if (!isOpen) {
      // Clean up immediately when modal closes
      cleanupBodyStyles();
    }
    
    // Cleanup function to ensure styles are reset on unmount
    return cleanupBodyStyles;
  }, [isOpen]);
};

/**
 * Hook to generate a consistent name based on a principal hash
 * @param principal - the principal string to generate name from
 * @returns generated name using animals array
 */
import { ANIMALS } from './shared.constants';

export function useGeneratedName(principal: string) {
  
  const generateName = (principal: string): string => {
    if (!principal) return 'Anonymous';
    
    // Simple hash function to get consistent index
    let hash = 0;
    for (let i = 0; i < principal.length; i++) {
      const char = principal.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const index = Math.abs(hash) % ANIMALS.length;
    return ANIMALS[index];
  };

  return generateName(principal);
}

// ===== COMMON DATA HOOKS =====

/**
 * Hook to get transactions from Redux store
 * Used across dashboard transactions, and other modules
 */
export const useTransactions = () => {
  const transactions: NormalizedTransaction[] = useSelector((state: RootState) => state.transactions.transactions);
  
  return {
    transactions,
  };
};

/**
 * Hook to get user data with auth context
 * Combines useUser and useAuth for convenience
 */
export const useUserWithAuth = () => {
  const { principal, authClient } = useAuth();
  const { name, profilePicture, ckbtcBalance } = useUser();
  
  return {
    principal,
    authClient,
    isAuthenticated: !!principal,
    nickname: name,
    profilePicture,
    ckbtcBalance,
  };
};

// ===== COMMON UTILITY HOOKS =====

/**
 * Hook for managing async operations with loading and error states
 */
export function useAsyncOperation<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (operation: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for managing search state
 */
export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSearchChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const handleFilterChange = useCallback((key: string, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setSortBy('');
    setSortOrder('desc');
  }, []);

  return {
    query,
    filters,
    sortBy,
    sortOrder,
    handleSearchChange,
    handleFilterChange,
    setSortBy,
    setSortOrder,
    clearSearch,
  };
}

/**
 * Hook for managing dialog state
 */
export function useDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    isLoading,
    setIsLoading,
    open,
    close,
    toggle,
  };
}

/**
 * Hook for formatting utilities
 */
export function useFormatting() {
  const formatDate = useCallback((timestamp: number | string) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, []);

  const getInitials = useCallback((name: string) => {
    return name.charAt(0).toUpperCase();
  }, []);

  const truncateText = useCallback((text: string, length: number = 12) => {
    if (text.length <= length) return text;
    return `${text.slice(0, length)}...`;
  }, []);

  const truncatePrincipal = useCallback((principal: string, startLength: number = 8, endLength: number = 8) => {
    if (principal.length <= startLength + endLength) {
      return principal;
    }
    return `${principal.slice(0, startLength)}...${principal.slice(-endLength)}`;
  }, []);

  return {
    formatDate,
    getInitials,
    truncateText,
    truncatePrincipal,
  };
}
