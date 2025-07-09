import { router } from '@/router'
import { DynamicRouteGenerator, type RouteImportConfig } from '@/utils/dynamicRouteGenerator'
import type { Menu } from '@/types/system'

/**
 * 从现有路由配置生成菜单数据的工具类
 */
export class MenuDataGenerator {
  /**
   * 默认的路由导入配置
   */
  static readonly defaultConfig: RouteImportConfig = {
    includeStaticRoutes: true,
    includeDynamicRoutes: false,
    excludePaths: ['/login', '/error', '/redirect'],
    defaultStatus: 1,
    defaultSort: 0
  }

  /**
   * 从当前路由配置生成菜单数据
   */
  static async generateMenusFromCurrentRoutes(config?: Partial<RouteImportConfig>): Promise<Menu[]> {
    const finalConfig = { ...this.defaultConfig, ...config }

    try {
      const result = await DynamicRouteGenerator.generateMenusFromRoutes(finalConfig)

      if (result.success) {
        console.log(`✅ 成功从路由生成 ${result.generatedMenus.length} 个菜单项`)

        // 处理生成的菜单数据，补充必要字段
        const processedMenus = this.processGeneratedMenus(result.generatedMenus)

        return processedMenus
      } else {
        console.error('❌ 生成菜单失败:', result.errors)
        return []
      }
    } catch (error) {
      console.error('❌ 生成菜单异常:', error)
      return []
    }
  }

  /**
   * 处理生成的菜单数据，补充必要字段
   */
  private static processGeneratedMenus(menus: Menu[]): Menu[] {
    let idCounter = 1

    const processMenu = (menu: Menu, parentId: number | null = null, level: number = 1): Menu => {
      const processedMenu: Menu = {
        ...menu,
        id: idCounter++,
        parentId,
        level,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        // 根据路径判断菜单类型
        type: this.inferMenuType(menu),
        // 设置默认状态
        status: 1,
        visible: menu.visible !== false,
        cache: menu.cache || false,
        affix: menu.affix || false,
        alwaysShow: false
      }

      // 处理子菜单
      if (menu.children && menu.children.length > 0) {
        processedMenu.children = menu.children.map(child =>
          processMenu(child, processedMenu.id, level + 1)
        )
      }

      return processedMenu
    }

    return menus.map(menu => processMenu(menu))
  }

  /**
   * 根据菜单信息推断菜单类型
   */
  private static inferMenuType(menu: Menu): number {
    // 有子菜单的为目录
    if (menu.children && menu.children.length > 0) {
      return 1 // 目录
    }

    // 有组件路径的为菜单
    if (menu.component) {
      return 2 // 菜单
    }

    // 其他情况默认为菜单
    return 2
  }

  /**
   * 生成菜单数据并保存为JSON文件（用于开发调试）
   */
  static async generateAndExportMenus(config?: Partial<RouteImportConfig>): Promise<void> {
    const menus = await this.generateMenusFromCurrentRoutes(config)

    if (menus.length > 0) {
      const jsonData = JSON.stringify(menus, null, 2)

      // 在浏览器环境中下载文件
      if (typeof window !== 'undefined') {
        const blob = new Blob([jsonData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `generated-menus-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        console.log('📄 菜单数据已导出为JSON文件')
      } else {
        // Node.js环境中输出到控制台
        console.log('📄 生成的菜单数据:')
        console.log(jsonData)
      }
    }
  }

  /**
   * 合并生成的菜单与现有mock数据
   */
  static mergeWithMockData(generatedMenus: Menu[], mockMenus: Menu[]): Menu[] {
    const merged: Menu[] = [...mockMenus]

    // 获取已有的路径集合
    const existingPaths = new Set<string>()
    const collectPaths = (menus: Menu[]) => {
      menus.forEach(menu => {
        existingPaths.add(menu.path)
        if (menu.children) {
          collectPaths(menu.children)
        }
      })
    }
    collectPaths(mockMenus)

    // 只添加不存在的菜单
    const addUniqueMenus = (menus: Menu[]) => {
      menus.forEach(menu => {
        if (!existingPaths.has(menu.path)) {
          merged.push(menu)
          existingPaths.add(menu.path)
          console.log(`➕ 添加新菜单: ${menu.title} (${menu.path})`)
        }

        if (menu.children) {
          addUniqueMenus(menu.children)
        }
      })
    }

    addUniqueMenus(generatedMenus)

    return merged
  }

  /**
   * 获取当前系统中所有路由的统计信息
   */
  static getRouteStatistics(): {
    total: number
    byComponent: Record<string, number>
    byLevel: Record<number, number>
    withMeta: number
    withoutMeta: number
  } {
    const routes = router.getRoutes()
    const stats = {
      total: routes.length,
      byComponent: {} as Record<string, number>,
      byLevel: {} as Record<number, number>,
      withMeta: 0,
      withoutMeta: 0
    }

    routes.forEach(route => {
      // 按组件类型统计
      const componentType = route.component ? 'has-component' : 'no-component'
      stats.byComponent[componentType] = (stats.byComponent[componentType] || 0) + 1

      // 按路径层级统计
      const level = route.path.split('/').filter(Boolean).length
      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1

      // 按meta信息统计
      if (route.meta && Object.keys(route.meta).length > 0) {
        stats.withMeta++
      } else {
        stats.withoutMeta++
      }
    })

    return stats
  }

  /**
   * 打印路由统计信息
   */
  static printRouteStatistics(): void {
    const stats = this.getRouteStatistics()

    console.log('📊 路由统计信息:')
    console.log(`总路由数: ${stats.total}`)
    console.log(`有组件: ${stats.byComponent['has-component'] || 0}`)
    console.log(`无组件: ${stats.byComponent['no-component'] || 0}`)
    console.log(`有Meta信息: ${stats.withMeta}`)
    console.log(`无Meta信息: ${stats.withoutMeta}`)
    console.log('按层级分布:')
    Object.entries(stats.byLevel).forEach(([level, count]) => {
      console.log(`  ${level}级路由: ${count}个`)
    })
  }
}

/**
 * 快捷方法：生成少量示例菜单数据
 */
export async function generateSampleMenuData(): Promise<Menu[]> {
  console.log('🚀 开始从路由配置生成菜单数据...')

  // 打印当前路由统计
  MenuDataGenerator.printRouteStatistics()

  // 生成菜单数据
  const generatedMenus = await MenuDataGenerator.generateMenusFromCurrentRoutes({
    includeStaticRoutes: true,
    includeDynamicRoutes: false,
    excludePaths: ['/login', '/error', '/redirect', '/welcome'],
    defaultStatus: 1,
    defaultSort: 0
  })

  console.log(`✅ 生成完成，共 ${generatedMenus.length} 个菜单项`)

  // 可选：导出为文件
  // await MenuDataGenerator.generateAndExportMenus()

  return generatedMenus
}

/**
 * 开发时使用的调试函数
 */
export function debugMenuGeneration(): void {
  console.log('🔧 菜单生成调试信息:')

  // 打印所有路由信息
  const routes = router.getRoutes()
  console.log('📋 当前路由列表:')
  routes.forEach((route, index) => {
    console.log(`${index + 1}. ${route.name || 'unnamed'} -> ${route.path}`)
    if (route.meta) {
      console.log(`   Meta: ${JSON.stringify(route.meta)}`)
    }
  })

  // 生成并打印菜单数据
  generateSampleMenuData().then(menus => {
    console.log('🎯 生成的菜单结构:')
    console.log(JSON.stringify(menus, null, 2))
  })
} 