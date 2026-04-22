import { computeBodySize } from '@/lib/utils/compute-body-size';
import { serializeBody } from '@/lib/utils/serialize-body';

export async function serializeAndTruncate(
  preparedBody: unknown,
  bodyMaxBytes: number,
  captureStreamBodies: boolean,
): Promise<{ bodySize: number; body: string | null }> {
  const serializedBody = await serializeBody(preparedBody, captureStreamBodies);
  const byteSize = computeBodySize(serializedBody);
  return {
    bodySize: byteSize,
    body: byteSize <= bodyMaxBytes ? serializedBody : null,
  };
}
