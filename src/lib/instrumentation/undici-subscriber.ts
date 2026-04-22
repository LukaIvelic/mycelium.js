import diagnosticsChannel from 'node:diagnostics_channel';
import { performance } from 'node:perf_hooks';
import { InflightRequest, DiagnosticsChannel, HeaderFilterLevel } from '@/lib/types';
import { FetchLogger } from '@/lib/logging/network/fetch-logger';
import { Service } from '@/setup/client.types';
import { childContext } from '@/lib/utils/context';
import { injectTraceHeaders } from '@/lib/utils/inject-trace';
import { prepareBody } from '@/lib/utils/prepare-body';

interface UndiciSubscriberConfig {
  service: Service;
  bodyMaxBytes?: number;
  captureStreamBodies: boolean;
  headerFilterLevel?: HeaderFilterLevel;
}

export function subscribeToUndici(config: UndiciSubscriberConfig) {
  const fetchLogger: FetchLogger = new FetchLogger(
    config.bodyMaxBytes,
    config.captureStreamBodies,
    config.headerFilterLevel,
    config.service,
  );

  const inflightRequests = new WeakMap<object, InflightRequest>();

  const finalize = (message: any) => {
    const existingInflightRequest = inflightRequests.get(message.request);
    if (!existingInflightRequest) return;

    const modifiedRequest = {
      ...message.request,
      statusCode: existingInflightRequest.statusCode,
      durationMs: performance.now() - existingInflightRequest.startedAt,
      body: existingInflightRequest.body,
    };

    fetchLogger.log(modifiedRequest, existingInflightRequest.ctx);

    inflightRequests.delete(message.request);
  };

  diagnosticsChannel.subscribe(DiagnosticsChannel.UndiciRequestCreate, (message: any) => {
    const ctx = childContext();
    const preparedBody = prepareBody(message.request, config.captureStreamBodies);

    injectTraceHeaders(message.request, ctx);

    inflightRequests.set(message.request, {
      startedAt: performance.now(),
      body: preparedBody,
      ctx,
    });
  });

  diagnosticsChannel.subscribe(DiagnosticsChannel.UndiciRequestHeaders, (message: any) => {
    inflightRequests.set(message.request, {
      ...(inflightRequests.get(message.request) as InflightRequest),
      statusCode: Number(message.response.statusCode) || 0,
    });
  });

  diagnosticsChannel.subscribe(DiagnosticsChannel.UndiciRequestTrailers, finalize);

  diagnosticsChannel.subscribe(DiagnosticsChannel.UndiciRequestError, finalize);
}