// ICP Principal validation function
export const isValidICPPrincipal = (principal: string): boolean => {
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