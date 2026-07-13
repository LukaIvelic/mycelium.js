import diagnosticsChannel from 'node:diagnostics_channel';
import { performance } from 'node:perf_hooks';
import { HttpLogger } from '@/lib/logging/network/http-logger';
import {
  DiagnosticsChannel,
  HeaderFilterLevel,
  InflightRequest,
  TraceContext,
} from '@/lib/types';
import { childContext, traceStore } from '@/lib/utils/context';
import { injectTraceHeaders } from '@/lib/utils/inject';
import { isLogEndpoint } from '@/lib/utils/is-internal-origin';
import { prepareBody } from '@/lib/utils/prepare-body';
import { Service } from '@/setup/client.types';
import { newSpanUUID, newTraceUUID } from '../utils/generate-uuid';

interface HttpSubscriberConfig {
  service: Service;
  bodyMaxBytes?: number;
  captureStreamBodies: boolean;
  headerFilterLevel?: HeaderFilterLevel;
  apiKey: string;
}

export function subscribeToHttp(config: HttpSubscriberConfig) {
  const httpLogger: HttpLogger = new HttpLogger(
    config.bodyMaxBytes,
    config.captureStreamBodies,
    config.headerFilterLevel,
    config.service,
    config.apiKey,
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
      headers: message.request.headers,
      host: message.request.headers?.host,
      method: message.request.method,
      path: message.request.url ?? message.request.path,
      protocol: message.request.socket?.encrypted ? 'https' : 'http',
      rawHeaders: message.request.rawHeaders,
      statusCode: existingInflightRequest.statusCode,
      durationMs: performance.now() - existingInflightRequest.startedAt,
      body: existingInflightRequest.body,
    };

    httpLogger.log(modifiedRequest, existingInflightRequest.ctx);

    inflightServerRequests.delete(message.request);
  };

  diagnosticsChannel.subscribe(
    DiagnosticsChannel.HttpClientRequestStart,
    (message: any) => {
      if (
        isLogEndpoint(message.request?.host ?? '', message.request?.path ?? '')
      )
        return;
      if (String(message.request?.method ?? '').toUpperCase() === 'OPTIONS')
        return;

      const ctx = childContext();
      const preparedBody = prepareBody(
        message.request,
        config.captureStreamBodies,
      );

      injectTraceHeaders(message.request, ctx);

      inflightRequests.set(message.request, {
        startedAt: performance.now(),
        body: preparedBody,
        ctx,
      });
    },
  );

  diagnosticsChannel.subscribe(
    DiagnosticsChannel.HttpClientResponseFinish,
    (message: any) => {
      const existing = inflightRequests.get(message.request);
      if (!existing) return;
      inflightRequests.set(message.request, {
        ...existing,
        statusCode: Number(message.response.statusCode) || 0,
      });
    },
  );

  diagnosticsChannel.subscribe(
    DiagnosticsChannel.HttpClientResponseFinish,
    finalize,
  );

  diagnosticsChannel.subscribe(
    DiagnosticsChannel.HttpClientRequestError,
    finalize,
  );

  diagnosticsChannel.subscribe(
    DiagnosticsChannel.HttpServerRequestStart,
    (message: any) => {
      const request = message.request;
      const headers = request.headers;
      const host = request.host ?? request.headers?.host ?? '';
      const path = request.path ?? request.url ?? '';

      if (isLogEndpoint(host, path)) return;
      if (String(request.method ?? '').toUpperCase() === 'OPTIONS') return;

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
    },
  );

  diagnosticsChannel.subscribe(
    DiagnosticsChannel.HttpServerResponseFinish,
    (message: any) => {
      const existing = inflightServerRequests.get(message.request);
      if (!existing) return;

      inflightServerRequests.set(message.request, {
        ...existing,
        statusCode: Number(message.response.statusCode) || 0,
      });
    },
  );

  diagnosticsChannel.subscribe(
    DiagnosticsChannel.HttpServerResponseFinish,
    finalizeServer,
  );
}
