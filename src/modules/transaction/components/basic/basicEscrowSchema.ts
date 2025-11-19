import { basicEscrowFormSchema as importedSchema } from "@/validation/escrow";
import { z } from "zod";

// Re-export the simplified basic escrow schema
export const basicEscrowFormSchema = importedSchema;

export type BasicEscrowFormData = z.infer<typeof basicEscrowFormSchema>;
