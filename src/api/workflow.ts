import { http } from "@/utils/http";
import type { WorkflowData, NodeData, EdgeData } from "@/views/computer/workflow/designer/types";

// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  data: T;
}

// 工作流查询参数
export interface WorkflowQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  dateRange?: string[];
  categoryIds?: number[];
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

// 工作流列表响应
export interface WorkflowListResponse {
  list: WorkflowData[];
  total: number;
}

// 工作流更新参数
export interface WorkflowUpdateParams {
  id: number;
  name: string;
  description?: string;
  category?: string;
  nodes?: NodeData[];
  edges?: EdgeData[];
}

// 获取工作流列表
export const getWorkflowList = (params: WorkflowQueryParams) => {
  return http.request<ApiResponse<WorkflowListResponse>>("get", "/workflow/list", { params });
};

// 获取工作流详情
export const getWorkflow = (id: string | number) => {
  return http.request<ApiResponse<WorkflowData>>("get", `/workflow/${id}`);
};

// 创建工作流
export const createWorkflow = (data: Omit<WorkflowUpdateParams, "id">) => {
  return http.request<ApiResponse<WorkflowData>>("post", "/workflow", { data });
};

// 更新工作流
export const updateWorkflow = (data: WorkflowUpdateParams) => {
  return http.request<ApiResponse<WorkflowData>>("put", `/workflow/${data.id}`, { data });
};

// 删除工作流
export const deleteWorkflow = (id: number) => {
  return http.request<ApiResponse<void>>("delete", `/workflow/${id}`);
};

// 批量删除工作流
export const batchDeleteWorkflow = (ids: number[]) => {
  return http.request<ApiResponse<void>>("delete", "/workflow/batch", { data: { ids } });
};

// 发布工作流
export const publishWorkflow = (id: number) => {
  return http.request<ApiResponse<void>>("post", `/workflow/${id}/publish`);
};

// 归档工作流
export const archiveWorkflow = (id: number) => {
  return http.request<ApiResponse<void>>("post", `/workflow/${id}/archive`);
};

// 导出工作流
export const exportWorkflow = (id: string | number) => {
  return http.request<Blob>("get", `/workflow/${id}/export`, {
    responseType: "blob"
  });
};

// 批量导出工作流
export const batchExportWorkflow = (ids: Array<string | number>) => {
  return http.request<Blob>("post", "/workflow/export", {
    data: { ids },
    responseType: "blob"
  });
}; 