import { BodyBytes } from '@/lib/types';

//export const API_ENDPOINT = 'https://www.myceliums.dev/api';
export const API_ENDPOINT = 'http://localhost:8000/api';
export const LOG_ENDPOINT = `${API_ENDPOINT}/logs`;
export const SERVICE_REGISTER_ENDPOINT = `${API_ENDPOINT}/services/register`;
export const BODY_MAX_BYTES = BodyBytes.FIVE_KB;

export const AssertReadyMessages = {
  API_KEY: 'Mycelium client requires an api key before initialize().',
  SERVICE_KEY: 'Mycelium client requires service.key before initialize().',
  SERVICE_ORIGIN: 'Mycelium client requires service.origin before initialize().',
};
