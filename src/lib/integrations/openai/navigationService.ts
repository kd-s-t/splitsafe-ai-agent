import { ApprovalSuggestionAction, EscrowCreateAction, HelpDecideEscrowsAction, NavigationAction as ParsedNavigationAction } from './actionParser';

export interface NavigationAction {
  type: 'redirect' | 'populate_form';
  path: string;
  data?: Record<string, unknown>;
}

// Global navigate function reference (React Router)
type NavigateFunction = (to: string | number, options?: { replace?: boolean }) => void;
let navigateFn: NavigateFunction | null = null;

export function setRouter(navigate: NavigateFunction) {
  navigateFn = navigate;
}

export function handleEscrowCreation(action: EscrowCreateAction): NavigationAction {
  return {
    type: 'redirect',
    path: '/escrow',
    data: {
      amount: action.amount,
      recipients: action.recipients,
      title: action.title
    }
  };
}

export function handleBitcoinAddressSet(): NavigationAction {
  return {
    type: 'redirect',
    path: '/integrations',
    data: {
      autoSet: true
    }
  };
}

export function handleApprovalSuggestion(_action: ApprovalSuggestionAction): NavigationAction { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Check if user is already on transactions page
  if (typeof window !== 'undefined' && window.location.pathname === '/transactions') {
    return {
      type: 'populate_form',
      path: '/transactions',
      data: { show_approval_suggestions: true }
    };
  }
  
  return {
    type: 'redirect',
    path: '/transactions'
  };
}

export function handleHelpDecideEscrows(_action: HelpDecideEscrowsAction): NavigationAction { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Check if user is already on transactions page
  if (typeof window !== 'undefined' && window.location.pathname === '/transactions') {
    return {
      type: 'populate_form',
      path: '/transactions',
      data: { show_approval_suggestions: true, help_decide: true }
    };
  }
  
  return {
    type: 'redirect',
    path: '/transactions',
    data: { show_approval_suggestions: true, help_decide: true }
  };
}

export function handleNavigation(action: ParsedNavigationAction): NavigationAction {
  const pathMap: Record<string, string> = {
    'dashboard': '/dashboard',
    'escrow': '/escrow',
    'transactions': '/transactions',
    'settings': '/settings'
  };
  
  const path = pathMap[action.destination] || '/dashboard';
  
  return {
    type: 'redirect',
    path
  };
}

export function executeNavigation(navigation: NavigationAction): void {
  if (navigation.data) {
    // Handle approval suggestions specifically
    if (navigation.data.show_approval_suggestions) {
      sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
    } else {
      sessionStorage.setItem('splitsafe_chat_data', JSON.stringify(navigation.data));
    }
  }
  
  // Only navigate if it's a redirect action
  if (navigation.type === 'redirect') {
    if (navigateFn) {
      navigateFn(navigation.path);
    } else {
      window.location.href = navigation.path;
    }
  }
} 