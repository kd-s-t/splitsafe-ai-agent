import { setTitle as setPageTitle, setSubtitle } from '@/lib/redux/store/store';
import EscrowTypeSelector from "@/modules/escrow/components/EscrowTypeSelector";
import TransactionForm from "@/modules/escrow/components/TransactionForm";
import { EscrowType } from "@/modules/shared.types";
import { motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";

function EscrowPageContent() {
  const [searchParams] = useSearchParams();
  const editTxId = searchParams.get('edit');
  const dispatch = useDispatch();
  const [selectedEscrowType, setSelectedEscrowType] = useState<EscrowType | null>(null);

  useEffect(() => {
    if (editTxId) {
      dispatch(setPageTitle('Edit escrow'));
      dispatch(setSubtitle('Update your escrow configuration'));
    } else {
      dispatch(setPageTitle('Create new escrow'));
      dispatch(setSubtitle('Configure your secure Bitcoin transaction'));
    }
  }, [dispatch, editTxId]);

  const handleEscrowTypeSelect = (type: EscrowType) => {
    setSelectedEscrowType(type);
  };

  if (editTxId) {
    return (
      <motion.div
        className="flex flex-row w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <TransactionForm />
      </motion.div>
    );
  }

  if (!selectedEscrowType) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <EscrowTypeSelector onSelectType={handleEscrowTypeSelect} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-row w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <TransactionForm escrowType={selectedEscrowType} />
    </motion.div>
  );
}

export default function EscrowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EscrowPageContent />
    </Suspense>
  );
}

