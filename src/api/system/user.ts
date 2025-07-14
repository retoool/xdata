import { http } from '@/utils/http'
import type {
  User,
  UserFormData,
  UserSearchParams,
  PageResult
} from '@/types/system'

/**
 * 用户管理相关API
 */
export class UserApi {
  /**
   * 获取用户列表（分页）
   */
  static async getUserList(params: UserSearchParams): Promise<PageResult<User>> {
    return http.request<PageResult<User>>('GET', '/system/user/list', { params })
  }

  /**
   * 根据ID获取用户详情
   */
  static async getUserById(id: number): Promise<User> {
    return http.request<User>('GET', `/system/user/${id}`)
  }

  /**
   * 创建用户
   */
  static async createUser(data: UserFormData): Promise<User> {
    return http.request<User>('POST', '/system/user', { data })
  }

  /**
   * 更新用户
   */
  static async updateUser(id: number, data: Partial<UserFormData>): Promise<User> {
    return http.request<User>('POST', `/system/user/${id}`, { data })
  }

  /**
   * 删除用户
   */
  static async deleteUser(id: number): Promise<void> {
    return http.request<void>('POST', `/system/user/${id}/delete`)
  }

  /**
   * 批量删除用户
   */
  static async batchDeleteUsers(ids: number[]): Promise<void> {
    return http.request<void>('POST', '/system/user/batch-delete', { data: { ids } })
  }

  /**
   * 重置用户密码
   */
  static async resetUserPassword(id: number): Promise<string> {
    return http.request<string>('POST', `/system/user/${id}/reset-password`)
  }

  /**
   * 更新用户状态
   */
  static async updateUserStatus(id: number, status: number): Promise<void> {
    return http.request<void>('POST', `/system/user/${id}/status`, { data: { status } })
  }

  /**
   * 检查用户名是否可用
   */
  static async checkUsername(username: string, excludeId?: number): Promise<boolean> {
    const data: any = { username }
    if (excludeId !== undefined) {
      data.excludeId = excludeId
    }
    return http.request<boolean>('POST', '/system/user/check-username', { data })
  }

  /**
   * 检查邮箱是否可用
   */
  static async checkEmail(email: string, excludeId?: number): Promise<boolean> {
    const data: any = { email }
    if (excludeId !== undefined) {
      data.excludeId = excludeId
    }
    return http.request<boolean>('POST', '/system/user/check-email', { data })
  }

  /**
   * 检查工号是否可用
   */
  static async checkEmployeeNo(employeeNo: string, excludeId?: number): Promise<boolean> {
    const data: any = { employeeNo }
    if (excludeId !== undefined) {
      data.excludeId = excludeId
    }
    return http.request<boolean>('POST', '/system/user/check-employee-no', { data })
  }

  /**
   * 上传用户头像
   */
  static async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    return http.request<string>('POST', '/system/user/upload-avatar', { data: formData })
  }

  /**
   * 更新用户头像
   */
  static async updateUserAvatar(id: number, avatar: string): Promise<void> {
    return http.request<void>('POST', `/system/user/${id}/avatar`, { data: { avatar } })
  }

  /**
   * 分配用户角色
   */
  static async assignUserRoles(id: number, roleIds: number[]): Promise<void> {
    return http.request<void>('POST', `/system/user/${id}/roles`, { data: { roleIds } })
  }

  /**
   * 获取用户权限菜单
   */
  static async getUserMenus(id: number): Promise<any[]> {
    return http.request<any[]>('GET', `/system/user/${id}/menus`)
  }

  /**
   * 导出用户数据
   */
  static async exportUsers(params?: UserSearchParams): Promise<Blob> {
    return http.request<Blob>('GET', '/system/user/export', { params })
  }

  /**
   * 导入用户数据
   */
  static async importUsers(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    return http.request<any>('POST', '/system/user/import', { data: formData })
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<User> {
    return http.request<User>('GET', '/system/user/current')
  }

  /**
   * 更新当前用户信息
   */
  static async updateCurrentUser(data: Partial<User>): Promise<User> {
    return http.request<User>('POST', '/system/user/current', { data })
  }

  /**
   * 修改当前用户密码
   */
  static async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return http.request<void>('POST', '/system/user/change-password', {
      data: { oldPassword, newPassword }
    })
  }
}

// 导出常用方法
export const {
  getUserList,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  resetUserPassword,
  updateUserStatus,
  checkUsername,
  checkEmail,
  checkEmployeeNo,
  uploadAvatar,
  updateUserAvatar,
  assignUserRoles,
  getUserMenus,
  exportUsers,
  importUsers,
  getCurrentUser,
  updateCurrentUser,
  changePassword
} = UserApi 


export type LoginData = {
  avatar: string;
  username: string;
  nickname: string;
  roles: Array<string>;
  permissions: Array<string>;
  accessToken: string;
  refreshToken: string;
  expires: Date;
};

export type RefreshTokenData = {
  accessToken: string;
  refreshToken: string;
  expires: Date;
};

export type UpdateUserInfoData = {
  realName?: string;
  employeeNo?: string;
  email?: string;
  phone?: string;
  avatar?: string;
};

/** 登录 */
export const getLogin = (data?: object): Promise<LoginData> => {
  return http.request<LoginData>("post", "/login", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object): Promise<RefreshTokenData> => {
  return http.request<RefreshTokenData>("post", "/refresh-token", { data });
};

/** 更新用户信息（当前用户） */
export const updateUserInfo = (data: UpdateUserInfoData): Promise<void> => {
  return http.request<void>("put", "/system/user/profile", { data });
};

/** 注销用户 */
export const logoutUser = (): Promise<void> => {
  return http.request<void>("post", "/system/user/logout", {});
}; 