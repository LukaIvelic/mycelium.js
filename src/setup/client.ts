import {
  AssertReadyMessages,
  RUNTIME_SETTINGS_ENDPOINT,
} from '@/lib/constants';
import { subscribeToHttp } from '@/lib/instrumentation/http-subscriber';
import { subscribeToUndici } from '@/lib/instrumentation/undici-subscriber';
import { observePerformance } from '@/lib/observers/performance-observer';
import { HeaderFilterLevel } from '@/lib/types';
import {
  CaptureBodyOptions,
  FilterHeaderOptions,
  RemoteRuntimeSettings,
  RemoteSettingsOptions,
  Service,
} from '@/setup/client.types';

class MyceliumBuilder {
  private serviceValue: Service = { key: '', name: '', origin: '' };
  private apiKeyValue: string = '';
  private subscribeToFetchValue: boolean = false;
  private subscribeToHttpValue: boolean = false;
  private captureStreamBodiesValue: boolean = false;
  private captureBodyOptionsValue: CaptureBodyOptions = {};
  private filterHeaderOptionsValue: FilterHeaderOptions = {};
  private performanceMetricsValue: boolean = false;
  private remoteSettingsOptionsValue?: RemoteSettingsOptions;

  defineService(service: Service): this {
    this.serviceValue = service;
    return this;
  }

  apiKey(apiKey: string): this {
    this.apiKeyValue = apiKey;
    return this;
  }

  subscribeToFetch(): this {
    this.subscribeToFetchValue = true;
    return this;
  }

  subscribeToHttp(): this {
    this.subscribeToHttpValue = true;
    return this;
  }

  captureBody(captureBodyOptions: CaptureBodyOptions) {
    this.captureBodyOptionsValue = captureBodyOptions;
    return this;
  }

  captureStreamBodies(): this {
    this.captureStreamBodiesValue = true;
    return this;
  }

  filterHeader(filterHeaderOptions: FilterHeaderOptions): this {
    this.filterHeaderOptionsValue = filterHeaderOptions;
    return this;
  }

  capturePerformanceMetrics(): this {
    this.performanceMetricsValue = true;
    return this;
  }

  useRemoteSettings(options: RemoteSettingsOptions = {}): this {
    this.remoteSettingsOptionsValue = options;
    return this;
  }

  initialize() {
    if (this.remoteSettingsOptionsValue) {
      throw new Error(AssertReadyMessages.REMOTE_SETTINGS_INITIALIZE);
    }

    return new MyceliumClient(
      this.serviceValue,
      this.apiKeyValue,
      this.subscribeToFetchValue,
      this.subscribeToHttpValue,
      this.captureStreamBodiesValue,
      this.captureBodyOptionsValue,
      this.filterHeaderOptionsValue,
      this.performanceMetricsValue,
    );
  }

  async initializeAsync() {
    const client = new MyceliumClient(
      this.serviceValue,
      this.apiKeyValue,
      this.subscribeToFetchValue,
      this.subscribeToHttpValue,
      this.captureStreamBodiesValue,
      this.captureBodyOptionsValue,
      this.filterHeaderOptionsValue,
      this.performanceMetricsValue,
      this.remoteSettingsOptionsValue,
      false,
    );

    await client.initializeAsync();
    return client;
  }
}

class MyceliumClient {
  private serviceValue: Service;
  private apiKeyValue: string = '';
  private subscribeToFetchValue: boolean = false;
  private subscribeToHttpValue: boolean = false;
  private captureStreamBodiesValue: boolean = false;
  private captureBodyOptionsValue: CaptureBodyOptions = {};
  private initialized: boolean = false;
  private filterHeaderOptionsValue: FilterHeaderOptions = {};
  private performanceMetricsValue: boolean = false;
  private remoteSettingsOptionsValue?: RemoteSettingsOptions;

  constructor(
    serviceValue: Service,
    apiKeyValue: string = '',
    subscribeToFetchValue: boolean = false,
    subscribeToHttpValue: boolean = false,
    captureStreamBodiesValue: boolean = false,
    captureBodyOptionsValue: CaptureBodyOptions = {},
    filterHeaderOptionsValue: FilterHeaderOptions = {},
    performanceMetricsValue: boolean = false,
    remoteSettingsOptionsValue?: RemoteSettingsOptions,
    autoInitialize: boolean = true,
  ) {
    this.serviceValue = serviceValue;
    this.apiKeyValue = apiKeyValue;
    this.captureStreamBodiesValue = captureStreamBodiesValue;
    this.captureBodyOptionsValue = captureBodyOptionsValue;
    this.subscribeToFetchValue = subscribeToFetchValue;
    this.subscribeToHttpValue = subscribeToHttpValue;
    this.filterHeaderOptionsValue = filterHeaderOptionsValue;
    this.performanceMetricsValue = performanceMetricsValue;
    this.remoteSettingsOptionsValue = remoteSettingsOptionsValue;

    if (autoInitialize) {
      this.initialize();
    }
  }

  initialize() {
    this.assertReady();
    this.startInstrumentation();
  }

  async initializeAsync(): Promise<void> {
    this.assertReady();
    await this.applyRemoteSettings();
    this.startInstrumentation();
  }

  private startInstrumentation(): void {
    if (this.initialized) return;

    if (this.subscribeToFetchValue) {
      subscribeToUndici({
        bodyMaxBytes: this.captureBodyOptionsValue.maxBytes,
        captureStreamBodies: this.captureStreamBodiesValue,
        headerFilterLevel: this.filterHeaderOptionsValue.level,
        service: this.serviceValue,
        apiKey: this.apiKeyValue,
      });
    }

    if (this.subscribeToHttpValue) {
      subscribeToHttp({
        bodyMaxBytes: this.captureBodyOptionsValue.maxBytes,
        captureStreamBodies: this.captureStreamBodiesValue,
        headerFilterLevel: this.filterHeaderOptionsValue.level,
        service: this.serviceValue,
        apiKey: this.apiKeyValue,
      });
    }

    if (this.performanceMetricsValue) {
      observePerformance();
    }

    this.initialized = true;
  }

  private async applyRemoteSettings(): Promise<void> {
    if (!this.remoteSettingsOptionsValue) return;

    try {
      const settings = await this.fetchRemoteSettings();
      this.applyRuntimeSettings(settings);
    } catch (err) {
      if (this.remoteSettingsOptionsValue.required) {
        throw err;
      }
    }
  }

  private async fetchRemoteSettings(): Promise<RemoteRuntimeSettings> {
    const endpoint =
      this.remoteSettingsOptionsValue?.endpoint ?? RUNTIME_SETTINGS_ENDPOINT;
    const url = new URL(endpoint);
    url.searchParams.set('origin', this.serviceValue.origin);
    url.searchParams.set('key', this.serviceValue.key);

    const response = await fetch(url, {
      headers: {
        'x-api-key': this.apiKeyValue,
      },
    });

    if (!response.ok) {
      throw new Error(`Mycelium remote settings failed: ${response.status}`);
    }

    return (await response.json()) as RemoteRuntimeSettings;
  }

  private applyRuntimeSettings(settings: RemoteRuntimeSettings): void {
    this.performanceMetricsValue = settings.performance.captureMetrics;
    this.subscribeToFetchValue = settings.communication.subscribeToFetch;
    this.subscribeToHttpValue = settings.communication.subscribeToHttp;
    this.captureStreamBodiesValue = settings.communication.captureStreamBodies;
    this.captureBodyOptionsValue = {
      ...this.captureBodyOptionsValue,
      maxBytes: settings.communication.captureBody
        ? settings.communication.bodyMaxBytes
        : 0,
    };

    const headerFilterLevel = HeaderFilterLevel[
      settings.communication.headerFilterLevel
    ] as HeaderFilterLevel | undefined;

    if (headerFilterLevel !== undefined) {
      this.filterHeaderOptionsValue = {
        ...this.filterHeaderOptionsValue,
        level: headerFilterLevel,
      };
    }
  }

  private assertReady(): void {
    if (!this.apiKeyValue) {
      throw new Error(AssertReadyMessages.API_KEY);
    }
    if (!this.serviceValue.key) {
      throw new Error(AssertReadyMessages.SERVICE_KEY);
    }
    if (!this.serviceValue.origin) {
      throw new Error(AssertReadyMessages.SERVICE_ORIGIN);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const createClient = () => new MyceliumBuilder();
