export function computeBodySize(body: string | null): number {
  return body ? Buffer.byteLength(body, 'utf8') : 0;
}
