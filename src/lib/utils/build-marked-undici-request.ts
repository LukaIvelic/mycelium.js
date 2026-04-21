import { Service } from "../../setup/client.types";
import { HeaderFilterLevel, MarkedUndiciRequest, TraceContext } from "../types";
import { safeHeaders } from "./safe-headers";
import { serializeAndTruncate } from "./serialize-and-truncate";

export async function buildMarkedUndiciRequest(
    request: any,
    preparedBody: unknown,
    bodyMaxBytes: number,
    captureStreamBodies: boolean,
    headerFilterLevel: HeaderFilterLevel,
    service: Service,
    ctx: TraceContext
): Promise<MarkedUndiciRequest> {
    const headers = safeHeaders(request.headers, headerFilterLevel);
    const { body, bodySize } = await serializeAndTruncate(preparedBody, bodyMaxBytes, captureStreamBodies);
    const bodySizeKb = bodySize / 1024;
    const timestamp = new Date().toISOString();

    return {
        method: request.method,
        statusCode: request.statusCode,
        body: body,
        bodySizeKb: bodySizeKb,
        complete: request.complete,
        aborted: request.aborted,
        path: request.path,
        origin: request.origin,
        protocol: request.protocol,
        idempotent: request.idempotent,
        contentLength: request.contentLength,
        contentType: request.contentType,
        headers: headers,
        traceId: ctx.traceId,
        spanId: ctx.spanId,
        parentSpanId: ctx.parentSpanId,
        timestamp: timestamp,
        durationMs: 0, //calculate duration based on request start and end time
        serviceName: service.name,
        serviceKey: service.key,
        serviceOrigin: service.origin,
        serviceVersion: service.version,
        serviceDescription: service.description
    }
}
