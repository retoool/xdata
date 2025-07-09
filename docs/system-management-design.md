# 系统管理模块设计方案

## 概述

本文档描述了系统管理模块的完整设计方案，包含用户管理、角色管理、菜单管理三个核心子模块。设计基于现有项目架构，采用左侧树形结构 + 右侧内容区域的经典布局模式。

## 目录结构

```
src/
├── views/
│   └── system/
│       ├── user/
│       │   ├── index.vue              # 用户管理主页面
│       │   ├── DepartmentTree.vue     # 部门树组件
│       │   ├── UserTable.vue          # 用户列表组件
│       │   └── components/
│       │       ├── UserForm.vue       # 用户表单
│       │       └── DepartmentForm.vue # 部门表单
│       ├── role/
│       │   ├── index.vue              # 角色管理主页面
│       │   ├── RoleTable.vue          # 角色列表组件
│       │   └── components/
│       │       ├── RoleForm.vue       # 角色表单
│       │       └── MenuPermission.vue # 菜单权限配置
│       └── menu/
│           ├── index.vue              # 菜单管理主页面
│           ├── MenuTable.vue          # 菜单列表组件
│           └── components/
│               └── MenuForm.vue       # 菜单表单
├── api/
│   └── system/
│       ├── user.ts                    # 用户相关API
│       ├── department.ts              # 部门相关API
│       ├── role.ts                    # 角色相关API
│       └── menu.ts                    # 菜单相关API
├── store/
│   └── modules/
│       └── system.ts                  # 系统管理状态管理
├── router/
│   └── modules/
│       └── system.ts                  # 系统管理路由配置
└── types/
    └── system.d.ts                    # 系统管理类型定义
```

## 一、用户管理模块

### 1.1 功能描述

用户管理模块采用左右分栏布局：
- **左侧部门树**：支持部门的创建、修改、删除、批量删除和模糊搜索
- **右侧用户列表**：根据左侧部门选择显示对应部门的用户，支持用户的增删改查和角色分配

### 1.2 页面布局

```vue
<!-- src/views/system/user/index.vue -->
<template>
  <div class="user-management-page">
    <!-- 左侧部门树 -->
    <div class="department-tree" :class="{ 'collapsed': isTreeCollapsed }">
      <DepartmentTree 
        ref="departmentTreeRef"
        @node-select="handleDepartmentSelect"
        @node-create="handleDepartmentCreate"
        @node-update="handleDepartmentUpdate"
        @node-delete="handleDepartmentDelete"
        @batch-delete="handleDepartmentBatchDelete"
      />
    </div>
    
    <!-- 右侧用户列表 -->
    <div class="content-area" :class="{ 'expanded': isTreeCollapsed }">
      <UserTable 
        ref="userTableRef"
        :selected-department-id="selectedDepartmentId"
        :selected-department-path="selectedDepartmentPath"
        @department-breadcrumb-click="handleDepartmentBreadcrumbClick"
      />
    </div>
    
    <!-- 展开/收起按钮 -->
    <div class="collapse-button" @click="toggleTreeCollapse">
      <el-icon :class="{ 'rotated': isTreeCollapsed }">
        <ArrowLeft />
      </el-icon>
    </div>
  </div>
</template>
```

### 1.3 部门树组件 (DepartmentTree.vue)

#### 功能特性
- **树形展示**：支持无限层级的部门结构
- **搜索功能**：实时模糊搜索部门名称
- **CRUD操作**：右键菜单支持增删改操作
- **批量删除**：支持多选批量删除
- **拖拽排序**：支持拖拽调整部门层级关系

#### 核心功能
```javascript
// 部门树核心方法
const methods = {
  // 搜索部门
  searchDepartment(keyword) {
    this.filterText = keyword;
  },
  
  // 添加部门
  async handleAddDepartment(parentId) {
    const departmentForm = {
      name: '',
      parentId: parentId || null,
      sort: 0,
      description: ''
    };
    // 打开部门表单对话框
    this.showDepartmentForm(departmentForm, 'create');
  },
  
  // 编辑部门
  async handleEditDepartment(node) {
    const departmentForm = { ...node };
    this.showDepartmentForm(departmentForm, 'edit');
  },
  
  // 删除部门
  async handleDeleteDepartment(node) {
    await this.$confirm('确认删除该部门吗？删除后该部门下的子部门和用户将一并删除！', '警告', {
      type: 'warning'
    });
    await deleteDepartment(node.id);
    this.refreshTree();
  },
  
  // 批量删除
  async handleBatchDelete() {
    const selectedNodes = this.$refs.tree.getCheckedNodes();
    if (selectedNodes.length === 0) {
      this.$message.warning('请选择要删除的部门');
      return;
    }
    await this.$confirm(`确认删除选中的 ${selectedNodes.length} 个部门吗？`, '警告', {
      type: 'warning'
    });
    const ids = selectedNodes.map(node => node.id);
    await batchDeleteDepartments(ids);
    this.refreshTree();
  }
};
```

### 1.4 用户列表组件 (UserTable.vue)

#### 功能特性
- **用户列表**：表格展示当前部门的用户信息
- **面包屑导航**：显示当前选中的部门路径
- **用户操作**：新增、编辑、删除、批量删除用户
- **角色分配**：为用户分配角色
- **状态管理**：启用/禁用用户账户
- **高级搜索**：按姓名、工号、邮箱等条件搜索

#### 表格字段
```javascript
const tableColumns = [
  { prop: 'avatar', label: '头像', width: 80 },
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'realName', label: '真实姓名', width: 120 },
  { prop: 'employeeNo', label: '工号', width: 120 },
  { prop: 'email', label: '邮箱', width: 180 },
  { prop: 'phone', label: '手机号', width: 130 },
  { prop: 'roles', label: '角色', width: 150 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'lastLoginTime', label: '最后登录', width: 160 },
  { prop: 'createTime', label: '创建时间', width: 160 },
  { prop: 'actions', label: '操作', width: 200, fixed: 'right' }
];
```

### 1.5 默认数据

系统默认提供以下数据：
- **默认部门**：总公司（根部门）
- **默认用户**：admin（管理员角色）

## 二、角色管理模块

### 2.1 功能描述

角色管理模块负责系统角色的全生命周期管理：
- **角色CRUD**：创建、查看、编辑、删除角色
- **权限配置**：为角色分配菜单访问权限
- **默认角色**：系统预置管理员和普通用户角色

### 2.2 页面布局

```vue
<!-- src/views/system/role/index.vue -->
<template>
  <div class="role-management-page">
    <div class="role-content">
      <RoleTable 
        ref="roleTableRef"
        @role-permission="handleRolePermission"
      />
    </div>
    
    <!-- 权限配置对话框 -->
    <el-dialog 
      v-model="showPermissionDialog" 
      title="配置权限" 
      width="800px"
      :before-close="handlePermissionDialogClose"
    >
      <MenuPermission 
        ref="menuPermissionRef"
        :role-id="currentRoleId"
        @permission-change="handlePermissionChange"
      />
      <template #footer>
        <el-button @click="showPermissionDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

### 2.3 角色表格组件 (RoleTable.vue)

#### 表格字段
```javascript
const roleColumns = [
  { prop: 'name', label: '角色名称', width: 150 },
  { prop: 'code', label: '角色编码', width: 150 },
  { prop: 'description', label: '描述', minWidth: 200 },
  { prop: 'userCount', label: '用户数量', width: 100 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'createTime', label: '创建时间', width: 160 },
  { prop: 'actions', label: '操作', width: 200, fixed: 'right' }
];
```

#### 操作功能
- **新增角色**：打开角色表单，输入基本信息
- **编辑角色**：修改角色基本信息
- **配置权限**：打开权限配置对话框
- **删除角色**：删除角色（需检查是否有用户使用）
- **启用/禁用**：控制角色状态

### 2.4 菜单权限组件 (MenuPermission.vue)

#### 功能特性
- **树形菜单**：以树形结构展示所有系统菜单
- **权限类型**：支持菜单访问权限和按钮操作权限
- **批量操作**：支持全选、反选、展开/折叠
- **实时预览**：实时显示权限配置结果

#### 组件结构
```vue
<template>
  <div class="menu-permission">
    <!-- 操作工具栏 -->
    <div class="permission-toolbar">
      <el-button @click="expandAll">展开全部</el-button>
      <el-button @click="collapseAll">折叠全部</el-button>
      <el-button @click="checkAll">全选</el-button>
      <el-button @click="uncheckAll">取消全选</el-button>
    </div>
    
    <!-- 菜单权限树 -->
    <el-tree
      ref="menuTree"
      :data="menuTreeData"
      :props="treeProps"
      node-key="id"
      show-checkbox
      check-strictly
      :default-checked-keys="checkedMenus"
      @check="handleMenuCheck"
    >
      <template #default="{ node, data }">
        <div class="menu-node">
          <el-icon v-if="data.icon">
            <component :is="data.icon" />
          </el-icon>
          <span class="menu-title">{{ data.title }}</span>
          <span class="menu-path">{{ data.path }}</span>
        </div>
      </template>
    </el-tree>
  </div>
</template>
```

### 2.5 默认角色

系统预置以下角色：

```javascript
const defaultRoles = [
  {
    id: 1,
    name: '系统管理员',
    code: 'admin',
    description: '拥有系统所有权限的超级管理员',
    permissions: ['*'], // 所有权限
    status: 1
  },
  {
    id: 2,
    name: '普通用户',
    code: 'user',
    description: '系统普通用户，具有基础功能权限',
    permissions: [
      '/welcome',
      '/computer/operator',
      '/computer/workflow/list'
    ],
    status: 1
  }
];
```

## 三、菜单管理模块

### 3.1 功能描述

菜单管理模块用于维护系统的菜单结构：
- **菜单配置**：创建、编辑、删除菜单项
- **层级管理**：支持多级菜单嵌套
- **权限控制**：配置菜单访问权限标识
- **排序功能**：调整菜单显示顺序

### 3.2 页面布局

```vue
<!-- src/views/system/menu/index.vue -->
<template>
  <div class="menu-management-page">
    <MenuTable ref="menuTableRef" />
  </div>
</template>
```

### 3.3 菜单表格组件 (MenuTable.vue)

#### 功能特性
- **树形表格**：以表格形式展示菜单层级结构
- **在线编辑**：支持表格内直接编辑菜单信息
- **拖拽排序**：通过拖拽调整菜单顺序
- **图标预览**：实时预览菜单图标效果
- **路径验证**：自动验证路由路径的有效性

#### 表格字段
```javascript
const menuColumns = [
  { prop: 'title', label: '菜单名称', minWidth: 200 },
  { prop: 'icon', label: '图标', width: 80 },
  { prop: 'path', label: '路由路径', width: 200 },
  { prop: 'component', label: '组件路径', width: 200 },
  { prop: 'permission', label: '权限标识', width: 150 },
  { prop: 'sort', label: '排序', width: 80 },
  { prop: 'status', label: '状态', width: 100 },
  { prop: 'actions', label: '操作', width: 200, fixed: 'right' }
];
```

### 3.4 菜单表单组件 (MenuForm.vue)

#### 表单字段
```javascript
const menuFormFields = {
  title: { label: '菜单名称', required: true },
  icon: { label: '菜单图标', type: 'icon-select' },
  path: { label: '路由路径', required: true },
  component: { label: '组件路径' },
  parentId: { label: '父级菜单', type: 'menu-select' },
  permission: { label: '权限标识' },
  sort: { label: '排序号', type: 'number', default: 0 },
  status: { label: '状态', type: 'switch', default: true },
  isHidden: { label: '是否隐藏', type: 'switch', default: false },
  isKeepAlive: { label: '是否缓存', type: 'switch', default: false },
  isAffix: { label: '是否固定', type: 'switch', default: false }
};
```

## 四、数据模型设计

### 4.1 部门模型 (Department)

```typescript
interface Department {
  id: number;
  name: string;
  parentId: number | null;
  level: number;
  sort: number;
  description?: string;
  status: number; // 1:启用 0:禁用
  createTime: string;
  updateTime: string;
  children?: Department[];
}
```

### 4.2 用户模型 (User)

```typescript
interface User {
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
```

### 4.3 角色模型 (Role)

```typescript
interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  permissions: string[];
  userCount?: number;
  status: number; // 1:启用 0:禁用
  createTime: string;
  updateTime: string;
}
```

### 4.4 菜单模型 (Menu)

```typescript
interface Menu {
  id: number;
  title: string;
  icon?: string;
  path: string;
  component?: string;
  parentId: number | null;
  permission?: string;
  sort: number;
  level: number;
  status: number; // 1:启用 0:禁用
  isHidden: boolean;
  isKeepAlive: boolean;
  isAffix: boolean;
  createTime: string;
  updateTime: string;
  children?: Menu[];
}
```

## 五、API接口设计

### 5.1 部门接口

```typescript
// src/api/system/department.ts
export interface DepartmentApi {
  // 获取部门树
  getDepartmentTree(): Promise<Department[]>;
  
  // 获取部门列表
  getDepartmentList(params?: SearchParams): Promise<PageResult<Department>>;
  
  // 创建部门
  createDepartment(data: Partial<Department>): Promise<Department>;
  
  // 更新部门
  updateDepartment(id: number, data: Partial<Department>): Promise<Department>;
  
  // 删除部门
  deleteDepartment(id: number): Promise<void>;
  
  // 批量删除部门
  batchDeleteDepartments(ids: number[]): Promise<void>;
}
```

### 5.2 用户接口

```typescript
// src/api/system/user.ts
export interface UserApi {
  // 获取用户列表
  getUserList(params: UserSearchParams): Promise<PageResult<User>>;
  
  // 创建用户
  createUser(data: Partial<User>): Promise<User>;
  
  // 更新用户
  updateUser(id: number, data: Partial<User>): Promise<User>;
  
  // 删除用户
  deleteUser(id: number): Promise<void>;
  
  // 批量删除用户
  batchDeleteUsers(ids: number[]): Promise<void>;
  
  // 重置用户密码
  resetUserPassword(id: number): Promise<string>;
  
  // 更新用户状态
  updateUserStatus(id: number, status: number): Promise<void>;
}
```

### 5.3 角色接口

```typescript
// src/api/system/role.ts
export interface RoleApi {
  // 获取角色列表
  getRoleList(params?: SearchParams): Promise<PageResult<Role>>;
  
  // 创建角色
  createRole(data: Partial<Role>): Promise<Role>;
  
  // 更新角色
  updateRole(id: number, data: Partial<Role>): Promise<Role>;
  
  // 删除角色
  deleteRole(id: number): Promise<void>;
  
  // 获取角色权限
  getRolePermissions(id: number): Promise<string[]>;
  
  // 更新角色权限
  updateRolePermissions(id: number, permissions: string[]): Promise<void>;
}
```

### 5.4 菜单接口

```typescript
// src/api/system/menu.ts
export interface MenuApi {
  // 获取菜单树
  getMenuTree(): Promise<Menu[]>;
  
  // 获取菜单列表
  getMenuList(params?: SearchParams): Promise<PageResult<Menu>>;
  
  // 创建菜单
  createMenu(data: Partial<Menu>): Promise<Menu>;
  
  // 更新菜单
  updateMenu(id: number, data: Partial<Menu>): Promise<Menu>;
  
  // 删除菜单
  deleteMenu(id: number): Promise<void>;
  
  // 获取用户权限菜单
  getUserMenus(userId: number): Promise<Menu[]>;
}
```

## 六、状态管理设计

### 6.1 系统管理Store

```typescript
// src/store/modules/system.ts
export const useSystemStore = defineStore('system', {
  state: () => ({
    // 用户管理状态
    selectedDepartmentId: null as number | null,
    selectedDepartmentPath: [] as string[],
    isDepartmentTreeCollapsed: false,
    
    // 角色管理状态
    currentEditingRole: null as Role | null,
    
    // 菜单管理状态
    menuTreeData: [] as Menu[],
    expandedMenuKeys: [] as string[],
    
    // 通用状态
    loading: false,
    refreshFlag: 0
  }),
  
  actions: {
    // 设置选中的部门
    setSelectedDepartment(id: number | null, path: string[] = []) {
      this.selectedDepartmentId = id;
      this.selectedDepartmentPath = path;
    },
    
    // 切换部门树折叠状态
    toggleDepartmentTree() {
      this.isDepartmentTreeCollapsed = !this.isDepartmentTreeCollapsed;
    },
    
    // 设置当前编辑的角色
    setCurrentEditingRole(role: Role | null) {
      this.currentEditingRole = role;
    },
    
    // 设置菜单树数据
    setMenuTreeData(data: Menu[]) {
      this.menuTreeData = data;
    },
    
    // 触发刷新
    triggerRefresh() {
      this.refreshFlag++;
    }
  }
});
```

## 七、路由配置

### 7.1 系统管理路由

```typescript
// src/router/modules/system.ts
export default [
  {
    path: "/system",
    name: "System",
    redirect: "/system/user",
    meta: {
      title: "系统管理",
      icon: "setting",
      permission: "system:view"
    },
    children: [
      {
        path: "/system/user",
        name: "SystemUser",
        meta: {
          title: "用户管理",
          permission: "system:user:view"
        },
        component: () => import("@/views/system/user/index.vue")
      },
      {
        path: "/system/role",
        name: "SystemRole",
        meta: {
          title: "角色管理",
          permission: "system:role:view"
        },
        component: () => import("@/views/system/role/index.vue")
      },
      {
        path: "/system/menu",
        name: "SystemMenu",
        meta: {
          title: "菜单管理",
          permission: "system:menu:view"
        },
        component: () => import("@/views/system/menu/index.vue")
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;
```

## 八、权限控制设计

### 8.1 权限标识规范

采用模块:功能:操作的三级权限标识：

```typescript
const permissionCodes = {
  // 系统管理
  'system:view': '系统管理查看',
  
  // 用户管理
  'system:user:view': '用户查看',
  'system:user:create': '用户创建',
  'system:user:update': '用户编辑',
  'system:user:delete': '用户删除',
  'system:user:reset-password': '重置密码',
  
  // 部门管理
  'system:dept:view': '部门查看',
  'system:dept:create': '部门创建',
  'system:dept:update': '部门编辑',
  'system:dept:delete': '部门删除',
  
  // 角色管理
  'system:role:view': '角色查看',
  'system:role:create': '角色创建',
  'system:role:update': '角色编辑',
  'system:role:delete': '角色删除',
  'system:role:permission': '权限配置',
  
  // 菜单管理
  'system:menu:view': '菜单查看',
  'system:menu:create': '菜单创建',
  'system:menu:update': '菜单编辑',
  'system:menu:delete': '菜单删除'
};
```

### 8.2 权限验证组件

```vue
<!-- 按钮权限控制 -->
<el-button 
  v-perms="'system:user:create'"
  type="primary" 
  @click="handleCreate"
>
  新增用户
</el-button>

<!-- 菜单权限控制 -->
<template v-if="hasPermission('system:user:view')">
  <!-- 用户管理内容 -->
</template>
```

## 九、开发计划

### 9.1 第一阶段：基础架构 (1-2天)
- [x] 创建目录结构
- [ ] 配置路由模块
- [ ] 创建基础组件框架
- [ ] 设置状态管理
- [ ] 定义类型接口

### 9.2 第二阶段：用户管理 (3-4天)
- [ ] 部门树组件开发
- [ ] 用户列表组件开发
- [ ] 用户表单组件开发
- [ ] 部门CRUD功能
- [ ] 用户CRUD功能
- [ ] 搜索和筛选功能

### 9.3 第三阶段：角色管理 (2-3天)
- [ ] 角色列表组件开发
- [ ] 角色表单组件开发
- [ ] 权限配置组件开发
- [ ] 角色CRUD功能
- [ ] 权限分配功能

### 9.4 第四阶段：菜单管理 (2天)
- [ ] 菜单列表组件开发
- [ ] 菜单表单组件开发
- [ ] 菜单CRUD功能
- [ ] 菜单排序功能

### 9.5 第五阶段：集成测试 (1天)
- [ ] 权限验证集成
- [ ] 功能联调测试
- [ ] 性能优化
- [ ] 文档完善

## 十、技术要点

### 10.1 关键技术选型
- **UI框架**：Element Plus
- **状态管理**：Pinia
- **路由管理**：Vue Router
- **HTTP客户端**：Axios
- **表单验证**：Async Validator
- **图标库**：Element Plus Icons

### 10.2 性能优化策略
- **组件懒加载**：大型表格采用虚拟滚动
- **接口缓存**：用户、角色、菜单数据适当缓存
- **防抖节流**：搜索输入采用防抖处理
- **分页加载**：大数据量列表采用分页

### 10.3 用户体验优化
- **操作反馈**：所有操作提供明确的成功/失败反馈
- **数据校验**：前端表单验证 + 后端接口验证
- **快捷操作**：支持键盘快捷键操作
- **响应式设计**：适配不同屏幕尺寸

## 十一、总结

本设计方案基于现有项目架构，采用模块化设计理念，实现了完整的系统管理功能。方案具有以下特点：

1. **架构清晰**：模块化设计，职责分离
2. **扩展性强**：支持功能扩展和定制
3. **用户体验好**：直观的操作界面和交互
4. **权限控制完善**：细粒度的权限管理
5. **代码复用性高**：组件化开发，便于维护

该设计方案为系统管理模块的开发提供了详细的指导，确保项目的顺利实施和后期维护。 