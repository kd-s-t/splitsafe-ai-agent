import { canonicalize } from 'json-canonicalize';

export function canonicalizeJson(data: unknown): string {
  return canonicalize(data);
}


