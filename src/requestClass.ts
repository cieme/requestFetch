//
import utils from "./utils.js";

/* 基础的请求路径 */
export const BASEURL = "";

/* 文件响应类型 */
export enum TResponseType {
  BLOB = "blob",
  JSON = "json",
  ARRAYBUFFER = "arraybuffer",
  TEXT = "text",
  FORM_DATA = "formData",
}

/* 请求参数 */
export interface IFetchOptions {
  baseURL?: string;
  method?: "GET" | "POST";
  headers?: Headers;
  responseType?: TResponseType;
  mode?: "cors" | "no-cors" | "same-origin";
  query?: object;
  timeout?: number;
  // signal?: AbortSignal;
}

/**
 * 默认请求参数
 * @param {any}
 * @returns {any}
 */
export const defaultOption: IFetchOptions = {
  method: "GET",
  baseURL: BASEURL,
  responseType: TResponseType.JSON,
  headers: (function () {
    const headers = new Headers();
    headers.append("Content-Type", "application/json;charset:utf-8;");
    // headers.append("Content-Type", "application/x-www-form-urlencoded");
    // headers.append("Content-Type", "text/plain");
    // headers.append("Content-Type", "multipart/form-data");
    return headers;
  })(),
  timeout: 0,
};

interface IParams {
  [key: string]: any;
}
/**
 * object to query string
 * @param {IParams} params
 * @returns {any}
 */
export const queryString = (params: IParams) => {
  if (params && Object.keys(params).length > 0) {
    return (
      "?" +
      Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&")
    );
  }
  return "";
};

class InterceptorManager {
  public handlers: any = [];
  constructor() {
    this.handlers = [];
  }
  use(fulfilled: Function, rejected?: Function) {
    this.handlers.push({
      fulfilled,
      rejected,
    } as any);
    return this.handlers.length - 1;
  }

  eject(id: number) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }
  forEach(fn: Function) {
    utils.forEach(this.handlers, function forEachHandler(h: any) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}

interface XX extends RequestClass {
  apply: Function;
  interceptors: {
    request: InterceptorManager;
    response: InterceptorManager;
  };
}

export class RequestClass {
  public defaults: object = {};
  public interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager(),
  };

  constructor(defaults: any) {
    this.defaults = defaults;
  }

  static create(defaults: any) {
    const instance = new RequestClass(defaults);
    return instance;
  }
  public request(config: any) {
    /*  */
    const requestInterceptorChain: Array<any> = [];
    this.interceptors.request.forEach(function (interceptor: any) {
      requestInterceptorChain.unshift(
        interceptor.fulfilled,
        interceptor.rejected,
      );
    });
    /*  */
    const responseInterceptorChain: Array<any> = [];
    this.interceptors.response.forEach(function (interceptor: any) {
      responseInterceptorChain.push(
        interceptor.fulfilled,
        interceptor.rejected,
      );
    });

    /*  */

    while (requestInterceptorChain.length) {
      const onFulfilled = requestInterceptorChain.shift();
      const onRejected = requestInterceptorChain.shift();
      try {
        config = onFulfilled(config);
      } catch (error) {
        onRejected(error);
        break;
      }
    }

    let promise = Promise.resolve(config);
    try {
      promise = this.dispatchRequest(config);
    } catch (error) {
      return Promise.reject(error);
    }

    while (responseInterceptorChain.length) {
      promise = promise.then(
        responseInterceptorChain.shift(),
        responseInterceptorChain.shift(),
      );
    }
    return promise;
  }
  public dispatchRequest(config: any) {
    return new Promise((resolve, reject) => {
      fetch(config.url as string, config)
        .then((res) => {
          resolve(res);
          return res;
        })
        .catch((error) => {
          reject(error);
          return error;
        });
    });
  }
  static createInstance(defaultConfig: any) {
    const context = new RequestClass(defaultConfig);
    // const instance = utils.bind(RequestClass.prototype.request, context);
    const instance = RequestClass.prototype.request.bind(context);

    // Copy axios.prototype to instance
    utils.extend(instance, RequestClass.prototype, context);

    // Copy context to instance
    utils.extend(instance, context);

    // Factory for creating new instances
    (instance as any).create = function create(instanceConfig: any) {
      return RequestClass.createInstance(instanceConfig);
    };

    return instance as any;
  }
}

export const fetchInstance = RequestClass.createInstance(defaultOption);

/* 请求拦截 */
fetchInstance.interceptors.request.use(
  (config: any) => {
    return config;
  },
  (error: any) => {
    return error;
  },
);
/* 响应拦截 */
fetchInstance.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    return error;
  },
);

(fetchInstance as Function)({ url: "/index.css" })
  .then((res: any) => {
    console.log(res);
  })
  .catch((error: any) => {
    console.log(error);
  });
