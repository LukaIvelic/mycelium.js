import diagnosticsChannel from 'node:diagnostics_channel';
import { HttpLogger } from '@/lib/logging/network/http-logger';
import { flattenHeaders } from '@/lib/utils/flatten-headers';
import { childContext, traceStore } from '@/lib/utils/context';
import { newSpanUUID, newTraceUUID } from '@/lib/utils/generate-uuid';
import { DiagnosticsChannel, HeaderFilterLevel, TraceContext } from '@/lib/types';
import { Service } from '@/setup/client.types';

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
