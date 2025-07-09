import { defineFakeRoute } from "vite-plugin-fake-server/client";
import type { Menu } from "@/types/system";

// 模拟菜单数据，基于现有路由配置
let menuData: Menu[] = [
  {
    id: 1,
    title: "首页",
    name: "Home",
    icon: "HomeFilled",
    path: "/",
    component: "@/layout/index",
    parentId: null,
    sort: 0,
    level: 1,
    type: 1, // 目录
    status: 1,
    isHidden: false,
    isKeepAlive: false,
    isAffix: false,
    visible: true,
    cache: false,
    affix: false,
    redirect: "/welcome",
    alwaysShow: false,
    createTime: "2024-01-01 00:00:00",
    updateTime: "2024-01-01 00:00:00",
    children: [
      {
        id: 2,
        title: "首页",
        name: "Welcome",
        icon: "HomeFilled",
        path: "/welcome",
        component: "@/views/welcome/index",
        parentId: 1,
        sort: 0,
        level: 2,
        type: 2, // 菜单
        status: 1,
        isHidden: false,
        isKeepAlive: false,
        isAffix: false,
        visible: true,
        cache: false,
        affix: false,
        redirect: "",
        alwaysShow: false,
        createTime: "2024-01-01 00:00:00",
        updateTime: "2024-01-01 00:00:00"
      }
    ]
  },
  {
    id: 3,
    title: "系统管理",
    name: "System",
    icon: "Setting",
    path: "/system",
    component: "",
    parentId: null,
    sort: 999,
    level: 1,
    type: 1, // 目录
    status: 1,
    isHidden: false,
    isKeepAlive: false,
    isAffix: false,
    visible: true,
    cache: false,
    affix: false,
    redirect: "",
    alwaysShow: false,
    createTime: "2024-01-01 00:00:00",
    updateTime: "2024-01-01 00:00:00",
    children: [
      {
        id: 4,
        title: "用户管理",
        name: "SystemUser",
        icon: "User",
        path: "/system/user",
        component: "@/views/system/user/index",
        parentId: 3,
        sort: 1,
        level: 2,
        type: 2, // 菜单
        status: 1,
        isHidden: false,
        isKeepAlive: true,
        isAffix: false,
        visible: true,
        cache: true,
        affix: false,
        redirect: "",
        alwaysShow: false,
        createTime: "2024-01-01 00:00:00",
        updateTime: "2024-01-01 00:00:00"
      },
      {
        id: 5,
        title: "角色管理",
        name: "SystemRole",
        icon: "UserFilled",
        path: "/system/role",
        component: "@/views/system/role/index",
        parentId: 3,
        sort: 2,
        level: 2,
        type: 2, // 菜单
        status: 1,
        isHidden: false,
        isKeepAlive: true,
        isAffix: false,
        visible: true,
        cache: true,
        affix: false,
        redirect: "",
        alwaysShow: false,
        createTime: "2024-01-01 00:00:00",
        updateTime: "2024-01-01 00:00:00"
      },
      {
        id: 6,
        title: "菜单管理",
        name: "SystemMenu",
        icon: "Menu",
        path: "/system/menu",
        component: "@/views/system/menu/index",
        parentId: 3,
        sort: 3,
        level: 2,
        type: 2, // 菜单
        status: 1,
        isHidden: false,
        isKeepAlive: true,
        isAffix: false,
        visible: true,
        cache: true,
        affix: false,
        redirect: "",
        alwaysShow: false,
        createTime: "2024-01-01 00:00:00",
        updateTime: "2024-01-01 00:00:00"
      }
    ]
  },
  {
    id: 7,
    title: "计算管理",
    name: "Computer",
    icon: "Monitor",
    path: "/computer",
    component: "",
    parentId: null,
    sort: 100,
    level: 1,
    type: 1, // 目录
    status: 1,
    isHidden: false,
    isKeepAlive: false,
    isAffix: false,
    visible: true,
    cache: false,
    affix: false,
    redirect: "/computer/operator",
    alwaysShow: false,
    createTime: "2024-01-01 00:00:00",
    updateTime: "2024-01-01 00:00:00",
    children: [
      {
        id: 8,
        title: "算子管理",
        name: "Operator",
        icon: "Operation",
        path: "/computer/operator",
        component: "@/views/computer/operator/index",
        parentId: 7,
        sort: 1,
        level: 2,
        type: 2, // 菜单
        status: 1,
        isHidden: false,
        isKeepAlive: false,
        isAffix: false,
        visible: true,
        cache: false,
        affix: false,
        redirect: "",
        alwaysShow: false,
        createTime: "2024-01-01 00:00:00",
        updateTime: "2024-01-01 00:00:00"
      },
      {
        id: 9,
        title: "工作流管理",
        name: "ComputerWorkflow",
        icon: "SetUp",
        path: "/computer/workflow/list",
        component: "@/views/computer/workflow/list/index",
        parentId: 7,
        sort: 2,
        level: 2,
        type: 2, // 菜单
        status: 1,
        isHidden: false,
        isKeepAlive: false,
        isAffix: false,
        visible: true,
        cache: false,
        affix: false,
        redirect: "",
        alwaysShow: false,
        createTime: "2024-01-01 00:00:00",
        updateTime: "2024-01-01 00:00:00"
      },
      {
        id: 10,
        title: "工作流设计器",
        name: "ComputerWorkflowDesigner",
        icon: "Edit",
        path: "/computer/workflow/designer/:id",
        component: "@/views/computer/workflow/designer/index",
        parentId: 7,
        sort: 3,
        level: 2,
        type: 2, // 菜单
        status: 1,
        isHidden: true, // 隐藏菜单，不在侧边栏显示
        isKeepAlive: false,
        isAffix: false,
        visible: false,
        cache: false,
        affix: false,
        redirect: "",
        alwaysShow: false,
        createTime: "2024-01-01 00:00:00",
        updateTime: "2024-01-01 00:00:00"
      }
    ]
  }
];

// 辅助函数：根据ID查找菜单项
function findMenuById(id: number, menus: Menu[] = menuData): Menu | null {
  for (const menu of menus) {
    if (menu.id === id) return menu;
    if (menu.children) {
      const found = findMenuById(id, menu.children);
      if (found) return found;
    }
  }
  return null;
}

// 辅助函数：根据ID查找父菜单和索引
function findParentMenu(id: number, menus: Menu[] = menuData): { parent: Menu | null; index: number } {
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i];
    if (menu.children) {
      const childIndex = menu.children.findIndex(child => child.id === id);
      if (childIndex !== -1) {
        return { parent: menu, index: childIndex };
      }
      const result = findParentMenu(id, menu.children);
      if (result.parent) return result;
    }
  }
  return { parent: null, index: -1 };
}

// 辅助函数：生成新的菜单ID
function generateMenuId(): number {
  const allIds: number[] = [];

  function collectIds(menus: Menu[]) {
    menus.forEach(menu => {
      allIds.push(menu.id);
      if (menu.children) {
        collectIds(menu.children);
      }
    });
  }

  collectIds(menuData);
  return Math.max(...allIds) + 1;
}

// 辅助函数：扁平化菜单树
function flattenMenus(menus: Menu[]): Menu[] {
  const result: Menu[] = [];

  function traverse(menuList: Menu[]) {
    menuList.forEach(menu => {
      const { children, ...menuWithoutChildren } = menu;
      result.push(menuWithoutChildren as Menu);
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  }

  traverse(menus);
  return result;
}

// 辅助函数：检查路径是否已存在
function isPathExists(path: string, excludeId?: number): boolean {
  const flatMenus = flattenMenus(menuData);
  return flatMenus.some(menu =>
    menu.path === path && menu.id !== excludeId
  );
}

// 辅助函数：检查名称是否已存在（同一级别下）
function isNameExists(name: string, parentId: number | null, excludeId?: number): boolean {
  let siblings: Menu[] = [];

  if (parentId === null) {
    siblings = menuData;
  } else {
    const parent = findMenuById(parentId);
    if (parent && parent.children) {
      siblings = parent.children;
    }
  }

  return siblings.some(menu =>
    menu.title === name && menu.id !== excludeId
  );
}

export default defineFakeRoute([
  // 获取菜单树
  {
    url: "/system/menu/tree",
    method: "get",
    response: () => {
      return {
        code: 0,
        message: "获取成功",
        data: menuData,
        success: true
      };
    }
  },

  // 获取菜单列表（分页）
  {
    url: "/system/menu/list",
    method: "get",
    response: ({ query }) => {
      const { page = 1, size = 10, status, parentId } = query;
      const keyword = String(query.keyword || "");
      let flatMenus = flattenMenus(menuData);

      // 过滤
      if (keyword) {
        flatMenus = flatMenus.filter(menu =>
          menu.title.includes(keyword) ||
          menu.path.includes(keyword)
        );
      }

      if (status !== undefined) {
        flatMenus = flatMenus.filter(menu => menu.status === Number(status));
      }

      if (parentId !== undefined) {
        flatMenus = flatMenus.filter(menu => menu.parentId === Number(parentId));
      }

      // 分页
      const total = flatMenus.length;
      const start = (Number(page) - 1) * Number(size);
      const end = start + Number(size);
      const records = flatMenus.slice(start, end);

      return {
        code: 0,
        message: "获取成功",
        data: {
          records,
          total,
          current: Number(page),
          size: Number(size),
          pages: Math.ceil(total / Number(size))
        },
        success: true
      };
    }
  },

  // 根据ID获取菜单详情
  {
    url: "/system/menu/:id",
    method: "get",
    response: ({ params, url }) => {
      let id: number;
      if (!params || !params.id) {
        // 从URL中提取ID
        const match = url.match(/\/system\/menu\/(\d+)$/);
        if (!match) {
          return {
            code: 400,
            message: "无效的菜单ID",
            data: null,
            success: false
          };
        }
        id = Number(match[1]);
      } else {
        id = Number(params.id);
      }
      const menu = findMenuById(id);

      if (!menu) {
        return {
          code: 404,
          message: "菜单不存在",
          data: null,
          success: false
        };
      }

      return {
        code: 0,
        message: "获取成功",
        data: menu,
        success: true
      };
    }
  },

  // 创建菜单
  {
    url: "/system/menu",
    method: "post",
    response: ({ body }) => {
      const newMenu = {
        ...body,
        id: generateMenuId(),
        level: body.parentId ? 2 : 1,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        children: []
      } as Menu;

      // 检查路径是否已存在
      if (isPathExists(newMenu.path)) {
        return {
          code: 400,
          message: "路径已存在",
          data: null,
          success: false
        };
      }

      // 检查名称是否已存在
      if (isNameExists(newMenu.title, newMenu.parentId)) {
        return {
          code: 400,
          message: "同级菜单名称不能重复",
          data: null,
          success: false
        };
      }

      if (newMenu.parentId) {
        const parent = findMenuById(newMenu.parentId);
        if (!parent) {
          return {
            code: 404,
            message: "父级菜单不存在",
            data: null,
            success: false
          };
        }
        if (!parent.children) parent.children = [];
        parent.children.push(newMenu);
      } else {
        menuData.push(newMenu);
      }

      return {
        code: 0,
        message: "创建成功",
        data: newMenu,
        success: true
      };
    }
  },

  // 更新菜单
  {
    url: "/system/menu/:id",
    method: "post",
    response: ({ params, body, url }) => {
      let id: number;
      if (!params || !params.id) {
        const match = url.match(/\/system\/menu\/(\d+)$/);
        if (!match) {
          return {
            code: 400,
            message: "无效的菜单ID",
            data: null,
            success: false
          };
        }
        id = Number(match[1]);
      } else {
        id = Number(params.id);
      }
      const menu = findMenuById(id);

      if (!menu) {
        return {
          code: 404,
          message: "菜单不存在",
          data: null,
          success: false
        };
      }

      // 检查路径是否已存在（排除自己）
      if (body.path && isPathExists(body.path, id)) {
        return {
          code: 400,
          message: "路径已存在",
          data: null,
          success: false
        };
      }

      // 检查名称是否已存在（排除自己）
      if (body.title && isNameExists(body.title, body.parentId || menu.parentId, id)) {
        return {
          code: 400,
          message: "同级菜单名称不能重复",
          data: null,
          success: false
        };
      }

      // 更新菜单
      Object.assign(menu, body, {
        updateTime: new Date().toISOString()
      });

      return {
        code: 0,
        message: "更新成功",
        data: menu,
        success: true
      };
    }
  },

  // 删除菜单
  {
    url: "/system/menu/:id/delete",
    method: "post",
    response: ({ params, url }) => {
      let id: number;
      if (!params || !params.id) {
        const match = url.match(/\/system\/menu\/(\d+)\/delete$/);
        if (!match) {
          return {
            code: 400,
            message: "无效的菜单ID",
            data: null,
            success: false
          };
        }
        id = Number(match[1]);
      } else {
        id = Number(params.id);
      }
      const menu = findMenuById(id);

      if (!menu) {
        return {
          code: 404,
          message: "菜单不存在",
          data: null,
          success: false
        };
      }

      // 检查是否有子菜单
      if (menu.children && menu.children.length > 0) {
        return {
          code: 400,
          message: "存在子菜单，无法删除",
          data: null,
          success: false
        };
      }

      // 删除菜单
      if (menu.parentId) {
        const { parent, index } = findParentMenu(id);
        if (parent && parent.children && index !== -1) {
          parent.children.splice(index, 1);
        }
      } else {
        const index = menuData.findIndex(m => m.id === id);
        if (index !== -1) {
          menuData.splice(index, 1);
        }
      }

      return {
        code: 0,
        message: "删除成功",
        data: null,
        success: true
      };
    }
  },

  // 批量删除菜单
  {
    url: "/system/menu/batch-delete",
    method: "post",
    response: ({ body }) => {
      const { ids } = body;
      const deletedIds: number[] = [];
      const errors: string[] = [];

      for (const id of ids) {
        const menu = findMenuById(id);
        if (!menu) {
          errors.push(`菜单ID ${id} 不存在`);
          continue;
        }

        if (menu.children && menu.children.length > 0) {
          errors.push(`菜单"${menu.title}"存在子菜单，无法删除`);
          continue;
        }

        // 删除菜单
        if (menu.parentId) {
          const { parent, index } = findParentMenu(id);
          if (parent && parent.children && index !== -1) {
            parent.children.splice(index, 1);
            deletedIds.push(id);
          }
        } else {
          const index = menuData.findIndex(m => m.id === id);
          if (index !== -1) {
            menuData.splice(index, 1);
            deletedIds.push(id);
          }
        }
      }

      return {
        code: 0,
        message: `删除成功 ${deletedIds.length} 个菜单`,
        data: { deletedIds, errors },
        success: true
      };
    }
  },

  // 更新菜单状态
  {
    url: "/system/menu/:id/status",
    method: "post",
    response: ({ params, body, url }) => {
      let id: number;
      if (!params || !params.id) {
        const match = url.match(/\/system\/menu\/(\d+)\/status$/);
        if (!match) {
          return {
            code: 400,
            message: "无效的菜单ID",
            data: null,
            success: false
          };
        }
        id = Number(match[1]);
      } else {
        id = Number(params.id);
      }
      const menu = findMenuById(id);

      if (!menu) {
        return {
          code: 404,
          message: "菜单不存在",
          data: null,
          success: false
        };
      }

      menu.status = body.status;
      menu.updateTime = new Date().toISOString();

      return {
        code: 0,
        message: "状态更新成功",
        data: null,
        success: true
      };
    }
  },

  // 更新菜单可见性
  {
    url: "/system/menu/:id/visibility",
    method: "post",
    response: ({ params, body, url }) => {
      let id: number;
      if (!params || !params.id) {
        const match = url.match(/\/system\/menu\/(\d+)\/visibility$/);
        if (!match) {
          return {
            code: 400,
            message: "无效的菜单ID",
            data: null,
            success: false
          };
        }
        id = Number(match[1]);
      } else {
        id = Number(params.id);
      }
      const menu = findMenuById(id);

      if (!menu) {
        return {
          code: 404,
          message: "菜单不存在",
          data: null,
          success: false
        };
      }

      menu.visible = body.visible;
      menu.updateTime = new Date().toISOString();

      return {
        code: 0,
        message: "可见性更新成功",
        data: null,
        success: true
      };
    }
  },

  // 移动菜单
  {
    url: "/system/menu/:id/move",
    method: "post",
    response: ({ params, body, url }) => {
      let id: number;
      if (!params || !params.id) {
        const match = url.match(/\/system\/menu\/(\d+)\/move$/);
        if (!match) {
          return {
            code: 400,
            message: "无效的菜单ID",
            data: null,
            success: false
          };
        }
        id = Number(match[1]);
      } else {
        id = Number(params.id);
      }
      const { parentId } = body;
      const menu = findMenuById(id);

      if (!menu) {
        return {
          code: 404,
          message: "菜单不存在",
          data: null,
          success: false
        };
      }

      // 不能移动到自己的子级下
      if (parentId && menu.children) {
        const childIds: number[] = [];
        function collectChildIds(children: Menu[]) {
          children.forEach(child => {
            childIds.push(child.id);
            if (child.children) {
              collectChildIds(child.children);
            }
          });
        }
        collectChildIds(menu.children);

        if (childIds.includes(parentId)) {
          return {
            code: 400,
            message: "不能移动到自己的子级下",
            data: null,
            success: false
          };
        }
      }

      // 从原位置移除
      if (menu.parentId) {
        const { parent, index } = findParentMenu(id);
        if (parent && parent.children && index !== -1) {
          parent.children.splice(index, 1);
        }
      } else {
        const index = menuData.findIndex(m => m.id === id);
        if (index !== -1) {
          menuData.splice(index, 1);
        }
      }

      // 添加到新位置
      menu.parentId = parentId;
      menu.level = parentId ? 2 : 1;
      menu.updateTime = new Date().toISOString();

      if (parentId) {
        const newParent = findMenuById(parentId);
        if (!newParent) {
          return {
            code: 404,
            message: "目标父级菜单不存在",
            data: null,
            success: false
          };
        }
        if (!newParent.children) newParent.children = [];
        newParent.children.push(menu);
      } else {
        menuData.push(menu);
      }

      return {
        code: 0,
        message: "移动成功",
        data: null,
        success: true
      };
    }
  },

  // 更新菜单排序
  {
    url: "/system/menu/sort",
    method: "post",
    response: ({ body }) => {
      const { items } = body;

      for (const item of items) {
        const menu = findMenuById(item.id);
        if (menu) {
          menu.sort = item.sort;
          menu.updateTime = new Date().toISOString();
        }
      }

      return {
        code: 0,
        message: "排序更新成功",
        data: null,
        success: true
      };
    }
  },

  // 检查菜单路径是否可用
  {
    url: "/system/menu/check-path",
    method: "post",
    response: ({ body }) => {
      const { path, excludeId } = body;
      const exists = isPathExists(path, excludeId);

      return {
        code: 0,
        message: "检查完成",
        data: !exists,
        success: true
      };
    }
  },

  // 检查菜单名称是否可用
  {
    url: "/system/menu/check-name",
    method: "post",
    response: ({ body }) => {
      const { name, parentId, excludeId } = body;
      const exists = isNameExists(name, parentId, excludeId);

      return {
        code: 0,
        message: "检查完成",
        data: !exists,
        success: true
      };
    }
  },

  // 获取菜单图标列表
  {
    url: "/system/menu/icons",
    method: "get",
    response: () => {
      const icons = [
        "home-filled", "setting", "user", "user-filled", "menu", "cpu", "operation",
        "workflow", "design", "document", "folder", "files", "edit", "delete",
        "search", "refresh", "plus", "minus", "upload", "download", "link",
        "picture", "video", "music", "bell", "message", "phone", "email",
        "location", "time", "calendar", "clock", "star", "heart", "lock",
        "key", "shield", "warning", "info", "question", "success", "error"
      ];

      return {
        code: 0,
        message: "获取成功",
        data: icons,
        success: true
      };
    }
  },

  // 复制菜单
  {
    url: "/system/menu/:id/copy",
    method: "post",
    response: ({ params, body, url }) => {
      let id: number;
      if (!params || !params.id) {
        const match = url.match(/\/system\/menu\/(\d+)\/copy$/);
        if (!match) {
          return {
            code: 400,
            message: "无效的菜单ID",
            data: null,
            success: false
          };
        }
        id = Number(match[1]);
      } else {
        id = Number(params.id);
      }
      const { name, parentId } = body;
      const sourceMenu = findMenuById(id);

      if (!sourceMenu) {
        return {
          code: 404,
          message: "源菜单不存在",
          data: null,
          success: false
        };
      }

      // 检查名称是否已存在
      if (isNameExists(name, parentId || sourceMenu.parentId)) {
        return {
          code: 400,
          message: "同级菜单名称不能重复",
          data: null,
          success: false
        };
      }

      const newMenu: Menu = {
        ...sourceMenu,
        id: generateMenuId(),
        title: name,
        path: `${sourceMenu.path}_copy_${Date.now()}`,
        parentId: parentId || sourceMenu.parentId,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        children: []
      };

      if (newMenu.parentId) {
        const parent = findMenuById(newMenu.parentId);
        if (!parent) {
          return {
            code: 404,
            message: "父级菜单不存在",
            data: null,
            success: false
          };
        }
        if (!parent.children) parent.children = [];
        parent.children.push(newMenu);
      } else {
        menuData.push(newMenu);
      }

      return {
        code: 0,
        message: "复制成功",
        data: newMenu,
        success: true
      };
    }
  },

  // 导出菜单数据
  {
    url: "/system/menu/export",
    method: "get",
    response: () => {
      const jsonData = JSON.stringify(menuData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });

      return {
        code: 0,
        message: "导出成功",
        data: blob,
        success: true
      };
    }
  },

  // 导入菜单数据
  {
    url: "/system/menu/import",
    method: "post",
    response: ({ body }) => {
      try {
        // 这里简化处理，实际应该解析上传的文件
        const importData = body.data || [];

        // 简单的数据验证
        if (!Array.isArray(importData)) {
          return {
            code: 400,
            message: "导入数据格式错误",
            data: null,
            success: false
          };
        }

        // 备份当前数据
        const backupData = JSON.parse(JSON.stringify(menuData));

        try {
          // 重新分配ID避免冲突
          const maxId = Math.max(...flattenMenus(menuData).map(m => m.id));
          let newId = maxId + 1;

          function reassignIds(menus: Menu[]): Menu[] {
            return menus.map(menu => ({
              ...menu,
              id: newId++,
              children: menu.children ? reassignIds(menu.children) : undefined
            }));
          }

          const processedData = reassignIds(importData);
          menuData.push(...processedData);

          return {
            code: 0,
            message: `导入成功，共导入 ${processedData.length} 个菜单`,
            data: { count: processedData.length },
            success: true
          };
        } catch (error) {
          // 恢复数据
          menuData.length = 0;
          menuData.push(...backupData);

          return {
            code: 500,
            message: "导入失败，数据已恢复",
            data: null,
            success: false
          };
        }
      } catch (error) {
        return {
          code: 500,
          message: "导入过程中发生错误",
          data: null,
          success: false
        };
      }
    }
  }
]); 