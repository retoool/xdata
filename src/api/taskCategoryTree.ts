import { http } from "@/utils/http";

export interface CategoryNode {
  id: number;
  label: string;
  children?: CategoryNode[];
}

export interface CategoryTreeResponse {
  code: number;
  msg: string;
  data: CategoryNode[];
}

export interface CategoryNodeParams {
  parentId: number;
  label: string;
}

// 获取分类树
export function fetchCategoryTree() {
  return http.request<CategoryTreeResponse>("get", "/category/tree");
}

// 新增分类节点
export function addCategoryNode(data: CategoryNodeParams) {
  return http.request<CategoryTreeResponse>("post", "/category", { data });
}

// 编辑分类节点
export function editCategoryNode(id: number, data: CategoryNodeParams) {
  return http.request<CategoryTreeResponse>("put", `/category/${id}`, { data });
}

// 删除分类节点
export function deleteCategoryNode(id: number) {
  return http.request<CategoryTreeResponse>("delete", `/category/${id}`);
}

// 批量删除分类节点
export function batchDeleteCategoryNodes(ids: number[]) {
  return http.request<CategoryTreeResponse>("delete", "/category/batch", {
    data: { ids }
  });
}

// 移动分类节点
export function moveCategoryNode(id: number, targetId: number) {
  return http.request<CategoryTreeResponse>("post", `/category/${id}/move`, {
    data: { targetId }
  });
}
