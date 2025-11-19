"use client";

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { X } from 'lucide-react';
// img component removed - use <img> tags instead;
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface QRCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  amount?: number;
  title?: string;
  useExplorerUrl?: boolean;
}

export function QRCodeModal({
  open,
  onOpenChange,
  address,
  amount,
  useExplorerUrl = false
}: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Generate QR code when modal opens
  useEffect(() => {
    if (open && address) {
      const generateQR = async () => {
        try {
          let qrContent: string;

          if (useExplorerUrl) {
            // Use explorer URL for QR code
            qrContent = `${process.env.VITE_BLOCKSTREAM_URL}/address/${address}`;
          } else {
            // Create Bitcoin URI with amount if provided
            qrContent = amount
              ? `bitcoin:${address}?amount=${amount}`
              : `bitcoin:${address}`;
          }

          const canvas = canvasRef.current;
          if (canvas) {
            const qrDataUrl = await QRCode.toDataURL(qrContent, {
              width: 256,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });
            setQrDataUrl(qrDataUrl);
          }
        } catch (error) {
          console.error('Error generating QR code:', error);
          toast.error('Error', { description: 'Failed to generate QR code' });
        }
      };

      generateQR();
    }
  }, [open, address, amount, useExplorerUrl]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-md"
    >
      <div className="relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="absolute top-2 right-2 z-10 h-8 w-8 p-0 hover:bg-gray-200"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center space-y-4">
          {/* QR Code Display */}
          <div className="bg-white p-4 rounded-lg">
            <canvas
              ref={canvasRef}
              className="w-64 h-64"
              style={{ display: qrDataUrl ? 'none' : 'block' }}
            />
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Bitcoin Address QR Code"
                width={256}
                height={256}
                className="w-64 h-64"
              />
            )}
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              {useExplorerUrl
                ? 'Scan this QR code to view the address on Blockstream Explorer'
                : 'Scan this QR code with your Bitcoin wallet'
              }
            </p>
            {!useExplorerUrl && (
              <p className="text-xs mt-1">
                {amount ? 'Amount is pre-filled' : 'Enter amount manually'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
