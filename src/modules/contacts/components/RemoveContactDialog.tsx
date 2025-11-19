'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog-new';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useUser } from '@/hooks/useUser';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { CONTACT_DIALOG, CONTACT_UI } from '../constants';
import { useContactFormatting } from '../hooks';
import { type RemoveContactDialogProps } from '../types';

export default function RemoveContactDialog({
  open,
  onOpenChange,
  contact,
  deleteContact,
}: RemoveContactDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const { } = useUser();
  const { getInitials, truncateId, truncatePrincipal } = useContactFormatting();

  const handleRemoveContact = async () => {
    if (!contact) return;

    try {
      setIsRemoving(true);
      await deleteContact(contact);
      // Close dialog after successful deletion
      onOpenChange(false);
    } catch (error) {
      console.error('Error removing contact:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleClose = () => {
    if (!isRemoving) { // && !loading
      onOpenChange(false);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {CONTACT_DIALOG.REMOVE_TITLE}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {CONTACT_DIALOG.REMOVE_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-${CONTACT_UI.AVATAR_SIZE / 4} h-${CONTACT_UI.AVATAR_SIZE / 4} bg-blue-600 rounded-full flex items-center justify-center`}>
                <span className="text-sm font-medium text-white">
                  {getInitials(contact.nickname)}
                </span>
              </div>
              <div>
                <h3 className="text-white font-medium">{contact.nickname}</h3>
                <p className="text-gray-400 text-sm">ID: {truncateId(contact.id)}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Principal ID:</span>
                <span className="text-orange-400 font-mono">
                  {truncatePrincipal(String(contact.principalid))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">Active</span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-300 text-sm font-medium">Warning</p>
                <p className="text-yellow-200 text-sm mt-1">
                  Removing this contact will prevent them from participating in future escrow transactions with you.
                </p>
              </div>
            </div>
          </div>

        </div>

        <DialogFooter className="flex space-x-3">
          <Button variant="outline" onClick={handleClose} disabled={isRemoving}>
            Cancel
          </Button>
          <motion.div className="relative overflow-hidden">
            <Button
              onClick={handleRemoveContact}
              disabled={isRemoving}
              className="text-sm bg-[#FEB64D] text-black font-medium hover:bg-[#FEB64D]/90"
            >
              {isRemoving ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Removing...
                </>
              ) : (
                'Remove Contact'
              )}
            </Button>
            {isRemoving && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 2,
                }}
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                  transform: "skewX(-20deg)",
                }}
              />
            )}
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
