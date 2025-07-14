import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type CustomParamsSerializer
} from "axios";
import type {
  PureHttpError,
  RequestMethods,
  PureHttpResponse,
  PureHttpRequestConfig
} from "./types.d";
import { stringify } from "qs";
import NProgress from "../progress";
import { getToken, formatToken } from "@/utils/auth";
import { ElMessage } from "element-plus";

// Token处理配置接口
interface TokenHandlers {
  getToken: () => any;
  refreshToken: (refreshToken: string) => Promise<any>;
  onTokenExpired?: (error?: any) => void;
}

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // API基础路径
  baseURL: "/api/v1",
  // 请求超时时间
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  paramsSerializer: {
    serialize: stringify as unknown as CustomParamsSerializer
  }
};

class PureHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** `token`过期后，暂存待执行的请求 */
  private static requests = [];

  /** 防止重复刷新`token` */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: PureHttpRequestConfig = {};

  /** 保存当前`Axios`实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** Token处理器配置 */
  private static tokenHandlers: TokenHandlers | null = null;

  /** 配置Token处理器 */
  public static setTokenHandlers(handlers: TokenHandlers) {
    PureHttp.tokenHandlers = handlers;
  }

  /** 重连原始请求 */
  private static retryOriginalRequest(config: PureHttpRequestConfig) {
    return new Promise(resolve => {
      PureHttp.requests.push((token: string) => {
        config.headers["Authorization"] = formatToken(token);
        resolve(config);
      });
    });
  }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    PureHttp.axiosInstance.interceptors.request.use(
      async (config: PureHttpRequestConfig): Promise<any> => {
        // 开启进度条动画
        NProgress.start();

        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (PureHttp.initConfig.beforeRequestCallback) {
          PureHttp.initConfig.beforeRequestCallback(config);
          return config;
        }

        /** 请求白名单，放置一些不需要`token`的接口 */
        const whiteList = ["/refresh-token", "/login"];
        if (whiteList.some(url => config.url.endsWith(url))) {
          return config;
        }

        // 处理token逻辑
        return new Promise(resolve => {
          const data = getToken();
          if (data) {
            const now = new Date().getTime();
            const expired = parseInt(data.expires) - now <= 0;

            if (expired) {
              // Token过期处理
              if (!PureHttp.isRefreshing && PureHttp.tokenHandlers?.refreshToken) {
                PureHttp.isRefreshing = true;
                // 使用配置的token刷新方法
                PureHttp.tokenHandlers
                  .refreshToken(data.refreshToken)
                  .then(res => {
                    const token = res.data.accessToken;
                    config.headers["Authorization"] = formatToken(token);
                    PureHttp.requests.forEach(cb => cb(token));
                    PureHttp.requests = [];
                  })
                  .catch(() => {
                    // token刷新失败，触发登出回调
                    PureHttp.tokenHandlers?.onTokenExpired?.();
                  })
                  .finally(() => {
                    PureHttp.isRefreshing = false;
                  });
              }
              resolve(PureHttp.retryOriginalRequest(config));
            } else {
              // Token有效，直接添加到请求头
              config.headers["Authorization"] = formatToken(data.accessToken);
              resolve(config);
            }
          } else {
            // 没有token，直接通过
            resolve(config);
          }
        });
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = PureHttp.axiosInstance;
    instance.interceptors.response.use(
      (response: PureHttpResponse) => {
        const $config = response.config;
        // 关闭进度条动画
        NProgress.done();

        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response.data;
        }
        if (PureHttp.initConfig.beforeResponseCallback) {
          PureHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }

        // 处理后端标准响应格式
        const responseData = response.data;
        if (responseData && typeof responseData === 'object' && 'code' in responseData) {
          // 检查业务状态码
          if (responseData.code === 200) {
            return responseData.data; // 只返回data字段
          } else {
            ElMessage.error(responseData.message || '请求失败');
            return Promise.reject(responseData);
          }
        }

        return responseData;
      },
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        NProgress.done();

        // 处理401未授权错误
        if ($error.response?.status === 401) {
          // 触发token过期处理，传递错误信息
          PureHttp.tokenHandlers?.onTokenExpired?.($error);
        }

        // 处理403禁止访问错误（用户被禁用）
        if ($error.response?.status === 403) {
          const responseData = $error.response?.data as any;
          const message = responseData?.message || '用户已被禁用，无法访问系统';
          ElMessage.error(message);
          // 触发登出处理
          PureHttp.tokenHandlers?.onTokenExpired?.($error);
          return Promise.reject(new Error(message));
        }

        // 处理其他HTTP错误，提取后端返回的错误信息
        const responseData = $error.response?.data as any;
        if (responseData && responseData.message) {
          return Promise.reject(new Error(responseData.message));
        }

        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      }
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: PureHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as PureHttpRequestConfig;
    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      PureHttp.axiosInstance
        .request(config)
        .then((response: undefined) => {
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /** 单独抽离的`post`工具函数 */
  public post<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("POST", url, params, config);
  }

  /** 单独抽离的`get`工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("GET", url, params, config);
  }
}

export const http = new PureHttp();
export { PureHttp };
