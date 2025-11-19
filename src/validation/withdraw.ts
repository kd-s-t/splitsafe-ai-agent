import z from "zod";

// ICP Principal validation function
const isValidICPPrincipal = (principal: string): boolean => {
  const trimmed = principal.trim();
  
  // Check if empty
  if (trimmed.length === 0) {
    return false;
  }
  
  // ICP Principal format: alphanumeric characters with hyphens, typically 27-63 characters
  // Format: xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxxxx-xxx
  const icpPrincipalRegex = /^[a-zA-Z0-9\-]{27,63}$/;
  
  // Check if it matches the ICP principal format
  if (!icpPrincipalRegex.test(trimmed)) {
    return false;
  }
  
  // Check if it's not the anonymous principal
  if (trimmed === "2vxsx-fae") {
    return false;
  }
  
  // Check if it has the correct number of segments (should be 11 segments separated by hyphens)
  const segments = trimmed.split('-');
  if (segments.length !== 11) {
    return false;
  }
  
  // Each segment should be 5 characters (except possibly the last one)
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i].length !== 5) {
      return false;
    }
  }
  
  // Last segment should be 3 characters
  if (segments[segments.length - 1].length !== 3) {
    return false;
  }
  
  return true;
};


// Enhanced validation to detect wrong address types
const validateAddressType = (address: string, expectedType: 'ICP' | 'BTC'): boolean => {
  const trimmed = address.trim();
  
  if (expectedType === 'ICP') {
    // If someone enters a BTC address in ICP field, it should be invalid
    if (trimmed.startsWith('1') || trimmed.startsWith('3') || trimmed.startsWith('bc1')) {
      return false;
    }
    return isValidICPPrincipal(trimmed);
  } else if (expectedType === 'BTC') {
    // If someone enters an ICP principal in BTC field, it should be invalid
    if (trimmed.includes('-') && trimmed.length > 20) {
      return false;
    }
    // Basic Bitcoin address format validation (starts with 1, 3, or bc1)
    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return bitcoinRegex.test(trimmed);
  }
  
  return false;
};

export const withdrawFormSchema = z.object({
  amount: z.string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number"
    }),
  address: z.string()
    .min(1, "Address is required")
    .min(26, "Address is too short")
    .max(100, "Address is too long")
    .refine(() => {
      // This will be refined further based on the selected currency
      return true;
    }, "Please enter a valid address"),
  isAcceptedTerms: z.boolean()
    .refine((val) => val === true, {
      message: "You must accept the terms and conditions"
    })
});

// Dynamic validation based on selected currency
export const createWithdrawSchema = (selectedCurrency: 'ICP' | 'BTC') => {
  return z.object({
    amount: z.string()
      .min(1, "Amount is required")
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Amount must be a positive number"
      }),
      address: z.string()
    .min(1, "Address is required")
    .refine((address) => validateAddressType(address, selectedCurrency), {
      message: selectedCurrency === 'ICP'
        ? "Please enter a valid ICP Principal ID"
        : "Please enter a valid Bitcoin address"
    }),
    isAcceptedTerms: z.boolean()
      .refine((val) => val === true, {
        message: "You must accept the terms and conditions"
      })
  });
};