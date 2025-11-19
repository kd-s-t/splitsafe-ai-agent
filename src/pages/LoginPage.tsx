import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useAuth } from "@/contexts/auth-context";
import { clearUser } from "@/lib/redux/store/userSlice";
import { FeedbackDisplay } from "@/modules/feedback";
import { Principal } from "@dfinity/principal";
import { getInfo, saveInfo } from "@icp";
import { motion } from "framer-motion";
import { KeyRound, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

function LoginPageContent() {
  const dispatch = useDispatch();
  const { principal, authClient, updatePrincipal, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const [visitorTracked, setVisitorTracked] = useState(false);

  // Redirect /login/ to /login (remove trailing slash)
  useEffect(() => {
    if (pathname === '/login/') {
      navigate('/login', { replace: true });
    }
  }, [pathname, navigate]);

  // Track visitor when they visit the website
  const trackWebsiteVisitor = useCallback(async () => {
    if (visitorTracked) return;

    try {
      const anonymousPrincipal = Principal.fromText("2vxsx-fae");
      const userInfo = await getInfo(anonymousPrincipal, anonymousPrincipal);

      if (!userInfo) {
        const defaultUserInfo = {
          nickname: [] as [] | [string],
          username: [] as [] | [string],
          picture: [] as [] | [string],
          email: [] as [] | [string]
        };
        await saveInfo(anonymousPrincipal, defaultUserInfo);
      }

      setVisitorTracked(true);
    } catch (error) {
      console.error('Error tracking website visitor:', error);
    }
  }, [visitorTracked]);

  useEffect(() => {
    trackWebsiteVisitor();
  }, [trackWebsiteVisitor]);

  useEffect(() => {
    if (principal) {
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [principal, navigate, searchParams]);

  useEffect(() => {
    if (!isLoading && !principal && authClient) {
      updatePrincipal();
    }
  }, [isLoading, principal, authClient, updatePrincipal]);

  useEffect(() => {
    if (authClient && !principal && !isLoading) {
      const checkAuth = async () => {
        await updatePrincipal();
      };
      checkAuth();
    }
  }, [authClient, principal, isLoading, updatePrincipal]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleLogin = async () => {
    await login();
    navigate('/dashboard');
  };

  const login = async () => {
    if (!authClient) return;

    const identityProvider = 'https://identity.internetcomputer.org';
    let derivationOrigin: string;
    
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isICDeployment = hostname.includes('.icp0.io') || hostname.includes('.ic0.app');
      
      if (isICDeployment) {
        derivationOrigin = window.location.origin;
        console.log('[AUTH] Detected IC deployment, using derivation origin:', derivationOrigin);
      } else if (process.env.NODE_ENV === 'development') {
        derivationOrigin = 'http://localhost:3000';
        console.log('[AUTH] Using development derivation origin:', derivationOrigin);
      } else if (hostname === 'thesplitsafe.com' || hostname.includes('thesplitsafe.com')) {
        derivationOrigin = window.location.origin;
        console.log('[AUTH] Using custom domain derivation origin:', derivationOrigin);
      } else {
        derivationOrigin = window.location.origin || 'https://thesplitsafe.com';
        console.log('[AUTH] Using current origin as derivation origin:', derivationOrigin);
      }
    } else {
      derivationOrigin = 'https://thesplitsafe.com';
    }

    await authClient.login({
      identityProvider,
      maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1_000_000_000),
      derivationOrigin,
      onSuccess: async () => {
        await updatePrincipal();
        try {
          const userPrincipal = authClient.getIdentity().getPrincipal();
          const userInfo = await getInfo(userPrincipal, userPrincipal);
          if (!userInfo) {
            const defaultUserInfo = {
              nickname: [] as [] | [string],
              username: [] as [] | [string],
              picture: [] as [] | [string],
              email: [] as [] | [string]
            };
            await saveInfo(userPrincipal, defaultUserInfo);
          }
        } catch (error) {
          console.error('Error tracking logged-in user:', error);
        }
      },
    });
  };

  const logout = async () => {
    if (!authClient) return;
    await authClient.logout();
    indexedDB.deleteDatabase('auth-client-storage');
    dispatch(clearUser());
  };

  if (principal) {
    return null;
  }

  return (
    <div
      className="login-page h-screen w-screen flex flex-col p-4 relative justify-between overflow-hidden"
      style={{
        background: "radial-gradient(91.85% 91.85% at 57.95% 22.75%, #3E3E3E 0%, #0D0D0D 100%)",
      }}
    >
      <FeedbackDisplay />
      <div>
        <img src="/logo-partial.svg" alt="SplitDApp Logo" width={24} height={24} />
      </div>
      <motion.div
        className="absolute top-0 right-0 overflow-hidden"
        initial={{ x: 400, y: 0, opacity: 0 }}
        animate={{ x: 130, y: -40, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <img
          src="/bg-logo.svg"
          alt="SplitDApp Logo"
          width={800}
          height={64}
          style={{ height: "auto", maxWidth: "100%", maxHeight: "100%" }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full space-y-2 flex flex-col items-center -mt-8 z-10"
      >
        <img
          src="/splitsafe-logo.svg"
          alt="SplitDApp Logo"
          width={150}
          height={64}
          style={{ width: "auto", height: "auto" }}
        />
        <Typography variant="h2" className="text-center mt-6">
          Secure. Trustless. On-chain.
        </Typography>
        <Typography variant="large" className="font-medium text-center text-[#BCBCBC]">
          Built for native Bitcoin escrow — no bridges, no wraps.
        </Typography>

        {principal ? (
          <>
            <p className="text-center break-all">Principal: {principal}</p>
            <motion.div whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <Button onClick={logout} variant="secondary" className="text-sm mt-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="relative flex items-center gap-2">
                  <LogOut size={14} />
                  <span>Logout</span>
                </div>
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Button variant="secondary" onClick={handleLogin} className="text-sm mt-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative flex items-center gap-2">
                <KeyRound size={14} color="#FEB64D" />
                <span>Login with Internet Identity</span>
              </div>
            </Button>
          </motion.div>
        )}
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 w-[450px] overflow-hidden"
        initial={{ scale: 0.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <img
          src="/bg-eclipse-group.svg"
          alt="SplitDApp Logo"
          width={450}
          height={64}
          style={{ width: "auto", height: "auto", maxWidth: "100%", maxHeight: "100%" }}
        />
      </motion.div>
      <div className="flex items-center gap-6 w-full justify-center z-20 relative">
        <Link to="/terms-of-service" className="hover:text-[#FEB64D] transition-colors">
          <Typography variant="muted" className="cursor-pointer">Terms of service</Typography>
        </Link>
        <Link to="/privacy-policy" className="hover:text-[#FEB64D] transition-colors">
          <Typography variant="muted" className="cursor-pointer">Privacy policy</Typography>
        </Link>
        <Link to="/faq" className="hover:text-[#FEB64D] transition-colors">
          <Typography variant="muted" className="cursor-pointer">FAQ</Typography>
        </Link>
        <Link to="/contact-us" className="hover:text-[#FEB64D] transition-colors">
          <Typography variant="muted" className="cursor-pointer">Contact Us</Typography>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

