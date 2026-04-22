import { HeaderFilterLevel } from '@/lib/types';
import { filterHeaders } from '@/lib/utils/filter-header';
import { parseRawHeaders } from '@/lib/utils/parse-raw-headers';

export function safeHeaders(
  raw: string[],
  headerFilterLevel: HeaderFilterLevel,
): Record<string, string> {
  return filterHeaders(parseRawHeaders(raw), headerFilterLevel);
}
