"use client";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Typography } from "@/components/ui/typography";
import { EscrowTransaction, NormalizedTransaction, PendingEscrowDetailsProps, isMilestoneTransaction } from "@/modules/shared.types";
import { motion } from "framer-motion";
import { Bitcoin, CheckCircle, CircleAlert, CircleX, Download, Eye, FileText, Shield, Users, Zap } from "lucide-react";
import { useState } from "react";
import { calculateTotalBTC, countUniqueRecipients } from "../../utils/transactionDetailsHelpers";
import { MilestonesList } from "./MilestonesList";

// Helper function to check if first milestone has any approvals
  const hasFirstMilestoneApprovals = (transaction: EscrowTransaction | NormalizedTransaction): boolean => {
    if (!isMilestoneTransaction(transaction) || !transaction.milestoneData?.milestones || transaction.milestoneData.milestones.length === 0) {
      return false;
    }

    const firstMilestone = transaction.milestoneData.milestones[0];
  if (!firstMilestone.recipients || firstMilestone.recipients.length === 0) {
    return false;
  }

  // Check if any recipient in the first milestone has approved
  return firstMilestone.recipients.some((recipient: { approvedAt?: unknown; status?: unknown }) => {
    // Check multiple possible approval indicators
    const hasApprovedAt = recipient.approvedAt && (
      (Array.isArray(recipient.approvedAt) && recipient.approvedAt.length > 0) ||
      (typeof recipient.approvedAt === 'string' && recipient.approvedAt.length > 0) ||
      (typeof recipient.approvedAt === 'number' && recipient.approvedAt > 0)
    );
    
    const hasApprovedStatus = recipient.status && 
      ((typeof recipient.status === 'object' && recipient.status !== null && 'approved' in recipient.status && recipient.status.approved !== undefined) || 
       (typeof recipient.status === 'object' && recipient.status !== null && Object.keys(recipient.status).includes('approved')));
    
    return hasApprovedAt || hasApprovedStatus;
  });
};

export default function MilestonePendingDetails({
  transaction,
  currentUserPrincipal,
  onCancel,
  isLoading = false,
  onUploadSignedContract,
  onClientApproveSignedContract,
  onTransactionUpdate
}: PendingEscrowDetailsProps & {
  onUploadSignedContract?: (milestoneId: string, recipientId: string) => Promise<void>;
  onClientApproveSignedContract?: (transactionId: string, milestoneId: string, recipientId: string) => void;
  onTransactionUpdate?: (updatedTransaction: NormalizedTransaction) => void;
}) {

  const totalBTC = calculateTotalBTC(transaction);
  const recipientCount = countUniqueRecipients(transaction);
  const [isUploadingContract, setIsUploadingContract] = useState(false);
  const [isApprovingContracts, setIsApprovingContracts] = useState(false);
  const [isDownloadingContract, setIsDownloadingContract] = useState(false);
  const [isDownloadingMainContract, setIsDownloadingMainContract] = useState(false);
  const [isViewingMainContract, setIsViewingMainContract] = useState(false);


  return (
    <div className="space-y-4">
      <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6 max-w-4xl mx-auto">

        <Typography variant="large" className="mb-4 mx-4">Milestone Escrow Overview</Typography>
        {/* Stats Information (without cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Your Share Info */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
              <Bitcoin size={24} className="text-[#FEB64D]" />
            </div>
            <div className="text-center">
              <Typography variant="small" className="text-[#9F9F9F]">Funds allocated</Typography>
              <Typography variant="base" className="text-white font-semibold mt-2">
                {totalBTC.toFixed(8)} BTC
              </Typography>
            </div>
          </div>

          {/* Total Recipients Info */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
              <Users size={24} className="text-[#FEB64D]" />
            </div>
            <div className="text-center">
              <Typography variant="small" className="text-[#9F9F9F]">Total recipients</Typography>
              <Typography variant="base" className="text-white font-semibold mt-2">
                {recipientCount}
              </Typography>
            </div>
          </div>

          {/* Status Info */}
          <div className="flex flex-col items-center space-y-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
              <Zap size={24} className="text-[#FEB64D]" />
            </div>
            {/* <div className="text-center">
              <Typography variant="small" className="text-[#9F9F9F]">Status</Typography>
              <Typography variant="base" className={`font-semibold mt-2 ${milestoneStatus.color}`}>
                {milestoneStatus.status}
              </Typography>
            </div> */}
          </div>
        </div>

        {/* Contract File - Show contract file with download and view */}
        {transaction.milestoneData?.contractFileId && transaction.milestoneData.contractFileId.length > 0 && (
          <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-[#FEB64D]">
                <FileText size={16} className="text-[#FEB64D]" />
                <span>Contract File: Ready (PDF)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isViewingMainContract}
                  onClick={async () => {
                    if (!isViewingMainContract && transaction.milestoneData?.contractFileId?.[0]) {
                      setIsViewingMainContract(true);
                      try {
                        // Fetch file on-demand
                        const { getFileBase64 } = await import('@/lib/internal/icp/fileStorage');
                        const fileData = await getFileBase64(transaction.milestoneData.contractFileId[0]);
                        console.log('fileData', fileData);
                        if (fileData) {
                          // Create blob URL and open in new tab
                          const byteCharacters = atob(fileData);
                          const byteNumbers = new Array(byteCharacters.length);
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], { type: 'application/pdf' });
                          const blobUrl = URL.createObjectURL(blob);
                          
                          const newWindow = window.open(blobUrl, '_blank');
                          if (!newWindow) {
                            const link = document.createElement('a');
                            link.href = blobUrl;
                            link.download = `milestone-contract-${transaction.id}.pdf`;
                            link.click();
                          }
                          
                          setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
                        }
                      } catch {
                        // Handle error silently
                      } finally {
                        setIsViewingMainContract(false);
                      }
                    }
                  }}
                  className={`h-8 px-3 text-blue-400 hover:bg-blue-400/10 hover:text-blue-400 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 ${isViewingMainContract ? 'animate-pulse' : ''}`}
                >
                  {isViewingMainContract ? (
                    <>
                      <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      Opening...
                    </>
                  ) : (
                    <>
                      <Eye size={12} className="mr-1" />
                      View PDF
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isDownloadingMainContract}
                  onClick={async () => {
                    if (!isDownloadingMainContract && transaction.milestoneData?.contractFileId?.[0]) {
                      setIsDownloadingMainContract(true);
                      try {
                        // Fetch file on-demand
                        const { getFileBase64 } = await import('@/lib/internal/icp/fileStorage');
                        const fileData = await getFileBase64(transaction.milestoneData.contractFileId[0]);
                        
                        if (fileData) {
                          // Create download link
                          const link = document.createElement('a');
                          link.href = `data:application/pdf;base64,${fileData}`;
                          link.download = `milestone-contract-${transaction.id}.pdf`;
                          link.click();
                        }
                      } catch {
                        // Handle error silently
                      } finally {
                        setIsDownloadingMainContract(false);
                      }
                    }
                  }}
                  className={`h-8 px-3 text-[#FEB64D] hover:bg-[#FEB64D]/10 hover:text-[#FEB64D] text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 ${isDownloadingMainContract ? 'animate-pulse' : ''}`}
                >
                  {isDownloadingMainContract ? (
                    <>
                      <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={12} className="mr-1" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Contract Signing Section - Show at milestone escrow level */}
        {(() => {
          // Check if all recipients have signed the contract
          // const getArrayValue = (value: unknown) => {
          //   if (Array.isArray(value) && value.length > 0) {
          //     return value[0];
          //   }
          //   return null;
          // };
          
          const allRecipientsSigned = transaction.milestoneData?.recipients?.every((r) => {
            const recipientRecord = r as unknown as Record<string, unknown>;
            const signedAt = recipientRecord.signedContractAt;
            
            // Handle string format (normalized data)
            if (typeof signedAt === 'string') {
              return signedAt !== '' && signedAt !== 'null' && signedAt !== 'undefined';
            }
            
            // Handle array format from Candid interface
            if (Array.isArray(signedAt)) {
              return signedAt.length > 0 && signedAt[0] !== null && signedAt[0] !== undefined && signedAt[0] !== '';
            }
            
            // Handle other formats
            return signedAt !== null && signedAt !== undefined && signedAt !== '';
          }) || false;
          
          // Check if client has approved the signed contracts - all recipients must have client approval
          const clientApprovedSigned = transaction.milestoneData?.recipients?.every((r) => {
            const rRecord = r as unknown as Record<string, unknown>;
            const clientApprovedAt = rRecord.clientApprovedSignedContractAt;
            
            // Handle string format (normalized data)
            if (typeof clientApprovedAt === 'string') {
              return clientApprovedAt !== '' && clientApprovedAt !== 'null' && clientApprovedAt !== 'undefined';
            }
            
            // Handle array format from Candid interface
            if (Array.isArray(clientApprovedAt)) {
              return clientApprovedAt.length > 0 && clientApprovedAt[0] !== null && clientApprovedAt[0] !== undefined && clientApprovedAt[0] !== '';
            }
            
            // Handle other formats
            return clientApprovedAt !== null && clientApprovedAt !== undefined && clientApprovedAt !== '';
          }) || false;
          
          // Get recipients from milestone escrow level
          let uniqueRecipients = transaction.milestoneData?.recipients || [];
          
          // TEMPORARY WORKAROUND: If milestoneData.recipients is empty, extract from milestones
          if (uniqueRecipients.length === 0 && transaction.milestoneData?.milestones) {
            const seenPrincipals = new Set<string>();
            uniqueRecipients = [];
            
            for (const milestone of transaction.milestoneData.milestones) {
              for (const recipient of milestone.recipients) {
                if (!seenPrincipals.has(recipient.principal)) {
                  seenPrincipals.add(recipient.principal);
                  
                  // Try to find contract signing data from milestoneData.recipients if it exists
                  const contractData = transaction.milestoneData?.recipients?.find((r) => (r as unknown as Record<string, unknown>).principal === recipient.principal);
                  
                  // Handle array-wrapped values from Candid interface
                  const getArrayValue = (value: unknown) => {
                    if (Array.isArray(value) && value.length > 0) {
                      return value[0];
                    }
                    return null;
                  };
                  
                  const processedRecipient = {
                    id: recipient.id,
                    name: recipient.name,
                    principal: recipient.principal,
                    signedContractFile: getArrayValue(contractData?.signedContractFile),
                    signedContractAt: getArrayValue(contractData?.signedContractAt),
                    clientApprovedSignedContractAt: getArrayValue(contractData?.clientApprovedSignedContractAt)
                  };
                  
                  
                  uniqueRecipients.push(processedRecipient);
                }
              }
            }
          }
          

          return (
            <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
                  <FileText size={24} className="text-[#FEB64D]" />
                </div>
                <div className="space-y-3 flex-1">

                  <div>
                    <Typography variant="base" className="text-white font-semibold">
                      Contract Signing Status
                    </Typography>
                    <Typography variant="small" className="text-[#9F9F9F]">
                      All recipients must sign the contract before the milestone escrow can be activated
                    </Typography>
                  </div>
                  
                  {/* Contract Signing Progress */}
                  <div className="space-y-2">
                    {uniqueRecipients.length > 0 ? uniqueRecipients.map((recipient) => {
                      const recipientRecord = recipient as unknown as Record<string, unknown>;
                      // More explicit check for signed status
                      const isSigned = recipientRecord.signedContractAt !== null && 
                                     recipientRecord.signedContractAt !== undefined && 
                                     recipientRecord.signedContractAt !== '' &&
                                     !(Array.isArray(recipientRecord.signedContractAt) && recipientRecord.signedContractAt.length === 0);
                      
                      
                      return (
                        <div key={String(recipientRecord.id)} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${isSigned ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                            <Typography variant="small" className="text-white">
                              {String(recipientRecord.name)}
                            </Typography>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Typography variant="small" className={isSigned ? "text-green-400" : "text-gray-500"}>
                              {isSigned ? 'Signed' : 'Pending'}
                            </Typography>
                            {isSigned && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isDownloadingContract}
                                onClick={async () => {
                                  if (!isDownloadingContract) {
                                    setIsDownloadingContract(true);
                                    try {
                                      const signedContractFileId = recipientRecord.signedContractFileId;
                                      if (signedContractFileId) {
                                        // Handle both string and array formats
                                        const fileId = Array.isArray(signedContractFileId) ? signedContractFileId[0] : signedContractFileId;
                                        
                                        // Fetch file from storage using getFileBase64
                                        const { getFileBase64 } = await import('@/lib/internal/icp/fileStorage');
                                        const fileData = await getFileBase64(fileId);
                                        
                                        if (fileData) {
                                          // Create download link
                                          const link = document.createElement('a');
                                          link.href = `data:application/pdf;base64,${fileData}`;
                                          link.download = `signed-contract-${recipientRecord.name}.pdf`;
                                          link.click();
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error downloading contract:', error);
                                    } finally {
                                      setIsDownloadingContract(false);
                                    }
                                  }
                                }}
                                className="h-6 px-2 text-green-400 hover:bg-green-400/10 hover:text-green-400 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200"
                              >
                                <Download size={10} className="mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="p-3 bg-[#1A1A1A] rounded-lg">
                        <Typography variant="small" className="text-gray-500">
                          No recipients found for contract signing
                        </Typography>
                      </div>
                    )}
                  </div>

                  {/* Client Approval Status */}
                  {allRecipientsSigned && (
                    <div className="mt-4 p-3 bg-[#1A1A1A] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${clientApprovedSigned ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                          <Typography variant="small" className="text-white">
                            Client Approval
                          </Typography>
                        </div>
                        <Typography variant="small" className={clientApprovedSigned ? "text-green-400" : "text-yellow-400"}>
                          {clientApprovedSigned ? 'Approved' : 'Pending'}
                        </Typography>
                      </div>
                    </div>
                  )}

                  {/* Contract Actions */}
                  <div className="mt-4 space-y-2">
                    {/* Contract Signing Actions for Recipients */}
                    {(() => {
                      
                      const currentUserRecipient = uniqueRecipients.find((r) => 
                        String((r as unknown as Record<string, unknown>).principal) === String(currentUserPrincipal)
                      );
                      
                      if (currentUserRecipient) {
                        const isSigned = currentUserRecipient.signedContractAt !== null && 
                                       currentUserRecipient.signedContractAt !== undefined && 
                                       currentUserRecipient.signedContractAt !== '' &&
                                       !(Array.isArray(currentUserRecipient.signedContractAt) && currentUserRecipient.signedContractAt.length === 0);
                        
                        return (
                          <div className="flex items-center space-x-2">
                            {isSigned ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isDownloadingContract}
                                onClick={async () => {
                                  if (!isDownloadingContract) {
                                    setIsDownloadingContract(true); 
                                    try {
                                      // Get the signed contract file ID 
                                      const signedContractFileId = currentUserRecipient.signedContractFile;
                                      if (signedContractFileId) {
                                        // Handle both string and array formats
                                        const fileId = Array.isArray(signedContractFileId) ? signedContractFileId[0] : signedContractFileId;
                                        
                                        // Fetch file from storage using getFileBase64
                                        const { getFileBase64 } = await import('@/lib/internal/icp/fileStorage');
                                        const fileData = await getFileBase64(fileId);
                                        
                                        if (fileData) {
                                          // Create download link
                                          const link = document.createElement('a');
                                          link.href = `data:application/pdf;base64,${fileData}`;
                                          link.download = `signed-contract-${currentUserRecipient.name}.pdf`;
                                          link.click();
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error downloading contract:', error);
                                    } finally {
                                      setIsDownloadingContract(false);
                                    }
                                  }
                                }}
                                className={`h-8 px-3 text-green-400 hover:bg-green-400/10 hover:text-green-400 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 ${isDownloadingContract ? 'animate-pulse' : ''}`}
                              >
                                {isDownloadingContract ? (
                                  <>
                                    <svg
                                      className="animate-spin h-3 w-3 mr-1"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                      />
                                    </svg>
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <FileText size={12} className="mr-1" />
                                    Download Signed Contract
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isUploadingContract}
                                onClick={async () => {
                                  if (onUploadSignedContract && !isUploadingContract) {
                                    setIsUploadingContract(true);
                                    try {
                                      // Use the first milestone ID since contract signing is at milestoneData level
                                      const firstMilestone = transaction.milestoneData?.milestones?.[0];
                                      if (firstMilestone) {
                                        await onUploadSignedContract(firstMilestone.id, currentUserRecipient.id);
                                      }
                                    } finally {
                                      setIsUploadingContract(false);
                                    }
                                  }
                                }}
                                className={`h-8 px-3 text-blue-400 hover:bg-blue-400/10 hover:text-blue-400 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 ${isUploadingContract ? 'animate-pulse' : ''}`}
                              >
                                {isUploadingContract ? (
                                  <>
                                    <LoadingSpinner size="sm" className="mr-1" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <FileText size={12} className="mr-1" />
                                    Upload Signed Contract
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  {/* Client Approval Action - Only show to client (transaction sender) */}
                  {allRecipientsSigned && !clientApprovedSigned && currentUserPrincipal === transaction.from && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isApprovingContracts}
                          onClick={async () => {
                            if (onClientApproveSignedContract && !isApprovingContracts) {
                              setIsApprovingContracts(true);
                              try {
                                // Use the first milestone ID since contract signing is at milestoneData level
                                const firstMilestone = transaction.milestoneData?.milestones?.[0];
                                
                                if (firstMilestone) {
                                // Call client approval for each signed recipient
                                // Use the same data source as the UI display (transaction.milestoneData.recipients)
                                const signedRecipients = (transaction.milestoneData?.recipients || []).filter((recipient) => {
                                  const recipientRecord = recipient as unknown as Record<string, unknown>;
                                  const signedAt = recipientRecord.signedContractAt;
                                  
                                  // Handle string format (normalized data) - same logic as allRecipientsSigned
                                  if (typeof signedAt === 'string') {
                                    return signedAt !== '' && signedAt !== 'null' && signedAt !== 'undefined';
                                  }
                                  
                                  // Handle array format from Candid interface
                                  if (Array.isArray(signedAt)) {
                                    return signedAt.length > 0 && signedAt[0] !== null && signedAt[0] !== undefined && signedAt[0] !== '';
                                  }
                                  
                                  // Handle other formats
                                  return signedAt !== null && signedAt !== undefined && signedAt !== '';
                                });
                                  
                                  for (const recipient of signedRecipients) {
                                    const recipientRecord = recipient as unknown as Record<string, unknown>;
                                    try {
                                      await onClientApproveSignedContract(transaction.id, firstMilestone.id, String(recipientRecord.id));
                                    } catch (error) {
                                      console.error(`Failed to approve contract for ${recipientRecord.name}:`, error);
                                      // Continue with other recipients even if one fails
                                    }
                                  }
                                }
                              } catch (error) {
                                console.error('Error in approval process:', error);
                              } finally {
                                setIsApprovingContracts(false);
                              }
                            }
                          }}
                          className={`h-8 px-3 text-green-400 hover:bg-green-400/10 hover:text-green-400 text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 ${isApprovingContracts ? 'animate-pulse' : ''}`}
                        >
                          {isApprovingContracts ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3 mr-1"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                />
                              </svg>
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={12} className="mr-1" />
                              Approve All Contracts
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Milestones List for milestone transactions */}
        <MilestonesList 
          transaction={transaction} 
          onUploadSignedContract={onUploadSignedContract}
          onClientApproveSignedContract={onClientApproveSignedContract}
          onTransactionUpdate={onTransactionUpdate}
        />

        {/* Trustless Banner */}
        <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-[#4F3F27] rounded-full flex items-center justify-center">
              <Shield size={24} className="text-[#FEB64D]" />
            </div>
            <div className="space-y-2">
              <Typography variant="base" className="text-white font-semibold">
                Milestone Escrow powered by Internet Computer
              </Typography>
              <Typography variant="small" className="text-[#9F9F9F]">
                No bridge. No wrap. Fully trustless Bitcoin milestone escrow with threshold ECDSA.
              </Typography>
            </div>
          </div>
        </div>

        {/* Cancel Button for Senders - Only show if no approvals on first milestone */}
        {(() => {
          const canCancel = transaction.status === "pending" && !transaction.releasedAt && onCancel && !hasFirstMilestoneApprovals(transaction);
          return canCancel;
        })() && (
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                variant="outline"
                className="text-[#F64C4C] !border-[#303434] !bg-transparent hover:!border-[#F64C4C] hover:!bg-[#F64C4C]/10"
                onClick={onCancel}
                disabled={isLoading === "cancel"}
              >
                {isLoading === "cancel" ? (
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                ) : (
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <CircleX size={16} />
                  </motion.div>
                )}
                {isLoading === "cancel" ? "Cancelling..." : "Cancel milestone escrow"}
              </Button>
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CircleAlert size={16} color="#FEB64D" />
              </motion.div>
              <Typography variant="small" className="text-white font-normal">
                This action cannot be undone. Only available while pending.
              </Typography>
            </motion.div>
          </motion.div>
        )}

        {/* Message when cancel is not available due to approvals */}
        {transaction.status === "pending" && !transaction.releasedAt && onCancel && hasFirstMilestoneApprovals(transaction) && (
          <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
            <div className="flex items-start gap-3">
              <CircleAlert size={20} className="text-[#FEB64D] mt-0.5" />
              <div>
                <Typography variant="base" className="text-[#FEB64D] font-semibold">
                  Cannot Cancel Milestone
                </Typography>
                <Typography variant="small" className="text-white">
                  This milestone cannot be cancelled because recipients have already approved the first milestone. Once approvals are received, the milestone must proceed according to the contract terms.
                </Typography>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
