import { TraceContext } from '../types';

export function injectTraceHeaders(request: any, ctx: TraceContext): void {
  request.addHeader('x-trace-id', ctx.traceId);
  request.addHeader('x-span-id', ctx.spanId);
  if (ctx.parentSpanId) request.addHeader('x-parent-span-id', ctx.parentSpanId);
}
