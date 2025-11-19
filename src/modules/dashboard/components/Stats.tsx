"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { RootState } from "@/lib/redux/store/store";
import { useAppSelector } from "@/lib/redux/store/store";
import { BanknoteArrowDown, CircleCheck, Clock8, Eye, EyeOff, Plus, Shield, Zap } from "lucide-react";

import { setIsChooseEscrowTypeDialogOpen } from "@/lib/redux/store/dialogSlice";
import type { NormalizedTransaction } from '@/modules/shared.types';
import { Withdraw, WithdrawalConfirmation } from "@/modules/withdraw";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { StatCardProps } from './types';

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, additionalInfo, isLoading = false }) => (
  <Card className="bg-[#222222] border-[#303434] text-white p-5 rounded-[20px] min-h-[132px]">
    <div className="flex items-center justify-between mb-6">
      <Typography variant="muted" className="text-[#BBBBBB] text-sm">
        {label}
      </Typography>
      <div className="bg-[#323232] rounded-full p-1.5">
        {icon}
      </div>
    </div>
    <div className="flex items-center justify-between">
      {isLoading ? (
        <div className="w-16 h-8 bg-gray-600 animate-pulse rounded" />
      ) : (
        <Typography variant="h3" className="font-semibold text-3xl text-white">
          {value}
        </Typography>
      )}
      {additionalInfo && !isLoading && (
        <Typography variant="small" className="text-[#00E19C] text-sm self-end">
          {additionalInfo}
        </Typography>
      )}
    </div>
  </Card>
);

async function ckbtcToUsd(ckbtc: number) {
  try {
    // Use CoinGecko integration
    const { ckBtcToUsd } = await import('@/lib/integrations/coingecko');
    return await ckBtcToUsd(ckbtc);
  } catch (error) {
    console.warn('CoinGecko API failed:', error);
    // Fallback to current market rate
    return ckbtc * 114764.80;
  }
}

export default function DashboardStats({ transactions }: { transactions: NormalizedTransaction[] }) {
  const ckbtcBalance = useAppSelector((state: RootState) => state.user.ckbtcBalance);
  // const _icpBalance = useAppSelector((state: RootState) => state.user.icpBalance);
  
  

  const dispatch = useDispatch();
  const isLoading =
    ckbtcBalance === null || ckbtcBalance === undefined || ckbtcBalance === "";

  const [showBalance, setShowBalance] = useState(true);
  const [displayBalance, setDisplayBalance] = useState("0.00000000");
  const [displayUsd, setDisplayUsd] = useState("$0.00");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Calculate transaction counts
  const totalEscrows = transactions ? transactions.length : 0;
  const activeEscrows = transactions ? transactions.filter(tx => tx.status === 'confirmed').length : 0;
  const completedEscrows = transactions ? transactions.filter(tx => tx.status === 'released').length : 0;
  const pendingEscrows = transactions ? transactions.filter(tx => tx.status === 'pending').length : 0;

  // Calculate weekly escrow data for each category
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyTotalEscrows = transactions ? transactions.filter(tx => {
    // Convert from nanoseconds to milliseconds (divide by 1,000,000)
    const txDate = new Date(Number(tx.createdAt) / 1000000);

    // Check if the date is valid
    if (isNaN(txDate.getTime())) {
      return false;
    }

    const isThisWeek = txDate >= oneWeekAgo;
    return isThisWeek;
  }).length : 0;

  const weeklyActiveEscrows = transactions ? transactions.filter(tx => {
    const txDate = new Date(Number(tx.createdAt) / 1000000);
    return txDate >= oneWeekAgo && tx.status === 'confirmed';
  }).length : 0;

  const weeklyCompletedEscrows = transactions ? transactions.filter(tx => {
    const txDate = new Date(Number(tx.createdAt) / 1000000);
    return txDate >= oneWeekAgo && tx.status === 'released';
  }).length : 0;

  const weeklyPendingEscrows = transactions ? transactions.filter(tx => {
    const txDate = new Date(Number(tx.createdAt) / 1000000);
    return txDate >= oneWeekAgo && tx.status === 'pending';
  }).length : 0;

  // Calculate ICP metrics (stored for potential future use)
  // const _totalIcpAmount = transactions ? transactions.reduce((sum, tx) => {
  //   if (tx.status === 'released') {
  //     return sum + tx.to.reduce((txSum, toEntry) => txSum + Number(toEntry.amount), 0) / 1e8;
  //   }
  //   return sum;
  // }, 0) : 0;

  const handleNewEscrow = async () => {
    dispatch(setIsChooseEscrowTypeDialogOpen(true));
  };

  const handleWithdraw = (isOpen: boolean) => {
    setIsWithdrawOpen(isOpen)
  }


  const handleToggleBalance = () => {
    setShowBalance((prev) => !prev);
  };

  // Animate balance when it becomes visible
  useEffect(() => {
    const updateBalance = async () => {
      
      if (showBalance && ckbtcBalance && !isLoading) {
        const targetBalance = Number(ckbtcBalance);
        const targetUsd = await ckbtcToUsd(targetBalance);

        // Animate from 0 to target
        const duration = 1000; // 1 second
        const steps = 60;
        const increment = targetBalance / steps;
        const usdIncrement = targetUsd / steps;

        let current = 0;
        let currentUsd = 0;
        const interval = setInterval(() => {
          current += increment;
          currentUsd += usdIncrement;

          if (current >= targetBalance) {
            current = targetBalance;
            currentUsd = targetUsd;
            clearInterval(interval);
          }

          setDisplayBalance(current.toFixed(8));
          setDisplayUsd(`$${currentUsd.toLocaleString()}`);
        }, duration / steps);

        return () => clearInterval(interval);
      } else if (!showBalance) {
        setDisplayBalance("0.00000000");
        setDisplayUsd("$0.00");
      }
    };

    updateBalance();
  }, [showBalance, ckbtcBalance, isLoading]);

  return (
    <React.Fragment>
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleToggleBalance}>
            <Typography variant="small">Portfolio balance</Typography>
            <motion.div
              initial={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {showBalance ? (
                  <motion.div
                    key="eye"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Eye size={16} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="eye-off"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <EyeOff size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <motion.div
            key={showBalance ? 'visible' : 'hidden'}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Typography variant="h2" className="font-semibold">
              {isLoading ? (
                <span className="inline-block w-32 h-7 bg-gray-600 animate-pulse rounded" />
              ) : showBalance ? (
                `${displayBalance} ckBTC`
              ) : (
                '•••••••• ckBTC'
              )}
            </Typography>
          </motion.div>

          <motion.div
            key={showBalance ? 'visible-usd' : 'hidden-usd'}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <Typography variant="muted">
              {showBalance ? displayUsd : '••••••••'}
            </Typography>
            {showBalance && (
              <div className="bg-[#242424] text-[#00E19C] text-xs px-2 py-0.5 rounded-[14px] w-10 h-[19px] flex items-center justify-center">
                24H
              </div>
            )}
          </motion.div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => handleWithdraw(true)}
          >
            <BanknoteArrowDown size={14} /> Withdraw
          </Button>
          <div className="relative overflow-hidden">
            <Button
              variant="default"
              className="text-sm bg-[#FEB64D] text-black font-medium hover:bg-[#FEB64D]/90"
              onClick={handleNewEscrow}
            >
              <Plus className="text-xs" /> New escrow
            </Button>
          </div>
        </div>
      </div>

      <div className="container w-full shadow-sm flex items-center gap-2 mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden"
        >
          <Shield color="#FEB64D" size={24} />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        <Typography variant="muted" className="font-medium">
          Secured by ICP threshold ECDSA • No bridges, no wrapped ckBTC
        </Typography>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard
          title="Total escrows"
          label="Total escrows"
          value={totalEscrows}
          icon={<Shield className="text-yellow-400 text-2xl" />}
          additionalInfo={totalEscrows > 0 && weeklyTotalEscrows > 0 ? `+ ${weeklyTotalEscrows} this week` : undefined}
          isLoading={transactions === null || transactions === undefined}
        />
        <StatCard
          title="Active escrows"
          label="Active escrows"
          value={activeEscrows}
          icon={<Zap className="text-blue-400 text-2xl" />}
          additionalInfo={activeEscrows > 0 && weeklyActiveEscrows > 0 ? `+ ${weeklyActiveEscrows} this week` : undefined}
          isLoading={transactions === null || transactions === undefined}
        />
        <StatCard
          title="Completed escrows"
          label="Completed escrows"
          value={completedEscrows}
          icon={<CircleCheck className="text-green-400 text-2xl" />}
          additionalInfo={completedEscrows > 0 && weeklyCompletedEscrows > 0 ? `+ ${weeklyCompletedEscrows} this week` : undefined}
          isLoading={transactions === null || transactions === undefined}
        />
        <StatCard
          title="Pending escrows"
          label="Pending escrows"
          value={pendingEscrows}
          icon={<Clock8 className="text-gray-400 text-2xl" />}
          additionalInfo={pendingEscrows > 0 && weeklyPendingEscrows > 0 ? `+ ${weeklyPendingEscrows} this week` : undefined}
          isLoading={transactions === null || transactions === undefined}
        />
      </div>

      <Withdraw
        open={isWithdrawOpen}
        onClose={() => handleWithdraw(false)}
      />

      <WithdrawalConfirmation />

    </React.Fragment>
  );
};
