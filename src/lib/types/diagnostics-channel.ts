enum UndiciRequests {
  UndiciRequestCreate = 'undici:request:create',
  UndiciRequestBodyChunkSent = 'undici:request:bodyChunkSent',
  UndiciRequestBodySent = 'undici:request:bodySent',
  UndiciRequestHeaders = 'undici:request:headers',
  UndiciRequestBodyChunkReceived = 'undici:request:bodyChunkReceived',
  UndiciRequestTrailers = 'undici:request:trailers',
  UndiciRequestError = 'undici:request:error',
  UndiciRequestPendingRequests = 'undici:request:pending-requests',

  UndiciClientSendHeaders = 'undici:client:sendHeaders',
  UndiciClientBeforeConnect = 'undici:client:beforeConnect',
  UndiciClientConnected = 'undici:client:connected',
  UndiciClientConnectError = 'undici:client:connectError',

  UndiciWebSocketOpen = 'undici:websocket:open',
  UndiciWebSocketClose = 'undici:websocket:close',
  UndiciWebSocketSocketError = 'undici:websocket:socket_error',
  UndiciWebSocketPing = 'undici:websocket:ping',
  UndiciWebSocketPong = 'undici:websocket:pong',

  UndiciProxyConnected = 'undici:proxy:connected',
}

enum HttpRequests {
  HttpClientRequestCreated = 'http.client.request.created',
  HttpClientRequestStart = 'http.client.request.start',
  HttpClientRequestError = 'http.client.request.error',
  HttpClientResponseFinish = 'http.client.response.finish',

  HttpServerRequestStart = 'http.server.request.start',
  HttpServerResponseCreated = 'http.server.response.created',
  HttpServerResponseFinish = 'http.server.response.finish',
}

export const DiagnosticsChannel = {
  ...UndiciRequests,
  ...HttpRequests,
};
