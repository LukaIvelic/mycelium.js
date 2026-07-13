import { BodyBytes } from '@/lib/types';

export const DEFAULT_API_ENDPOINT = 'https://www.myceliums.dev/api';
export const API_ENDPOINT = (
  process.env.MYCELIUM_API_ENDPOINT ?? DEFAULT_API_ENDPOINT
).replace(/\/$/, '');
export const LOG_ENDPOINT = `${API_ENDPOINT}/logs`;
export const RUNTIME_SETTINGS_ENDPOINT = `${API_ENDPOINT}/integrations/runtime-settings`;
export const BODY_MAX_BYTES = BodyBytes.FIVE_KB;

export const AssertReadyMessages = {
  API_KEY: 'Mycelium client requires an api key before initialize().',
  SERVICE_KEY: 'Mycelium client requires service.key before initialize().',
  SERVICE_ORIGIN:
    'Mycelium client requires service.origin before initialize().',
  REMOTE_SETTINGS_INITIALIZE:
    'Remote settings require initializeAsync() instead of initialize().',
};
