import { setTitle as setPageTitle, setSubtitle } from '@/lib/redux/store/store';
import BasicEscrowForm from "@/modules/transaction/components/basic/BasicEscrowForm";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function BasicEscrowPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle('Create Basic Escrow'));
    dispatch(setSubtitle('Configure your immediate Bitcoin transaction'));
  }, [dispatch]);

  return (
    <motion.div
      className="flex flex-row w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BasicEscrowForm />
    </motion.div>
  );
}

