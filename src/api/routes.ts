import { http } from "@/utils/http";

export const getAsyncRoutes = (): Promise<Array<any>> => {
  return http.request<Array<any>>("get", "/get-async-routes");
};