"use client";

import { useAuth } from "@/contexts/auth-context";
import { setSubtitle, setTitle } from "@/lib/redux";
import type { NormalizedTransaction } from "@/modules/shared.types";
import { EscrowDetailsLayout } from "@/modules/transaction/components/shared/EscrowDetailsLayout";
import { useEscrowActions } from "@/modules/transaction/hooks/useTransactionActions";
import { useEscrowDetails } from "@/modules/transaction/hooks/useTransactionDetails";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// Early console log to verify component is mounting
if (typeof window !== 'undefined') {
  console.log('[TransactionDetailsView] Component file loaded at:', new Date().toISOString());
  console.log('[TransactionDetailsView] Current URL:', window.location.href);
}

export default function TransactionDetailsView() {
  console.log('[TransactionDetailsView v2.0] Component function called - START');
  const { principal, isLoading: authLoading } = useAuth();
  console.log('[TransactionDetailsView v2.0] Auth state:', {
    principal: principal?.toText(),
    principalIsNull: principal === null,
    principalIsUndefined: principal === undefined,
    authLoading
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get transaction ID from query parameter using URLSearchParams (works in static export)
  // Initialize immediately to avoid hydration mismatch
  const [transactionId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || undefined;
      console.log('[TransactionDetailsView] Extracted transaction ID from URL:', id);
      return id;
    }
    return undefined;
  });

  // Pass only principal to the hook (hook filters by transactionId internally if needed)
  // Note: useEscrowDetails might work with principal even if it's initially undefined
  const { escrow, isLoading, error, isAuthorized, initiatorNickname } = useEscrowDetails(principal);
  
  // Debug: Check what principal useEscrowDetails actually used
  console.log('🔍 [TransactionDetailsView] useEscrowDetails state:', {
    hasEscrow: !!escrow,
    escrowId: escrow?.id,
    escrowFrom: escrow?.from,
    isAuthorized,
    principalFromHook: principal?.toText()
  });
  const [localEscrow, setLocalEscrow] = useState<NormalizedTransaction | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('[TransactionDetailsView] State:', {
      transactionId,
      isLoading,
      error,
      isAuthorized,
      hasEscrow: !!escrow,
      hasLocalEscrow: !!localEscrow,
      principal: principal?.toString()
    });
  }, [transactionId, isLoading, error, isAuthorized, escrow, localEscrow, principal]);

  // Update titles when loading the page
  useEffect(() => {
    dispatch(setTitle("Escrow details"));
    dispatch(setSubtitle("View and manage your escrow"));
  }, [dispatch]);

  // Keep a local copy that can be updated instantly by actions/events
  useEffect(() => {
    if (escrow) setLocalEscrow(escrow);
  }, [escrow]);

  const handleUpdate = useCallback((updated: NormalizedTransaction) => {
    setLocalEscrow(updated);
  }, []);

  // CRITICAL: Use ONLY the principal from useAuth() - this is the actual logged-in user
  // DO NOT fall back to escrow.from - that's the sender, not the current user!
  // If current user is a recipient, we need THEIR principal, not the sender's
  const principalToUse = useMemo(() => {
    console.log('[TransactionDetailsView v2.0] principalToUse memo:', {
      principalFromAuth: principal?.toText(),
      authLoading,
      willReturn: principal?.toText() || null,
    });
    // Only use principal from useAuth - never construct from escrow.from
    return principal || null;
  }, [principal, authLoading]);

  const escrowId = localEscrow?.id || escrow?.id || "";
  const { isLoading: actionLoading, handleRelease, handleCancel, handleRefund, handleApprove, handleDecline, handleEdit } = useEscrowActions(
    localEscrow || escrow,
    principalToUse,
    String(escrowId),
    handleUpdate
  );

  // Wait for auth to finish loading before making decisions
  // Not logged in or unauthorized → redirect to /transactions
  useEffect(() => {
    if (!authLoading && !isLoading && (!isAuthorized || !principal)) {
      console.log('[TransactionDetailsView] Redirecting - auth finished but no principal or not authorized:', {
        authLoading,
        isLoading,
        isAuthorized,
        hasPrincipal: !!principal,
      });
      navigate("/transactions", { replace: true });
    }
  }, [authLoading, isLoading, isAuthorized, principal, navigate]);

  // Wait for auth to finish loading first
  if (authLoading) {
    console.log('[TransactionDetailsView] Waiting for auth to load...');
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-white">Loading authentication…</div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-white">Loading escrow…</div>
    );
  }

  // Show error if there's an error AND we have no escrow data
  if (error && !escrow && !localEscrow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white space-y-4">
        <div className="text-xl font-semibold">Transaction not found</div>
        <div className="text-gray-400 text-sm">The transaction you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</div>
        <button
          onClick={() => navigate("/transactions")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
        >
          Back to Transactions
        </button>
      </div>
    );
  }

  // Use escrow if localEscrow isn't set yet (localEscrow gets set from escrow in useEffect)
  const escrowToUse = localEscrow || escrow;

  // If we have NO escrow data at all after loading, show error
  if (!escrowToUse && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white space-y-4">
        <div className="text-xl font-semibold">Transaction not found</div>
        <div className="text-gray-400 text-sm">The transaction you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</div>
        <button
          onClick={() => navigate("/transactions")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
        >
          Back to Transactions
        </button>
      </div>
    );
  }

  // If we don't have escrow yet but still loading, show loading
  if (!escrowToUse) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-white">Loading escrow…</div>
    );
  }

  // CRITICAL: We need the actual logged-in user's principal, NOT the sender's principal
  // The escrow.from is the sender, but we need the current user (could be sender OR recipient)
  // So we should ONLY use principal from useAuth(), never construct from escrow.from
  let finalPrincipal = principalToUse;
  
  console.log('[TransactionDetailsView v2.0] Principal resolution:', {
    principalFromAuth: principal?.toText(),
    principalToUse: principalToUse?.toText(),
    escrowFrom: escrowToUse?.from,
    willUse: finalPrincipal?.toText(),
  });
  
  // DO NOT fall back to escrow.from - that's the sender, not the current user!
  // If useAuth() hasn't provided principal yet, we need to wait for it
  // Only use escrow.from as absolute last resort for very old code paths

  // If we STILL don't have a principal, only then show loading
  if (!finalPrincipal) {
    if (authLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] text-white">
          Loading authentication...
        </div>
      );
    }
    // Auth finished but no principal = not logged in
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-white">
        Please log in to view this transaction
      </div>
    );
  }

  console.log('✅ [TransactionDetailsView] Rendering with principal:', finalPrincipal.toText());

  return (
    <div className="flex flex-col gap-3">
      <EscrowDetailsLayout
        escrow={escrowToUse}
        principal={finalPrincipal}
        isLoading={actionLoading}
        initiatorNickname={initiatorNickname}
        onBackClick={() => navigate("/transactions")}
        onRelease={handleRelease}
        onRefund={handleRefund}
        onApprove={handleApprove}
        onDecline={handleDecline}
        onCancel={handleCancel}
        onEdit={handleEdit}
        onEscrowUpdate={handleUpdate}
      />
    </div>
  );
}


