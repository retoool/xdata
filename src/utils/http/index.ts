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
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  baseURL: "api/v1",
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
        /** 请求白名单，放置一些不需要`token`的接口（通过设置请求白名单，防止`token`过期后再请求造成的死循环问题） */
        const whiteList = ["/refresh-token", "/login"];
        return whiteList.some(url => config.url.endsWith(url))
          ? config
          : new Promise(resolve => {
              const data = getToken();
              if (data) {
                // 后端返回的是秒级时间戳，需要转换为秒级进行比较
                const now = Math.floor(Date.now() / 1000);
                const expired = parseInt(data.expires) - now <= 0;
                if (expired) {
                  if (!PureHttp.isRefreshing) {
                    PureHttp.isRefreshing = true;
                    // token过期刷新
                    useUserStoreHook()
                      .handRefreshToken({ refreshToken: data.refreshToken })
                      .then(res => {
                        const token = res.accessToken;
                        config.headers["Authorization"] = formatToken(token);
                        PureHttp.requests.forEach(cb => cb(token));
                        PureHttp.requests = [];
                      })
                      .finally(() => {
                        PureHttp.isRefreshing = false;
                      });
                  }
                  resolve(PureHttp.retryOriginalRequest(config));
                } else {
                  config.headers["Authorization"] = formatToken(
                    data.accessToken
                  );
                  resolve(config);
                }
              } else {
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
        
        // 处理标准化响应结构
        const responseData = response.data;
        if (responseData && typeof responseData === 'object' && 'code' in responseData) {
          if (responseData.code === 200) {
            // 业务成功，返回 data 字段
            const result = responseData.data;
            // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
            if (typeof $config.beforeResponseCallback === "function") {
              $config.beforeResponseCallback(response);
              return result;
            }
            if (PureHttp.initConfig.beforeResponseCallback) {
              PureHttp.initConfig.beforeResponseCallback(response);
              return result;
            }
            return result;
          } else {
            // 业务失败，创建错误对象但不显示消息（让调用方决定是否显示）
            const errorMessage = responseData.message || '请求失败';
            const error = new Error(errorMessage);
            (error as any).code = responseData.code;
            (error as any).response = response;
            return Promise.reject(error);
          }
        }
        
        // 不符合标准化响应结构，抛出异常
        const errorMessage = '接口响应格式不符合标准化要求，缺少 code 字段';
        const error = new Error(errorMessage);
        (error as any).code = 500;
        (error as any).response = response;
        return Promise.reject(error);
      },
      (error: PureHttpError) => {
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 关闭进度条动画
        NProgress.done();
        
        // 处理网络错误或HTTP状态码错误
        if ($error.response) {
          // 服务器返回了错误状态码
          const status = $error.response.status;
          const data = $error.response.data;
          
          if (data && typeof data === 'object' && 'message' in data) {
            // 服务器返回了错误信息
            $error.message = String(data.message);
            $error.code = String((data as any).code || status);
          } else {
            // 服务器没有返回错误信息，使用默认错误信息
            switch (status) {
              case 400:
                $error.message = '请求参数错误';
                break;
              case 401:
                $error.message = '未授权，请重新登录';
                break;
              case 403:
                $error.message = '拒绝访问';
                break;
              case 404:
                $error.message = '请求地址不存在';
                break;
              case 500:
                $error.message = '服务器内部错误';
                break;
              default:
                $error.message = `请求失败，状态码：${status}`;
            }
            $error.code = String(status);
          }
        } else if ($error.request) {
          // 请求已发出但没有收到响应
          $error.message = '网络连接失败，请检查网络设置';
          $error.code = '0';
        } else {
          // 请求配置出错
          $error.message = '请求配置错误';
          $error.code = '-1';
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
    return this.request<T>("post", url, params, config);
  }

  /** 单独抽离的`get`工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<P>,
    config?: PureHttpRequestConfig
  ): Promise<T> {
    return this.request<T>("get", url, params, config);
  }
}

export const http = new PureHttp();