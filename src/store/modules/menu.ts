import { defineStore } from "pinia";
import {
  type cacheType,
  store,
  debounce,
  ascending,
  getKeyList,
  constantMenus,
  formatFlatteningRoutes
} from "../utils";
import { useMultiTagsStoreHook } from "./multiTags";
import type { RouteRecordRaw } from "vue-router";

export const useMenuStore = defineStore("menu", {
  state: () => ({
    // 静态路由生成的菜单
    constantMenus,
    // 整体路由生成的菜单（静态、动态）
    wholeMenus: [],
    // 整体路由（一维数组格式）
    flatteningRoutes: [],
    // 缓存页面keepAlive
    cachePageList: []
  }),
  actions: {
    /** 组装整体路由生成的菜单 */
    handleWholeMenus(routes: BackendRoute[]) {
      function convertAndSortMenus(
        menus: BackendRoute[]
      ): Array<RouteConfigsTable> {
        return menus.map(menu => {
          const meta = {
            title: menu.title,
            icon: menu.icon,
            // extraIcon: menu.icon,
            keepAlive: menu.isKeepAlive,
            showLink: !menu.isHidden,
            rank: menu.sort,
            ...(menu.permission ? { roles: [menu.permission] } : {})
          };
          if (/^https?:\/\//.test(menu.component)) {
            (meta as any).frameSrc = menu.component;
            (meta as any).isIframe = menu.isIframe;
          }
          let children: Array<RouteConfigsTable> = [];
          if (menu.children && menu.children.length > 0) {
            children = ascending(
              convertAndSortMenus(menu.children)
            ) as Array<RouteConfigsTable>;
          }
          const base: RouteConfigsTable = {
            path: menu.path,
            name: menu.title,
            redirect: menu.redirect,
            meta,
            ...(children.length > 0 ? { children } : {})
          };
          return menu.component ? { ...base, component: null } : base;
        });
      }

      // 1. 先转换后端菜单
      const backendMenus = convertAndSortMenus(routes);
      const allMenus = ascending([
        // ...this.constantMenus,
        ...backendMenus
      ]) as RouteRecordRaw[];
      // 3. 存储
      this.wholeMenus = allMenus;
      this.flatteningRoutes = formatFlatteningRoutes(allMenus);
    },
    cacheOperate({ mode, name }: cacheType) {
      const delIndex = this.cachePageList.findIndex(v => v === name);
      switch (mode) {
        case "refresh":
          this.cachePageList = this.cachePageList.filter(v => v !== name);
          break;
        case "add":
          this.cachePageList.push(name);
          break;
        case "delete":
          delIndex !== -1 && this.cachePageList.splice(delIndex, 1);
          break;
      }
      /** 监听缓存页面是否存在于标签页，不存在则删除 */
      debounce(() => {
        let cacheLength = this.cachePageList.length;
        const nameList = getKeyList(useMultiTagsStoreHook().multiTags, "name");
        while (cacheLength > 0) {
          nameList.findIndex(v => v === this.cachePageList[cacheLength - 1]) ===
            -1 &&
            this.cachePageList.splice(
              this.cachePageList.indexOf(this.cachePageList[cacheLength - 1]),
              1
            );
          cacheLength--;
        }
      })();
    },
    /** 清空缓存页面 */
    clearAllCachePage() {
      this.wholeMenus = [];
      this.cachePageList = [];
    }
  }
});

export function useMenuStoreHook() {
  return useMenuStore(store);
}
