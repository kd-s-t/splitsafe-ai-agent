'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { setActivePage, setSubtitle, setTitle } from '@/lib/redux/store/store';
import { setTransactions } from '@/lib/redux/store/transactionsSlice';
import { LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';

export default function LogoutButton() {
  const dispatch = useDispatch();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Use the logout function from auth context
      await logout();
      
      // Clear additional state
      dispatch(setTransactions([]));
      dispatch(setTitle(''));
      dispatch(setSubtitle(''));
      dispatch(setActivePage('dashboard'));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleLogout}
      className="px-2 py-1.5 cursor-pointer hover:bg-[#2F2F2F] focus:bg-[#2F2F2F] data-[highlighted]:bg-[#2F2F2F] rounded"
    >
      <div className="flex items-center gap-3">
        <LogOut size={16} className="text-[#FEB64D]" />
        <span className="text-sm text-white">Log out</span>
      </div>
    </DropdownMenuItem>
  );
}
