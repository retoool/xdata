import { http } from '@/utils/http';

// 算子类型枚举
export enum OperatorType {
  BASIC = 'basic',      // 基础算子
  SCRIPT = 'script',    // 脚本算子
  EXTERNAL = 'external', // 外部算子
}

// 算子接口
export interface Operator {
  id: number;
  name: string;
  type: OperatorType;
  categoryId: number;
  categoryPath?: string[];  // 所属分类路径
  description: string;
  version: string;
  author: string;
  inputSchema?: string;     // 输入参数Schema (JSON Schema)
  outputSchema?: string;    // 输出参数Schema (JSON Schema)
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
}) {
  return http.get('/api/operators', { params });
}

// 获取算子详情
export function fetchOperatorDetail(id: number) {
  return http.get(`/api/operators/${id}`);
}

// 新增算子
export function addOperator(data: Partial<Operator>) {
  return http.post('/api/operators', { data });
}

// 更新算子
export function updateOperator(id: number, data: Partial<Operator>) {
  return http.request('put', `/api/operators/${id}`, { data });
}

// 删除算子
export function deleteOperator(id: number) {
  return http.request('delete', `/api/operators/${id}`);
}

// 批量删除算子
export function batchDeleteOperators(ids: number[]) {
  return http.post('/api/operators/batch-delete', { data: { ids } });
}

// 导出算子
export function exportOperators(params: {
  categoryId?: string | number;
  type?: OperatorType;
  keyword?: string;
}) {
  return http.get('/api/operators/export', {
    params,
    responseType: 'blob'
  });
} 