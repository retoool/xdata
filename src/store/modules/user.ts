import { defineStore } from "pinia";
import { store } from "../utils";
import type { User } from "@/views/system/user/types/user";
import type { Role } from "@/views/system/role/types/role";
import { getLogin, refreshTokenApi } from "@/api/system/user";
import { removeToken, userKey } from "@/utils/auth";
import { storageLocal } from "@pureadmin/utils";
import Cookies from "js-cookie";

export const useUserStore = defineStore("user", {
  state: () => ({
    token: localStorage.getItem("token"),
    userInfo: null as User | null,
    roles: [] as Role[],
    permissions: [] as string[],
    menuList: [] as BackendRoute[]
  }),
  getters: {
    isLoggedIn: state => !!state.token,
    userName: state =>
      state.userInfo?.realName || state.userInfo?.username || "",
    userAvatar: state => state.userInfo?.avatar || "",
    hasRole: state => (roleCode: string) =>
      state.roles.some(role => role.code === roleCode),
    hasPermission: state => (permission: string) =>
      state.permissions.includes(permission)
  },
  actions: {
    setToken(newToken: string | null) {
      this.token = newToken;
      if (newToken) {
        localStorage.setItem("token", newToken);
      } else {
        localStorage.removeItem("token");
      }
    },
    setUserInfo(info: User | null) {
      this.userInfo = info;
    },
    setRoles(newRoles: Role[]) {
      this.roles = newRoles;
    },
    setPermissions(newPermissions: string[]) {
      console.log("setPermissions", newPermissions);
      this.permissions = newPermissions;
    },
    setMenuList(menus: BackendRoute[]) {
      this.menuList = menus;
    },
    async login(loginData: { username: string; password: string }) {
      try {
        const response = await getLogin(loginData);
        this.setToken(response.accessToken);
        Cookies.set("multiple-tabs", "true");
        const userData = {
          id: 1,
          username: response.username,
          realName: response.nickname || response.username,
          avatar: response.avatar || "/src/assets/user.svg",
          email: "",
          phone: "",
          departmentId: 0,
          departmentName: "",
          roleIds: [],
          status: 1,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        };
        this.setUserInfo(userData);
        const roleObjects: Role[] = (response.roles || []).map(
          (roleCode: string, index: number) => ({
            id: index + 1,
            name: roleCode,
            code: roleCode,
            description: "",
            permissions: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          })
        );
        this.setRoles(roleObjects);
        this.setPermissions(response.permissions || []);
        const storageData = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expires: new Date(response.expires).getTime(),
          avatar: response.avatar || "/src/assets/user.svg",
          username: response.username,
          nickname: response.nickname || response.username,
          roles: response.roles || [],
          permissions: response.permissions || []
        };
        storageLocal().setItem(userKey, storageData);
        this.persistState();
        return response;
      } catch (error) {
        console.error("登录失败:", error);
        throw error;
      }
    },
    logout() {
      removeToken();
      this.setToken(null);
      this.setUserInfo(null);
      this.setRoles([]);
      this.setPermissions([]);
      this.setMenuList([]);
      localStorage.removeItem("userInfo");
      localStorage.removeItem("roles");
      localStorage.removeItem("permissions");
      localStorage.removeItem("menuList");
      import("@/router").then(({ router }) => {
        router
          .push("/login")
          .then(() => {
            console.log("已退出登录，跳转到登录页");
          })
          .catch(error => {
            console.error("跳转到登录页失败:", error);
            window.location.href = "/login";
          });
      });
    },
    updateUserInfo(info: Partial<User>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...info };
      }
    },
    async refreshUserInfo() {
      try {
        // 这里应该调用获取用户信息的API
        // const response = await getUserInfoApi()
        // this.setUserInfo(response.user)
        // this.setRoles(response.roles)
        // this.setPermissions(response.permissions)
        console.log("刷新用户信息");
      } catch (error) {
        console.error("刷新用户信息失败:", error);
        throw error;
      }
    },
    checkPermission(permission: string | string[]): boolean {
      if (!this.permissions.length) return false;
      if (Array.isArray(permission)) {
        return permission.some(p => this.permissions.includes(p));
      }
      return this.permissions.includes(permission);
    },
    checkRole(roleCode: string | string[]): boolean {
      if (!this.roles.length) return false;
      if (Array.isArray(roleCode)) {
        return roleCode.some(code =>
          this.roles.some(role => role.code === code)
        );
      }
      return this.roles.some(role => role.code === roleCode);
    },
    restoreState() {
      try {
        const savedUserInfo = localStorage.getItem("userInfo");
        const savedRoles = localStorage.getItem("roles");
        const savedPermissions = localStorage.getItem("permissions");
        const savedMenuList = localStorage.getItem("menuList");
        if (savedUserInfo) {
          this.setUserInfo(JSON.parse(savedUserInfo));
        }
        if (savedRoles) {
          this.setRoles(JSON.parse(savedRoles));
        }
        if (savedPermissions) {
          this.setPermissions(JSON.parse(savedPermissions));
        }
        if (savedMenuList) {
          this.setMenuList(JSON.parse(savedMenuList));
        }
      } catch (error) {
        console.error("恢复用户状态失败:", error);
      }
    },
    persistState() {
      try {
        if (this.userInfo) {
          localStorage.setItem("userInfo", JSON.stringify(this.userInfo));
        }
        if (this.roles.length) {
          localStorage.setItem("roles", JSON.stringify(this.roles));
        }
        if (this.permissions.length) {
          localStorage.setItem("permissions", JSON.stringify(this.permissions));
        }
        if (this.menuList.length) {
          localStorage.setItem("menuList", JSON.stringify(this.menuList));
        }
      } catch (error) {
        console.error("保存用户状态失败:", error);
      }
    },
    async handRefreshToken(data: { refreshToken: string }) {
      try {
        const response = await refreshTokenApi(data);
        this.setToken(response.accessToken);
        return response;
      } catch (error) {
        console.error("刷新token失败:", error);
        throw error;
      }
    },
    handleTokenExpired(error?: any) {
      if (error?.config?.url?.includes("/login")) {
        return;
      }
      if (error?.response?.status === 403) {
        console.log("用户已被禁用，执行登出操作");
        this.logout();
        return;
      }
      console.log("Token已过期，执行登出操作");
      this.logout();
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
