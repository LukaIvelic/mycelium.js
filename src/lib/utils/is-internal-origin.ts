import { LOG_ENDPOINT, SERVICE_REGISTER_ENDPOINT } from '../constants';

export function isLogEndpoint(origin: string, path: string): boolean {
  const value = `${origin}${path}`;
  const candidates = [value];

  if (!value.startsWith('http://') && !value.startsWith('https://')) {
    candidates.push(`http://${value}`);
    candidates.push(`https://${value}`);
  }

  return candidates.some(
    (candidate) =>
      candidate.startsWith(LOG_ENDPOINT) ||
      candidate.startsWith(SERVICE_REGISTER_ENDPOINT),
  );
}
