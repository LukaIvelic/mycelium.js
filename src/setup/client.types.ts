import { HeaderFilterLevel } from '@/lib/types';

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
