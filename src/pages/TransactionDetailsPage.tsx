import { useAuth } from "@/contexts/auth-context";
import { setSubtitle, setTitle } from "@/lib/redux";
import type { NormalizedTransaction } from "@/modules/shared.types";
import { EscrowDetailsLayout } from "@/modules/transaction/components/shared/EscrowDetailsLayout";
import { useEscrowActions } from "@/modules/transaction/hooks/useTransactionActions";
import { useEscrowDetails } from "@/modules/transaction/hooks/useTransactionDetails";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function TransactionDetailsPage() {
  const { principal, isLoading: authLoading } = useAuth();
  
  console.log('[TransactionDetailsPage v2.0] Component function called - START');
  console.log('[TransactionDetailsPage v2.0] Auth state:', {
    principal: principal?.toText(),
    principalIsNull: principal === null,
    principalIsUndefined: principal === undefined,
    authLoading
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { escrow, initiatorNickname } = useEscrowDetails(principal);
  const [localEscrow, setLocalEscrow] = useState<NormalizedTransaction | null>(null);

  useEffect(() => {
    dispatch(setTitle("Escrow details"));
    dispatch(setSubtitle("View and manage your escrow"));
  }, [dispatch]);

  useEffect(() => {
    if (escrow) setLocalEscrow(escrow);
  }, [escrow]);

  const handleUpdate = useCallback((updated: NormalizedTransaction) => {
    setLocalEscrow(updated);
  }, []);

  const escrowId = localEscrow?.id || escrow?.id || "";
  const { isLoading: actionLoading, handleApprove, handleDecline, handleRelease, handleCancel, handleRefund, handleEdit } = useEscrowActions(
    localEscrow || null,
    principal,
    String(escrowId),
    handleUpdate
  );

  // Wait for auth to finish loading first
  if (authLoading) {
    console.log('[TransactionDetailsPage v2.0] Waiting for auth to load...');
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-white">Loading authentication…</div>
    );
  }

  // At this point, localEscrow must be non-null (TypeScript guard)
  if (!localEscrow) {
    return null;
  }

  // CRITICAL: Log principal before passing to EscrowDetailsLayout
  console.log('[TransactionDetailsPage v2.0] Principal resolution:', {
    principalFromAuth: principal?.toText(),
    principalIsNull: principal === null,
    principalIsUndefined: principal === undefined,
    willPassToLayout: principal?.toText() || null,
  });

  if (!principal) {
    console.warn('[TransactionDetailsPage v2.0] ⚠️ No principal available! This will cause approve/decline buttons to not show.');
  }

  return (
    <EscrowDetailsLayout
      escrow={localEscrow}
      principal={principal}
      isLoading={actionLoading}
      initiatorNickname={initiatorNickname}
      onBackClick={() => navigate("/transactions")}
      onRelease={handleRelease}
      onRefund={handleRefund}
      onApprove={handleApprove}
      onDecline={handleDecline}
      onCancel={handleCancel}
      onEdit={handleEdit}
    />
  );
}

