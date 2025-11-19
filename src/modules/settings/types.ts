export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onNameSaved?: () => void;
}

export interface ProfileDropdownProps {
  user: {
    principalId: string | null;
    name?: string;
  };
}

export interface LogoutButtonProps {
  onLogout?: () => void;
}
