import { http } from "@/utils/http";
import type {
  Department,
  DepartmentFormData,
} from "@/views/system/user/types/department";

/**
 * 部门管理相关API
 */
export class DepartmentApi {


  /**
   * 获取部门树形结构
   */
  static async getDepartmentTree(): Promise<Department[]> {
    return http.request<Department[]>("GET", "/system/department/tree");
  }

  /**
   * 根据ID获取部门详情
   */
  static async getDepartmentById(id: number): Promise<Department> {
    return http.request<Department>("GET", `/system/department/${id}`);
  }

  /**
   * 创建部门
   */
  static async createDepartment(data: DepartmentFormData): Promise<Department> {
    return http.request<Department>("POST", "/system/department", { data });
  }

  /**
   * 更新部门
   */
  static async updateDepartment(
    id: number,
    data: Partial<DepartmentFormData>
  ): Promise<Department> {
    return http.request<Department>("POST", `/system/department/${id}`, {
      data
    });
  }

  /**
   * 删除部门
   */
  static async deleteDepartment(id: number): Promise<void> {
    return http.request<void>("POST", `/system/department/${id}/delete`);
  }

  /**
   * 批量删除部门
   */
  static async batchDeleteDepartments(ids: number[]): Promise<void> {
    return http.request<void>("POST", "/system/department/batch-delete", {
      data: { ids }
    });
  }

  /**
   * 更新部门状态
   */
  static async updateDepartmentStatus(
    id: number,
    status: number
  ): Promise<void> {
    return http.request<void>("POST", `/system/department/${id}/status`, {
      data: { status }
    });
  }

  /**
   * 检查部门名称是否可用
   */
  static async checkDepartmentName(
    name: string,
    parentId?: number,
    excludeId?: number
  ): Promise<boolean> {
    return http.request<boolean>("POST", "/system/department/check-name", {
      data: { name, parentId, excludeId }
    });
  }

  /**
   * 获取部门统计信息
   */
  static async getDepartmentStats(): Promise<any> {
    return http.request<any>("GET", "/system/department/stats");
  }
}

// 导出常用方法
export const {
  getDepartmentTree,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  batchDeleteDepartments,
  updateDepartmentStatus,
  checkDepartmentName,
  getDepartmentStats
} = DepartmentApi;
