# 菜单Mock数据生成指南

## 概述

本项目提供了一套完整的工具，用于从现有的Vue Router配置自动生成菜单管理的Mock数据。这些工具能够帮助开发者快速创建与路由配置同步的菜单数据，提高开发效率。

## 文件结构

```
├── mock/
│   └── menu.ts                    # 菜单管理的Mock数据和API
├── src/
│   ├── utils/
│   │   ├── routeManager.ts        # 路由管理器（已有）
│   │   ├── dynamicRouteGenerator.ts # 动态路由生成器（已有）
│   │   └── generateMenuFromRoutes.ts # 新增：菜单数据生成工具
│   └── examples/
│       └── menuMockExample.ts     # 使用示例
└── docs/
    └── menu-mock-generation.md   # 本文档
```

## 核心功能

### 1. Mock数据文件 (`mock/menu.ts`)

提供完整的菜单管理Mock API，包括：
- 📊 基于现有路由的菜单树数据（首页、系统管理、计算管理）
- 🔧 完整的CRUD操作API
- ✅ 数据验证和错误处理
- 🎯 符合系统类型定义的数据结构

### 2. 菜单生成工具 (`src/utils/generateMenuFromRoutes.ts`)

提供从路由配置生成菜单数据的工具类：
- 🚀 从当前Vue Router配置自动生成菜单
- 🔄 数据格式转换和处理
- 📈 路由统计和分析
- 💾 数据导出功能

### 3. 使用示例 (`src/examples/menuMockExample.ts`)

提供6个完整的使用示例，涵盖各种应用场景。

## 快速开始

### 1. 基本使用

```typescript
import { generateSampleMenuData } from '@/utils/generateMenuFromRoutes'

// 生成菜单数据
const menus = await generateSampleMenuData()
console.log('生成的菜单:', menus)
```

### 2. 在浏览器控制台中测试

在开发环境中打开浏览器控制台，执行：

```javascript
// 基本生成
await window.menuExamples.basic()

// 查看路由统计
window.menuExamples.stats()

// 运行所有示例
await window.menuExamples.runAll()
```

### 3. 自定义配置

```typescript
import { MenuDataGenerator } from '@/utils/generateMenuFromRoutes'

const menus = await MenuDataGenerator.generateMenusFromCurrentRoutes({
  includeStaticRoutes: true,
  excludePaths: ['/login', '/error'],
  defaultStatus: 1,
  defaultSort: 0
})
```

## 详细使用方法

### 配置选项

`RouteImportConfig` 接口提供以下配置选项：

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `includeStaticRoutes` | boolean | true | 是否包含静态路由 |
| `includeDynamicRoutes` | boolean | false | 是否包含动态路由 |
| `excludePaths` | string[] | ['/login', '/error', '/redirect'] | 排除的路径 |
| `defaultStatus` | number | 1 | 默认状态（1:启用 0:禁用） |
| `defaultSort` | number | 0 | 默认排序值 |

### API接口

Mock数据文件提供以下API端点：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/system/menu/tree` | 获取菜单树 |
| GET | `/system/menu/list` | 获取菜单列表（分页） |
| GET | `/system/menu/:id` | 获取菜单详情 |
| POST | `/system/menu` | 创建菜单 |
| POST | `/system/menu/:id` | 更新菜单 |
| POST | `/system/menu/:id/delete` | 删除菜单 |
| POST | `/system/menu/batch-delete` | 批量删除 |
| POST | `/system/menu/:id/status` | 更新状态 |
| POST | `/system/menu/:id/visibility` | 更新可见性 |
| POST | `/system/menu/:id/move` | 移动菜单 |
| POST | `/system/menu/sort` | 更新排序 |
| POST | `/system/menu/check-path` | 检查路径 |
| POST | `/system/menu/check-name` | 检查名称 |
| GET | `/system/menu/icons` | 获取图标列表 |
| POST | `/system/menu/:id/copy` | 复制菜单 |
| GET | `/system/menu/export` | 导出数据 |
| POST | `/system/menu/import` | 导入数据 |

## 使用示例

### 示例1: 基本生成

```typescript
import { generateSampleMenuData } from '@/utils/generateMenuFromRoutes'

export async function basicExample() {
  const menus = await generateSampleMenuData()
  console.log(`生成了 ${menus.length} 个菜单项`)
}
```

### 示例2: 合并数据

```typescript
import { MenuDataGenerator } from '@/utils/generateMenuFromRoutes'

export async function mergeExample() {
  const generated = await MenuDataGenerator.generateMenusFromCurrentRoutes()
  const existing = [...] // 现有的菜单数据
  const merged = MenuDataGenerator.mergeWithMockData(generated, existing)
  
  return merged
}
```

### 示例3: 导出数据

```typescript
import { MenuDataGenerator } from '@/utils/generateMenuFromRoutes'

export async function exportExample() {
  await MenuDataGenerator.generateAndExportMenus({
    includeStaticRoutes: true,
    excludePaths: ['/login', '/error']
  })
}
```

### 示例4: 路由统计

```typescript
import { MenuDataGenerator } from '@/utils/generateMenuFromRoutes'

export function statsExample() {
  MenuDataGenerator.printRouteStatistics()
  
  const stats = MenuDataGenerator.getRouteStatistics()
  console.log('详细统计:', stats)
}
```

## 数据结构

### 菜单数据结构

```typescript
interface Menu {
  id: number                    // 菜单ID
  title: string                // 菜单标题
  name?: string               // 路由名称
  icon?: string               // 图标
  path: string                // 路由路径
  component?: string          // 组件路径
  parentId: number | null     // 父菜单ID
  sort: number                // 排序
  level: number               // 层级
  type?: number               // 类型（1:目录 2:菜单）
  status: number              // 状态（1:启用 0:禁用）
  isHidden: boolean           // 是否隐藏
  isKeepAlive: boolean        // 是否缓存
  isAffix: boolean            // 是否固定
  visible?: boolean           // 是否可见
  cache?: boolean             // 是否缓存
  affix?: boolean             // 是否固定
  redirect?: string           // 重定向
  alwaysShow?: boolean        // 总是显示
  createTime: string          // 创建时间
  updateTime: string          // 更新时间
  children?: Menu[]           // 子菜单
}
```

### 现有路由配置

当前系统包含以下路由模块：
- **首页模块** (`/`): 欢迎页面
- **系统管理** (`/system`): 用户管理、角色管理、菜单管理
- **计算管理** (`/computer`): 算子管理、工作流管理、工作流设计器

## 最佳实践

### 1. 开发流程

1. **路由配置更新** → 修改 `src/router/modules/` 下的路由文件
2. **生成菜单数据** → 运行菜单生成工具
3. **更新Mock数据** → 将生成的数据合并到 `mock/menu.ts`
4. **测试验证** → 在开发环境中测试菜单功能

### 2. 配置建议

```typescript
// 推荐的生产环境配置
const productionConfig = {
  includeStaticRoutes: true,
  includeDynamicRoutes: false,
  excludePaths: ['/login', '/error', '/redirect', '/404', '/403'],
  defaultStatus: 1,
  defaultSort: 0
}

// 推荐的开发环境配置
const developmentConfig = {
  includeStaticRoutes: true,
  includeDynamicRoutes: true,
  excludePaths: ['/login', '/error'],
  defaultStatus: 1,
  defaultSort: 0
}
```

### 3. 调试技巧

```typescript
// 1. 查看路由统计
MenuDataGenerator.printRouteStatistics()

// 2. 调试生成过程
debugMenuGeneration()

// 3. 导出数据进行分析
await MenuDataGenerator.generateAndExportMenus()
```

## 注意事项

1. **权限控制**: 当前版本已移除菜单级别的权限控制，只保留角色级别权限
2. **路径唯一性**: 确保生成的菜单路径不重复
3. **层级关系**: 正确设置父子菜单关系
4. **数据同步**: 路由变更后及时更新菜单数据
5. **性能考虑**: 大量菜单时注意分页和懒加载

## 故障排除

### 常见问题

1. **生成的菜单为空**
   - 检查路由配置是否正确
   - 验证排除路径配置
   - 确认路由模块是否正确加载

2. **路径冲突**
   - 检查现有菜单数据
   - 使用 `checkMenuPath` API验证
   - 调整路由配置避免重复

3. **菜单层级错误**
   - 检查 `parentId` 设置
   - 验证路由嵌套结构
   - 使用调试工具分析层级关系

### 调试方法

```typescript
// 开启详细日志
console.log('当前路由:', router.getRoutes())

// 检查生成配置
const config = MenuDataGenerator.defaultConfig
console.log('默认配置:', config)

// 验证数据结构
const menus = await generateSampleMenuData()
console.log('生成结果:', JSON.stringify(menus, null, 2))
```

## 扩展开发

### 自定义处理器

```typescript
// 创建自定义菜单处理器
class CustomMenuProcessor {
  static processMenu(menu: Menu): Menu {
    // 自定义处理逻辑
    return {
      ...menu,
      // 添加自定义字段
      customField: 'value'
    }
  }
}
```

### 添加新的配置选项

```typescript
// 扩展RouteImportConfig接口
interface ExtendedRouteImportConfig extends RouteImportConfig {
  customOptions?: {
    enableSorting?: boolean
    defaultIcon?: string
  }
}
```

## 总结

这套菜单Mock数据生成工具提供了从路由配置到菜单数据的完整解决方案，支持：

- ✅ 自动化数据生成
- ✅ 灵活的配置选项
- ✅ 完整的API模拟
- ✅ 丰富的使用示例
- ✅ 详细的调试工具

通过使用这些工具，开发者可以快速建立与路由系统同步的菜单管理功能，提高开发效率并确保数据一致性。 