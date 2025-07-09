import { http } from '@/utils/http'
import type {
  Department,
  DepartmentSearchParams,
  PageResult
} from '@/types/system'

/**
 * 部门管理相关API
 */
export class DepartmentApi {
  /**
   * 获取部门树
   */
  static async getDepartmentTree(): Promise<Department[]> {
    return http.request<Department[]>('GET', '/system/department/tree')
  }

  /**
   * 获取部门列表（分页）
   */
  static async getDepartmentList(params?: DepartmentSearchParams): Promise<PageResult<Department>> {
    return http.request<PageResult<Department>>('GET', '/system/department/list', { params })
  }

  /**
   * 根据ID获取部门详情
   */
  static async getDepartmentById(id: number): Promise<Department> {
    return http.request<Department>('GET', `/system/department/${id}`)
  }

  /**
   * 创建部门
   */
  static async createDepartment(data: Partial<Department>): Promise<Department> {
    return http.request<Department>('POST', '/system/department', { data })
  }

  /**
   * 更新部门
   */
  static async updateDepartment(id: number, data: Partial<Department>): Promise<Department> {
    return http.request<Department>('POST', `/system/department/${id}`, { data })
  }

  /**
   * 删除部门
   */
  static async deleteDepartment(id: number): Promise<void> {
    return http.request<void>('POST', `/system/department/${id}/delete`)
  }

  /**
   * 批量删除部门
   */
  static async batchDeleteDepartments(ids: number[]): Promise<void> {
    return http.request<void>('POST', '/system/department/batch-delete', { data: { ids } })
  }

  /**
   * 移动部门（更改父级部门）
   */
  static async moveDepartment(id: number, parentId: number | null): Promise<void> {
    return http.request<void>('POST', `/system/department/${id}/move`, { data: { parentId } })
  }

  /**
   * 获取部门路径
   */
  static async getDepartmentPath(id: number): Promise<string[]> {
    return http.request<string[]>('GET', `/system/department/${id}/path`)
  }

  /**
   * 检查部门名称是否可用
   */
  static async checkDepartmentName(name: string, parentId?: number | null, excludeId?: number): Promise<boolean> {
    return http.request<boolean>('POST', '/system/department/check-name', {
      data: { name, parentId, excludeId }
    })
  }

  /**
   * 获取部门下的用户数量
   */
  static async getDepartmentUserCount(id: number): Promise<number> {
    return http.request<number>('GET', `/system/department/${id}/user-count`)
  }

  /**
   * 更新部门排序
   */
  static async updateDepartmentSort(items: { id: number; sort: number }[]): Promise<void> {
    return http.request<void>('POST', '/system/department/sort', { data: { items } })
  }
}

// 导出常用方法
export const {
  getDepartmentTree,
  getDepartmentList,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  batchDeleteDepartments,
  moveDepartment,
  getDepartmentPath,
  checkDepartmentName,
  getDepartmentUserCount,
  updateDepartmentSort
} = DepartmentApi 