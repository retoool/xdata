import { http } from "@/utils/http";
import type { PageResult } from "@/types/system";

// 算子类型枚举
export enum OperatorType {
  BASIC = "basic", // 基础算子
  SCRIPT = "script", // 脚本算子
  EXTERNAL = "external" // 外部算子
}

// 算子接口
export interface Operator {
  id: number;
  name: string;
  type: OperatorType;
  categoryId: number;
  categoryPath?: string[]; // 所属分类路径
  description: string;
  version: string;
  author: string;
  inputSchema?: string; // 输入参数Schema (JSON Schema)
  outputSchema?: string; // 输出参数Schema (JSON Schema)
  createTime: string;
  updateTime: string;
  tags: string[];
}

// 获取算子列表
export function fetchOperators(params: {
  categoryId?: string | number | number[];
  type?: OperatorType;
  keyword?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  author?: string;
  prop?: string;
  order?: string;
}): Promise<PageResult<Operator>> {
  return http.request<PageResult<Operator>>("get", "/operator/list", {
    params
  });
}

// 获取算子详情
export function fetchOperatorDetail(id: number): Promise<Operator> {
  return http.request<Operator>("get", `/operator/${id}`);
}

// 新增算子
export function addOperator(data: Partial<Operator>): Promise<Operator> {
  return http.request<Operator>("post", "/operator", { data });
}

// 更新算子
export function updateOperator(
  id: number,
  data: Partial<Operator>
): Promise<Operator> {
  return http.request<Operator>("post", `/operator/${id}`, { data });
}

// 删除算子
export function deleteOperator(id: number): Promise<void> {
  return http.request<void>("post", `/operator/${id}/delete`);
}

// 批量删除算子
export function batchDeleteOperators(ids: number[]): Promise<void> {
  return http.request<void>("post", "/operator/batch-delete", {
    data: { ids }
  });
}

// 执行算子
export function executeOperator(id: number, input?: any): Promise<any> {
  return http.request<any>("post", `/operator/${id}/execute`, {
    data: { input }
  });
}

// 激活算子
export function activateOperator(id: number): Promise<void> {
  return http.request<void>("post", `/operator/${id}/activate`);
}

// 停用算子
export function deactivateOperator(id: number): Promise<void> {
  return http.request<void>("post", `/operator/${id}/deactivate`);
}

// 获取算子执行记录
export function getOperatorExecutions(id: number): Promise<any[]> {
  return http.request<any[]>("get", `/operator/${id}/executions`);
}

// 搜索算子
export function searchOperators(keyword: string): Promise<Operator[]> {
  return http.request<Operator[]>("get", "/operator/search", {
    params: { keyword }
  });
}

// 根据类型获取算子
export function getOperatorsByType(type: OperatorType): Promise<Operator[]> {
  return http.request<Operator[]>("get", "/operator/by-type", {
    params: { type }
  });
}

// 根据状态获取算子
export function getOperatorsByStatus(status: string): Promise<Operator[]> {
  return http.request<Operator[]>("get", "/operator/by-status", {
    params: { status }
  });
}

// 根据分类获取算子
export function getOperatorsByCategory(
  categoryId: number
): Promise<Operator[]> {
  return http.request<Operator[]>("get", "/operator/by-category", {
    params: { categoryId }
  });
}

// 获取算子统计信息
export function getOperatorStats(): Promise<any> {
  return http.request<any>("get", "/operator/stats");
}

// 获取算子仪表板数据
export function getOperatorDashboard(): Promise<any> {
  return http.request<any>("get", "/operator/dashboard");
}

// 导出算子数据
export function exportOperators(params: {
  keyword?: string;
  type?: OperatorType;
  categoryId?: string | number | number[];
  status?: string;
  author?: string;
}): Promise<Blob> {
  return http.request<Blob>("get", "/operator/export", {
    params,
    responseType: "blob" // 指定响应类型为blob，用于文件下载
  });
}
