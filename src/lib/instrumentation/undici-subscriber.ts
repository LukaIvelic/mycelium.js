import diagnosticsChannel from 'node:diagnostics_channel';
import { DiagnosticsChannel, HeaderFilterLevel } from '../types';
import { FetchLogger } from '../logging/network/fetch-logger';
import { Service } from '../../setup/client.types';
import { childContext } from '../utils/context';

interface UndiciSubscriberConfig {
  service: Service;
  bodyMaxBytes?: number;
  captureStreamBodies: boolean;
  headerFilterLevel?: HeaderFilterLevel;
}

export function subscribeToUndici(config: UndiciSubscriberConfig) {
  const fetchLogger: FetchLogger = new FetchLogger(
    config.bodyMaxBytes,
    config.captureStreamBodies,
    config.headerFilterLevel,
    config.service,
  );

  diagnosticsChannel.subscribe(DiagnosticsChannel.UndiciRequestCreate, (message: any) => {
    fetchLogger.log(message.request, childContext());
  });
}
