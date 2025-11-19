"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Typography } from '@/components/ui/typography';
import { generateTransactionMessageSync } from '@/lib/utils';
import type { AppDispatch, RootState } from '@/lib/redux';
import { markTransactionAsReadWithCount } from '@/lib/redux';
import { useUnreadCount } from '@/modules/notifications/hooks';
import type { NormalizedTransaction } from '@/modules/shared.types';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';



function getTxId(tx: NormalizedTransaction) {
  return `${tx.from}_${tx.to.map((toEntry) => toEntry.principal).join('-')}_${tx.createdAt}`;
}

export default function TransactionNotificationDropdown({ principalId }: { principalId: string }) {
  const transactions = useSelector((state: RootState) => state.transactions.transactions);
  const dispatch = useDispatch<AppDispatch>();
  const { unreadCount, setCount } = useUnreadCount();

  // Fallback to local calculation if Redux count is 0 or fails
  const localUnreadCount = transactions.filter(tx => {
    // Check if current user is a recipient in this transaction
    const recipientEntry = tx.to.find((entry) =>
      String(entry.principal) === String(principalId)
    );

    const isUnread = recipientEntry && (recipientEntry.readAt === null || recipientEntry.readAt === undefined || recipientEntry.readAt === "null" || recipientEntry.readAt === "");

    return isUnread;
  }).length;

  // Use Redux unread count, fallback to local calculation if needed
  const finalUnreadCount = unreadCount > 0 ? unreadCount : localUnreadCount;

  // Sync local count to Redux if they differ (fallback mechanism)
  useEffect(() => {
    if (localUnreadCount > 0 && unreadCount === 0) {
      setCount(localUnreadCount);
    }
  }, [localUnreadCount, unreadCount, setCount]);


  const [bellRing, setBellRing] = useState(false);

  // Ring bell every 5 seconds when there are unread notifications
  useEffect(() => {
    if (finalUnreadCount === 0) return;

    const interval = setInterval(() => {
      setBellRing(true);
      setTimeout(() => setBellRing(false), 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [finalUnreadCount]);

  const handleRowClick = async (tx: NormalizedTransaction) => {
    const recipientEntry = tx.to.find((entry) =>
      String(entry.principal) === String(principalId)
    );

    if (recipientEntry && (recipientEntry.readAt === null || recipientEntry.readAt === undefined || recipientEntry.readAt === "null" || recipientEntry.readAt === "")) {
      // Use the new thunk that handles both marking as read and decrementing count
      dispatch(markTransactionAsReadWithCount(tx));
    }

    // Redirect to single transaction page instead of opening modal
    window.location.href = `/transactions/${tx.id}`;
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          type="button"
          className="relative text-white hover:text-white transition cursor-pointer w-full h-full flex items-center justify-center"
          whileTap={{ scale: 0.95 }}
          animate={bellRing ? {
            rotate: [0, -15, 15, -15, 15, 0],
            scale: [1, 1.2, 1]
          } : finalUnreadCount > 0 ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{
            duration: bellRing ? 0.3 : 0.6,
            repeat: bellRing ? 0 : (finalUnreadCount > 0 ? Infinity : 0),
            repeatDelay: 2
          }}
        >
          <Bell className="w-6 h-6" />
          <AnimatePresence>
            {finalUnreadCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#EA2D2D] rounded-full flex items-center justify-center px-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 500 }}
              >
                <span className="text-white text-xs font-bold">
                  {finalUnreadCount > 99 ? '99+' : finalUnreadCount}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[456px] max-h-96 overflow-y-auto bg-[#222222] !rounded-[10px] border-transparent p-3" side='bottom' align='end'>
        <DropdownMenuLabel>
          <Typography variant='h3' className='text=[#FAFAFA]'>Notifications</Typography>
          <Typography variant='muted'>You have {transactions.length === 0 ? 'no' : transactions.length} unread messages.</Typography>
        </DropdownMenuLabel>

        {transactions.length === 0 ? (
          <motion.div
            className="px-3 py-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            No transactions
          </motion.div>
        ) : (
          <DropdownMenuGroup className='!mt-2'>
            {transactions
              .slice()
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map(tx => (

                <DropdownMenuItem
                  key={getTxId(tx)}
                  onClick={() => handleRowClick(tx)}
                  className='!p-4 !focus:bg-[#3C3C3C] hover:bg-[#3C3C3C] transition-colors duration-200 cursor-pointer'
                >
                  <div className="flex items-start gap-2">

                    {(() => {
                      const recipientEntry = tx.to.find((entry) =>
                        String(entry.principal) === String(principalId)
                      );
                      const isUnread = recipientEntry && (recipientEntry.readAt === null || recipientEntry.readAt === undefined || recipientEntry.readAt === "null" || recipientEntry.readAt === "");
                      return isUnread ? <div className="w-2 bg-[#FEB64D] rounded-full h-2 mt-1"></div> : null;
                    })()}

                    <div className="flex flex-col w-full">
                      <Typography variant='small'>
                        {generateTransactionMessageSync(tx, principalId, false)}
                      </Typography>

                      <Typography variant='muted'>
                        {new Date(Number(tx.createdAt) / 1_000_000).toLocaleString()}
                      </Typography>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}