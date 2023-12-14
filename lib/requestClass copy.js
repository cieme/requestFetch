//
import utils from "./utils.js";
/* 基础的请求路径 */
export const BASEURL = "";
/* 文件响应类型 */
export var TResponseType;
(function (TResponseType) {
    TResponseType["BLOB"] = "blob";
    TResponseType["JSON"] = "json";
    TResponseType["ARRAYBUFFER"] = "arraybuffer";
    TResponseType["TEXT"] = "text";
    TResponseType["FORM_DATA"] = "formData";
})(TResponseType || (TResponseType = {}));
/**
 * 默认请求参数
 * @param {any}
 * @returns {any}
 */
export const defaultOption = {
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
/**
 * object to query string
 * @param {IParams} params
 * @returns {any}
 */
export const queryString = (params) => {
    if (params && Object.keys(params).length > 0) {
        return ("?" +
            Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&"));
    }
    return "";
};
class InterceptorManager {
    constructor() {
        this.handlers = [];
        this.handlers = [];
    }
    use(fulfilled, rejected) {
        this.handlers.push({
            fulfilled,
            rejected,
        });
        return this.handlers.length - 1;
    }
    eject(id) {
        if (this.handlers[id]) {
            this.handlers[id] = null;
        }
    }
    forEach(fn) {
        utils.forEach(this.handlers, function forEachHandler(h) {
            if (h !== null) {
                fn(h);
            }
        });
    }
}
export class RequestClass {
    constructor(defaults) {
        this.defaults = {};
        this.interceptors = {
            request: new InterceptorManager(),
            response: new InterceptorManager(),
        };
        this.defaults = defaults;
    }
    static create(defaults) {
        const instance = new RequestClass(defaults);
        return instance;
    }
    request(config) {
        /*  */
        const requestInterceptorChain = [];
        this.interceptors.request.forEach(function (interceptor) {
            requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
        });
        /*  */
        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function (interceptor) {
            responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });
        /*  */
        while (requestInterceptorChain.length) {
            const onFulfilled = requestInterceptorChain.shift();
            const onRejected = requestInterceptorChain.shift();
            try {
                config = onFulfilled(config);
            }
            catch (error) {
                onRejected(error);
                break;
            }
        }
        let promise = Promise.resolve(config);
        try {
            promise = this.dispatchRequest(config);
        }
        catch (error) {
            return Promise.reject(error);
        }
        while (responseInterceptorChain.length) {
            promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
        }
        return promise;
    }
    dispatchRequest(config) {
        return new Promise((resolve, reject) => {
            fetch(config.url, config)
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
    static createInstance(defaultConfig) {
        const context = new RequestClass(defaultConfig);
        // const instance = utils.bind(RequestClass.prototype.request, context);
        // const instance = RequestClass.prototype.request.bind(context);
        const instance = context;
        // Copy axios.prototype to instance
        // utils.extend(instance, RequestClass.prototype, context);
        // Copy context to instance
        // utils.extend(instance, context);
        // Factory for creating new instances
        instance.create = function create(instanceConfig) {
            return RequestClass.createInstance(instanceConfig);
        };
        return instance;
    }
}
export const fetchInstance = RequestClass.createInstance(defaultOption);
/* 请求拦截 */
// fetchInstance.interceptors.request.use(
//   (config: any) => {
//     return config;
//   },
//   (error: any) => {
//     return error;
//   },
// );
/* 响应拦截 */
// fetchInstance.interceptors.response.use(
//   (response: any) => {
//     return response;
//   },
//   (error: any) => {
//     return error;
//   },
// );
(fetchInstance).request({ url: "/index.css" })
    .then((res) => {
    console.log(res);
})
    .catch((error) => {
    console.log(error);
});
//# sourceMappingURL=requestClass%20copy.js.map