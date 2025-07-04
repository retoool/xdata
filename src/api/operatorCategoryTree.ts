import { http } from '@/utils/http';
import { OperatorType } from './operator';

// 获取分类树
export function fetchCategoryTree(type?: OperatorType) {
  const params = type ? { type } : {};
  return http.get('/api/operatorCategoryTree', { params });
}

// 新增节点（只用 label 字段）
export function addCategoryNode(data: { parentId?: number; label: string; type?: OperatorType }) {
  const params = data.type ? { type: data.type } : {};
  return http.post('/api/operatorCategoryTree', { data, params });
}

// 编辑节点
export function editCategoryNode(id: number, data: { label: string }, operatorType?: OperatorType) {
  const params = operatorType ? { type: operatorType } : {};
  return http.request('put', `/api/operatorCategoryTree/${id}`, { data, params });
}

// 删除节点
export function deleteCategoryNode(id: number, operatorType?: OperatorType) {
  const params = operatorType ? { type: operatorType } : {};
  return http.request('delete', `/api/operatorCategoryTree/${id}`, { params });
}

// 批量删除
export function batchDeleteCategoryNodes(ids: number[], operatorType?: OperatorType) {
  const params = operatorType ? { type: operatorType } : {};
  return http.post('/api/operatorCategoryTree/batch-delete', { data: { ids }, params });
}

// 拖拽/移动节点
export function moveCategoryNode(data: { id: number; targetId: number; type: string }, operatorType?: OperatorType) {
  const params = operatorType ? { type: operatorType } : {};
  return http.post('/api/operatorCategoryTree/move', { data, params });
} 