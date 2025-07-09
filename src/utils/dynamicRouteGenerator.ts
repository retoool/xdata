/**
 * 动态路由生成器
 * 提供从现有路由导入菜单、批量生成路由等功能
 */

import type { RouteRecordRaw } from 'vue-router'
import type { Menu, MenuFormData } from '@/types/system'
import { router } from '@/router'
import { RouteManager } from './routeManager'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface RouteImportConfig {
  includeStaticRoutes: boolean // 是否包含静态路由
  includeDynamicRoutes: boolean // 是否包含动态路由
  excludePaths: string[] // 排除的路径
  defaultStatus: number // 默认状态
  defaultSort: number // 默认排序
}

export interface RouteGenerationResult {
  success: boolean
  totalRoutes: number
  generatedMenus: Menu[]
  errors: string[]
  warnings: string[]
}

export class DynamicRouteGenerator {
  /**
   * 从现有路由生成菜单配置
   */
  static async generateMenusFromRoutes(config: RouteImportConfig): Promise<RouteGenerationResult> {
    const result: RouteGenerationResult = {
      success: false,
      totalRoutes: 0,
      generatedMenus: [],
      errors: [],
      warnings: []
    }

    try {
      const allRoutes = router.getRoutes()
      const validRoutes = this.filterRoutes(allRoutes, config)

      result.totalRoutes = validRoutes.length

      if (validRoutes.length === 0) {
        result.warnings.push('没有找到符合条件的路由')
        return result
      }

      // 构建路由树结构
      const routeTree = this.buildRouteTree(validRoutes)

      // 转换为菜单配置
      for (const route of routeTree) {
        try {
          const menu = this.routeToMenu(route, config)
          if (menu) {
            result.generatedMenus.push(menu)
          }
        } catch (error) {
          result.errors.push(`转换路由 ${route.path} 失败: ${error}`)
        }
      }

      result.success = result.errors.length === 0

      if (result.success) {
        ElMessage.success(`成功生成 ${result.generatedMenus.length} 个菜单项`)
      } else {
        ElMessage.warning(`生成完成，但有 ${result.errors.length} 个错误`)
      }

    } catch (error) {
      result.errors.push(`生成菜单失败: ${error}`)
      ElMessage.error('生成菜单失败')
    }

    return result
  }

  /**
   * 批量创建动态路由
   */
  static async batchCreateRoutes(menus: Menu[]): Promise<{
    success: boolean
    created: number
    failed: number
    errors: string[]
  }> {
    const result = {
      success: false,
      created: 0,
      failed: 0,
      errors: []
    }

    for (const menu of menus) {
      try {
        const success = RouteManager.addDynamicRoute(menu)
        if (success) {
          result.created++
        } else {
          result.failed++
          result.errors.push(`创建路由失败: ${menu.path}`)
        }
      } catch (error) {
        result.failed++
        result.errors.push(`创建路由 ${menu.path} 异常: ${error}`)
      }
    }

    result.success = result.failed === 0
    return result
  }

  /**
   * 预览路由生成结果
   */
  static previewRouteGeneration(menus: Menu[]): {
    routeConfigs: any[]
    validCount: number
    invalidCount: number
    validationErrors: { menu: Menu; errors: string[] }[]
  } {
    const result = {
      routeConfigs: [],
      validCount: 0,
      invalidCount: 0,
      validationErrors: []
    }

    for (const menu of menus) {
      try {
        const routeConfig = RouteManager.previewRouteConfig(menu)
        if (routeConfig) {
          result.routeConfigs.push({
            menu,
            routeConfig
          })

          // 验证路由配置
          const validation = RouteManager.validateMenuRoute(menu)
          if (validation.valid) {
            result.validCount++
          } else {
            result.invalidCount++
            result.validationErrors.push({
              menu,
              errors: validation.errors
            })
          }
        }
      } catch (error) {
        result.invalidCount++
        result.validationErrors.push({
          menu,
          errors: [`生成路由配置失败: ${error}`]
        })
      }
    }

    return result
  }

  /**
   * 检测路由冲突
   */
  static detectRouteConflicts(menus: Menu[]): {
    conflicts: {
      type: 'path' | 'name'
      value: string
      menus: Menu[]
    }[]
    hasConflicts: boolean
  } {
    const pathMap = new Map<string, Menu[]>()
    const nameMap = new Map<string, Menu[]>()

    // 收集路径和名称
    for (const menu of menus) {
      if (menu.path) {
        if (!pathMap.has(menu.path)) {
          pathMap.set(menu.path, [])
        }
        pathMap.get(menu.path)!.push(menu)
      }

      if (menu.name) {
        if (!nameMap.has(menu.name)) {
          nameMap.set(menu.name, [])
        }
        nameMap.get(menu.name)!.push(menu)
      }
    }

    const conflicts = []

    // 检查路径冲突
    for (const [path, menuList] of pathMap) {
      if (menuList.length > 1) {
        conflicts.push({
          type: 'path' as const,
          value: path,
          menus: menuList
        })
      }
    }

    // 检查名称冲突
    for (const [name, menuList] of nameMap) {
      if (menuList.length > 1) {
        conflicts.push({
          type: 'name' as const,
          value: name,
          menus: menuList
        })
      }
    }

    return {
      conflicts,
      hasConflicts: conflicts.length > 0
    }
  }

  /**
   * 自动修复路由冲突
   */
  static autoFixConflicts(menus: Menu[]): Menu[] {
    const fixedMenus = [...menus]
    const pathCounter = new Map<string, number>()
    const nameCounter = new Map<string, number>()

    for (const menu of fixedMenus) {
      // 修复路径冲突
      if (menu.path) {
        const count = pathCounter.get(menu.path) || 0
        if (count > 0) {
          menu.path = `${menu.path}_${count}`
        }
        pathCounter.set(menu.path, count + 1)
      }

      // 修复名称冲突
      if (menu.name) {
        const count = nameCounter.get(menu.name) || 0
        if (count > 0) {
          menu.name = `${menu.name}${count}`
        }
        nameCounter.set(menu.name, count + 1)
      }
    }

    return fixedMenus
  }

  /**
   * 智能路由分组
   */
  static groupRoutesByModule(menus: Menu[]): {
    [module: string]: Menu[]
  } {
    const groups: { [module: string]: Menu[] } = {}

    for (const menu of menus) {
      if (!menu.path) continue

      const pathParts = menu.path.split('/').filter(Boolean)
      const module = pathParts[0] || 'root'

      if (!groups[module]) {
        groups[module] = []
      }
      groups[module].push(menu)
    }

    return groups
  }

  /**
   * 过滤路由
   */
  private static filterRoutes(routes: RouteRecordRaw[], config: RouteImportConfig): RouteRecordRaw[] {
    return routes.filter(route => {
      // 排除指定路径
      if (config.excludePaths.some(excludePath => route.path.includes(excludePath))) {
        return false
      }

      // 排除系统路由
      if (route.path.startsWith('/redirect') ||
        route.path.startsWith('/error') ||
        route.path === '/login' ||
        route.path === '/') {
        return false
      }

      // 根据配置过滤静态/动态路由
      const isDynamic = route.meta?.backstage === true

      if (isDynamic && !config.includeDynamicRoutes) {
        return false
      }

      if (!isDynamic && !config.includeStaticRoutes) {
        return false
      }

      return true
    })
  }

  /**
   * 构建路由树
   */
  private static buildRouteTree(routes: RouteRecordRaw[]): RouteRecordRaw[] {
    const tree: RouteRecordRaw[] = []
    const routeMap = new Map<string, RouteRecordRaw>()

    // 先添加所有路由到map
    for (const route of routes) {
      routeMap.set(route.path, route)
    }

    // 构建树结构
    for (const route of routes) {
      const pathParts = route.path.split('/').filter(Boolean)

      if (pathParts.length === 1) {
        // 顶级路由
        tree.push(route)
      } else {
        // 子路由，尝试找到父路由
        const parentPath = '/' + pathParts.slice(0, -1).join('/')
        const parent = routeMap.get(parentPath)

        if (parent) {
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(route)
        } else {
          // 没有找到父路由，作为顶级路由
          tree.push(route)
        }
      }
    }

    return tree
  }

  /**
   * 路由转菜单
   */
  private static routeToMenu(route: RouteRecordRaw, config: RouteImportConfig, parentId: number | null = null): Menu {
    const pathParts = route.path.split('/').filter(Boolean)

    return {
      id: 0, // 新菜单ID
      title: route.meta?.title || route.name as string || pathParts[pathParts.length - 1] || '未命名',
      name: route.name as string,
      path: route.path,
      component: this.getComponentPathFromRoute(route),
      icon: route.meta?.icon as string,
      parentId,
      sort: config.defaultSort,
      level: parentId ? 2 : 1,
      type: route.children ? 1 : 2, // 有子路由为目录，无子路由为菜单
      status: config.defaultStatus,
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
        this.routeToMenu(child, config, 0)
      ) : undefined
    }
  }

  /**
   * 从路由获取组件路径
   */
  private static getComponentPathFromRoute(route: RouteRecordRaw): string {
    if (!route.component) return ''

    // 如果是函数组件，尝试提取路径
    if (typeof route.component === 'function') {
      const componentStr = route.component.toString()
      const match = componentStr.match(/import\("([^"]+)"\)/)
      if (match) {
        return match[1].replace('/src/views/', '@/views/').replace(/\.(vue|tsx)$/, '')
      }
    }

    return ''
  }


} 