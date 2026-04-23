import { Service } from '@/setup/client.types';
import { HeaderFilterLevel, MarkedUndiciRequest, TraceContext } from '@/lib/types';
import { safeHeaders } from '@/lib/utils/safe-headers';
import { serializeAndTruncate } from '@/lib/utils/serialize-and-truncate';

const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS', 'TRACE']);

export async function buildMarkedHttpRequest(
  request: any,
  preparedBody: unknown,
  bodyMaxBytes: number,
  captureStreamBodies: boolean,
  headerFilterLevel: HeaderFilterLevel,
  service: Service,
  ctx: TraceContext,
): Promise<MarkedUndiciRequest> {
  const headers = safeHeaders(request.rawHeaders ?? [], headerFilterLevel);
  const { body, bodySize } = await serializeAndTruncate(
    preparedBody,
    bodyMaxBytes,
    captureStreamBodies,
  );
  const bodySizeKb = bodySize / 1024;
  const timestamp = new Date().toISOString();
  const method: string = request.method ?? '';
  const protocol = request.protocol ?? (request._encrypted ? 'https' : 'http');
  const host: string = request.host ?? request.hostname ?? '';
  const origin = `${protocol}://${host}`;

  return {
    method,
    statusCode: request.statusCode ?? 0,
    body,
    bodySizeKB: bodySizeKb,
    completed: !request.destroyed,
    aborted: request.destroyed ?? false,
    path: request.path ?? '/',
    origin,
    protocol,
    idempotent: IDEMPOTENT_METHODS.has(method.toUpperCase()),
    contentLength: Number(headers['content-length']) || null,
    contentType: headers['content-type'] ?? null,
    headers,
    traceId: ctx.traceId,
    spanId: ctx.spanId,
    parentSpanId: ctx.parentSpanId,
    timestamp,
    durationMs: Math.round(request.durationMs ?? 0),
    serviceName: service.name,
    serviceKey: service.key,
    serviceOrigin: service.origin,
    serviceVersion: service.version,
    serviceDescription: service.description,
  };
}
