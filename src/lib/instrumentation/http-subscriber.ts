import diagnosticsChannel from 'node:diagnostics_channel';
import { performance } from 'node:perf_hooks';
import { InflightRequest, DiagnosticsChannel, HeaderFilterLevel, TraceContext } from '@/lib/types';
import { HttpLogger } from '@/lib/logging/network/http-logger';
import { Service } from '@/setup/client.types';
import { childContext, traceStore } from '@/lib/utils/context';
import { injectTraceHeaders } from '@/lib/utils/inject-trace';
import { prepareBody } from '@/lib/utils/prepare-body';
import { newSpanUUID, newTraceUUID } from '../utils/generate-uuid';

interface HttpSubscriberConfig {
  service: Service;
  bodyMaxBytes?: number;
  captureStreamBodies: boolean;
  headerFilterLevel?: HeaderFilterLevel;
}

export function subscribeToHttp(config: HttpSubscriberConfig) {
  const httpLogger: HttpLogger = new HttpLogger(
    config.bodyMaxBytes,
    config.captureStreamBodies,
    config.headerFilterLevel,
    config.service,
  );

  const inflightRequests = new WeakMap<object, InflightRequest>();
  const inflightServerRequests = new WeakMap<object, InflightRequest>();

  const finalize = (message: any) => {
    const existingInflightRequest = inflightRequests.get(message.request);
    if (!existingInflightRequest) return;

    const modifiedRequest = {
      ...message.request,
      statusCode: existingInflightRequest.statusCode,
      durationMs: performance.now() - existingInflightRequest.startedAt,
      body: existingInflightRequest.body,
    };

    httpLogger.log(modifiedRequest, existingInflightRequest.ctx);

    inflightRequests.delete(message.request);
  };

  const finalizeServer = (message: any) => {
    const existingInflightRequest = inflightServerRequests.get(message.request);
    if (!existingInflightRequest) return;

    const modifiedRequest = {
      ...message.request,
      statusCode: existingInflightRequest.statusCode,
      durationMs: performance.now() - existingInflightRequest.startedAt,
      body: existingInflightRequest.body,
      headers: message.request.rawHeaders,
    };

    httpLogger.log(modifiedRequest, existingInflightRequest.ctx);

    inflightServerRequests.delete(message.request);
  };

  diagnosticsChannel.subscribe(DiagnosticsChannel.HttpClientRequestStart, (message: any) => {
    const ctx = childContext();
    const preparedBody = prepareBody(message.request, config.captureStreamBodies);

    injectTraceHeaders(message.request, ctx);

    inflightRequests.set(message.request, {
      startedAt: performance.now(),
      body: preparedBody,
      ctx,
    });
  });

  diagnosticsChannel.subscribe(DiagnosticsChannel.HttpClientResponseFinish, (message: any) => {
    inflightRequests.set(message.request, {
      ...(inflightRequests.get(message.request) as InflightRequest),
      statusCode: Number(message.response.statusCode) || 0,
    });
  });

  diagnosticsChannel.subscribe(DiagnosticsChannel.HttpClientResponseFinish, finalize);

  diagnosticsChannel.subscribe(DiagnosticsChannel.HttpClientRequestError, finalize);

  diagnosticsChannel.subscribe(DiagnosticsChannel.HttpServerRequestStart, (message: any) => {
    const request = message.request;
    const headers = request.headers;

    const ctx: TraceContext = {
      traceId: (headers['x-trace-id'] as string) ?? newTraceUUID(),
      spanId: newSpanUUID(),
      parentSpanId: headers['x-span-id'] as string | undefined,
    };

    traceStore.enterWith(ctx);

    const preparedBody = prepareBody(request, config.captureStreamBodies);

    inflightServerRequests.set(request, {
      startedAt: performance.now(),
      body: preparedBody,
      ctx,
    });
  });

  diagnosticsChannel.subscribe(DiagnosticsChannel.HttpServerResponseFinish, (message: any) => {
    inflightServerRequests.set(message.request, {
      ...(inflightServerRequests.get(message.request) as InflightRequest),
      statusCode: Number(message.response.statusCode) || 0,
    });
  });

  diagnosticsChannel.subscribe(DiagnosticsChannel.HttpServerResponseFinish, finalizeServer);
}
