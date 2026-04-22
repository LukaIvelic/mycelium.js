import { TraceContext } from '@/lib/types';

export function injectTraceHeaders(request: any, ctx: TraceContext): void {
  const setHeader = (key: string, value: string) => {
    if (typeof request?.addHeader === 'function') {
      request.addHeader(key, value);
      return;
    }

    if (request?.headers && typeof request.headers === 'object') {
      request.headers[key] = value;
    }
  };

  setHeader('x-trace-id', ctx.traceId);
  setHeader('x-span-id', ctx.spanId);
  if (ctx.parentSpanId) setHeader('x-parent-span-id', ctx.parentSpanId);
}
