import { http } from "@/utils/http";
import type { WorkflowData, NodeData, EdgeData } from "@/views/computer/workflow/designer/types";
import type { ApiResponse, PageResult } from "@/types/system";

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
export type WorkflowListResponse = PageResult<WorkflowData>;

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
export const getWorkflowList = (params: WorkflowQueryParams): Promise<WorkflowListResponse> => {
  return http.request<WorkflowListResponse>("get", "/workflow/list", { params });
};

// 获取工作流详情
export const getWorkflow = (id: string | number): Promise<WorkflowData> => {
  return http.request<WorkflowData>("get", `/workflow/${id}`);
};

// 创建工作流
export const createWorkflow = (data: Omit<WorkflowUpdateParams, "id">): Promise<WorkflowData> => {
  return http.request<WorkflowData>("post", "/workflow", { data });
};

// 更新工作流
export const updateWorkflow = (data: WorkflowUpdateParams): Promise<WorkflowData> => {
  return http.request<WorkflowData>("post", `/workflow/${data.id}`, { data });
};

// 删除工作流
export const deleteWorkflow = (id: number): Promise<void> => {
  return http.request<void>("post", `/workflow/${id}/delete`);
};

// 批量删除工作流
export const batchDeleteWorkflow = (ids: number[]): Promise<void> => {
  return http.request<void>("post", "/workflow/batch-delete", { data: { ids } });
};

// 发布工作流
export const publishWorkflow = (id: number): Promise<void> => {
  return http.request<void>("post", `/workflow/${id}/publish`);
};

// 取消发布工作流
export const unpublishWorkflow = (id: number): Promise<void> => {
  return http.request<void>("post", `/workflow/${id}/unpublish`);
};

// 执行工作流
export const executeWorkflow = (id: number): Promise<void> => {
  return http.request<void>("post", `/workflow/${id}/execute`);
};

// 停止工作流
export const stopWorkflow = (id: number): Promise<void> => {
  return http.request<void>("post", `/workflow/${id}/stop`);
};

// 获取工作流执行记录
export const getWorkflowExecutions = (id: number): Promise<any[]> => {
  return http.request<any[]>("get", `/workflow/${id}/executions`);
};

// 获取工作流统计信息
export const getWorkflowStats = (): Promise<any> => {
  return http.request<any>("get", "/workflow/stats");
};

// 获取工作流仪表板数据
export const getWorkflowDashboard = (): Promise<any> => {
  return http.request<any>("get", "/workflow/dashboard");
};

// 批量导出工作流
export const batchExportWorkflow = (ids: number[]) => {
  return http.request<Blob>("get", "/workflow/export", { 
    params: { ids },
    responseType: 'blob'  // 指定响应类型为blob，用于文件下载
  });
}; 