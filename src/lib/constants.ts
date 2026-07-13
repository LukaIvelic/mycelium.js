import { BodyBytes } from '@/lib/types';

export const API_ENDPOINT = 'http://localhost:8000/api';
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
