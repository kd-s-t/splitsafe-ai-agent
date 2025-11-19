'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useUser } from '@/hooks/useUser';
import { getAvatarUrl } from '@/lib/utils';
import { ChevronDown, MessageSquare, User, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './Button';
import EditProfileModal from './EditProfileModal';
import WalletModal from './WalletModal';

export default function ProfileDropdown({ principalId }: { principalId: string }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { name, profilePicture } = useUser()


  // Reset image states when profile picture changes
  useEffect(() => {
    setImageError(false);
  }, [profilePicture]);

  const handleSettingsClick = () => {
    try {
      setShowSettings(true);
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  };

  const handleWalletClick = () => {
    try {
      setShowWallet(true);
    } catch (error) {
      console.error('Error opening wallet:', error);
    }
  };

  const handleSettingsClose = () => {
    try {
      setShowSettings(false);
    } catch (error) {
      console.error('Error closing settings:', error);
    }
  };

  const handleWalletClose = () => {
    try {
      setShowWallet(false);
    } catch (error) {
      console.error('Error closing wallet:', error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-3 focus:outline-none cursor-pointer hover:opacity-80 transition-opacity min-w-0">
            <div className="relative w-12 h-12 overflow-hidden rounded-[34px] flex-shrink-0 bg-[#151717]">
              {!profilePicture ? (
                // Skeleton loader only when no profile picture is set
                <div className="w-full h-full bg-[#2F2F2F] animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 bg-[#424444] rounded-full"></div>
                </div>
              ) : imageError ? (
                // Fallback when image fails to load
                <div className="w-full h-full flex items-center justify-center bg-[#FEB64D] text-[#0D0D0D] font-semibold text-lg">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </div>
              ) : (
                // Actual profile picture
                <img
                  src={getAvatarUrl(principalId, profilePicture)}
                  alt={'User avatar'}
                  className="w-full h-full object-cover"
                  onError={() => {
                    setImageError(true);
                  }}
                />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-white text-[19px] leading-[19px] font-normal hidden md:block">
                {name || 'Loading...'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#212121] border border-[#303333] text-white rounded-xl shadow-lg -translate-x-7">

          <DropdownMenuLabel className="px-2 py-1.5">
            <div className="text-sm font-medium text-white">
              My Account
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-[#424444] mx-1" />

          <DropdownMenuItem
            onClick={handleSettingsClick}
            className="px-2 py-1.5 cursor-pointer hover:bg-[#2F2F2F] focus:bg-[#2F2F2F] data-[highlighted]:bg-[#2F2F2F] rounded"
          >
            <div className="flex items-center gap-3">
              <User size={16} className="text-[#FEB64D]" />
              <span className="text-sm text-white">Edit profile</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleWalletClick}
            className="px-2 py-1.5 cursor-pointer hover:bg-[#2F2F2F] focus:bg-[#2F2F2F] data-[highlighted]:bg-[#2F2F2F] rounded"
          >
            <div className="flex items-center gap-3">
              <Wallet size={16} className="text-[#FEB64D]" />
              <span className="text-sm text-white">Wallet</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="px-2 py-1.5 cursor-pointer hover:bg-[#2F2F2F] focus:bg-[#2F2F2F] data-[highlighted]:bg-[#2F2F2F] rounded"
          >
            <Link href="/feedback" className="flex items-center gap-3">
              <MessageSquare size={16} className="text-[#FEB64D]" />
              <span className="text-sm text-white">Feedback</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-[#424444] mx-1" />

          <LogoutButton />
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileModal
        open={showSettings}
        onClose={handleSettingsClose}
        onNameSaved={handleSettingsClose}
      />

      <WalletModal
        isOpen={showWallet}
        onClose={handleWalletClose}
        principalId={principalId}
      />
    </>
  );
}