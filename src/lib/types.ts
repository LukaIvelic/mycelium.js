export enum DiagnosticsChannel {
  UndiciRequestCreate = 'undici:request:create',
  HttpClientRequestStart = 'http.client.request.start',
  HttpServerRequestStart = 'http.server.request.start',
}

export type UndiciRequest = {
  method: string;
  statusCode: number;
  body: unknown;
  complete: boolean;
  aborted: boolean;
  path: string;
  origin: string;
  protocol: string;
  idempotent: boolean;
  contentLength: number;
  contentType: string;
  headers: Record<string, string>;
};

export type MarkedUndiciRequest = UndiciRequest & {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  bodySizeKb: number;
  timestamp: string;
  durationMs: number;
  serviceKey: string;
  serviceName: string;
  serviceOrigin: string;
  serviceVersion?: string;
  serviceDescription?: string;
};

export type TraceContext = {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
};

export enum HeaderFilterLevel {
  HIGH = 0,
  MEDIUM = 1,
  METADATA = 2,
  ALL = 3,
}
