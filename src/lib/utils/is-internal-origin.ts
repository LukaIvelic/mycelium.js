import { LOG_ENDPOINT } from '../constants';

export function isLogEndpoint(origin: string, path: string): boolean {
  return (origin + path).startsWith(LOG_ENDPOINT);
}
