import type { RootState } from '@/lib/redux/store/store';
import { setSubtitle, setTitle } from "@/lib/redux/store/store";
import RecentActivities from '@/modules/dashboard/components/Activities';
import DashboardStats from '@/modules/dashboard/components/Stats';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function DashboardPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTitle("Welcome back"));
    dispatch(setSubtitle("Manage your Bitcoin escrow transactions with confidence"));
  }, [dispatch]);

  const transactions = useSelector((state: RootState) => state.transactions.transactions);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <DashboardStats transactions={transactions} />
      <RecentActivities />
    </motion.div>
  );
}

