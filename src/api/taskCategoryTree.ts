import { http } from '@/utils/http';

// 获取树
export function getTaskCategoryTree() {
  return http.request('get', '/mock/task-category-tree');
}

// 新增节点
export function addTaskCategoryNode(data: { parentId: string; name: string; id: string }) {
  return http.request('post', '/mock/task-category-tree', { data });
}

// 删除节点（用 POST 代替 DELETE）
export function deleteTaskCategoryNode(data: { id: string }) {
  return http.request('post', '/mock/task-category-tree/delete', { data });
}

// 重命名节点
export function renameTaskCategoryNode(data: { id: string; name: string }) {
  return http.request('post', '/mock/task-category-tree/rename', { data });
}

// 移动节点
export function moveTaskCategoryNode(data: { id: string; newParentId: string }) {
  return http.request('post', '/mock/task-category-tree/move', { data });
} 