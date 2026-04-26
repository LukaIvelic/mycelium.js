import { SERVICE_REGISTER_ENDPOINT } from '@/lib/constants';
import { Service } from '@/setup/client.types';

const registrationRequests = new Map<string, Promise<void>>();

export function ensureServiceRegistered(service: Service, apiKey: string): Promise<void> {
  const cacheKey = `${apiKey}:${service.origin}`;
  const existingRequest = registrationRequests.get(cacheKey);
  if (existingRequest) return existingRequest;

  const request = fetch(SERVICE_REGISTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      serviceOrigin: service.origin,
      serviceKey: service.key,
      serviceName: service.name,
      serviceVersion: service.version,
      serviceDescription: service.description,
      serviceRepository: service.repository,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Service registration failed with ${response.status}`);
      }
    })
    .catch((error) => {
      registrationRequests.delete(cacheKey);
      throw error;
    });

  registrationRequests.set(cacheKey, request);
  return request;
}
