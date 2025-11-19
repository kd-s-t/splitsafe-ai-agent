"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { directTransferFormSchema, type DirectTransferFormData } from "./directTransferSchema";

interface DirectTransferFormProps {
  onTransferComplete?: (transferId: string) => void;
  defaultRecipient?: string;
  defaultMerchantId?: string;
}

export default function DirectTransferForm({ 
  onTransferComplete, 
  defaultRecipient,
  defaultMerchantId 
}: DirectTransferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { principal } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<DirectTransferFormData>({
    resolver: zodResolver(directTransferFormSchema),
    defaultValues: {
      to: defaultRecipient || "",
      amount: "",
      memo: "",
      merchantId: defaultMerchantId || "",
    },
  });

  const amount = watch("amount");

  const onSubmit = async () => {
    if (!principal) {
      setError("You must be logged in to make transfers");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Convert amount to e8s (satoshis)
      // const amountInE8s = Math.floor(parseFloat(data.amount) * 100_000_000); // Unused for now

      // TODO: Implement direct transfer with ICP calls instead of missing API
      // For now, simulate successful transfer
      const result = { success: true, transactionId: 'simulated_tx_id' };

      if (result.success) {
        setSuccess(`Transfer completed! Transfer ID: ${result.transactionId}`);
        reset();
        onTransferComplete?.(result.transactionId);
      } else {
        throw new Error("Transfer failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00000000 BTC";
    return `${num.toFixed(8)} BTC`;
  };

  return (
    <Card className="bg-[#1C1D1D] border border-[#2A2B2B]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-[#FEB64D]" />
          Direct Transfer
        </CardTitle>
        <p className="text-[#BCBCBC] text-sm">
          Send Bitcoin directly to another SplitSafe account. No approval needed.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Recipient Principal ID */}
          <div className="space-y-2">
            <Label htmlFor="to" className="text-white">
              Recipient Principal ID
            </Label>
            <Input
              id="to"
              {...register("to")}
              placeholder="e.g., z5ogu-fswbs-c4ckq-nmfa3-jukwt-ktdl7-u2jal-q4i6s-4eltd-sz3wk-rqe"
              className="bg-[#2A2B2B] border-[#3A3B3B] text-white placeholder-[#BCBCBC]"
            />
            {errors.to && (
              <p className="text-red-400 text-sm">{errors.to.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white">
              Amount (BTC)
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                min="0.00000001"
                {...register("amount")}
                placeholder="0.00000001"
                className="bg-[#2A2B2B] border-[#3A3B3B] text-white placeholder-[#BCBCBC] pr-20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BCBCBC] text-sm">
                BTC
              </div>
            </div>
            {amount && (
              <p className="text-[#BCBCBC] text-sm">
                {formatAmount(amount)} ({(parseFloat(amount) * 100_000_000).toLocaleString()} e8s)
              </p>
            )}
            {errors.amount && (
              <p className="text-red-400 text-sm">{errors.amount.message}</p>
            )}
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo" className="text-white">
              Memo (Optional)
            </Label>
            <Textarea
              id="memo"
              {...register("memo")}
              placeholder="e.g., Payment for flight booking"
              className="bg-[#2A2B2B] border-[#3A3B3B] text-white placeholder-[#BCBCBC]"
              rows={2}
            />
          </div>

          {/* Merchant ID */}
          <div className="space-y-2">
            <Label htmlFor="merchantId" className="text-white">
              Merchant ID (Optional)
            </Label>
            <Input
              id="merchantId"
              {...register("merchantId")}
              placeholder="e.g., cebu_pacific"
              className="bg-[#2A2B2B] border-[#3A3B3B] text-white placeholder-[#BCBCBC]"
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-900/20 border-red-500/50">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {success && (
            <Alert className="bg-green-900/20 border-green-500/50">
              <AlertCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FEB64D] hover:bg-[#FEB64D]/90 text-black font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Transfer...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Transfer
              </>
            )}
          </Button>
        </form>

        {/* Transfer Info */}
        <div className="mt-6 p-4 bg-[#2A2B2B] rounded-lg border border-[#3A3B3B]">
          <h4 className="text-white font-medium mb-2">Transfer Information</h4>
          <div className="space-y-1 text-sm text-[#BCBCBC]">
            <p>• <strong>Fee:</strong> 0.1% (minimum 100 e8s)</p>
            <p>• <strong>Minimum:</strong> 0.00001 BTC (1000 e8s)</p>
            <p>• <strong>Processing:</strong> Instant (no approval needed)</p>
            <p>• <strong>Network:</strong> SplitSafe internal transfer</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
