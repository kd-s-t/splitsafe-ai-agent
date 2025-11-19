import { Principal } from '@dfinity/principal';
import type { ICPResultType } from './types';

/**
 * Type guard for ICP result
 */
export function isICPSuccess<T>(result: ICPResultType<T>): result is { ok: T } {
  return 'ok' in result;
}

/**
 * Type guard for ICP error
 */
export function isICPError<T>(result: ICPResultType<T>): result is { err: string } {
  return 'err' in result;
}

/**
 * Type guard for Principal
 */
export function isPrincipal(value: unknown): value is Principal {
  return value != null && typeof value === 'object' && 'toText' in value && typeof (value as { toText: unknown }).toText === 'function';
}

/**
 * Convert various principal formats to string
 */
export function principalToString(principal: Principal | string | { toText?: () => string }): string {
  if (typeof principal === 'string') {
    return principal;
  }
  if (isPrincipal(principal)) {
    return principal.toText();
  }
  if (principal && typeof principal.toText === 'function') {
    return principal.toText();
  }
  return String(principal);
}
