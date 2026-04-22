import { HeaderFilterLevel } from '@/lib/types';

const HIGH_RISK_BLOATERS = new Set([
  'cookie',
  'authorization',
  'set-cookie',
  'content-security-policy',
]);

const MEDIUM_RISK_BLOATERS = new Set([
  'referer',
  'user-agent',
  'link',
  'x-forwarded-for',
  'server-timing',
  'sec-ch-ua-full-version-list',
]);

const HIDDEN_METADATA_RISKS = new Set([
  'query_parameters',
  'x-cloud-trace-context',
  'x-amz-signature',
  'via',
  'warning',
]);

const BLOATER_SETS: Record<HeaderFilterLevel, Set<string>[]> = {
  '0': [HIGH_RISK_BLOATERS],
  '1': [HIGH_RISK_BLOATERS, MEDIUM_RISK_BLOATERS],
  '2': [HIGH_RISK_BLOATERS, MEDIUM_RISK_BLOATERS, HIDDEN_METADATA_RISKS],
  '3': [HIGH_RISK_BLOATERS, MEDIUM_RISK_BLOATERS, HIDDEN_METADATA_RISKS],
};

export function filterHeaders(
  headers: Record<string, string>,
  level: HeaderFilterLevel = HeaderFilterLevel.HIGH,
): Record<string, string> {
  const blocklists = BLOATER_SETS[level];
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    if (!blocklists.some((set) => set.has(lower))) {
      result[key] = value;
    }
  }
  return result;
}
