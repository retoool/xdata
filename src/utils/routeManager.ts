/**
 * 路由管理工具类
 * 用于处理菜单配置与路由配置之间的转换和同步
 */

import type { RouteRecordRaw } from 'vue-router'
import type { Menu, MenuFormData } from '@/types/system'
import { router } from '@/router'
import { ElMessage } from 'element-plus'
import { cloneDeep } from '@pureadmin/utils'

// https://cn.vitejs.dev/guide/features.html#glob-import
const viewModules = import.meta.glob('/src/views/**/*.{vue,tsx}')

export interface RouteConfig extends RouteRecordRaw {
  meta?: {
    title?: string
    icon?: string
    keepAlive?: boolean
    hidden?: boolean
    affix?: boolean
    showLink?: boolean
    rank?: number
    frameSrc?: string
    backstage?: boolean
  }
}

export class RouteManager {
  /**
   * 将菜单配置转换为路由配置
   */
  static menuToRoute(menu: Menu): RouteConfig {
    const route: RouteConfig = {
      path: menu.path,
      name: menu.name || this.generateRouteName(menu.path),
      meta: {
        title: menu.title,
        icon: menu.icon,
        keepAlive: menu.cache,
        hidden: !menu.visible,
        affix: menu.affix,
        showLink: menu.visible !== false,
        rank: menu.sort,
        backstage: true // 标识为后端配置的路由
      }
    }

    // 根据菜单类型设置路由属性
    switch (menu.type) {
      case 1: // 目录
        route.redirect = menu.redirect || (menu.children?.[0]?.path)
        if (menu.children && menu.children.length > 0) {
          route.children = menu.children.map(child => this.menuToRoute(child))
        }
        break

      case 2: // 菜单
        if (menu.component) {
          route.component = this.resolveComponent(menu.component)
        }
        if (menu.redirect) {
          route.redirect = menu.redirect
        }
        break

      case 3: // 按钮
        // 按钮类型不生成路由
        return null as any
    }

    return route
  }

  /**
   * 将菜单树转换为路由配置数组
   */
  static menuTreeToRoutes(menuTree: Menu[]): RouteConfig[] {
    const routes: RouteConfig[] = []

    for (const menu of menuTree) {
      const route = this.menuToRoute(menu)
      if (route) {
        routes.push(route)
      }
    }

    return routes
  }

  /**
   * 将路由配置转换为菜单配置
   */
  static routeToMenu(route: RouteConfig, parentId: number | null = null): Menu {
    return {
      id: 0, // 新菜单ID为0，保存时由后端生成
      title: route.meta?.title || route.name as string || '',
      name: route.name as string,
      path: route.path,
      component: this.getComponentPath(route.component),
      icon: route.meta?.icon,
      parentId,
      sort: route.meta?.rank || 0,
      level: parentId ? 2 : 1, // 简单层级计算
      type: route.children ? 1 : 2, // 有子路由为目录，无子路由为菜单
      status: 1,
      isHidden: route.meta?.hidden || false,
      isKeepAlive: route.meta?.keepAlive || false,
      isAffix: route.meta?.affix || false,
      visible: route.meta?.showLink !== false,
      cache: route.meta?.keepAlive || false,
      affix: route.meta?.affix || false,
      redirect: route.redirect as string,
      alwaysShow: false,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      children: route.children ? route.children.map(child =>
        this.routeToMenu(child as RouteConfig, 0)
      ) : undefined
    }
  }

  /**
   * 获取所有可用的组件路径
   */
  static getAvailableComponents(): string[] {
    return Object.keys(viewModules).map(path =>
      path.replace('/src/views/', '@/views/').replace(/\.(vue|tsx)$/, '')
    ).sort()
  }

  /**
   * 验证组件路径是否存在
   */
  static validateComponentPath(componentPath: string): boolean {
    const fullPath = componentPath.startsWith('@/views/')
      ? componentPath.replace('@/views/', '/src/views/')
      : `/src/views/${componentPath}`

    const existsAsVue = viewModules[`${fullPath}.vue`] !== undefined
    const existsAsTsx = viewModules[`${fullPath}.tsx`] !== undefined

    return existsAsVue || existsAsTsx
  }

  /**
   * 智能组件路径建议
   */
  static suggestComponentPath(menuPath: string, menuName?: string): string[] {
    const suggestions: string[] = []

    // 基于路径的建议
    if (menuPath.startsWith('/')) {
      const pathParts = menuPath.split('/').filter(Boolean)
      if (pathParts.length > 0) {
        suggestions.push(`@/views/${pathParts.join('/')}/index`)
        if (pathParts.length > 1) {
          suggestions.push(`@/views/${pathParts.slice(0, -1).join('/')}/${pathParts[pathParts.length - 1]}`)
        }
      }
    }

    // 基于名称的建议
    if (menuName) {
      const nameParts = menuName.split(/(?=[A-Z])/).map(part => part.toLowerCase())
      suggestions.push(`@/views/${nameParts.join('/')}/index`)
    }

    // 过滤出实际存在的路径
    return suggestions.filter(path => this.validateComponentPath(path))
  }

  /**
   * 动态添加路由
   */
  static addDynamicRoute(menu: Menu): boolean {
    try {
      const route = this.menuToRoute(menu)
      if (!route) return false

      // 检查路由是否已存在
      if (router.hasRoute(route.name!)) {
        router.removeRoute(route.name!)
      }

      // 添加到主路由的children中
      router.addRoute('/', route)

      ElMessage.success(`路由 ${route.path} 已动态添加`)
      return true
    } catch (error) {
      console.error('添加动态路由失败:', error)
      ElMessage.error('添加动态路由失败')
      return false
    }
  }

  /**
   * 移除动态路由
   */
  static removeDynamicRoute(routeName: string): boolean {
    try {
      if (router.hasRoute(routeName)) {
        router.removeRoute(routeName)
        ElMessage.success(`路由 ${routeName} 已移除`)
        return true
      }
      return false
    } catch (error) {
      console.error('移除动态路由失败:', error)
      ElMessage.error('移除动态路由失败')
      return false
    }
  }

  /**
   * 批量同步菜单到路由
   */
  static syncMenusToRoutes(menus: Menu[]): void {
    try {
      // 清除现有的动态路由（标记为backstage的路由）
      const existingRoutes = router.getRoutes()
      existingRoutes.forEach(route => {
        if (route.meta?.backstage && route.name) {
          router.removeRoute(route.name)
        }
      })

      // 添加新的路由
      const routes = this.menuTreeToRoutes(menus)
      routes.forEach(route => {
        if (route && route.name) {
          router.addRoute('/', route)
        }
      })

      ElMessage.success('菜单路由同步完成')
    } catch (error) {
      console.error('同步菜单到路由失败:', error)
      ElMessage.error('同步菜单到路由失败')
    }
  }

  /**
   * 生成路由名称
   */
  private static generateRouteName(path: string): string {
    return path
      .split('/')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  /**
   * 解析组件
   */
  private static resolveComponent(componentPath: string): any {
    if (!componentPath) return undefined

    const fullPath = componentPath.startsWith('@/views/')
      ? componentPath.replace('@/views/', '/src/views/')
      : `/src/views/${componentPath}`

    // 尝试.vue文件
    if (viewModules[`${fullPath}.vue`]) {
      return viewModules[`${fullPath}.vue`]
    }

    // 尝试.tsx文件
    if (viewModules[`${fullPath}.tsx`]) {
      return viewModules[`${fullPath}.tsx`]
    }

    console.warn(`组件路径不存在: ${componentPath}`)
    return undefined
  }

  /**
   * 获取组件路径字符串
   */
  private static getComponentPath(component: any): string {
    if (!component) return ''

    // 如果是函数，尝试从注释或其他方式获取路径
    if (typeof component === 'function') {
      const componentStr = component.toString()
      const match = componentStr.match(/import\("([^"]+)"\)/)
      if (match) {
        return match[1].replace('/src/views/', '@/views/').replace(/\.(vue|tsx)$/, '')
      }
    }

    return ''
  }

  /**
   * 验证菜单配置的路由有效性
   */
  static validateMenuRoute(menu: Partial<MenuFormData>): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // 验证路径格式
    if (menu.path && !menu.path.startsWith('/') && !menu.path.startsWith('http')) {
      errors.push('路由路径必须以 / 开头或者是完整的URL地址')
    }

    // 验证路由名称唯一性
    if (menu.name && router.hasRoute(menu.name)) {
      errors.push(`路由名称 ${menu.name} 已存在`)
    }

    // 验证组件路径
    if (menu.type === 2 && menu.component && !this.validateComponentPath(menu.component)) {
      errors.push(`组件路径 ${menu.component} 不存在`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 预览生成的路由配置
   */
  static previewRouteConfig(menu: Menu): RouteConfig | null {
    return this.menuToRoute(cloneDeep(menu))
  }
} 