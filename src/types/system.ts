/**
 * 系统管理模块类型定义
 */

// 基础分页参数
export interface PageParams {
  page: number
  size: number
}

// 基础搜索参数
export interface SearchParams extends PageParams {
  keyword?: string
}

// 分页结果
export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

// 部门模型
export interface Department {
  id: number
  name: string
  parentId: number | null
  sort: number
  status: number
  children?: Department[]
  userCount?: number
}

// 用户模型
export interface User {
  id: number
  username: string
  password?: string
  realName: string
  avatar?: string
  employeeNo?: string
  email?: string
  phone?: string
  departmentId: number
  departmentName?: string
  roleIds: number[]
  roles?: Role[]
  status: number // 1:启用 0:禁用
  lastLoginTime?: string
  createTime: string
  updateTime: string
}

// 角色模型
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  permissions: string[]
  userCount?: number
  status: number // 1:启用 0:禁用
  createTime: string
  updateTime: string
}

// 菜单模型
export interface Menu {
  id: number
  title: string
  name?: string
  icon?: string
  path: string
  component?: string
  parentId: number | null
  sort: number
  level: number
  type?: number
  status: number // 1:启用 0:禁用
  isHidden: boolean
  isKeepAlive: boolean
  isAffix: boolean
  visible?: boolean
  cache?: boolean
  affix?: boolean
  redirect?: string
  alwaysShow?: boolean
  disabled?: boolean
  createTime: string
  updateTime: string
  children?: Menu[]
}

// 用户搜索参数
export interface UserSearchParams extends SearchParams {
  departmentId?: number | null
  status?: number
  roleId?: number
  createTimeRange?: string[]
}

// 角色搜索参数
export interface RoleSearchParams extends SearchParams {
  status?: number
}

// 菜单搜索参数
export interface MenuSearchParams extends SearchParams {
  status?: number
  parentId?: number | null
}

// 部门搜索参数
export interface DepartmentSearchParams extends SearchParams {
  status?: number
  parentId?: number | null
}

// 表单模式
export type FormMode = 'create' | 'edit' | 'view' | 'copy'

// 用户表单数据
export interface UserFormData {
  id?: number
  username: string
  password?: string
  realName: string
  avatar?: string
  employeeNo?: string
  email?: string
  phone?: string
  departmentId?: number
  roleIds: number[]
  status: number
}

// 角色表单数据
export interface RoleFormData {
  id?: number
  name: string
  code: string
  description?: string
  permissions: string[]
  status: number
  userCount?: number
  createTime?: string
  updateTime?: string
}

// 菜单表单数据
export interface MenuFormData {
  id?: number
  title: string
  name?: string
  icon?: string
  path: string
  component?: string
  parentId?: number | null
  sort: number
  type?: number
  status: number
  isHidden: boolean
  isKeepAlive: boolean
  isAffix: boolean
  visible?: boolean
  cache?: boolean
  affix?: boolean
  redirect?: string
  alwaysShow?: boolean
}

// 部门表单数据
export interface DepartmentFormData {
  id?: number
  name: string
  parentId?: number | null
  sort: number
  description?: string
  status: number
}

// 部门统计信息
export interface DepartmentStats {
  totalDepartments: number
  activeDepartments: number
  inactiveDepartments: number
  totalUsers: number
}

// 权限标识枚举
export enum PermissionCode {
  // 系统管理
  SYSTEM_VIEW = 'system:view',

  // 用户管理
  USER_VIEW = 'system:user:view',
  USER_CREATE = 'system:user:create',
  USER_UPDATE = 'system:user:update',
  USER_DELETE = 'system:user:delete',
  USER_RESET_PASSWORD = 'system:user:reset-password',

  // 部门管理
  DEPT_VIEW = 'system:dept:view',
  DEPT_CREATE = 'system:dept:create',
  DEPT_UPDATE = 'system:dept:update',
  DEPT_DELETE = 'system:dept:delete',

  // 角色管理
  ROLE_VIEW = 'system:role:view',
  ROLE_CREATE = 'system:role:create',
  ROLE_UPDATE = 'system:role:update',
  ROLE_DELETE = 'system:role:delete',
  ROLE_PERMISSION = 'system:role:permission',

  // 菜单管理
  MENU_VIEW = 'system:menu:view',
  MENU_CREATE = 'system:menu:create',
  MENU_UPDATE = 'system:menu:update',
  MENU_DELETE = 'system:menu:delete'
}

// 状态枚举
export enum Status {
  DISABLED = 0,
  ENABLED = 1
}

// 性别枚举
export enum Gender {
  MALE = 1,
  FEMALE = 2
}

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 1, // 目录
  MENU = 2,      // 菜单
  BUTTON = 3     // 按钮
}

// 系统管理状态接口
export interface SystemState {
  // 用户管理状态
  selectedDepartmentId: number | null
  selectedDepartmentPath: string[]
  isDepartmentTreeCollapsed: boolean

  // 角色管理状态
  currentEditingRole: Role | null

  // 菜单管理状态
  menuTreeData: Menu[]
  expandedMenuKeys: string[]

  // 通用状态
  loading: boolean
  refreshFlag: number
}

// API响应接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 树形节点接口
export interface TreeNode {
  id: number | string
  label: string
  children?: TreeNode[]
  [key: string]: any
}

// 下拉选项接口
export interface SelectOption {
  label: string
  value: any
  disabled?: boolean
  [key: string]: any
}

// 表单验证规则
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: string | string[]
  validator?: (rule: any, value: any, callback: any) => void
  [key: string]: any
}

// 表格列配置
export interface TableColumn {
  prop?: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean | string
  sortable?: boolean
  showOverflowTooltip?: boolean
  align?: string
  [key: string]: any
}

// 操作按钮配置
export interface ActionButton {
  label: string
  type?: string
  size?: string
  icon?: string
  permission?: string
  disabled?: boolean
  loading?: boolean
  onClick: (row?: any) => void
}

// 默认数据
export const DEFAULT_DEPARTMENT: DepartmentFormData = {
  name: '',
  parentId: null,
  sort: 0,
  description: '',
  status: Status.ENABLED
}

export const DEFAULT_USER: UserFormData = {
  username: '',
  realName: '',
  email: '',
  phone: '',
  employeeNo: '',
  departmentId: undefined,
  roleIds: [],
  status: Status.ENABLED
}

export const DEFAULT_ROLE: RoleFormData = {
  name: '',
  code: '',
  description: '',
  permissions: [],
  status: Status.ENABLED
}

export const DEFAULT_MENU: MenuFormData = {
  title: '',
  icon: '',
  path: '',
  component: '',
  parentId: null,
  sort: 0,
  status: Status.ENABLED,
  isHidden: false,
  isKeepAlive: false,
  isAffix: false
} 