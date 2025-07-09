/**
 * 菜单Mock数据生成示例
 * 
 * 这个文件展示了如何：
 * 1. 从现有路由配置生成菜单数据
 * 2. 结合mock数据进行测试
 * 3. 在开发环境中使用生成的数据
 */

import { generateSampleMenuData, MenuDataGenerator, debugMenuGeneration } from '@/utils/generateMenuFromRoutes'
import type { Menu } from '@/types/system'

// 模拟从mock/menu.ts中获取的现有数据
const mockMenuData: Menu[] = [
  {
    id: 1,
    title: "首页",
    name: "Home",
    icon: "ep/home-filled",
    path: "/",
    component: "@/layout/index",
    parentId: null,
    sort: 0,
    level: 1,
    type: 1,
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
        icon: "ep/home-filled",
        path: "/welcome",
        component: "@/views/welcome/index",
        parentId: 1,
        sort: 0,
        level: 2,
        type: 2,
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
  }
]

/**
 * 示例1: 基本的菜单数据生成
 */
export async function basicMenuGeneration() {
  console.log('📖 示例1: 基本的菜单数据生成')
  console.log('=' * 50)

  try {
    // 从当前路由生成菜单数据
    const generatedMenus = await generateSampleMenuData()

    if (generatedMenus.length > 0) {
      console.log('✅ 生成的菜单数据:')
      generatedMenus.forEach((menu, index) => {
        console.log(`${index + 1}. ${menu.title} (${menu.path})`)
        if (menu.children) {
          menu.children.forEach((child, childIndex) => {
            console.log(`   ${childIndex + 1}. ${child.title} (${child.path})`)
          })
        }
      })
    } else {
      console.log('⚠️ 没有生成任何菜单数据')
    }
  } catch (error) {
    console.error('❌ 生成失败:', error)
  }

  console.log('\n')
}

/**
 * 示例2: 合并生成数据与Mock数据
 */
export async function mergedMenuGeneration() {
  console.log('📖 示例2: 合并生成数据与Mock数据')
  console.log('=' * 50)

  try {
    // 生成新的菜单数据
    const generatedMenus = await MenuDataGenerator.generateMenusFromCurrentRoutes({
      includeStaticRoutes: true,
      excludePaths: ['/login', '/error', '/redirect'],
      defaultStatus: 1,
      defaultSort: 0
    })

    // 与现有mock数据合并
    const mergedMenus = MenuDataGenerator.mergeWithMockData(generatedMenus, mockMenuData)

    console.log(`✅ 合并完成，共 ${mergedMenus.length} 个顶级菜单`)

    // 打印合并后的菜单结构
    console.log('📋 合并后的菜单结构:')
    mergedMenus.forEach((menu, index) => {
      console.log(`${index + 1}. ${menu.title} (${menu.path}) - ${menu.id}`)
    })

    return mergedMenus
  } catch (error) {
    console.error('❌ 合并失败:', error)
    return []
  }

  console.log('\n')
}

/**
 * 示例3: 生成并导出菜单数据为JSON文件
 */
export async function exportMenuGeneration() {
  console.log('📖 示例3: 生成并导出菜单数据')
  console.log('=' * 50)

  try {
    await MenuDataGenerator.generateAndExportMenus({
      includeStaticRoutes: true,
      includeDynamicRoutes: false,
      excludePaths: ['/login', '/error'],
      defaultStatus: 1,
      defaultSort: 0
    })

    console.log('✅ 菜单数据已导出为JSON文件（仅在浏览器环境中有效）')
  } catch (error) {
    console.error('❌ 导出失败:', error)
  }

  console.log('\n')
}

/**
 * 示例4: 获取路由统计信息
 */
export function routeStatisticsExample() {
  console.log('📖 示例4: 路由统计信息')
  console.log('=' * 50)

  try {
    MenuDataGenerator.printRouteStatistics()

    const stats = MenuDataGenerator.getRouteStatistics()
    console.log('\n📊 详细统计数据:')
    console.log(JSON.stringify(stats, null, 2))
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error)
  }

  console.log('\n')
}

/**
 * 示例5: 调试菜单生成过程
 */
export function debugExample() {
  console.log('📖 示例5: 调试菜单生成过程')
  console.log('=' * 50)

  try {
    debugMenuGeneration()
  } catch (error) {
    console.error('❌ 调试失败:', error)
  }

  console.log('\n')
}

/**
 * 示例6: 自定义配置生成菜单
 */
export async function customConfigGeneration() {
  console.log('📖 示例6: 自定义配置生成菜单')
  console.log('=' * 50)

  const customConfigs = [
    {
      name: "只包含系统管理模块",
      config: {
        includeStaticRoutes: true,
        excludePaths: ['/login', '/error', '/redirect', '/', '/welcome', '/computer'],
        defaultStatus: 1,
        defaultSort: 0
      }
    },
    {
      name: "只包含计算管理模块",
      config: {
        includeStaticRoutes: true,
        excludePaths: ['/login', '/error', '/redirect', '/', '/welcome', '/system'],
        defaultStatus: 1,
        defaultSort: 0
      }
    }
  ]

  for (const { name, config } of customConfigs) {
    console.log(`\n🔧 配置: ${name}`)
    console.log('-' * 30)

    try {
      const menus = await MenuDataGenerator.generateMenusFromCurrentRoutes(config)

      if (menus.length > 0) {
        console.log(`✅ 生成 ${menus.length} 个菜单项:`)
        menus.forEach((menu, index) => {
          console.log(`  ${index + 1}. ${menu.title} (${menu.path})`)
        })
      } else {
        console.log('⚠️ 没有生成任何菜单')
      }
    } catch (error) {
      console.error(`❌ 配置"${name}"生成失败:`, error)
    }
  }

  console.log('\n')
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('🚀 菜单Mock数据生成示例集合')
  console.log('=' * 60)
  console.log('\n')

  // 依次运行所有示例
  await basicMenuGeneration()
  await mergedMenuGeneration()
  await exportMenuGeneration()
  routeStatisticsExample()
  debugExample()
  await customConfigGeneration()

  console.log('✅ 所有示例运行完成!')
  console.log('\n💡 使用建议:')
  console.log('1. 在开发环境中，可以调用这些函数生成测试数据')
  console.log('2. 生成的菜单数据可以直接用于mock/menu.ts文件')
  console.log('3. 可以根据需要调整RouteImportConfig配置')
  console.log('4. 建议在路由变更后重新生成菜单数据保持同步')
}

/**
 * 在浏览器控制台中快速测试的函数
 */
export function quickTest() {
  console.log('🔥 快速测试 - 生成菜单数据')

  // 设置全局变量方便调试
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.menuExamples = {
      basic: basicMenuGeneration,
      merged: mergedMenuGeneration,
      export: exportMenuGeneration,
      stats: routeStatisticsExample,
      debug: debugExample,
      custom: customConfigGeneration,
      runAll: runAllExamples
    }

    console.log('📝 可用的测试函数已挂载到 window.menuExamples:')
    console.log('- basic(): 基本生成')
    console.log('- merged(): 合并数据')
    console.log('- export(): 导出文件')
    console.log('- stats(): 统计信息')
    console.log('- debug(): 调试信息')
    console.log('- custom(): 自定义配置')
    console.log('- runAll(): 运行所有示例')
  }
}

// 如果在浏览器环境中，自动运行快速测试
if (typeof window !== 'undefined') {
  quickTest()
} 