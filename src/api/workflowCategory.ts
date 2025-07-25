import { http } from "@/utils/http";
import type { ApiResponse } from "./workflow";

// 分类树节点类型
export interface CategoryNode {
  id: number;
  label: string;
  children?: CategoryNode[];
}

// 分类节点操作参数
export interface CategoryNodeParams {
  id?: number;
  label: string;
  parentId?: number;
}

// 获取分类树
export const getCategoryTree = () => {
  return http.request<ApiResponse<CategoryNode[]>>(
    "get",
    "/workflow/category/tree"
  );
};

// 添加分类节点
export const addCategoryNode = (data: CategoryNodeParams) => {
  return http.request<ApiResponse<CategoryNode>>("post", "/workflow/category", {
    data
  });
};

// 更新分类节点
export const updateCategoryNode = (data: CategoryNodeParams) => {
  return http.request<ApiResponse<CategoryNode>>(
    "put",
    `/workflow/category/${data.id}`,
    { data }
  );
};

// 删除分类节点
export const deleteCategoryNode = (id: number) => {
  return http.request<ApiResponse<void>>("delete", `/workflow/category/${id}`);
};

// 批量删除分类节点
export const batchDeleteCategoryNodes = (ids: number[]) => {
  return http.request<ApiResponse<void>>("delete", "/workflow/category/batch", {
    data: { ids }
  });
};

// 移动分类节点
export const moveCategoryNode = (data: {
  id: number;
  targetId: number;
  position: "before" | "after" | "inner";
}) => {
  return http.request<ApiResponse<void>>(
    "put",
    `/workflow/category/${data.id}/move`,
    { data }
  );
};
