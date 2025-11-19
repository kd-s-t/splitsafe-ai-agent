import { apiCall } from '../../auth/api-client';
import { StorySetupRequest, StorySetupResponse } from './types';

export async function setupStoryEscrow(data: StorySetupRequest): Promise<StorySetupResponse> {
  try {
    const res = await apiCall('/api/story/setup-escrow', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      console.error('❌ Story setup API error:', res.status, errorText);
      return { success: false, error: `HTTP ${res.status}: ${errorText}` };
    }
    const json = await res.json();
    return json;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Provide more helpful error messages for connection issues
    if (errorMessage.includes('Backend server not available') || 
        errorMessage.includes('ConnectionRefusedError')) {
      console.warn('⚠️ Story setup API unavailable (non-blocking):', errorMessage);
    } else {
      console.error('❌ Story setup API call failed:', error);
    }
    
    return { success: false, error: errorMessage };
  }
}
