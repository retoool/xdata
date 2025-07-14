import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Role, Menu } from '@/types/system'
import { getLogin, refreshTokenApi } from '@/api/system/user'
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
      
      // 直接设置token和必要的cookie
      setToken(response.accessToken)
      
      // 设置multipleTabsKey cookie，这是路由守卫需要的
      Cookies.set('multiple-tabs', 'true')

      // 设置用户信息到store
      const userData = {
        id: 1, // 临时ID，应该从后端获取
        username: response.username,
        realName: response.nickname || response.username,
        avatar: response.avatar || '/src/assets/user.svg', // 确保有默认头像
        email: '',
        phone: '',
        departmentId: 0,
        departmentName: '',
        roleIds: [],
        status: 1,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      
      // 设置用户信息到store
      setUserInfo(userData)
      
      // 将字符串角色转换为Role对象（临时处理，应该从后端获取完整的Role对象）
      const roleObjects: Role[] = (response.roles || []).map((roleCode: string, index: number) => ({
        id: index + 1,
        name: roleCode,
        code: roleCode,
        description: '',
        permissions: [],
        status: 1,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }))
      
      setRoles(roleObjects)
      setPermissions(response.permissions || [])
      
      // 设置用户信息到localStorage，供路由守卫使用
      const storageData = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expires: new Date(response.expires).getTime(),
        avatar: response.avatar || '/src/assets/user.svg', // 确保有默认头像
        username: response.username,
        nickname: response.nickname || response.username,
        roles: response.roles || [],
        permissions: response.permissions || []
      }
      
      // 存储到localStorage，供路由守卫检查 - 使用userKey保证一致性
      storageLocal().setItem(userKey, storageData)

      // 持久化状态
      persistState()

      return response
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
    
    // 导入router并跳转到登录页
    import('@/router').then(({ router }) => {
      router.push('/login').then(() => {
        console.log('已退出登录，跳转到登录页')
      }).catch(error => {
        console.error('跳转到登录页失败:', error)
        // 强制刷新页面作为备用方案
        window.location.href = '/login'
      })
    })
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
      
      setToken(response.accessToken)
      return response
    } catch (error) {
      console.error('刷新token失败:', error)
      throw error
    }
  }

  // 处理token过期和用户被禁用
  const handleTokenExpired = (error?: any) => {
    // 检查是否是登录接口的错误
    if (error?.config?.url?.includes('/login')) {
      // 登录接口的错误，不执行登出操作，让错误继续传播
      return;
    }
    
    // 检查是否是403错误（用户被禁用）
    if (error?.response?.status === 403) {
      console.log('用户已被禁用，执行登出操作');
      logout();
      return;
    }
    
    // 其他接口的401错误，执行登出操作
    console.log('Token已过期，执行登出操作');
    logout();
  }

  // 初始化时恢复状态
  restoreState()

  // 配置HTTP拦截器的token处理器
  import('@/utils/http').then(({ PureHttp }) => {
    PureHttp.setTokenHandlers({
      getToken: () => {
        const token = localStorage.getItem('authorized-token');
        return token ? JSON.parse(token) : null;
      },
      refreshToken: (refreshToken: string) => handRefreshToken({ refreshToken }),
      onTokenExpired: handleTokenExpired
    });
  });

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
