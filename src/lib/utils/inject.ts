import { TraceContext } from '@/lib/types';

const setHeader = (request: any, key: string, value: string) => {
  if (typeof request?.addHeader === 'function') {
    request.addHeader(key, value);
    return;
  }

  if (request?.headers && typeof request.headers === 'object') {
    request.headers[key] = value;
  }
};

export function injectTraceHeaders(request: any, ctx: TraceContext): void {
  setHeader(request, 'x-trace-id', ctx.traceId);
  setHeader(request, 'x-span-id', ctx.spanId);
  if (ctx.parentSpanId) setHeader(request, 'x-parent-span-id', ctx.parentSpanId);
}
