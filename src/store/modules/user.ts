import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Role, Menu } from '@/types/system'
import { getLogin, refreshTokenApi } from '@/api/user'
import { setToken as setAuthToken, removeToken, userKey } from '@/utils/auth'
import { storageLocal } from "@pureadmin/utils"
import Cookies from 'js-cookie'

export interface UserState {
  token: string | null
  userInfo: User | null
  roles: Role[]
  permissions: string[]
  menuList: Menu[]
  isLoggedIn: boolean
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<User | null>(null)
  const roles = ref<Role[]>([])
  const permissions = ref<string[]>([])
  const menuList = ref<Menu[]>([])

  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.realName || userInfo.value?.username || '')
  const userAvatar = computed(() => userInfo.value?.avatar || '')
  const hasRole = computed(() => (roleCode: string) =>
    roles.value.some(role => role.code === roleCode)
  )
  const hasPermission = computed(() => (permission: string) =>
    permissions.value.includes(permission)
  )

  // Actions
  const setToken = (newToken: string | null) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUserInfo = (info: User | null) => {
    userInfo.value = info
  }

  const setRoles = (newRoles: Role[]) => {
    roles.value = newRoles
  }

  const setPermissions = (newPermissions: string[]) => {
    permissions.value = newPermissions
  }

  const setMenuList = (menus: Menu[]) => {
    menuList.value = menus
  }

  const login = async (loginData: { username: string; password: string }) => {
    try {
      // 调用真正的后端登录API
      const response = await getLogin(loginData)
      
      if (response.success && response.data) {
        // 直接设置token和必要的cookie
        setToken(response.data.accessToken)
        
        // 设置multipleTabsKey cookie，这是路由守卫需要的
        Cookies.set('multiple-tabs', 'true')

        // 设置用户信息到localStorage，供路由守卫使用
        const userData = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
          expires: new Date(response.data.expires).getTime(),
          avatar: response.data.avatar || '',
          username: response.data.username,
          nickname: response.data.nickname || response.data.username,
          roles: response.data.roles || [],
          permissions: response.data.permissions || []
        }
        
        // 存储到localStorage，供路由守卫检查 - 使用userKey保证一致性
        storageLocal().setItem(userKey, userData)

        // 持久化状态
        persistState()

        return response
      } else {
        throw new Error('登录失败：响应数据格式错误')
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const logout = () => {
    // 使用auth工具的removeToken函数，这会清除所有相关数据
    removeToken()
    
    setToken(null)
    setUserInfo(null)
    setRoles([])
    setPermissions([])
    setMenuList([])

    // 清除其他存储的数据
    localStorage.removeItem('userInfo')
    localStorage.removeItem('roles')
    localStorage.removeItem('permissions')
    localStorage.removeItem('menuList')
  }

  const updateUserInfo = (info: Partial<User>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
    }
  }

  const refreshUserInfo = async () => {
    try {
      // 这里应该调用获取用户信息的API
      // const response = await getUserInfoApi()
      // setUserInfo(response.user)
      // setRoles(response.roles)
      // setPermissions(response.permissions)

      console.log('刷新用户信息')
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      throw error
    }
  }

  const checkPermission = (permission: string | string[]): boolean => {
    if (!permissions.value.length) return false

    if (Array.isArray(permission)) {
      return permission.some(p => permissions.value.includes(p))
    }

    return permissions.value.includes(permission)
  }

  const checkRole = (roleCode: string | string[]): boolean => {
    if (!roles.value.length) return false

    if (Array.isArray(roleCode)) {
      return roleCode.some(code => roles.value.some(role => role.code === code))
    }

    return roles.value.some(role => role.code === roleCode)
  }

  // 持久化状态恢复
  const restoreState = () => {
    try {
      const savedUserInfo = localStorage.getItem('userInfo')
      const savedRoles = localStorage.getItem('roles')
      const savedPermissions = localStorage.getItem('permissions')
      const savedMenuList = localStorage.getItem('menuList')

      if (savedUserInfo) {
        setUserInfo(JSON.parse(savedUserInfo))
      }
      if (savedRoles) {
        setRoles(JSON.parse(savedRoles))
      }
      if (savedPermissions) {
        setPermissions(JSON.parse(savedPermissions))
      }
      if (savedMenuList) {
        setMenuList(JSON.parse(savedMenuList))
      }
    } catch (error) {
      console.error('恢复用户状态失败:', error)
    }
  }

  // 持久化状态保存
  const persistState = () => {
    try {
      if (userInfo.value) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
      if (roles.value.length) {
        localStorage.setItem('roles', JSON.stringify(roles.value))
      }
      if (permissions.value.length) {
        localStorage.setItem('permissions', JSON.stringify(permissions.value))
      }
      if (menuList.value.length) {
        localStorage.setItem('menuList', JSON.stringify(menuList.value))
      }
    } catch (error) {
      console.error('保存用户状态失败:', error)
    }
  }

  const handRefreshToken = async (data: { refreshToken: string }) => {
    try {
      // 调用真正的刷新token API
      const response = await refreshTokenApi(data)
      
      if (response.success && response.data) {
        setToken(response.data.accessToken)
        return response
      } else {
        throw new Error('刷新token失败：响应数据格式错误')
      }
    } catch (error) {
      console.error('刷新token失败:', error)
      throw error
    }
  }

  return {
    // State
    token,
    userInfo,
    roles,
    permissions,
    menuList,

    // Getters
    isLoggedIn,
    userName,
    userAvatar,
    hasRole,
    hasPermission,

    // Actions
    setToken,
    setUserInfo,
    setRoles,
    setPermissions,
    setMenuList,
    login,
    logout,
    updateUserInfo,
    refreshUserInfo,
    checkPermission,
    checkRole,
    restoreState,
    persistState,
    handRefreshToken
  }
})
