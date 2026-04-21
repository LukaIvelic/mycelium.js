import { teeBody } from "./tee-body";

export function prepareBody(request: any, captureStreamBodies: boolean): unknown {
    if(!captureStreamBodies) return request.body;
    const tees = teeBody(request.body);
    if(!tees) return request.body;
    request.body = tees[0];
    return tees[1];
}
