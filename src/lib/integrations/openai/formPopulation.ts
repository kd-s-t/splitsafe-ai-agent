export function populateEscrowForm(): { amount: string; recipients: string[] } | null {
  try {
    const storedData = sessionStorage.getItem('splitsafe_chat_data');
    if (storedData) {
      const data = JSON.parse(storedData);
      sessionStorage.removeItem('splitsafe_chat_data'); // Clear after use
      return {
        amount: data.amount || '',
        recipients: data.recipients || []
      };
    }
  } catch (error) {
    console.error('Error populating escrow form:', error);
  }
  return null;
}

export function populateTransactionSuggestions(): void {
  try {
    const storedData = sessionStorage.getItem('splitsafe_chat_data');
    if (storedData) {
      sessionStorage.removeItem('splitsafe_chat_data'); // Clear after use
      // This will trigger the approval suggestion logic
      sessionStorage.setItem('splitsafe_show_approval_suggestions', 'true');
    }
  } catch (error) {
    console.error('Error setting up transaction suggestions:', error);
  }
} 