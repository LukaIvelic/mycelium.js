import { Service } from '@/setup/client.types';
import { BODY_MAX_BYTES, LOG_ENDPOINT } from '@/lib/constants';
import { HeaderFilterLevel, TraceContext } from '@/lib/types';
import { buildMarkedUndiciRequest } from '@/lib/utils/build-marked-undici-request';
import { prepareBody } from '@/lib/utils/prepare-body';

export class FetchLogger {
  private readonly logEndpoint: string = LOG_ENDPOINT;
  private bodyMaxBytes: number = BODY_MAX_BYTES;
  private captureStreamBodies: boolean = false;
  private headerFilterLevel: HeaderFilterLevel = HeaderFilterLevel.HIGH;
  private service: Service = { key: '', name: '', origin: '' };
  private apiKey: string = '';

  constructor(
    bodyMaxBytes: number = 0,
    captureStreamBodies: boolean,
    headerFilterLevel: HeaderFilterLevel = HeaderFilterLevel.HIGH,
    service: Service,
    apiKey: string,
  ) {
    this.bodyMaxBytes = Math.min(bodyMaxBytes, BODY_MAX_BYTES);
    this.captureStreamBodies = captureStreamBodies;
    this.headerFilterLevel = headerFilterLevel;
    this.service = service;
    this.apiKey = apiKey;
  }

  async log(request: any, ctx: TraceContext): Promise<void> {
    const preparedBody = prepareBody(request, this.captureStreamBodies);
    const markedRequest = await buildMarkedUndiciRequest(
      request,
      preparedBody,
      this.bodyMaxBytes,
      this.captureStreamBodies,
      this.headerFilterLevel,
      this.service,
      ctx,
    );

    try {
      await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(markedRequest),
      });
    } catch (err) {
      // swallow errors to avoid disrupting the main application flow
    }
  }
}
