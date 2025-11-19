import { useUser } from "@/hooks/useUser";
import { InitiateMultipleMilestonesRequest } from "@/lib/internal/icp/milestone";
import { createMilestoneEscrow } from "@/lib/internal/icp/transaction";
import { setNewTxId } from "@/lib/redux/store/escrowSlice";
import { PhoneNumber } from "@/modules/shared.types";
import { escrowFormSchema } from "@/validation/escrow";
import { Principal } from '@dfinity/principal';
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

// Utility function to humanize error messages
const humanizeErrorMessage = (error: string): string => {
  // Convert satoshis to BTC in error messages
  const satoshiMatch = error.match(/(\d+)\s*satoshis?/i);
  if (satoshiMatch) {
    const satoshis = parseInt(satoshiMatch[1]);
    const btc = (satoshis / 1e8).toFixed(8);
    return error.replace(satoshiMatch[0], `${btc} BTC`);
  }

  // Convert large numbers that look like satoshis to BTC
  const largeNumberMatch = error.match(/Required:\s*(\d+),\s*Available:\s*(\d+)/);
  if (largeNumberMatch) {
    const required = parseInt(largeNumberMatch[1]);
    const available = parseInt(largeNumberMatch[2]);
    const requiredBTC = (required / 1e8).toFixed(8);
    const availableBTC = (available / 1e8).toFixed(8);
    return error.replace(largeNumberMatch[0], `Required: ${requiredBTC} BTC, Available: ${availableBTC} BTC`);
  }

  // Convert other large numbers that might be satoshis
  const numberMatch = error.match(/(\d{8,})/);
  if (numberMatch) {
    const number = parseInt(numberMatch[1]);
    // If it's a large number that could be satoshis (8+ digits), convert to BTC
    if (number > 1000000) { // More than 1 million, likely satoshis
      const btc = (number / 1e8).toFixed(8);
      return error.replace(numberMatch[1], `${btc} BTC`);
    }
  }

  return error;
};

type FormData = z.infer<typeof escrowFormSchema>;

export function useMilestoneActions() {
  const { principal } = useUser();
  const dispatch = useDispatch();

  const createMilestone = useCallback(
    async (data: FormData) => {
      if (!principal) {
        toast.error("Error", { description: "Please connect your wallet to create a milestone" });
        return { success: false, error: "No principal found" };
      }

      try {
        if (!data.milestones || data.milestones.length === 0) {
          toast.error("Error", { description: "Please add at least one milestone" });
          return { success: false, error: "No milestones provided" };
        }

        // Create 1 transaction with multiple milestones
        const milestones = data.milestones;

        // Validate all milestones
        for (const milestone of milestones) {
          if (!milestone.recipients || milestone.recipients.length === 0) {
            toast.error("Error", { description: `Please add at least one recipient to milestone: ${milestone.title}` });
            return { success: false, error: "No recipients provided" };
          }
        }

        console.log('🔍 ===== CREATING SINGLE TRANSACTION WITH MULTIPLE MILESTONES =====');
        console.log(`🔍 Total milestones to create: ${milestones.length}`);
        console.log(`🔍 Transaction title: ${data.title}`);
        console.log(`🔍 Total BTC amount: ${data.btcAmount}`);
        console.log('🔍 Raw milestone data:', milestones);

        // Get the form-level contract file
        const formContractFile = data.contractFile;
        console.log('🔍 Form contract file:', formContractFile);

        // Convert all milestones to the format expected by the backend
        const milestoneRequests = milestones.map((milestone) => {

          // Convert recipients to the format expected by the backend
          const recipients = milestone.recipients.map((recipient) => {
            // Convert percentage to actual BTC amount, then to satoshis
            const shareInBTC = (Number(recipient.share) / 100) * Number(milestone.allocation);
            const shareInSatoshis = BigInt(Math.round(shareInBTC * 1e8));

            return {
              id: recipient.id,
              name: recipient.name,
              principal: Principal.fromText(recipient.principal),
              share: shareInSatoshis,
              email: recipient.email ? [recipient.email] as [string] : [] as [], // Motoko optional type
              phone: recipient.phone ? [recipient.phone] as [PhoneNumber] : [] as [], // Motoko optional type
              billingAddress: recipient.billingAddress ? [recipient.billingAddress] as [string] : [] as [], // Motoko optional type
              approvedAt: [] as [], // Motoko optional type - empty array for null
              declinedAt: [] as [] // Motoko optional type - empty array for null
            };
          });

          const allocationInSatoshis = BigInt(Math.round(Number(milestone.allocation) * 1e8));
          const startDateTimestamp = BigInt(milestone.startDate) * BigInt(1000000); // Convert ms to ns

          const frequencyVariant = (() => {
            if (milestone.frequency.startsWith('day-')) {
              const dayNumber = parseInt(milestone.frequency.replace('day-', ''));
              if (dayNumber >= 1 && dayNumber <= 28) {
                return { 'day': BigInt(dayNumber) };
              } else {
                throw new Error(`Invalid day number: ${dayNumber}. Must be between 1-28`);
              }
            } else {
              throw new Error(`Invalid frequency: ${milestone.frequency}. Must be in format 'day-X' where X is 1-28`);
            }
          })();

          const milestoneRequest = {
            title: milestone.title,
            allocation: allocationInSatoshis,
            coin: milestone.coin,
            recipients: recipients,
            startDate: startDateTimestamp, // Use nanoseconds timestamp
            frequency: frequencyVariant,
            duration: BigInt(milestone.duration || 12), // Duration in months/weeks/years, default to 12
            contractSigningPeriod: data.contractSigningPeriod ? [BigInt(data.contractSigningPeriod)] as [bigint] : [] as [], // Motoko optional type
            contractFile: [] as [] // Contract file is now at milestoneData level, not in individual milestones
          };

          console.log(`🔍 Milestone request for "${milestone.title}":`, milestoneRequest);
          return milestoneRequest;
        });

        // Use contract file base64 data directly (no need to upload to storage)
        let contractFileData: string | null = null;
        if (formContractFile) {
          console.log('📁 Using contract file base64 data directly...');
          // Extract base64 data from data URL if it's a data URL
          if (formContractFile.startsWith('data:')) {
            const base64Index = formContractFile.indexOf('base64,');
            if (base64Index !== -1) {
              contractFileData = formContractFile.substring(base64Index + 7); // Remove 'base64,' prefix

              // Comprehensive file validation
              try {
                const decodedBytes = atob(contractFileData.substring(0, 100)); // Check first 100 characters for better validation
                console.log('🔍 First 100 decoded bytes:', decodedBytes);

                // Check for PDF signature
                if (!decodedBytes.startsWith('%PDF')) {
                  let detectedType = 'Unknown';
                  let errorMessage = 'The uploaded file is not a valid PDF.';

                  if (decodedBytes.startsWith('<!DOCTYPE') || decodedBytes.startsWith('<html')) {
                    detectedType = 'HTML';
                    errorMessage = 'HTML file detected. Please upload a PDF file instead.';
                  } else if (decodedBytes.startsWith('PK')) {
                    detectedType = 'ZIP/Office Document';
                    errorMessage = 'ZIP or Office document detected. Please upload a PDF file instead.';
                  } else if (decodedBytes.startsWith('GIF8') || decodedBytes.startsWith('PNG') || decodedBytes.startsWith('JFIF')) {
                    detectedType = 'Image';
                    errorMessage = 'Image file detected. Please upload a PDF file instead.';
                  } else if (decodedBytes.startsWith('RIFF')) {
                    detectedType = 'Video/Audio';
                    errorMessage = 'Video or audio file detected. Please upload a PDF file instead.';
                  }

                  console.warn(' Invalid file type detected:', detectedType);
                  console.warn(' First bytes:', decodedBytes.substring(0, 50));
                  toast.error("Error", { description: errorMessage });
                  return { success: false, error: `Invalid file format: ${detectedType}` };
                }

                // Additional PDF validation - check for PDF version
                const pdfVersionMatch = decodedBytes.match(/^%PDF-(\d+\.\d+)/);
                if (pdfVersionMatch) {
                  const version = pdfVersionMatch[1];
                  console.log('✅ PDF validation passed - detected PDF version:', version);

                  // Check if it's a reasonable PDF version (1.0 to 2.0)
                  const versionNum = parseFloat(version);
                  if (versionNum < 1.0 || versionNum > 2.0) {
                    console.warn(' Unusual PDF version detected:', version);
                    toast.error('Warning: Unusual PDF version detected.', { description: "Please ensure this is a valid PDF file." });
                    return { success: false, error: "Unusual PDF version" };
                  }
                } else {
                  console.warn(' PDF file detected but version could not be determined');
                }

                console.log('✅ PDF validation passed - file appears to be a valid PDF');
              } catch (error) {
                console.error('❌ Error validating PDF file:', error);
                toast.error('Error: Unable to validate the uploaded file', { description: "Please ensure it is a valid PDF and try again." });
                return { success: false, error: "File validation failed" };
              }
            } else {
              contractFileData = formContractFile;
            }
          } else {
            contractFileData = formContractFile;
          }

          // Additional validation for non-data URL files
          if (contractFileData && !formContractFile.startsWith('data:')) {
            try {
              const decodedBytes = atob(contractFileData.substring(0, 100));
              console.log('🔍 Validating non-data URL file, first 100 decoded bytes:', decodedBytes);

              if (!decodedBytes.startsWith('%PDF')) {
                let detectedType = 'Unknown';
                let errorMessage = 'The uploaded file is not a valid PDF.';

                if (decodedBytes.startsWith('<!DOCTYPE') || decodedBytes.startsWith('<html')) {
                  detectedType = 'HTML';
                  errorMessage = 'HTML file detected. Please upload a PDF file instead.';
                } else if (decodedBytes.startsWith('PK')) {
                  detectedType = 'ZIP/Office Document';
                  errorMessage = 'ZIP or Office document detected. Please upload a PDF file instead.';
                } else if (decodedBytes.startsWith('GIF8') || decodedBytes.startsWith('PNG') || decodedBytes.startsWith('JFIF')) {
                  detectedType = 'Image';
                  errorMessage = 'Image file detected. Please upload a PDF file instead.';
                }

                console.warn(' Invalid file type detected in non-data URL:', detectedType);
                toast.error("Error", { description: errorMessage });
                return { success: false, error: `Invalid file format: ${detectedType}` };
              }

              console.log('✅ Non-data URL PDF validation passed');
            } catch (error) {
              console.error('❌ Error validating non-data URL PDF file:', error);
              toast.error('Error: Unable to validate the uploaded file', { description: "Please ensure it is a valid PDF and try again." });
              return { success: false, error: "File validation failed" };
            }
          }
          console.log('✅ Contract file data prepared for backend');
        }

        // Create the multiple milestones request
        const multipleMilestonesRequest: InitiateMultipleMilestonesRequest = {
          title: data.title || milestones[0].title, // Use form title or first milestone title
          milestones: milestoneRequests,
          contractFile: contractFileData ? [contractFileData] as [string] : [] as [] // Motoko optional type
        };

        console.log('🔍 ===== MULTIPLE MILESTONES REQUEST TO BACKEND =====');
        console.log('🔍 Request:', multipleMilestonesRequest);
        console.log('🔍 Contract file data in request:', multipleMilestonesRequest.contractFile ? 'Present' : 'None');
        console.log('🔍 ===== END MULTIPLE MILESTONES REQUEST =====');

        // Call the backend to create the transaction with multiple milestones
        const result = await createMilestoneEscrow(principal, multipleMilestonesRequest);

        if ('ok' in result) {
          const okResult = result as { ok: { milestoneId: string; transactionId: string } };
          console.log('✅ Transaction with multiple milestones created successfully!');
          console.log(`✅ Transaction ID: ${okResult.ok.transactionId}`);
          console.log(`✅ Primary Milestone ID: ${okResult.ok.milestoneId}`);

          const allMilestoneTitles = milestones.map(m => m.title);

          console.log('🔍 ===== TRANSACTION CREATION SUMMARY =====');
          console.log(`🔍 Transaction ID: ${okResult.ok.transactionId}`);
          console.log(`🔍 Primary Milestone ID: ${okResult.ok.milestoneId}`);
          console.log(`🔍 All Milestone Titles: ${allMilestoneTitles.join(', ')}`);
          console.log(`🔍 Total Milestones Created: ${milestones.length}`);
          console.log('🔍 ===== END TRANSACTION CREATION SUMMARY =====');

          toast.success("Milestone created successfully", { description: `Milestone escrow with ${milestones.length} milestones created successfully! Transaction ID: ${okResult.ok.transactionId}` });

          // Set the new transaction ID in Redux for redirect
          dispatch(setNewTxId(okResult.ok.transactionId));

          return {
            success: true,
            transactionId: okResult.ok.transactionId,
            milestoneId: okResult.ok.milestoneId,
            milestoneIds: [okResult.ok.milestoneId], // Primary milestone ID
            milestoneTitles: allMilestoneTitles
          };
        } else {
          const errResult = result as { err: string };
          const humanizedError = humanizeErrorMessage(errResult.err || "Failed to create milestone escrow");
          console.error('❌ Milestone escrow creation failed:', humanizedError);
          toast.error('Failed to create milestone escrow:', { description: humanizedError });
          return { success: false, error: humanizedError };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('🔍 Error creating milestone:', err);
        toast.error("Failed to create milestone", { description: errorMessage });
        return { success: false, error: errorMessage };
      }
    },
    [principal, dispatch]
  );

  return {
    createMilestone
  };
}
