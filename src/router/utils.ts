import {
  type RouterHistory,
  type RouteRecordRaw,
  createWebHistory,
  createWebHashHistory
} from "vue-router";
import type { Component } from "vue";
import { router } from "./index";
import { isProxy, toRaw } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import {
  isString,
  cloneDeep,
  storageLocal,
  isIncludeAllChildren
} from "@pureadmin/utils";
import { getConfig } from "@/config";
import { buildHierarchyTree } from "@/utils/tree";
import { type menuType, routerArrays } from "@/layout/types";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useMenuStoreHook } from "@/store/modules/menu";

// 动态路由
import { getAsyncRoutes } from "@/api/routes";
import { useUserStoreHook } from "@/store/modules/user";
import { alias } from "@build/utils";

// ==================== 常量定义 ====================
const IFrame = () => import("@/layout/frame.vue");
// https://cn.vitejs.dev/guide/features.html#glob-import
const modulesRoutes = import.meta.glob("/src/views/**/*.{vue,tsx}");
// 组件路径管理相关功能（复用 modulesRoutes）
const viewModules = modulesRoutes;

// ==================== 动态路由处理 ====================
/** 初始化路由（`new Promise` 写法防止在异步请求中造成无限循环）*/
function initRouter() {
  return new Promise(resolve => {
    const loadRoutes = (data: BackendRoute[]) => {
      handleAsyncRoutes(cloneDeep(data) as BackendRoute[]);
      resolve(router);
    };

    if (getConfig()?.CachingAsyncRoutes) {
      // 开启动态路由缓存本地localStorage
      const key = "async-routes";
      const asyncRouteList = storageLocal().getItem(key) as any;
      if (asyncRouteList && asyncRouteList?.length > 0) {
        loadRoutes(asyncRouteList);
      } else {
        getAsyncRoutes().then(data => {
          storageLocal().setItem(key, data);
          loadRoutes(data);
        });
      }
    } else {
      getAsyncRoutes().then(loadRoutes);
    }
  });
}

/** 处理动态路由（后端返回的路由） */
function handleAsyncRoutes(routeList: BackendRoute[]) {
  // 添加参数校验，防止传入 undefined 或 null
  if (!routeList || !Array.isArray(routeList)) {
    routeList = [];
  }

  // 1. 存储完整菜单树到 menu store
  useMenuStoreHook().handleWholeMenus(routeList);

  // 2. 存储按钮权限到 user Store
  useUserStoreHook().setPermissions(routeList.map(route => route.permission));
  
  // 3. 转换并注册所有路由
  registerAllRoutes(routeList);

  // 4. 处理标签页缓存
  handleMultiTags();

  // 5. 添加 404 匹配
  addPathMatch();
}

/**
 * 注册所有路由（包含外链和普通路由）
 */
function registerAllRoutes(routeList) {
  // 转换路由结构（addAsyncRoutes 内部会处理外链注册）
  const asyncRoutes = formatFlatteningRoutes(addAsyncRoutes(routeList));

  // 检查路由结构是否存在
  if (
    !router.options.routes ||
    !router.options.routes[0] ||
    !router.options.routes[0].children
  ) {
    // 路由结构不完整时，直接使用 addRoute 添加路由
    asyncRoutes.forEach((v: RouteRecordRaw) => {
      if (!router.hasRoute(v?.name)) {
        router.addRoute(v);
      }
    });
  } else {
    // 路由结构存在，继续处理
    asyncRoutes.forEach((v: RouteRecordRaw) => {
      // 防止重复添加路由
      const existingRouteIndex = router.options.routes[0].children.findIndex(
        value => value.path === v.path
      );

      if (existingRouteIndex !== -1) {
        return;
      } else {
        // 切记将路由push到routes后还需要使用addRoute，这样路由才能正常跳转
        router.options.routes[0].children.push(v);
        // 最终路由进行升序
        ascending(router.options.routes[0].children);
        if (!router.hasRoute(v?.name)) router.addRoute(v);
      }
    });

    // 同步路由结构
    const flattenRouters: any = router.getRoutes().find(n => n.path === "/");
    if (flattenRouters) {
      flattenRouters.children = router.options.routes[0].children;
      router.addRoute(flattenRouters);
    }
  }
}

/** 过滤后端传来的动态路由 重新生成规范路由 */
function addAsyncRoutes(arrRoutes: Array<BackendRoute>): RouteRecordRaw[] {
  if (!arrRoutes || !arrRoutes.length) return [];

  const modulesRoutesKeys = Object.keys(modulesRoutes);

  return arrRoutes
    .map((v: BackendRoute) => {
      // 外链（通过 component 字段识别）
      if (/^https?:\/\//.test(v.component)) {
        return {
          path: v.path,
          name: v.title || generateRouteName(v.path),
          meta: {
            isIframe: !!v.isIframe,
            frameSrc: v.component,
            title: v.title,
            icon: v.icon,
            backstage: true,
            id: v.id,
            parentId: v.parentId,
            sort: v.sort,
            level: v.level,
            type: v.type,
            isKeepAlive: v.isKeepAlive,
            isHidden: v.isHidden,
            permission: v.permission
          },
          component: v.isIframe ? IFrame : undefined
        };
      }

      // 普通路由
      let route: any = {
        path: v.path,
        name: v.title || generateRouteName(v.path),
        meta: {
          title: v.title,
          icon: v.icon,
          backstage: true,
          id: v.id,
          parentId: v.parentId,
          sort: v.sort,
          level: v.level,
          type: v.type,
          isKeepAlive: v.isKeepAlive,
          isHidden: v.isHidden,
          permission: v.permission
        },
        component: undefined,
        // redirect: undefined
      };

      // 处理component
      if (v.component) {
        const index = modulesRoutesKeys.findIndex(ev => ev.includes(v.component as any));
        if (index !== -1) {
          route.component = modulesRoutes[modulesRoutesKeys[index]] as any;
        }
      }

      // 递归处理子路由
      if (v.children && v.children.length) {
        route.children = addAsyncRoutes(v.children);
      }

      return route;
    })
    .filter(Boolean) as RouteRecordRaw[];
}

// ==================== 菜单转路由 ====================

/**
 * 生成路由名称
 */
function generateRouteName(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/**
 * 将菜单配置转换为路由配置
 */
function menuToRoute(menu: BackendRoute): any {
  const route: any = {
    path: menu.path,
    name: menu.title || generateRouteName(menu.path),
    meta: {
      title: menu.title,
      icon: menu.icon,
      keepAlive: menu.isKeepAlive,
      hidden: menu.isHidden,
      showLink: !menu.isHidden,
      rank: menu.sort || 0,
      backstage: true // 标识为后端配置的路由
    }
  };

  // 根据菜单类型设置路由属性
  switch (menu.type) {
    case 1: // 目录
      route.redirect = menu.redirect || menu.children?.[0]?.path;
      if (menu.children && menu.children.length > 0) {
        route.children = menu.children.map((child: BackendRoute) =>
          menuToRoute(child)
        );
      }
      break;
    case 2: // 菜单
      if (menu.component) {
        route.component = resolveComponent(menu.component);
      }
      if (menu.redirect) {
        route.redirect = menu.redirect;
      }
      break;
    case 3: // 按钮
      // 按钮类型不生成路由
      return null;
  }

  return route;
}

/**
 * 预览生成的路由配置
 */
function previewRouteConfig(menu: BackendRoute): any {
  return menuToRoute(cloneDeep(menu));
}

/**
 * 验证菜单配置的路由有效性
 */
function validateMenuRoute(menu: BackendRoute): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证路径格式
  if (
    menu.path &&
    !menu.path.startsWith("/") &&
    !menu.path.startsWith("http")
  ) {
    errors.push("路由路径必须以 / 开头或者是完整的URL地址");
  }

  // 验证组件路径
  if (
    menu.type === 2 &&
    menu.component &&
    !validateComponentPath(menu.component)
  ) {
    errors.push(`组件路径 ${menu.component} 不存在`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ==================== 路由排序和过滤 ====================
/** 按照路由中meta下的rank等级升序来排序路由 */
function ascending(arr: any[]) {
  // 确保所有路由都有有效的meta和rank
  arr.forEach((v, index) => {
    if (!v.meta) {
      throw new Error(
        `菜单项缺少 meta 字段，path: ${String(v.path) || ""}, name: ${String(v.name) || ""}`
      );
    }
    // 确保rank有默认值
    if (v.meta.rank === undefined || v.meta.rank === null) {
      v.meta.rank = index + 1;
    }
  });
  return arr.sort(
    (a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
      const rankA = a?.meta?.rank ?? 0;
      const rankB = b?.meta?.rank ?? 0;
      return rankA - rankB;
    }
  );
}
// ==================== 路由查找和路径处理 ====================

/** 通过指定 `key` 获取父级路径集合，默认 `key` 为 `path` */
function getParentPaths(value: string, routes: RouteRecordRaw[], key = "path") {
  // 深度遍历查找
  function dfs(routes: RouteRecordRaw[], value: string, parents: string[]) {
    for (let i = 0; i < routes.length; i++) {
      const item = routes[i];
      // 返回父级path
      if (item[key] === value) return parents;
      // children不存在或为空则不递归
      if (!item.children || !item.children.length) continue;
      // 往下查找时将当前path入栈
      parents.push(item.path);

      if (dfs(item.children, value, parents).length) return parents;
      // 深度遍历查找未找到时当前path 出栈
      parents.pop();
    }
    // 未找到时返回空数组
    return [];
  }

  return dfs(routes, value, []);
}

/** 查找对应 `path` 的路由信息 */
function findRouteByPath(path: string, routes: RouteRecordRaw[]) {
  // 添加参数校验，防止传入 undefined 或 null
  if (!routes || !Array.isArray(routes) || routes.length === 0) {
    return null;
  }

  let res = routes.find((item: { path: string }) => item.path == path);
  if (res) {
    return isProxy(res) ? toRaw(res) : res;
  } else {
    for (let i = 0; i < routes.length; i++) {
      if (
        routes[i].children instanceof Array &&
        routes[i].children.length > 0
      ) {
        res = findRouteByPath(path, routes[i].children);
        if (res) {
          return isProxy(res) ? toRaw(res) : res;
        }
      }
    }
    return null;
  }
}

// ==================== 路由格式转换 ====================

/**
 * 将多级嵌套路由处理成一维数组
 * @param routesList 传入路由
 * @returns 返回处理后的一维路由
 */
function formatFlatteningRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  let hierarchyList = buildHierarchyTree(routesList);
  for (let i = 0; i < hierarchyList.length; i++) {
    if (hierarchyList[i].children) {
      hierarchyList = hierarchyList
        .slice(0, i + 1)
        .concat(hierarchyList[i].children, hierarchyList.slice(i + 1));
    }
  }
  return hierarchyList;
}

/**
 * 一维数组处理成多级嵌套数组（三级及以上的路由全部拍成二级，keep-alive 只支持到二级缓存）
 * https://github.com/pure-admin/vue-pure-admin/issues/67
 * @param routesList 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成规定路由的格式
 */
function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  const newRoutesList: RouteRecordRaw[] = [];
  routesList.forEach((v: RouteRecordRaw) => {
    if (v.path === "/") {
      newRoutesList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: []
      });
    } else {
      newRoutesList[0]?.children.push({ ...v });
    }
  });
  return newRoutesList;
}

// ==================== 路由工具函数 ====================

function addPathMatch() {
  if (!router.hasRoute("pathMatch")) {
    router.addRoute({
      path: "/:pathMatch(.*)",
      name: "pathMatch",
      redirect: "/error/404"
    });
  }
}

/** 获取路由历史模式 https://next.router.vuejs.org/zh/guide/essentials/history-mode.html */
function getHistoryMode(routerHistory): RouterHistory {
  // len为1 代表只有历史模式 为2 代表历史模式中存在base参数 https://next.router.vuejs.org/zh/api/#%E5%8F%82%E6%95%B0-1
  const historyMode = routerHistory.split(",");
  const leftMode = historyMode[0];
  const rightMode = historyMode[1];
  // no param
  if (historyMode.length === 1) {
    if (leftMode === "hash") {
      return createWebHashHistory("");
    } else if (leftMode === "h5") {
      return createWebHistory("");
    }
  } //has param
  else if (historyMode.length === 2) {
    if (leftMode === "hash") {
      return createWebHashHistory(rightMode);
    } else if (leftMode === "h5") {
      return createWebHistory(rightMode);
    }
  }
}

// ==================== 权限相关 ====================

/** 获取当前页面按钮级别的权限 */
function getAuths(): Array<string> {
  return router.currentRoute.value.meta.auths as Array<string>;
}

/** 是否有按钮级别的权限（根据路由`meta`中的`auths`字段进行判断）*/
function hasAuth(value: string | Array<string>): boolean {
  if (!value) return false;
  /** 从当前路由的`meta`字段里获取按钮级别的所有自定义`code`值 */
  const metaAuths = getAuths();
  if (!metaAuths) return false;
  const isAuths = isString(value)
    ? metaAuths.includes(value)
    : isIncludeAllChildren(value, metaAuths);
  return isAuths ? true : false;
}

// ==================== 菜单处理 ====================

function handleTopMenu(route) {
  if (!route) {
    return null;
  }
  if (route?.children && route.children.length > 1) {
    if (route.redirect) {
      return route.children.filter(cur => cur.path === route.redirect)[0];
    } else {
      return route.children[0];
    }
  } else {
    return route;
  }
}

/** 获取所有菜单中的第一个菜单（顶级菜单）*/
function getTopMenu(tag = false): menuType {
  const wholeMenus = useMenuStoreHook().wholeMenus;
  if (!wholeMenus || wholeMenus.length === 0) {
    return null;
  }

  // 递归查找第一个后端菜单的第一个页面
  function findFirstBackendPage(menus) {
    for (const menu of menus) {
      if (menu.meta?.backstage) {
        if (menu.children && menu.children.length > 0) {
          const found = findFirstBackendPage(menu.children);
          if (found) return found;
        } else if (menu.path && menu.meta?.showLink !== false) {
          return menu;
        }
      } else if (menu.children && menu.children.length > 0) {
        // 兼容后端菜单包裹在静态 layout 下的情况
        const found = findFirstBackendPage(menu.children);
        if (found) return found;
      }
    }
    return null;
  }

  const backendPage = findFirstBackendPage(wholeMenus);
  if (backendPage) {
    tag && useMultiTagsStoreHook().handleTags("push", backendPage);
    return backendPage;
  }

  // 兜底：原有逻辑
  const firstMenu = wholeMenus[0];
  if (!firstMenu?.children || firstMenu.children.length === 0) {
    tag && useMultiTagsStoreHook().handleTags("push", firstMenu);
    return firstMenu;
  }
  const topMenu = handleTopMenu(firstMenu.children[0]);
  tag && useMultiTagsStoreHook().handleTags("push", topMenu);
  return topMenu;
}

// ==================== 缓存处理 ====================

/** 处理缓存路由（添加、删除、刷新） */
function handleAliveRoute({ name }: ToRouteType, mode?: string) {
  switch (mode) {
    case "add":
      useMenuStoreHook().cacheOperate({
        mode: "add",
        name
      });
      break;
    case "delete":
      useMenuStoreHook().cacheOperate({
        mode: "delete",
        name
      });
      break;
    case "refresh":
      useMenuStoreHook().cacheOperate({
        mode: "refresh",
        name
      });
      break;
    default:
      useMenuStoreHook().cacheOperate({
        mode: "delete",
        name
      });
      useTimeoutFn(() => {
        useMenuStoreHook().cacheOperate({
          mode: "add",
          name
        });
      }, 100);
  }
}

/**
 * 处理多标签页缓存
 */
function handleMultiTags() {
  if (!useMultiTagsStoreHook().getMultiTagsCache) {
    useMultiTagsStoreHook().handleTags("equal", [
      ...routerArrays,
      ...useMenuStoreHook().flatteningRoutes.filter(v => v?.meta?.fixedTag)
    ]);
  }
}

// ==================== 组件路径管理 ====================

/**
 * 获取所有可用的组件路径
 */
function getAvailableComponents(): string[] {
  return Object.keys(viewModules)
    .map(path =>
      path.replace("/src/views/", "@/views/").replace(/\.(vue|tsx)$/, "")
    )
    .sort();
}

/**
 * 验证组件路径是否存在
 */
function validateComponentPath(componentPath: string): boolean {
  if (!componentPath) return false;

  const fullPath = componentPath.startsWith("@/views/")
    ? componentPath.replace("@/views/", "/src/views/")
    : `/src/views/${componentPath}`;

  const existsAsVue = viewModules[`${fullPath}.vue`] !== undefined;
  const existsAsTsx = viewModules[`${fullPath}.tsx`] !== undefined;

  return existsAsVue || existsAsTsx;
}

/**
 * 智能组件路径建议
 */
function suggestComponentPath(menuPath: string, menuName?: string): string[] {
  const suggestions: string[] = [];

  // 基于路径的建议
  if (menuPath && menuPath.startsWith("/")) {
    const pathParts = menuPath.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      suggestions.push(`@/views/${pathParts.join("/")}/index`);
      if (pathParts.length > 1) {
        suggestions.push(
          `@/views/${pathParts.slice(0, -1).join("/")}/${pathParts[pathParts.length - 1]}`
        );
      }
    }
  }

  // 基于名称的建议
  if (menuName) {
    const nameParts = menuName
      .split(/(?=[A-Z])/)
      .map(part => part.toLowerCase());
    suggestions.push(`@/views/${nameParts.join("/")}/index`);
  }

  // 过滤出实际存在的路径
  return suggestions.filter(path => validateComponentPath(path));
}

/**
 * 解析组件
 */
function resolveComponent(componentPath: string): any {
  if (!componentPath) return undefined;

  const fullPath = componentPath.startsWith("@/views/")
    ? componentPath.replace("@/views/", "/src/views/")
    : `/src/views/${componentPath}`;

  // 尝试.vue文件
  if (viewModules[`${fullPath}.vue`]) {
    return viewModules[`${fullPath}.vue`];
  }

  // 尝试.tsx文件
  if (viewModules[`${fullPath}.tsx`]) {
    return viewModules[`${fullPath}.tsx`];
  }

  return undefined;
}

// ==================== 导出 ====================

export {
  // 权限相关
  hasAuth, // 判断是否有按钮级别权限
  getAuths, // 获取当前页面按钮级别权限

  // 路由排序
  ascending, // 路由按 rank 升序排序

  // 动态路由处理
  initRouter, // 初始化动态路由
  addAsyncRoutes, // 递归处理后端返回的动态路由，生成标准路由结构
  handleAsyncRoutes, // 处理动态路由的完整流程（包含注册、缓存等）
  registerAllRoutes, // 注册所有路由（包含外链和普通路由）

  // 菜单处理
  getTopMenu, // 获取第一个顶级菜单

  // 路由工具函数
  addPathMatch, // 添加 404 匹配路由
  getHistoryMode, // 获取路由历史模式
  getParentPaths, // 获取指定路由的所有父级路径
  findRouteByPath, // 通过 path 查找路由信息

  // 缓存处理
  handleAliveRoute, // 处理 keep-alive 缓存路由
  handleMultiTags, // 处理多标签页缓存

  // 路由格式转换
  formatTwoStageRoutes, // 一维路由转为两级嵌套路由
  formatFlatteningRoutes, // 多级嵌套路由拍平成一维

  // 组件路径管理
  validateComponentPath, // 校验组件路径是否存在
  suggestComponentPath, // 智能建议组件路径
  getAvailableComponents, // 获取所有可用组件路径
  resolveComponent, // 解析组件路径为 import 组件

  // 菜单转路由
  validateMenuRoute, // 校验菜单路由配置有效性
  previewRouteConfig, // 预览菜单生成的路由配置
  menuToRoute, // 菜单对象转为路由对象
  generateRouteName // 根据 path 生成路由名称
};
