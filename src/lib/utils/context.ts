import { AsyncLocalStorage } from 'node:async_hooks';
import { TraceContext } from '@/lib/types';
import { newSpanUUID, newTraceUUID } from '@/lib/utils/generate-uuid';

export const traceStore = new AsyncLocalStorage<TraceContext>();

export const childContext = (): TraceContext => {
  const parent = traceStore.getStore();
  return {
    traceId: parent?.traceId ?? newTraceUUID(),
    spanId: newSpanUUID(),
    parentSpanId: parent?.spanId,
  };
};
