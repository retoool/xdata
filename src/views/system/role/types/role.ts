export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  menus: BackendRoute[];
  userCount?: number;
  permissionCount?: number;
  createTime: string;
  updateTime: string;
  sort?: number;
}

export interface RoleFormData {
  id?: number;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  userCount?: number;
  permissionCount?: number;
  createTime?: string;
  updateTime?: string;
  sort?: number;
}

export interface RoleSearchParams {
  keyword?: string;
  page: number;
  size: number;
}

export const DEFAULT_ROLE: RoleFormData = {
  name: "",
  code: "",
  description: "",
  permissions: [],
  userCount: 0,
  permissionCount: 0,
};
