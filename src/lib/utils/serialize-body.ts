import { Readable } from 'node:stream';

export async function serializeBody(
  body: unknown,
  captureStreamBodies = false,
): Promise<string | null> {
  if (body == null) return null;
  if (typeof (body as any)?.then === 'function') {
    body = await (body as Promise<unknown>);
  }
  if (body == null) return null;
  if (typeof body === 'string') return body;
  if (Buffer.isBuffer(body)) return body.toString('utf8');
  if (body instanceof Uint8Array) return Buffer.from(body).toString('utf8');
  if (Array.isArray(body)) {
    try {
      return Buffer.concat(
        body.map((chunk) => (Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))),
      ).toString('utf8');
    } catch {
      return '[unserializable array body]';
    }
  }

  const label = `[${(body as object).constructor?.name ?? 'unknown'} body]`;
  if (!captureStreamBodies) return label;

  if (body instanceof Blob) return await body.text();

  if (body instanceof FormData) {
    const entries = Array.from(body.entries()).map(([k, v]) => [
      k,
      v instanceof Blob ? `[Blob ${v.size}b]` : v,
    ]);
    return JSON.stringify(entries);
  }

  if (typeof (body as any).getReader === 'function') {
    const reader = (body as ReadableStream<Uint8Array>).getReader();
    const chunks: Buffer[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks).toString('utf8');
  }

  if (typeof (body as any)[Symbol.asyncIterator] === 'function') {
    const chunks: Buffer[] = [];
    for await (const chunk of body as AsyncIterable<Buffer | Uint8Array>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString('utf8');
  }

  return label;
}
