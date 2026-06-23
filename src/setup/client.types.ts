import { HeaderFilterLevel } from '@/lib/types';

export type HeaderFilterLevelName = keyof typeof HeaderFilterLevel;

export type Service = {
  key: string;
  origin: string;
  name: string;
  version?: string;
  description?: string;
  repository?: string;
};

export type CaptureBodyOptions = {
  maxBytes?: number;
};

export type FilterHeaderOptions = {
  level?: HeaderFilterLevel;
};

export type RemoteSettingsOptions = {
  endpoint?: string;
  required?: boolean;
};

export type RemoteRuntimeSettings = {
  performance: {
    captureMetrics: boolean;
    slowRequestThresholdMs: number;
    notifyOnSlowRequests: boolean;
    notifyOnFailedRequests: boolean;
    warningStatusCode: number;
    criticalStatusCode: number;
  };
  communication: {
    subscribeToFetch: boolean;
    subscribeToHttp: boolean;
    captureBody: boolean;
    bodyMaxBytes: number;
    captureStreamBodies: boolean;
    headerFilterLevel: HeaderFilterLevelName;
  };
};
