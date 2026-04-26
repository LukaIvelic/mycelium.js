import { subscribeToHttp } from '@/lib/instrumentation/http-subscriber';
import { CaptureBodyOptions, FilterHeaderOptions, Service } from '@/setup/client.types';
import { subscribeToUndici } from '@/lib/instrumentation/undici-subscriber';
import { AssertReadyMessages } from '@/lib/constants';
import { ensureServiceRegistered } from '@/lib/utils/ensure-service-registered';

class MyceliumBuilder {
  private serviceValue: Service = { key: '', name: '', origin: '' };
  private apiKeyValue: string = '';
  private subscribeToFetchValue: boolean = false;
  private subscribeToHttpValue: boolean = false;
  private captureStreamBodiesValue: boolean = false;
  private captureBodyOptionsValue: CaptureBodyOptions = {};
  private filterHeaderOptionsValue: FilterHeaderOptions = {};

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

  initialize() {
    return new MyceliumClient(
      this.serviceValue,
      this.apiKeyValue,
      this.subscribeToFetchValue,
      this.subscribeToHttpValue,
      this.captureStreamBodiesValue,
      this.captureBodyOptionsValue,
      this.filterHeaderOptionsValue,
    );
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

  constructor(
    serviceValue: Service,
    apiKeyValue: string = '',
    subscribeToFetchValue: boolean = false,
    subscribeToHttpValue: boolean = false,
    captureStreamBodiesValue: boolean = false,
    captureBodyOptionsValue: CaptureBodyOptions = {},
    filterHeaderOptionsValue: FilterHeaderOptions = {},
  ) {
    this.serviceValue = serviceValue;
    this.apiKeyValue = apiKeyValue;
    this.captureStreamBodiesValue = captureStreamBodiesValue;
    this.captureBodyOptionsValue = captureBodyOptionsValue;
    this.subscribeToFetchValue = subscribeToFetchValue;
    this.subscribeToHttpValue = subscribeToHttpValue;
    this.filterHeaderOptionsValue = filterHeaderOptionsValue;

    this.initialize();
  }

  initialize() {
    this.assertReady();
    void ensureServiceRegistered(this.serviceValue, this.apiKeyValue).catch(() => undefined);

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

    this.initialized = true;
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
