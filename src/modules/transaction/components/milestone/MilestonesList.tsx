import PDFViewerModal from "@/components/PDFViewerModal";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useUser } from "@/hooks/useUser";
import { clientReleaseMilestonePayment, submitProofOfWork } from "@/lib/internal/icp/milestone";
import { getTransaction } from "@/lib/internal/icp/transactions";
import {
    compressImage,
    DEFAULT_COMPRESSION_OPTIONS,
    estimatePayloadSize,
    formatFileSize,
    isImageFile,
    validateFileSize
} from "@/lib/utils/imageCompression";
import type { EscrowTransaction, Milestone, MilestoneEscrowRecipient, MilestoneRecipient, NormalizedTransaction } from "@/modules/shared.types";
import { isMilestoneTransaction } from "@/modules/shared.types";
import { CheckCircle, ClipboardList, Eye, Target, Users, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { convertToNormalizedTransactions } from "../../../transactions/utils";
import { ProofOfWorkData, ProofOfWorkForm } from "./ProofOfWorkForm";
import { ProofOfWorkViewer } from "./ProofOfWorkViewer";
import { ReleasePaymentsList } from "./ReleasePaymentsList";

// Interface for recipient with monthly proof of work
interface RecipientWithMonthlyProof extends MilestoneEscrowRecipient {
  monthlyProofOfWork?: Array<{
    monthNumber: number;
    description?: string;
    screenshotIds: string[];
    fileIds: string[];
    submittedAt?: string;
    approvedAt?: string;
  }>;
}

// Interface for client approved data
interface ClientApprovedData {
  length: number;
  [index: number]: unknown;
}

const getFrequencyText = (frequency: unknown): string => {
  if (!frequency || typeof frequency !== 'object') {
    return 'N/A';
  }

  if ('day' in frequency) {
    const day = Number(frequency.day);
    const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
    return `${day}${suffix} of month`;
  }

  return 'N/A';
};

// const calculateEndDate = (startDate: string, frequency: unknown, duration: number): string => {
//   if (!startDate || !frequency || typeof frequency !== 'object' || frequency === null) {
//     return 'N/A';
//   }

//   const actualDuration = duration || 1;
//   const start = new Date(Number(startDate) / 1000000);
//   const end = new Date(start);

//   if ('month' in frequency) {
//     end.setMonth(end.getMonth() + actualDuration);
//   } else if ('year' in frequency) {
//     end.setFullYear(end.getFullYear() + actualDuration);
//   } else if ('week' in frequency) {
//     end.setDate(end.getDate() + (actualDuration * 7));
//   } else if ('monthly' in frequency) {
//     end.setMonth(end.getMonth() + actualDuration);
//   } else if ('yearly' in frequency) {
//     end.setFullYear(end.getFullYear() + actualDuration);
//   } else if ('weekly' in frequency) {
//     end.setDate(end.getDate() + (actualDuration * 7));
//   } else {
//     return 'N/A';
//   }

//   return end.toLocaleDateString('en-US', { 
//     year: 'numeric', 
//     month: 'long', 
//     day: 'numeric' 
//   });
// };

interface MilestonesListProps {
  transaction: NormalizedTransaction | EscrowTransaction;
  onUploadSignedContract?: (milestoneId: string, recipientId: string) => Promise<void>;
  onClientApproveSignedContract?: (transactionId: string, milestoneId: string, recipientId: string) => void;
  onTransactionUpdate?: (updatedTransaction: NormalizedTransaction) => void;
}

export function MilestonesList({ transaction, onClientApproveSignedContract, onTransactionUpdate }: MilestonesListProps) {
  const { principal } = useUser();
  const [currentTransaction, setCurrentTransaction] = useState(transaction);

  // Sync state when transaction prop changes
  useEffect(() => {
    setCurrentTransaction(transaction);
    
    // Debug: Log the raw transaction data to see what's actually in the monthlyProofOfWork arrays
    if (transaction && isMilestoneTransaction(transaction)) {
      console.log("🔍 [DEBUG] Raw transaction data:", {
        transactionId: transaction.id,
        milestoneData: transaction.milestoneData,
        recipients: transaction.milestoneData?.recipients?.map(r => ({
          id: r.id,
          name: r.name,
          monthlyProofOfWork: (r as RecipientWithMonthlyProof).monthlyProofOfWork?.map((p) => ({
            monthNumber: p.monthNumber,
            description: p.description,
            submittedAt: p.submittedAt,
            screenshotIds: p.screenshotIds,
            fileIds: p.fileIds
          }))
        }))
      });
    }
  }, [transaction]);

  const [showProofOfWorkForm, setShowProofOfWorkForm] = useState(false);
  const [proofOfWorkData, setProofOfWorkData] = useState<{
    milestoneId: string;
    recipientId: string;
    recipientName: string;
  } | null>(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfData] = useState<{
    url: string;
    title: string;
    recipientName: string;
    milestoneId: string;
    recipientId: string;
  } | null>(null);
  const [showProofOfWorkViewer, setShowProofOfWorkViewer] = useState(false);
  const [proofOfWorkViewerData, setProofOfWorkViewerData] = useState<{
    proofOfWork: {
      description?: string;
      screenshots: string[];
      files: string[];
      submittedAt?: string;
      approvedAt?: string;
    };
    recipientName: string;
    milestoneId: string;
    monthNumber: number;
  } | null>(null);
  const [loadingStates, setLoadingStates] = useState<{
    approve: { [key: string]: boolean };
    upload: { [key: string]: boolean };
    release: boolean;
  }>({
    approve: {},
    upload: {},
    release: false
  });

  // Only show for milestone transactions
  if (!isMilestoneTransaction(currentTransaction)) {
    return null;
  }



  // Helper function to get the next month number to release
  const getNextMonthNumber = (milestone: Milestone): number => {
    if (!milestone.releasePayments || milestone.releasePayments.length === 0) {
      return 1; // First month if no payments yet
    }

    // Find the highest completed month
    const completedMonths = milestone.releasePayments
      .filter(payment => payment.releasedAt !== null && payment.releasedAt !== undefined)
      .map(payment => payment.monthNumber);

    const highestCompletedMonth = Math.max(...completedMonths, 0);
    return highestCompletedMonth + 1;
  };

  // Helper function to get the next month number to submit proof for
  const getNextProofMonthNumber = (milestone: Milestone, recipientId: string): number => {
    const recipient = milestone.recipients.find(r => r.id === recipientId);
    if (!recipient) return 1;
    
    console.log("🔍 [DEBUG] getNextProofMonthNumber function called:", {
      recipientId,
      duration: milestone.duration,
      monthlyProofOfWork: recipient.monthlyProofOfWork?.map(p => ({
        monthNumber: p.monthNumber,
        description: p.description,
        submittedAt: p.submittedAt
      }))
    });
    
    // Find the first month that doesn't have proof submitted
    for (let i = 0; i < milestone.duration; i++) {
      const monthNumber = i + 1;
      const monthlyProof = recipient.monthlyProofOfWork?.find(p => Number(p.monthNumber) === monthNumber);
      
      console.log("🔍 [DEBUG] Checking month:", {
        monthNumber,
        monthlyProof,
        found: !!monthlyProof
      });
      
      // Check if proof is actually submitted (not just default date)
      const hasValidProof = monthlyProof && monthlyProof.submittedAt && 
        (Array.isArray(monthlyProof.submittedAt) ? monthlyProof.submittedAt.length > 0 : monthlyProof.submittedAt) &&
        monthlyProof.description && typeof monthlyProof.description === 'string' && monthlyProof.description.trim() !== '';
      
      console.log("🔍 [DEBUG] hasValidProof for month", monthNumber, ":", hasValidProof);
      
      if (!hasValidProof) {
        console.log("🔍 [DEBUG] Returning monthNumber:", monthNumber);
        return monthNumber;
      }
    }
    
    // If all months have proof, return the last month
    console.log("🔍 [DEBUG] All months have proof, returning duration:", milestone.duration);
    return milestone.duration;
  };

  // Helper function to get release button text
  const getReleaseButtonText = (milestone: Milestone): string => {
    const nextMonth = getNextMonthNumber(milestone);
    const monthNames = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
    return `Release ${monthNames[nextMonth - 1]} Month Payment`;
  };

  // Function to handle milestone payment release
  const handleReleaseMilestonePayment = async (milestone: Milestone) => {
    if (!principal || !currentTransaction) return;

    const monthNumber = getNextMonthNumber(milestone);

    setLoadingStates(prev => ({ ...prev, release: true }));

    try {
      console.log("🚀 [FRONTEND] Starting milestone payment release");
      console.log("🚀 [FRONTEND] Transaction ID:", currentTransaction.id);
      console.log("🚀 [FRONTEND] Month Number:", monthNumber);
      console.log("🚀 [FRONTEND] Caller:", principal.toString());

      const result = await clientReleaseMilestonePayment(currentTransaction.id, monthNumber, principal);

      if ('ok' in result) {
        toast.success("Release payment success", { description: `Month ${monthNumber} payment released successfully! BTC has been sent to all recipients.` });
        // Refresh transaction data
        try {
          const updatedTransaction = await getTransaction(principal, currentTransaction.id);
          if (updatedTransaction) {
            // Normalize the transaction data to include releasePayments
            const normalizedTransactions = convertToNormalizedTransactions([updatedTransaction]);
            if (normalizedTransactions.length > 0) {
              setCurrentTransaction(normalizedTransactions[0]);
            }
          }
        } catch (refreshError) {
          console.error("❌ Failed to refresh transaction data:", refreshError);
          toast.error("Failed to refresh transaction data", { description: "Payment released successfully but failed to refresh data. Please reload the page." });
        }
      } else {
        toast.error(`Failed to release month ${monthNumber} payment`, { description: result.err });
      }
    } catch (error) {
      toast.error("Release payment error", { description: "Failed to release milestone payment" });
      console.error("Release payment error:", error);
    } finally {
      setLoadingStates(prev => ({ ...prev, release: false }));
    }
  };

  // Function to handle proof of work submission
  const handleProofOfWorkSubmit = async (data: ProofOfWorkData) => {
    if (!proofOfWorkData || !principal) return;

    console.log("🚀 [FRONTEND] Starting proof of work submission");
    console.log("🚀 [FRONTEND] Input data:", {
      milestoneId: proofOfWorkData.milestoneId,
      recipientId: proofOfWorkData.recipientId,
      principal: principal.toString(),
      description: data.description,
      screenshotsCount: data.screenshots.length,
      filesCount: data.files.length,
      screenshots: data.screenshots.map(f => ({ name: f.name, size: f.size, type: f.type })),
      files: data.files.map(f => ({ name: f.name, size: f.size, type: f.type }))
    });

    try {
      // Validate file sizes before processing
      console.log("🔍 [FRONTEND] Validating file sizes...");
      const maxFileSizeKB = 2000; // 2MB per file
      const maxTotalSizeMB = 1.5; // 1.5MB total payload limit

      // Check individual file sizes
      for (const file of [...data.screenshots, ...data.files]) {
        const validation = validateFileSize(file, maxFileSizeKB);
        if (!validation.valid) {
          toast.error('Error', { description: validation.error || "File size validation failed" });
          return;
        }
      }

      // Estimate total payload size
      const estimatedSize = estimatePayloadSize(data.description, data.screenshots, data.files);
      const estimatedSizeMB = estimatedSize / (1024 * 1024);

      console.log("📊 [FRONTEND] Payload size estimation:", {
        estimatedSizeBytes: estimatedSize,
        estimatedSizeMB: estimatedSizeMB.toFixed(2),
        maxAllowedMB: maxTotalSizeMB
      });

      if (estimatedSizeMB > maxTotalSizeMB) {
        toast.error(`Total payload size (${estimatedSizeMB.toFixed(2)}MB) exceeds limit (${maxTotalSizeMB}MB)`, { description: "Please reduce file sizes or remove some files." });
        return;
      }

      // Compress images and convert files to base64
      console.log("🔄 [FRONTEND] Processing screenshots...");
      const processedScreenshots = await Promise.all(
        data.screenshots.map(async (file, index) => {
          let processedFile = file;

          // Compress images
          if (isImageFile(file)) {
            try {
              console.log(`🔄 [FRONTEND] Compressing image ${index + 1}: ${file.name}`);
              processedFile = await compressImage(file, DEFAULT_COMPRESSION_OPTIONS);
              console.log(`✅ [FRONTEND] Image compressed: ${file.name} (${formatFileSize(file.size)} → ${formatFileSize(processedFile.size)})`);
            } catch (error) {
              console.warn(` [FRONTEND] Failed to compress image ${file.name}, using original:`, error);
            }
          }

          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              console.log(`🔄 [FRONTEND] Screenshot ${index + 1} converted:`, {
                name: processedFile.name,
                originalSize: file.size,
                processedSize: processedFile.size,
                base64Length: result.length,
                compressionRatio: ((file.size - processedFile.size) / file.size * 100).toFixed(1) + '%'
              });
              resolve(result);
            };
            reader.readAsDataURL(processedFile);
          });
        })
      );

      console.log("🔄 [FRONTEND] Processing files...");
      const filesBase64 = await Promise.all(
        data.files.map(async (file, index) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              console.log(`🔄 [FRONTEND] File ${index + 1} converted:`, {
                name: file.name,
                size: file.size,
                base64Length: result.length
              });
              resolve(result);
            };
            reader.readAsDataURL(file);
          });
        })
      );

      console.log("📤 [FRONTEND] Calling submitProofOfWork with payload:", {
        milestoneId: proofOfWorkData.milestoneId,
        recipientId: proofOfWorkData.recipientId,
        principal: principal.toString(),
        description: data.description,
        screenshotsCount: processedScreenshots.length,
        filesCount: filesBase64.length,
        screenshotsBase64Lengths: processedScreenshots.map(s => s.length),
        filesBase64Lengths: filesBase64.map(f => f.length),
        totalPayloadSizeMB: (processedScreenshots.reduce((sum, s) => sum + s.length, 0) +
          filesBase64.reduce((sum, f) => sum + f.length, 0) +
          data.description.length) / (1024 * 1024)
      });

      // Get the current milestone to determine which month to submit proof for
      if (!currentTransaction.milestoneData) {
        throw new Error("Milestone data not found");
      }
      const milestone = currentTransaction.milestoneData.milestones.find(m => m.id === proofOfWorkData.milestoneId);
      if (!milestone) {
        throw new Error("Milestone not found");
      }
      
      const monthNumber = getNextProofMonthNumber(milestone, proofOfWorkData.recipientId);
      
      console.log("📅 [FRONTEND] Submitting proof for month:", monthNumber);
      const recipient = milestone.recipients.find(r => r.id === proofOfWorkData.recipientId);
      console.log("🔍 [DEBUG] getNextProofMonthNumber result:", {
        milestoneId: proofOfWorkData.milestoneId,
        recipientId: proofOfWorkData.recipientId,
        monthNumber,
        monthlyProofOfWork: recipient?.monthlyProofOfWork?.map(p => ({
          monthNumber: p.monthNumber,
          description: p.description,
          submittedAt: p.submittedAt,
          hasValidDescription: p.description && typeof p.description === 'string' && p.description.trim() !== '',
          hasValidSubmittedAt: p.submittedAt && (Array.isArray(p.submittedAt) ? p.submittedAt.length > 0 : p.submittedAt)
        }))
      });

      const result = await submitProofOfWork(
        proofOfWorkData.milestoneId,
        proofOfWorkData.recipientId,
        principal,
        monthNumber,
        data.description,
        processedScreenshots,
        filesBase64
      );

      console.log("📥 [FRONTEND] submitProofOfWork result:", result);

      if ('ok' in result) {
        toast.success("Success", { description: "Proof of work submitted successfully!" });
        // Refresh transaction data
        if (principal) {
          try {
            const updatedTransaction = await getTransaction(principal, currentTransaction.id);
            if (updatedTransaction) {
              const normalizedTransactions = convertToNormalizedTransactions([updatedTransaction]);
              if (normalizedTransactions.length > 0) {
                const updatedNormalizedTransaction = normalizedTransactions[0];
                setCurrentTransaction(updatedNormalizedTransaction);
                
                // Notify parent component of the update
                if (onTransactionUpdate) {
                  onTransactionUpdate(updatedNormalizedTransaction);
                }
              }
            } else {
            }
          } catch (refreshError) {
            console.error("❌ Failed to refresh transaction data:", refreshError);
            toast.error("Failed to refresh transaction data", { description: "Submission successful but failed to refresh data. Please reload the page." });
          }
        }
      } else {
        console.error("❌ Backend returned error:", result.err);
        toast.error('Failed to submit proof of work', { description: result.err });
      }
    } catch (error) {
      console.error("Proof of work submission error:", error);
      throw error;
    }
  };

  // Function to open proof of work form
  const openProofOfWorkForm = (milestoneId: string, recipientId: string, recipientName: string) => {
    setProofOfWorkData({ milestoneId, recipientId, recipientName });
    setShowProofOfWorkForm(true);
  };

  // Function to close proof of work form
  const closeProofOfWorkForm = () => {
    setShowProofOfWorkForm(false);
    setProofOfWorkData(null);
  };

  // Function to open proof of work viewer
  const openProofOfWorkViewer = (recipient: MilestoneRecipient, milestoneId: string) => {
    // Find the milestone to get the current month
    const milestone = currentTransaction.milestoneData?.milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      console.error("Milestone not found for proof viewer");
      return;
    }

    // Use the current month that's ready for release (same as the button shows)
    const currentMonth = getNextMonthNumber(milestone);
    
    // Find the proof of work for the current month
    const monthlyProof = recipient.monthlyProofOfWork?.find(p => Number(p.monthNumber) === currentMonth);

    const proofOfWork = {
      description: monthlyProof?.description,
      screenshots: monthlyProof?.screenshotIds || [],
      files: monthlyProof?.fileIds || [],
      submittedAt: monthlyProof?.submittedAt
    };

    setProofOfWorkViewerData({
      proofOfWork,
      recipientName: recipient.name || 'Unknown',
      milestoneId,
      monthNumber: currentMonth
    });
    setShowProofOfWorkViewer(true);
  };

  // Function to close proof of work viewer
  const closeProofOfWorkViewer = () => {
    setShowProofOfWorkViewer(false);
    setProofOfWorkViewerData(null);
  };

  const milestones = currentTransaction.milestoneData?.milestones || [];


  if (milestones.length === 0) {
    return null;
  }

  // Calculate total allocation and per-milestone amount
  // const totalAllocation = transaction.to.reduce((sum, recipient) => sum + Number(recipient.amount), 0);
  // const perMilestoneAmount = totalAllocation / milestones.length;


  return (
    <div className="mt-6">

      <Typography variant="large" className="text-[#FEB64D] mb-4">
        Milestones ({milestones.length})
      </Typography>

      <div className="space-y-3">
        {milestones.map((milestone: Milestone, index: number) => {
          // Check contract signing at milestoneData level (all recipients sign once for the entire escrow)
          const allRecipientsSigned = currentTransaction.milestoneData?.recipients?.every((r: MilestoneEscrowRecipient) => {
            if (Array.isArray(r.signedContractAt)) {
              return r.signedContractAt.length > 0;
            }
            return !!r.signedContractAt;
          }) || false;

          // Check client approval at milestoneData level - all recipients must have client approval
          const clientApprovedSigned = currentTransaction.milestoneData?.recipients?.every((r: MilestoneEscrowRecipient) => {
            const clientApprovedAt = r.clientApprovedSignedContractAt;

            // Handle string format (normalized data)
            if (typeof clientApprovedAt === 'string') {
              return clientApprovedAt !== '' && clientApprovedAt !== 'null' && clientApprovedAt !== 'undefined';
            }

            // Handle array format from Candid interface
            if (Array.isArray(clientApprovedAt)) {
              return (clientApprovedAt as ClientApprovedData).length > 0 && clientApprovedAt[0] !== null && clientApprovedAt[0] !== undefined && String(clientApprovedAt[0]) !== '';
            }

            // Handle other formats
            return clientApprovedAt !== null && clientApprovedAt !== undefined && clientApprovedAt !== '';
          }) || false;

          const isActive = index === 0 && allRecipientsSigned && clientApprovedSigned;

          // Check if milestone is completed/released - using releasePayments instead
          const isCompleted = milestone.releasePayments && milestone.releasePayments.length > 0 &&
            milestone.releasePayments.some(payment => payment.releasedAt !== null && payment.releasedAt !== undefined);
          // Only check transaction status for the first milestone (index 0)
          const isReleased = index === 0 && (currentTransaction.status === "released" || currentTransaction.status === "completed");

          return (
            <div
              key={milestone.id || `milestone-${index}`}
              className={`${isCompleted || isReleased
                ? 'bg-gradient-to-br from-[#2A3A2A] to-[#1A2A1A] border-2 border-[#4A7C59] shadow-[0_8px_32px_rgba(74,124,89,0.2)] ring-2 ring-[#4A7C59]/20 ring-inset'
                : isActive
                  ? 'bg-gradient-to-br from-[#3A3A2A] to-[#2A2A2A] border-2 border-[#FEB64D] shadow-[0_8px_32px_rgba(254,182,77,0.3)] ring-2 ring-[#FEB64D]/20 ring-inset'
                  : 'bg-[#2A2A2A] border border-[#404040] shadow-sm'
                } rounded-[12px] p-4 transition-all duration-300 transform `}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${isCompleted || isReleased
                  ? 'bg-gradient-to-br from-[#4A7C59]/30 to-[#4A7C59]/10 shadow-lg shadow-[#4A7C59]/20'
                  : isActive
                    ? 'bg-gradient-to-br from-[#FEB64D]/30 to-[#FEB64D]/10 shadow-lg shadow-[#FEB64D]/20'
                    : 'bg-[#FEB64D]/20'
                  } rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
                  <Target size={16} className={`${isCompleted || isReleased
                    ? 'text-[#4A7C59] drop-shadow-sm'
                    : isActive
                      ? 'text-[#FEB64D] drop-shadow-sm'
                      : 'text-[#FEB64D]'
                    } transition-all duration-300`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Typography variant="base" className="text-white font-semibold">
                      Milestone {index + 1}
                    </Typography>
                    {index === 0 ? (
                      // First milestone - check contract signing at milestoneData level
                      (() => {
                        if (isCompleted || isReleased) {
                          return (
                            <div className="flex items-center space-x-1 bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-xs">
                              <span>Completed</span>
                            </div>
                          );
                        } else if (allRecipientsSigned && clientApprovedSigned) {
                          return (
                            <div className="flex items-center space-x-1 bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full text-xs">
                              <span>Active</span>
                            </div>
                          );
                        } else if (allRecipientsSigned && !clientApprovedSigned) {
                          return (
                            <div className="flex items-center space-x-1 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full text-xs">
                              <span>Awaiting Client Approval</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="flex items-center space-x-1 bg-[#FEB64D]/10 text-[#FEB64D] px-2 py-1 rounded-full text-xs">
                              <span>Pending Signatures</span>
                            </div>
                          );
                        }
                      })()
                    ) : (
                      // For subsequent milestones, check if start date has been reached
                      (() => {
                        const isStartDateReached = milestone.startDate && Number(milestone.startDate) / 1000000 <= Date.now();

                        if (isStartDateReached) {
                          return (
                            <div className="flex items-center space-x-1 bg-[#FEB64D]/10 text-[#FEB64D] px-2 py-1 rounded-full text-xs">
                              <span>Ready</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="flex items-center space-x-1 bg-[#6B7280]/10 text-[#6B7280] px-2 py-1 rounded-full text-xs">
                              <span>Scheduled</span>
                            </div>
                          );
                        }
                      })()
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-[#BCBCBC]">
                      <span>Amount: {milestone.allocation ? (Number(milestone.allocation) / 1e8).toFixed(8) : '0.00000000'} BTC</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-[#BCBCBC]">
                      <span>Frequency: {getFrequencyText(milestone.frequency)}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-[#BCBCBC]">
                      <span>Start Date: {milestone.startDate ? new Date(Number(milestone.startDate) / 1000000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-[#BCBCBC]">
                      <span>End Date: {milestone.endDate ? new Date(Number(milestone.endDate) / 1000000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-[#BCBCBC]">
                      <span>Duration: {milestone.duration || 1} months</span>
                    </div>


                    {/* Contract Signing Status - Show at milestone data level */}
                    {index === 0 && (
                      <>
                        {currentTransaction.milestoneData?.clientApprovedSignedAt &&
                          Array.isArray(currentTransaction.milestoneData.clientApprovedSignedAt) &&
                          currentTransaction.milestoneData.clientApprovedSignedAt.length > 0 &&
                          Number(currentTransaction.milestoneData.clientApprovedSignedAt[0]) > 0 && (
                            <div className="flex items-center space-x-2 text-sm text-[#BCBCBC]">
                              <span>Client Approved: {new Date(Number(currentTransaction.milestoneData.clientApprovedSignedAt[0]) / 1000000).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          )}
                      </>
                    )}

                    {/* Recipients List - Redesigned with better spacing */}
                    {milestone.recipients && milestone.recipients.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Users size={16} className="text-[#FEB64D]" />
                          <Typography variant="small" className="text-white font-medium">
                            Recipients ({milestone.recipients.length})
                          </Typography>
                        </div>

                        <div className="space-y-4">
                          {milestone.recipients.map((recipient: MilestoneRecipient, recipientIndex: number) => {
                            const isApproved = recipient.approvedAt && recipient.approvedAt.length > 0;
                            const isDeclined = recipient.declinedAt && recipient.declinedAt.length > 0;
                            // Only check proof status for the active milestone (index 0)
                            // Future milestones shouldn't show proof status since they haven't started yet
                            const hasProofOfWork = index === 0 && recipient.monthlyProofOfWork && 
                              recipient.monthlyProofOfWork.some(proof => proof.submittedAt);
                            
                            // Debug logging for proof status
                            if (index === 0) {
                              console.log('🔍 [MILESTONE_DEBUG] Recipient:', recipient.name, {
                                monthlyProofOfWork: recipient.monthlyProofOfWork,
                                hasProofOfWork,
                                recipientData: recipient
                              });
                            }


                            return (
                              <div
                                key={recipient.id || `recipient-${recipientIndex}`}
                                className="bg-[#1A1A1A] border border-[#333] rounded-[12px] p-4 hover:border-[#404040] transition-colors"
                              >
                                {/* Recipient Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#FEB64D]/20 to-[#FEB64D]/10 rounded-full flex items-center justify-center">
                                      <Users size={16} className="text-[#FEB64D]" />
                                    </div>
                                    <div>
                                      <Typography variant="small" className="text-white font-semibold">
                                        {recipient.name || 'Unknown'}
                                      </Typography>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-3">
                                    <div className="text-right">
                                      <Typography variant="small" className="text-[#FEB64D] font-mono">
                                        {(() => {
                                          // Calculate monthly amount per recipient based on their share amount (in satoshis)
                                          const duration = milestone.duration ? Number(milestone.duration) : 1;
                                          const recipientShareSatoshis = recipient.share ? Number(recipient.share) : 0;

                                          // Convert recipient share from satoshis to BTC
                                          const recipientShareBTC = recipientShareSatoshis / 1e8;

                                          // Convert duration from nanoseconds to months (assuming duration is in months)
                                          const durationInMonths = duration;

                                          // Calculate recipient's monthly amount
                                          const monthlyAmountForRecipient = recipientShareBTC / durationInMonths;

                                          return `${monthlyAmountForRecipient.toFixed(4)}btc/month`;
                                        })()}
                                      </Typography>
                                    </div>

                                    {/* Status Badge - Only show if approved or declined */}
                                    <div className="flex items-center space-x-2">
                                      {isApproved && (
                                        <div className="flex items-center space-x-1 bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs">
                                          <CheckCircle size={12} />
                                          <span>Approved</span>
                                        </div>
                                      )}
                                      {isDeclined && (
                                        <div className="flex items-center space-x-1 bg-red-500/10 text-red-400 px-2 py-1 rounded-full text-xs">
                                          <XCircle size={12} />
                                          <span>Declined</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Status Timeline - Only show Proof of Work status at recipient level */}
                                {(() => {
                                  // Check if client has approved signed contracts
                                  const clientApprovedSigned = currentTransaction.milestoneData?.recipients?.every((r: MilestoneEscrowRecipient) => {
                                    const clientApprovedAt = r.clientApprovedSignedContractAt;

                                    // Handle string format (normalized data)
                                    if (typeof clientApprovedAt === 'string') {
                                      return clientApprovedAt !== '' && clientApprovedAt !== 'null' && clientApprovedAt !== 'undefined';
                                    }

                                    // Handle array format from Candid interface
                                    if (Array.isArray(clientApprovedAt)) {
                                      return (clientApprovedAt as ClientApprovedData).length > 0 && clientApprovedAt[0] !== null && clientApprovedAt[0] !== undefined && String(clientApprovedAt[0]) !== '';
                                    }

                                    // Handle other formats
                                    return clientApprovedAt !== null && clientApprovedAt !== undefined && clientApprovedAt !== '';
                                  }) || false;

                                  // Only show proof status for the active milestone (index 0) and if client has approved signed contracts
                                  if (index !== 0 || !clientApprovedSigned) return null;

                                  return (
                                    <div className="flex items-center space-x-2 mb-4">
                                      {/* Proof of Work Status */}
                                      <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${hasProofOfWork ? 'bg-purple-400' : 'bg-gray-500'}`}></div>
                                        <Typography variant="small" className={hasProofOfWork ? "text-purple-400" : "text-gray-500"}>
                                          Proof {hasProofOfWork ? 'Submitted' : 'Pending'}
                                        </Typography>
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Action Buttons */}
                                {index === 0 && (
                                  <div className="flex flex-wrap items-center gap-2">
                                    {(() => {
                                      const currentPrincipalText = principal?.toString() || "";
                                      const transactionFromText = currentTransaction.from?.toString() || "";
                                      const isCurrentUserClient = currentPrincipalText === transactionFromText;
                                      const recipientPrincipalText = recipient.principal?.toString() || "";
                                      const isCurrentUserThisRecipient = currentPrincipalText === recipientPrincipalText;

                                      if (isCurrentUserClient) {
                                        // Client view
                                        return (
                                          <>
                                            {/* Contract signing moved to Milestone Escrow Overview level */}
                                            {hasProofOfWork && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openProofOfWorkViewer(recipient, milestone.id)}
                                                className="h-8 px-3 text-purple-400 hover:bg-purple-400/10 hover:text-purple-400 text-xs"
                                              >
                                                <ClipboardList size={12} className="mr-1" />
                                                View Proof (Month {getNextMonthNumber(milestone)})
                                              </Button>
                                            )}
                                          </>
                                        );
                                      } else if (isCurrentUserThisRecipient) {
                                        // Recipient view - Only show Submit Proof if client has approved signed contracts
                                        const clientApprovedSigned = currentTransaction.milestoneData?.recipients?.every((r: MilestoneEscrowRecipient) => {
                                          const clientApprovedAt = r.clientApprovedSignedContractAt;

                                          // Handle string format (normalized data)
                                          if (typeof clientApprovedAt === 'string') {
                                            return clientApprovedAt !== '' && clientApprovedAt !== 'null' && clientApprovedAt !== 'undefined';
                                          }

                                          // Handle array format from Candid interface
                                          if (Array.isArray(clientApprovedAt)) {
                                            return (clientApprovedAt as ClientApprovedData).length > 0 && clientApprovedAt[0] !== null && clientApprovedAt[0] !== undefined && String(clientApprovedAt[0]) !== '';
                                          }

                                          // Handle other formats
                                          return clientApprovedAt !== null && clientApprovedAt !== undefined && clientApprovedAt !== '';
                                        }) || false;

                                        return (
                                          <>
                                            {/* Contract signing moved to Milestone Escrow Overview level */}

                                            {clientApprovedSigned && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openProofOfWorkForm(milestone.id, recipient.id, recipient.name)}
                                                className="h-8 px-3 text-purple-400 hover:bg-purple-400/10 hover:text-purple-400 text-xs"
                                              >
                                                <ClipboardList size={12} className="mr-1" />
                                                {hasProofOfWork ? 'Update Proof' : `Submit Proof (Month ${getNextProofMonthNumber(milestone, recipient.id)})`}
                                              </Button>
                                            )}

                                            {hasProofOfWork && (
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => openProofOfWorkViewer(recipient, milestone.id)}
                                                className="h-8 px-3 text-purple-400 hover:bg-purple-400/10 hover:text-purple-400 text-xs"
                                              >
                                                <Eye size={12} className="mr-1" />
                                                View Proof (Month {getNextMonthNumber(milestone)})
                                              </Button>
                                            )}
                                          </>
                                        );
                                      } else {
                                        // Other user view - Only show "No actions available" if client has approved signed contracts
                                        const clientApprovedSigned = currentTransaction.milestoneData?.recipients?.every((r: MilestoneEscrowRecipient) => {
                                          const clientApprovedAt = r.clientApprovedSignedContractAt;

                                          // Handle string format (normalized data)
                                          if (typeof clientApprovedAt === 'string') {
                                            return clientApprovedAt !== '' && clientApprovedAt !== 'null' && clientApprovedAt !== 'undefined';
                                          }

                                          // Handle array format from Candid interface
                                          if (Array.isArray(clientApprovedAt)) {
                                            return (clientApprovedAt as ClientApprovedData).length > 0 && clientApprovedAt[0] !== null && clientApprovedAt[0] !== undefined && String(clientApprovedAt[0]) !== '';
                                          }

                                          // Handle other formats
                                          return clientApprovedAt !== null && clientApprovedAt !== undefined && clientApprovedAt !== '';
                                        }) || false;

                                        if (!clientApprovedSigned) return null;

                                        return (
                                          <div className="text-xs text-gray-500">
                                            No actions available
                                          </div>
                                        );
                                      }
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="text-sm text-[#BCBCBC]">
                        {index === 0 ? (
                          (() => {
                            const allRecipientsSigned = currentTransaction.milestoneData?.recipients?.every((r: MilestoneEscrowRecipient) => {
                              if (Array.isArray(r.signedContractAt)) {
                                return r.signedContractAt.length > 0;
                              }
                              return !!r.signedContractAt;
                            }) || false;
                            const allRecipientsApproved = currentTransaction.milestoneData?.recipients?.every((r: MilestoneEscrowRecipient) => {
                              const clientApprovedAt = r.clientApprovedSignedContractAt;

                              // Handle string format (normalized data)
                              if (typeof clientApprovedAt === 'string') {
                                return clientApprovedAt !== '' && clientApprovedAt !== 'null' && clientApprovedAt !== 'undefined';
                              }

                              // Handle array format from Candid interface
                              if (Array.isArray(clientApprovedAt)) {
                                return (clientApprovedAt as ClientApprovedData).length > 0 && clientApprovedAt[0] !== null && clientApprovedAt[0] !== undefined && String(clientApprovedAt[0]) !== '';
                              }

                              // Handle other formats
                              return clientApprovedAt !== null && clientApprovedAt !== undefined && clientApprovedAt !== '';
                            }) || false;
                            // Check if all recipients have submitted proof for the next month to be released
                            const nextMonthToRelease = getNextMonthNumber(milestone);
                            const allRecipientsSubmittedProof = milestone.recipients?.every((r: MilestoneRecipient) => {
                              const monthlyProof = r.monthlyProofOfWork?.find(p => p.monthNumber === nextMonthToRelease);
                              return monthlyProof && monthlyProof.submittedAt;
                            }) || false;
                            // const isStartDateReached = milestone.startDate && Number(milestone.startDate) / 1000000 <= Date.now();

                            if (allRecipientsSigned && allRecipientsApproved && allRecipientsSubmittedProof) {
                              return <span>Status: Ready for payment release - All recipients have submitted proof of work</span>;
                            } else if (allRecipientsSigned && allRecipientsApproved) {
                              return <span>Status: Active - Milestone is running</span>;
                            } else if (allRecipientsSigned) {
                              return <span>Status: Not active yet - Client must approve all signed contracts from recipients</span>;
                            } else {
                              return <span>Status: Awaiting recipient contract signatures</span>;
                            }
                          })()
                        ) : (
                          <span>Status: Waiting for previous milestone completion</span>
                        )}
                      </div>

                      {/* Release Payment Button - Only show for first milestone when all recipients have submitted proof */}
                      {index === 0 && (() => {
                        const currentPrincipalText = principal?.toString() || "";
                        const transactionFromText = currentTransaction.from?.toString() || "";
                        const isCurrentUserClient = currentPrincipalText === transactionFromText;

                        const allRecipientsSigned = currentTransaction.milestoneData?.recipients?.every((r: MilestoneEscrowRecipient) => {
                          if (Array.isArray(r.signedContractAt)) {
                            return r.signedContractAt.length > 0;
                          }
                          return !!r.signedContractAt;
                        }) || false;
                        const allRecipientsApproved = currentTransaction.milestoneData?.recipients?.every((r: MilestoneEscrowRecipient) => {
                          const clientApprovedAt = r.clientApprovedSignedContractAt;

                          // Handle string format (normalized data)
                          if (typeof clientApprovedAt === 'string') {
                            return clientApprovedAt !== '' && clientApprovedAt !== 'null' && clientApprovedAt !== 'undefined';
                          }

                          // Handle array format from Candid interface
                          if (Array.isArray(clientApprovedAt)) {
                            return (clientApprovedAt as ClientApprovedData).length > 0 && clientApprovedAt[0] !== null && clientApprovedAt[0] !== undefined && String(clientApprovedAt[0]) !== '';
                          }

                          // Handle other formats
                          return clientApprovedAt !== null && clientApprovedAt !== undefined && clientApprovedAt !== '';
                        }) || false;
                        // Check if all recipients have submitted proof for the next month to be released
                        const nextMonthToRelease = getNextMonthNumber(milestone);
                        const allRecipientsSubmittedProof = milestone.recipients?.every((r: MilestoneRecipient) => {
                          const monthlyProof = r.monthlyProofOfWork?.find(p => Number(p.monthNumber) === nextMonthToRelease);
                          return monthlyProof && monthlyProof.submittedAt;
                        }) || false;

                        const canReleasePayment = isCurrentUserClient && allRecipientsSigned && allRecipientsApproved && allRecipientsSubmittedProof && currentTransaction.status !== "released";

                        if (canReleasePayment) {
                          const nextMonth = getNextMonthNumber(milestone);
                          const buttonText = getReleaseButtonText(milestone);

                          return (
                            <div className="flex items-center justify-center pt-2">
                              <Button
                                onClick={() => handleReleaseMilestonePayment(milestone)}
                                disabled={loadingStates.release}
                                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                              >
                                {loadingStates.release ? `Releasing Month ${nextMonth} Payment...` : buttonText}
                              </Button>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Release Payments List - Show for first milestone only */}
              {index === 0 && milestone.releasePayments && (
                <div className="mt-4">
                  <ReleasePaymentsList
                    releasePayments={milestone.releasePayments}
                    milestone={milestone}
                    isLoading={loadingStates.release}
                    isCurrentUserClient={principal?.toString() === currentTransaction.from?.toString()}
                    onViewProofOfWork={(recipientId: string) => {
                      const recipient = milestone.recipients.find(r => r.id === recipientId);
                      if (recipient) {
                        openProofOfWorkViewer(recipient, milestone.id);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-[#2A2A2A] border border-[#404040] rounded-[12px]">
        <Typography variant="small" className="text-[#BCBCBC]">
          💡 Milestones will be processed automatically based on the configured frequency and recipient approvals.
        </Typography>
      </div>

      {/* Proof of Work Form Modal */}
      {showProofOfWorkForm && proofOfWorkData && (
        <ProofOfWorkForm
          milestoneId={proofOfWorkData.milestoneId}
          recipientId={proofOfWorkData.recipientId}
          recipientName={proofOfWorkData.recipientName}
          onClose={closeProofOfWorkForm}
          onSubmit={handleProofOfWorkSubmit}
        />
      )}

      {/* PDF Viewer Modal */}
      {showPDFModal && pdfData && (
        <PDFViewerModal
          isOpen={showPDFModal}
          onClose={() => setShowPDFModal(false)}
          pdfUrl={pdfData.url}
          title={pdfData.title}
          onDownload={() => {
            const link = document.createElement('a');
            link.href = pdfData.url;
            link.download = `signed-contract-${pdfData.recipientName}.pdf`;
            link.click();
          }}
          onApprove={() => {
            if (onClientApproveSignedContract) {
              onClientApproveSignedContract(currentTransaction.id, pdfData.milestoneId, pdfData.recipientId);
            }
            setShowPDFModal(false);
          }}
          isApproving={loadingStates.approve[`${pdfData.milestoneId}-${pdfData.recipientId}`]}
          showActions={true}
        />
      )}

      {/* Proof of Work Viewer Modal */}
      {showProofOfWorkViewer && proofOfWorkViewerData && (
        <ProofOfWorkViewer
          isOpen={showProofOfWorkViewer}
          onClose={closeProofOfWorkViewer}
          proofOfWork={proofOfWorkViewerData.proofOfWork}
          recipientName={proofOfWorkViewerData.recipientName}
          milestoneId={proofOfWorkViewerData.milestoneId}
          monthNumber={proofOfWorkViewerData.monthNumber}
        />
      )}
    </div>
  );
}
