import { BodyBytes } from '@/lib/types';

//export const LOG_ENDPOINT = 'https://www.myceliums.dev/api/logs';
export const LOG_ENDPOINT = 'http://localhost:8000/api/logs';
export const BODY_MAX_BYTES = BodyBytes.FIVE_KB;

export const AssertReadyMessages = {
  API_KEY: 'Mycelium client requires an api key before initialize().',
  SERVICE_KEY: 'Mycelium client requires service.key before initialize().',
  SERVICE_ORIGIN: 'Mycelium client requires service.origin before initialize().',
};
