import { HeaderFilterLevel } from '@/lib/types';
import { filterHeaders } from '@/lib/utils/filter-header';
import { parseRawHeaders } from '@/lib/utils/parse-raw-headers';

type HeaderValue = number | string | string[] | null | undefined;

export function safeHeaders(
  raw: Record<string, HeaderValue> | string[] = [],
  headerFilterLevel: HeaderFilterLevel,
): Record<string, string> {
  const headers = Array.isArray(raw)
    ? parseRawHeaders(raw)
    : normalizeHeaders(raw);
  return filterHeaders(headers, headerFilterLevel);
}

function normalizeHeaders(
  raw: Record<string, HeaderValue>,
): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined || value === null) continue;
    headers[key.toLowerCase()] = Array.isArray(value)
      ? value.join(', ')
      : String(value);
  }

  return headers;
}
