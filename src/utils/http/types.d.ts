import type {
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from "axios"

export type RequestMethods = "GET" | "POST" | "PATCH" | "PUT" | "DELETE" |
  "get" | "post" | "patch" | "put" | "delete"

export interface PureHttpError extends AxiosError {
  isCancelRequest?: boolean
}

export interface PureHttpResponse extends AxiosResponse {
  config: PureHttpRequestConfig
}

export interface PureHttpRequestConfig extends AxiosRequestConfig {
  beforeRequestCallback?: (request: PureHttpRequestConfig) => void
  beforeResponseCallback?: (response: PureHttpResponse) => void
}
