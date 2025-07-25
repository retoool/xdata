import type { Role } from "@/views/system/role/types/role";

export interface User {
  id: number;
  username: string;
  password?: string;
  realName: string;
  avatar?: string;
  employeeNo?: string;
  email?: string;
  phone?: string;
  departmentId: number;
  departmentName?: string;
  roleIds: number[];
  roles?: Role[];
  status: number; // 1:启用 0:禁用
  lastLoginTime?: string;
  createTime: string;
  updateTime: string;
}

export interface UserFormData {
  id?: number;
  username: string;
  password?: string;
  realName: string;
  avatar?: string;
  employeeNo?: string;
  email?: string;
  phone?: string;
  departmentId?: number;
  roleIds: number[];
  status: number;
}

export interface UserSearchParams {
  departmentId?: number | null;
  status?: number;
  roleId?: number;
  createTimeRange?: string[];
  keyword?: string;
  page: number;
  size: number;
}

export const DEFAULT_USER: UserFormData = {
  username: "",
  realName: "",
  email: "",
  phone: "",
  employeeNo: "",
  departmentId: 1, // 系统部门
  roleIds: [],
  status: 1
};
