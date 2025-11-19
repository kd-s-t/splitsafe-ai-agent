import { createHash } from 'crypto';
import { canonicalizeJson } from './canon';

export function hashDocument(documentContent: Buffer): string {
  return createHash('sha256').update(documentContent).digest('hex');
}

export function hashEscrowEvent(eventObject: unknown): string {
  const canonical = canonicalizeJson(eventObject);
  const bytes = Buffer.from(canonical, 'utf-8');
  return createHash('sha256').update(bytes).digest('hex');
}


