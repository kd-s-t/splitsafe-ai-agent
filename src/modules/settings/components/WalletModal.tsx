import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog-new";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/hooks/useUser";
import { createAnonymousActorNew } from "@/lib/internal/icp/splitDapp/splitDappNew";
import { setCkbtcAddress } from "@/lib/redux";
import { useModalCleanup } from "@/modules/settings/hooks";
import { Principal } from "@dfinity/principal";
// Image component removed - use <img> tags instead
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

// QR Code Modal Component
const QRCodeModal = ({ isOpen, onClose, data, title }: { isOpen: boolean; onClose: () => void; data: string; title: string }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && data) {
      QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#FFFFFF',
          light: '#000000'
        }
      }).then(setQrCodeDataUrl).catch(console.error);
    }
  }, [isOpen, data]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!bg-[#212121] border border-[#303333] !w-[400px] !max-w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title} QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to get the {title.toLowerCase()} information.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {qrCodeDataUrl ? (
            <div className="bg-white p-4 rounded-lg">
              <img src={qrCodeDataUrl} alt={`${title} QR Code`} width={256} height={256} className="w-64 h-64" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-gray-500">Generating QR code...</div>
            </div>
          )}
          <div className="text-center text-sm text-[#A1A1A1] max-w-xs break-all">
            {data}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="border border-[#7A7A7A] cursor-pointer"
            >
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Wallet Modal Component
const WalletModal = ({ isOpen, onClose, principalId }: { isOpen: boolean; onClose: () => void; principalId: string }) => {
  const { icpBalance, ckbtcAddress, principal } = useUser();
  const { authClient } = useAuth();
  const dispatch = useDispatch();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState("");
  const [qrTitle, setQrTitle] = useState("");

  const generateSeiAddress = useCallback(async () => {
    try {
      console.log('🔄 [WalletModal] Generating SEI address automatically...');
      
      // Check if user is authenticated first
      if (!authClient) {
        console.warn('❌ [WalletModal] No auth client available, trying anonymous SEI generation...');
        // Try anonymous generation as fallback
        try {
          const anonymousActor = await createAnonymousActorNew();
          if (anonymousActor && typeof anonymousActor.requestSeiWalletAnonymous === 'function') {
            const anonymousResult = await anonymousActor.requestSeiWalletAnonymous() as { ok?: { seiAddress: string; owner: Principal }; err?: string } | null;
            if (anonymousResult?.ok?.seiAddress) {
              console.log('✅ [WalletModal] SEI address generated anonymously:', anonymousResult.ok.seiAddress);
              return;
            }
          }
        } catch (anonError) {
          console.error('❌ [WalletModal] Anonymous SEI generation also failed:', anonError);
        }
        return;
      }
      
      const isAuthenticated = await authClient.isAuthenticated();
      if (!isAuthenticated) {
        console.warn('❌ [WalletModal] User not authenticated, trying anonymous SEI generation...');
        // Try anonymous generation as fallback
        try {
          const anonymousActor = await createAnonymousActorNew();
          if (anonymousActor && typeof anonymousActor.requestSeiWalletAnonymous === 'function') {
            const anonymousResult = await anonymousActor.requestSeiWalletAnonymous() as { ok?: { seiAddress: string; owner: Principal }; err?: string } | null;
            if (anonymousResult?.ok?.seiAddress) {
              console.log('✅ [WalletModal] SEI address generated anonymously:', anonymousResult.ok.seiAddress);
              return;
            }
          }
        } catch (anonError) {
          console.error('❌ [WalletModal] Anonymous SEI generation also failed:', anonError);
        }
        return;
      }
      
      // Use anonymous actor to avoid certificate verification issues
      const anonymousActor = await createAnonymousActorNew();
      
      if (anonymousActor && typeof anonymousActor.getOrRequestSeiWalletForUser === 'function') {
        const seiWalletResult = await anonymousActor.getOrRequestSeiWalletForUser(principal) as { ok?: { seiAddress: string; owner: Principal }; err?: string } | null;
        if (seiWalletResult?.ok?.seiAddress) {
          console.log('✅ [WalletModal] SEI address generated/retrieved automatically:', seiWalletResult.ok.seiAddress);
        } else {
          console.warn('❌ [WalletModal] Failed to generate/retrieve SEI address:', seiWalletResult?.err || 'Unknown error');
        }
      } else {
        console.warn('❌ [WalletModal] getOrRequestSeiWalletForUser method not available on anonymous actor');
      }
    } catch (seiError) {
      console.error('❌ [WalletModal] Error generating SEI address automatically:', seiError);
    }
  }, [authClient, principal]);

  const generateCkbtcAddressAutomatic = useCallback(async () => {
    try {
      console.log('🔄 [WalletModal] Generating ckBTC address automatically...');
      
      // Don't generate if address already exists
      if (ckbtcAddress) {
        console.log('✅ [WalletModal] ckBTC address already exists, skipping generation:', ckbtcAddress);
        return;
      }
      
      // Check if user is authenticated first
      if (!authClient) {
        console.warn('❌ [WalletModal] No auth client available, trying anonymous generation...');
        // Try anonymous generation as fallback
        try {
          const anonymousActor = await createAnonymousActorNew();
          if (anonymousActor && typeof anonymousActor.getCkbtcAddressAnonymous === 'function') {
            const anonymousResult = await anonymousActor.getCkbtcAddressAnonymous() as { ok?: { btcAddress: string; owner: Principal; subaccount: Uint8Array }; err?: string } | null;
            if (anonymousResult?.ok?.btcAddress) {
              console.log('✅ [WalletModal] ckBTC address generated anonymously:', anonymousResult.ok.btcAddress);
              dispatch(setCkbtcAddress(anonymousResult.ok.btcAddress));
              return;
            }
          }
        } catch (anonError) {
          console.error('❌ [WalletModal] Anonymous generation also failed:', anonError);
        }
        return;
      }
      
      const isAuthenticated = await authClient.isAuthenticated();
      if (!isAuthenticated) {
        console.warn('❌ [WalletModal] User not authenticated, trying anonymous generation...');
        // Try anonymous generation as fallback
        try {
          const anonymousActor = await createAnonymousActorNew();
          if (anonymousActor && typeof anonymousActor.getCkbtcAddressAnonymous === 'function') {
            const anonymousResult = await anonymousActor.getCkbtcAddressAnonymous() as { ok?: { btcAddress: string; owner: Principal; subaccount: Uint8Array }; err?: string } | null;
            if (anonymousResult?.ok?.btcAddress) {
              console.log('✅ [WalletModal] ckBTC address generated anonymously:', anonymousResult.ok.btcAddress);
              dispatch(setCkbtcAddress(anonymousResult.ok.btcAddress));
              return;
            }
          }
        } catch (anonError) {
          console.error('❌ [WalletModal] Anonymous generation also failed:', anonError);
        }
        return;
      }
      
      // Use anonymous actor to avoid certificate verification issues
      const anonymousActor = await createAnonymousActorNew();
      
      // Generate ckBTC address
      if (anonymousActor && typeof anonymousActor.generateBitcoinAddressForUser === 'function') {
        const newAddressResult = await anonymousActor.generateBitcoinAddressForUser(principal) as string | null;
        if (newAddressResult) {
          console.log('✅ [WalletModal] ckBTC address generated automatically:', newAddressResult);
          dispatch(setCkbtcAddress(newAddressResult));
        } else {
          console.warn('❌ [WalletModal] Failed to generate new Bitcoin address - no result returned');
        }
      } else {
        console.warn('❌ [WalletModal] generateBitcoinAddressForUser method not available on anonymous actor');
      }
    } catch (error) {
      console.error('❌ [WalletModal] Error generating Bitcoin address automatically:', error);
    }
  }, [authClient, dispatch, ckbtcAddress, principal]);

  // Debug logging when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 [WalletModal] Modal opened, ckBTC address state:', ckbtcAddress);
      
      // If no ckBTC address exists, try to trigger automatic generation
      if (!ckbtcAddress) {
        console.log('🔄 [WalletModal] No ckBTC address found, attempting automatic generation...');
        generateCkbtcAddressAutomatic();
      }
      
      // Also generate SEI address automatically (hidden from UI)
      generateSeiAddress();
    }
  }, [isOpen, ckbtcAddress, generateCkbtcAddressAutomatic, generateSeiAddress]);


  // Use the custom hook for modal cleanup
  useModalCleanup(isOpen);

  // Defensive check for required props
  if (!onClose || typeof onClose !== 'function') {
    console.error('WalletModal: onClose prop is missing or invalid');
    return null;
  }

  const copyToClipboard = async (text: string, type: string) => {
    if (!text || typeof text !== 'string') {
      console.error('Invalid text provided to copyToClipboard');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setShowTooltip(type);
      setTimeout(() => setShowTooltip(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setShowTooltip('error');
      setTimeout(() => setShowTooltip(null), 2000);
    }
  };

  const showQRCode = (data: string, title: string) => {
    setQrData(data);
    setQrTitle(title);
    setQrModalOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="!bg-[#212121] border border-[#303333] !w-[540px] !max-w-[90vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Wallet</DialogTitle>
            <DialogDescription>
              Your multi-chain wallet information. You can copy addresses for reference or use in transactions.
            </DialogDescription>
          </DialogHeader>

          {/* Content */}
          <div className="space-y-6">
            {/* ICP Principal */}
            <div>
              <Label className="block text-white mb-2">ICP Principal ID</Label>
              <div className="flex gap-2 items-stretch">
                <div className="flex-1">
                  <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3 h-[48px] flex items-center">
                    <input
                      type="text"
                      value={principalId}
                      readOnly
                      className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                      placeholder="Your ICP Principal ID"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(principalId, 'principal')}
                      className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer h-[48px] flex items-center justify-center"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="5.33" y="5.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5" />
                        <rect x="1.33" y="1.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5" />
                      </svg>
                    </button>
                    {showTooltip === 'principal' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                        Copied!
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => showQRCode(principalId, 'ICP Principal ID')}
                      className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer h-[48px] flex items-center justify-center"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="4" height="4" fill="white" />
                        <rect x="10" y="2" width="4" height="4" fill="white" />
                        <rect x="2" y="10" width="4" height="4" fill="white" />
                        <rect x="8" y="8" width="2" height="2" fill="white" />
                        <rect x="10" y="10" width="2" height="2" fill="white" />
                        <rect x="12" y="8" width="2" height="2" fill="white" />
                        <rect x="8" y="12" width="2" height="2" fill="white" />
                        <rect x="12" y="12" width="2" height="2" fill="white" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {icpBalance && (
                <div className="mt-2 text-sm text-[#A1A1A1]">
                  Balance: {Number(icpBalance).toFixed(4)} ICP
                </div>
              )}
            </div>

            {/* cKBTC Address */}
            <div>
              <Label className="block text-white mb-2">cKBTC Address</Label>
              <div className="flex gap-2 items-stretch">
                <div className="flex-1">
                  <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3 h-[48px] flex items-center">
                    <input
                      type="text"
                      value={ckbtcAddress || "Generating address..."}
                      readOnly
                      className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                      placeholder="Your cKBTC address"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(ckbtcAddress || "", 'ckbtc')}
                      disabled={!ckbtcAddress}
                      className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[48px] flex items-center justify-center"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="5.33" y="5.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5" />
                        <rect x="1.33" y="1.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5" />
                      </svg>
                    </button>
                    {showTooltip === 'ckbtc' && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                        Copied!
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => showQRCode(ckbtcAddress || "", 'cKBTC Address')}
                      disabled={!ckbtcAddress}
                      className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-[48px] flex items-center justify-center"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="2" y="2" width="4" height="4" fill="white" />
                        <rect x="10" y="2" width="4" height="4" fill="white" />
                        <rect x="2" y="10" width="4" height="4" fill="white" />
                        <rect x="8" y="8" width="2" height="2" fill="white" />
                        <rect x="10" y="10" width="2" height="2" fill="white" />
                        <rect x="12" y="8" width="2" height="2" fill="white" />
                        <rect x="8" y="12" width="2" height="2" fill="white" />
                        <rect x="12" y="12" width="2" height="2" fill="white" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with close button */}
          <div className="flex justify-end mt-6">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="border border-[#7A7A7A] cursor-pointer"
              >
                Close
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      
      <QRCodeModal 
        isOpen={qrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        data={qrData} 
        title={qrTitle} 
      />
    </>
  );
};

export default WalletModal;