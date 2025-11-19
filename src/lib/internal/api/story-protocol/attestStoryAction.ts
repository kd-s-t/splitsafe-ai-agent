import { apiCall } from '../../auth/api-client';
import { StoryAttestRequest, StoryAttestResponse } from './types';

export async function attestStoryAction(data: StoryAttestRequest): Promise<StoryAttestResponse> {
  const res = await apiCall('/api/story/attest', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.json().catch(() => ({}));
}


