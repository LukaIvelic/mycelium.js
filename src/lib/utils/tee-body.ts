import { PassThrough, Readable } from 'node:stream';

export function teeBody(body: unknown): [unknown, unknown] | null {
  if (body instanceof ReadableStream) {
    return body.tee() as unknown as [unknown, unknown];
  }
  if (body instanceof Readable) {
    const a = new PassThrough();
    const b = new PassThrough();
    body.pipe(a);
    body.pipe(b);
    return [a, b];
  }
  if (body != null && typeof (body as any)[Symbol.asyncIterator] === 'function') {
    const source = body as AsyncIterable<Buffer | Uint8Array | string>;
    const materialized: Promise<Buffer> = (async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of source) {
        chunks.push(
          typeof chunk === 'string'
            ? Buffer.from(chunk)
            : Buffer.isBuffer(chunk)
              ? chunk
              : Buffer.from(chunk),
        );
      }
      return Buffer.concat(chunks);
    })();
    const bodyForRequest = (async function* () {
      yield await materialized;
    })();
    return [bodyForRequest, materialized];
  }
  return null;
}