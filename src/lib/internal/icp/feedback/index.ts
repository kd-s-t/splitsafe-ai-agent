import { Principal } from '@dfinity/principal';
import { createAnonymousActor, createSplitDappActor } from '../splitDapp';
import {
  AnonymousFeedback,
  Feedback,
  FeedbackStats,
  SubmitFeedbackRequest
} from '../types';

// Re-export types for convenience
export type { AnonymousFeedback, Feedback, FeedbackStats, SubmitFeedbackRequest } from '../types';

/**
 * Submit feedback to the ICP canister
 */
export async function submitFeedback(
  request: SubmitFeedbackRequest
): Promise<{ ok: string } | { err: string }> {
  try {

    const actor = await createSplitDappActor();
    
    const motokoRequest = {
      name: request.name,
      email: request.email,
      rating: BigInt(request.rating),
      message: request.message,
      userAgent: request.userAgent ? [request.userAgent] : [],
      ipAddress: request.ipAddress ? [request.ipAddress] : [],
      principal: request.principal ? [request.principal] : []
    };
    
    const result = await actor.submitFeedback(motokoRequest) as { ok: string } | { err: string };
    
    return result;
  } catch (error) {
    return { err: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Get feedback by ID
 */
export async function getFeedback(feedbackId: string): Promise<Feedback | null> {
  try {
    const actor = await createSplitDappActor();
    const result = await actor.getFeedback(feedbackId) as [] | [Feedback];
    
    if (Array.isArray(result) && result.length > 0) {
      return result[0] || null;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Get all feedbacks
 */
export async function getAllFeedbacks(): Promise<Feedback[]> {
  try {
    const actor = await createSplitDappActor();
    const result = await actor.getAllFeedbacks() as Feedback[];
    return result;
  } catch {
    return [];
  }
}

/**
 * Get all feedbacks (anonymous) - public function that doesn't require authentication
 */
export async function getAllFeedbacksAnonymous(): Promise<AnonymousFeedback[]> {
  try {
    const actor = await createAnonymousActor();
    const result = await actor.getAllFeedbacksAnonymous() as AnonymousFeedback[];
    return result;
  } catch {
    return [];
  }
}


/**
 * Get feedbacks by minimum rating
 */
export async function getFeedbacksByRating(minRating: number): Promise<Feedback[]> {
  try {
    const actor = await createSplitDappActor();
    const result = await actor.getFeedbacksByRating(BigInt(minRating)) as Feedback[];
    return result;
  } catch {
    return [];
  }
}

/**
 * Get feedback count
 */
export async function getFeedbackCount(): Promise<number> {
  try {
    const actor = await createSplitDappActor();
    const result = await actor.getFeedbackCount() as bigint;
    return Number(result);
  } catch {
    return 0;
  }
}

/**
 * Get average rating
 */
export async function getAverageRating(): Promise<number> {
  try {
    const actor = await createSplitDappActor();
    const result = await actor.getAverageRating() as number;
    return result;
  } catch {
    return 0;
  }
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats(): Promise<FeedbackStats> {
  try {
    const actor = await createSplitDappActor();
    const result = await actor.getFeedbackStats() as {
      totalCount: bigint;
      averageRating: number;
    };
    
    return {
      totalCount: Number(result.totalCount),
      averageRating: result.averageRating
    };
  } catch {
    return {
      totalCount: 0,
      averageRating: 0
    };
  }
}

/**
 * Check if user should see feedback modal using direct ICP call
 */
export async function shouldShowFeedbackModal(
  principal: Principal,
  transactionCount?: number
): Promise<boolean> {
  try {
    console.log({
      principal: principal.toString(),
      transactionCount
    });

    return true;

    /*
    const actor = await createSplitDappActor();
    
    const result = await actor.shouldShowFeedback(
      transactionCount ? [BigInt(transactionCount)] : []
    ) as { ok: boolean } | { err: string };
    
    
    if ('ok' in result) {
      return result.ok;
    } else {
      return true;
    }
    */
  } catch {
    return true;
  }
}