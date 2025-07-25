import { http } from "@/utils/http";

export const getAsyncRoutes = () => {
  return http.request<BackendRoute[]>("get", "/system/menu/tree", {
    params: { asRoute: true }
  });
};
