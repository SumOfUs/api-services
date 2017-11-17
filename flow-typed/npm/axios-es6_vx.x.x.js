// flow-typed signature: 5c9591dcf1064ae866f0b326ffa34bd7
// flow-typed version: <<STUB>>/axios-es6_v^0.11.1/flow_v0.59.0

declare module 'axios-es6' {
  declare type AxiosBasicCredentials = {
    username: string,
    password: string,
  };

  declare type AxiosProxyConfig = {
    host: string,
    port: number,
    auth?: {
      username: string,
      password: string,
    },
  };

  declare type AxiosPromise<T> = Promise<AxiosResponse<T>>;
  declare type AxiosAdapter = (config: AxiosRequestConfig) => AxiosPromise<*>;

  declare interface CancelStatic {
    new(message?: string): Cancel;
  }

  declare type Cancel = {
    message: string,
  };

  declare interface Canceler {
    (message?: string): void;
  }

  declare interface CancelTokenStatic {
    new(executor: (cancel: Canceler) => void): CancelToken;
    source(): CancelTokenSource;
  }

  declare type CancelToken = {
    promise: Promise<Cancel>,
    reason?: Cancel,
    throwIfRequested(): void,
  };

  declare type CancelTokenSource = {
    token: CancelToken,
    cancel: Canceler,
  };

  declare interface AxiosInterceptorManager<V> {
    use(
      onFulfilled?: (value: V) => V | Promise<V>,
      onRejected?: (error: any) => any
    ): number;
    eject(id: number): void;
  }

  declare type AxiosError = typeof Error & {
    config: AxiosRequestConfig,
    code?: string,
    request?: any,
    response?: AxiosResponse<*>,
  };

  declare type AxiosRequestConfig = {
    url?: string,
    method?: string,
    baseURL?: string,
    transformRequest?: AxiosTransformer | AxiosTransformer[],
    transformResponse?: AxiosTransformer | AxiosTransformer[],
    headers?: any,
    params?: any,
    paramsSerializer?: (params: any) => string,
    data?: any,
    timeout?: number,
    withCredentials?: boolean,
    adapter?: AxiosAdapter,
    auth?: AxiosBasicCredentials,
    responseType?: string,
    xsrfCookieName?: string,
    xsrfHeaderName?: string,
    onUploadProgress?: (progressEvent: any) => void,
    onDownloadProgress?: (progressEvent: any) => void,
    maxContentLength?: number,
    validateStatus?: (status: number) => boolean,
    maxRedirects?: number,
    httpAgent?: any,
    httpsAgent?: any,
    proxy?: AxiosProxyConfig | false,
    cancelToken?: CancelToken,
  };

  declare type AxiosResponse<T> = {
    data: T,
    status: number,
    statusText: string,
    headers: any,
    config: AxiosRequestConfig,
    request?: any,
  };

  declare type AxiosTransformer = (data: any, headers?: any) => any;

  declare type AxiosInterceptors = {
    request: AxiosInterceptorManager<AxiosRequestConfig>,
    response: AxiosInterceptorManager<AxiosResponse<*>>,
  };

  declare class Axios {
    (config: AxiosRequestConfig): AxiosPromise<*>;
    (url: string, config?: AxiosRequestConfig): AxiosPromise<*>;
    request<T>(config: AxiosRequestConfig): AxiosPromise<T>;
    get<T>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
    delete(url: string, config?: AxiosRequestConfig): AxiosPromise<*>;
    head(url: string, config?: AxiosRequestConfig): AxiosPromise<*>;
    post<T>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): AxiosPromise<T>;
    put<T>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): AxiosPromise<T>;
    patch<T>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): AxiosPromise<T>;

    defaults: AxiosRequestConfig;
    interceptors: AxiosInterceptors;
    create(config?: AxiosRequestConfig): Axios;
    all<T>(values: (T | Promise<T>)[]): Promise<T[]>;
    spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
  }

  declare var exports: Axios;
}
