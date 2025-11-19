import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

export default function HomePage() {
  const { principal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-[#0a0a0a]">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FEB64D]"></div>
      <div className="text-center">
        <p className="text-white text-lg font-medium">Initializing App</p>
        <p className="text-gray-400 text-sm mt-2">Checking authentication...</p>
      </div>
    </div>
  );
}

