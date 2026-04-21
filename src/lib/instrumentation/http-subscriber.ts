import diagnosticsChannel from 'node:diagnostics_channel';
import { DiagnosticsChannel, HeaderFilterLevel, TraceContext } from '../types';
import { HttpLogger } from '../logging/network/http-logger';
import { Service } from '../../setup/client.types';
import { flattenHeaders } from '../utils/flatten-headers';
import { childContext, traceStore } from '../utils/context';
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

  diagnosticsChannel.subscribe(DiagnosticsChannel.HttpClientRequestStart, (message: any) => {
    const request = message.request;
    httpLogger.log({ ...request, headers: flattenHeaders(request.getHeaders()) }, childContext());
  });

  diagnosticsChannel.subscribe(DiagnosticsChannel.HttpServerRequestStart, (message: any) => {
    const request = message.request;
    const headers = request.headers;
    const ctx: TraceContext = {
      traceId: (headers['x-trace-id'] as string) ?? newTraceUUID(),
      spanId: newSpanUUID(),
      parentSpanId: headers['x-span-id'] as string | undefined,
    };
    traceStore.enterWith(ctx);
    httpLogger.log({ ...request, headers: request.rawHeaders }, ctx);
  });
}
