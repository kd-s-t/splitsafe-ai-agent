import { z } from "zod";

export const directTransferFormSchema = z.object({
  to: z.string().min(1, "Recipient principal ID is required"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    "Amount must be a positive number"
  ),
  memo: z.string().optional(),
  merchantId: z.string().optional(),
});

export type DirectTransferFormData = z.infer<typeof directTransferFormSchema>;
