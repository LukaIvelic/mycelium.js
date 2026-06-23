import { randomUUID } from 'node:crypto';

export const newSpanUUID = () => randomUUID().replace(/-/g, '').slice(0, 16);
export const newTraceUUID = () => randomUUID().replace(/-/g, '');
