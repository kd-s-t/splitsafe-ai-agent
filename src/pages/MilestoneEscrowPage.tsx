import { setTitle as setPageTitle, setSubtitle } from '@/lib/redux/store/store';
import MilestoneEscrowForm from "@/modules/transaction/components/milestone/MilestoneEscrowForm";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function MilestoneEscrowPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('Create Milestone Escrow'));
    dispatch(setSubtitle('Configure your milestone-based Bitcoin transaction'));
  }, [dispatch]);

  return (
    <motion.div
      className="flex flex-row w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <MilestoneEscrowForm />
    </motion.div>
  );
}

