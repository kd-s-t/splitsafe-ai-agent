import { useAuth } from '@/contexts/auth-context';
import { RootState } from '@/lib/redux/store/store';
import { useSelector } from 'react-redux';

export const useUser = () => {
  const { principal } = useAuth();
  const userState = useSelector((state: RootState) => state.user);


  return {
    principal,
    name: userState.name,
    profilePicture: userState.profilePicture,
    email: userState.email,
    balance: userState.balance,
    icpBalance: userState.icpBalance,
    ckbtcAddress: userState.ckbtcAddress,
    ckbtcBalance: userState.ckbtcBalance,
    seiAddress: userState.seiAddress,
    isAdmin: userState.isAdmin,
  };
};
