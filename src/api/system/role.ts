import { http } from "@/utils/http";
import type { Role, RoleFormData, RoleSearchParams } from "@/views/system/role/types/role";
import type { User } from "@/views/system/user/types/user";

/**
 * 角色管理相关API
 */
export class RoleApi {
  /**
   * 获取角色列表（分页）
   */
  static async getRoleList(
    params?: RoleSearchParams
  ): Promise<PageResult<Role>> {
    return http.request<PageResult<Role>>("GET", "/system/role/list", {
      params
    });
  }

  /**
   * 获取所有角色（不分页）
   */
  static async getAllRoles(): Promise<Role[]> {
    return http.request<Role[]>("GET", "/system/role/all");
  }

  /**
   * 根据ID获取角色详情
   */
  static async getRoleById(id: number): Promise<Role> {
    return http.request<Role>("GET", `/system/role/${id}`);
  }

  /**
   * 创建角色
   */
  static async createRole(data: RoleFormData): Promise<Role> {
    return http.request<Role>("POST", "/system/role", { data });
  }

  /**
   * 更新角色
   */
  static async updateRole(
    id: number,
    data: Partial<RoleFormData>
  ): Promise<Role> {
    return http.request<Role>("POST", `/system/role/${id}`, { data });
  }

  /**
   * 删除角色
   */
  static async deleteRole(id: number): Promise<void> {
    return http.request<void>("POST", `/system/role/${id}/delete`);
  }

  /**
   * 检查角色编码是否可用
   */
  static async checkRoleCode(
    code: string,
    excludeId?: number
  ): Promise<boolean> {
    return http.request<boolean>("POST", "/system/role/check-code", {
      data: { code, excludeId }
    });
  }

  /**
   * 检查角色名称是否可用
   */
  static async checkRoleName(
    name: string,
    excludeId?: number
  ): Promise<boolean> {
    return http.request<boolean>("POST", "/system/role/check-name", {
      data: { name, excludeId }
    });
  }

  /**
   * 分配角色权限
   */
  static async assignRoleMenus(id: number, menuIds: number[]): Promise<void> {
    return http.request<void>("POST", `/system/role/${id}/menus`, {
      data: { menuIds }
    });
  }

  /**
   * 获取角色权限
   */
  static async getRoleMenus(id: number): Promise<BackendRoute[]> {
    return http.request<any[]>("GET", `/system/role/${id}/menus`);
  }

  /**
   * 获取角色关联的用户
   */
  static async getRoleUsers(
    id: number,
    params?: PageParams
  ): Promise<PageResult<User>> {
    return http.request<PageResult<User>>("GET", `/system/role/${id}/users`, {
      params
    });
  }

  /**
   * 为角色分配用户
   */
  static async assignRoleUsers(id: number, userIds: number[]): Promise<void> {
    return http.request<void>("POST", `/system/role/${id}/users`, {
      data: { userIds }
    });
  }

  /**
   * 复制角色
   */
  static async copyRole(sourceId: number, name: string, code: string): Promise<Role> {
    return http.request<Role>("POST", `/system/role/${sourceId}/copy`, {
      data: { name, code}
    });
  }

  /**
   * 获取角色数据权限
   */
  static async getRoleDataScope(id: number): Promise<any> {
    return http.request<any>("GET", `/system/role/${id}/data-scope`);
  }

  /**
   * 设置角色数据权限
   */
  static async setRoleDataScope(id: number, dataScope: any): Promise<void> {
    return http.request<void>("POST", `/system/role/${id}/data-scope`, {
      data: dataScope
    });
  }

  /**
   * 导出角色数据
   */
  static async exportRoles(params?: RoleSearchParams): Promise<Blob> {
    return http.request<Blob>("GET", "/system/role/export", { params });
  }

  /**
   * 批量更新角色排序
   */
  static async updateRoleSort(items: { id: number; sort: number }[]): Promise<void> {
    return http.request<void>("POST", "/system/role/sort", {
      data: { items }
    });
  }
}

// 导出常用方法
export const {
  getRoleList,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  checkRoleCode,
  checkRoleName,
  assignRoleMenus,
  getRoleMenus,
  getRoleUsers,
  assignRoleUsers,
  copyRole,
  getRoleDataScope,
  setRoleDataScope,
  exportRoles,
  updateRoleSort
} = RoleApi;
