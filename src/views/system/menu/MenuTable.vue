<template>
  <div class="menu-table">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="left-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增菜单
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
        <el-button @click="expandAll">
          <el-icon><ArrowDown /></el-icon>展开全部
        </el-button>
        <el-button @click="collapseAll">
          <el-icon><ArrowRight /></el-icon>折叠全部
        </el-button>
        <el-dropdown @command="handleBatchAction">
          <el-button>
            <el-icon><Operation /></el-icon>批量操作
            <el-icon><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="sync-routes">
                <el-icon><Refresh /></el-icon>同步到路由
              </el-dropdown-item>
              <el-dropdown-item command="export-config" divided>
                <el-icon><Download /></el-icon>导出配置
              </el-dropdown-item>
              <el-dropdown-item command="import-config">
                <el-icon><Upload /></el-icon>导入配置
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      
      <div class="right-search">
        <el-input
          v-model="searchForm.keyword"
                      placeholder="搜索菜单名称、路径"
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select 
          v-model="searchForm.type" 
          placeholder="菜单类型" 
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="目录" :value="1" />
          <el-option label="菜单" :value="2" />
          <el-option label="按钮" :value="3" />
        </el-select>
        <el-select 
          v-model="searchForm.status" 
          placeholder="状态" 
          clearable
          style="width: 100px"
          @change="handleSearch"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </div>
    </div>
    
    <!-- 菜单表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="defaultExpandAll"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="50" />
        
        <!-- 菜单名称 -->
        <el-table-column label="菜单名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="menu-title">
              <el-icon v-if="row.icon" class="menu-icon">
                <component :is="row.icon" />
              </el-icon>
              <el-icon v-else class="menu-icon default-icon">
                <Menu />
              </el-icon>
              <span class="title-text">{{ row.title }}</span>
              <el-tag 
                :type="getMenuTypeTagType(row.type)" 
                size="small" 
                style="margin-left: 8px;"
              >
                {{ getMenuTypeText(row.type) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <!-- 路由信息 -->
        <el-table-column label="路由信息" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="route-info">
              <div v-if="row.path" class="route-path">
                <el-tag size="small" type="primary">{{ row.path }}</el-tag>
              </div>
              <div v-if="row.name" class="route-name">
                <span class="label">Name:</span>
                <span class="value">{{ row.name }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 组件路径 -->
        <el-table-column prop="component" label="组件路径" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.component" class="component-path">{{ row.component }}</span>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        

        
        <!-- 排序 -->
        <el-table-column prop="sort" label="排序" width="80" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.sort || 0 }}</el-tag>
          </template>
        </el-table-column>
        
        <!-- 可见性 -->
        <el-table-column label="显示" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.visible"
              :disabled="row.type === 3"
              @change="handleVisibilityChange(row)"
            />
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        
        <!-- 创建时间 -->
        <el-table-column prop="createTime" label="创建时间" width="160" />
        
        <!-- 操作 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              @click.stop="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click.stop="handleAddChild(row)"
            >
              新增
            </el-button>
            <el-button 
              type="warning" 
              size="small" 
              @click.stop="handleCopy(row)"
            >
              复制
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              :disabled="row.children && row.children.length > 0"
              @click.stop="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 菜单详情面板 -->
    <el-drawer
      v-model="showMenuDetail"
      title="菜单详情"
      direction="rtl"
      size="400px"
    >
      <MenuDetail 
        v-if="currentMenu"
        :menu="currentMenu"
        @edit="handleEdit"
        @delete="handleDelete"
        @add-child="handleAddChild"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, inject, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Plus, 
  Refresh, 
  ArrowDown, 
  ArrowRight, 
  Search, 
  Menu,
  Operation,
  Download,
  Upload
} from '@element-plus/icons-vue'
// Define basic Menu interface locally to avoid import issues
interface MenuType {
  id: number
  title: string
  name?: string
  icon?: string
  path: string
  component?: string
  parentId: number | null
  sort: number
  level: number
  type?: number
  status: number
  isHidden: boolean
  isKeepAlive: boolean
  isAffix: boolean
  visible?: boolean
  cache?: boolean
  affix?: boolean
  redirect?: string
  alwaysShow?: boolean
  createTime: string
  updateTime: string
  children?: MenuType[]
  [key: string]: any
}
import { 
  getMenuTree,
  createMenu,
  updateMenu,
  deleteMenu,
  updateMenuStatus,
  updateMenuVisibility,
  sortMenus
} from '@/api/system/menu'
import { RouteManager } from '@/utils/routeManager'
import MenuDetail from './components/MenuDetail.vue'

// 注入父组件方法
const menuManagement = inject<any>('menuManagement')

// Emits
const emit = defineEmits<{
  menuSelect: [menu: MenuType | null]
}>()

// 响应式数据
const tableRef = ref()
const loading = ref(false)
const showMenuDetail = ref(false)
const defaultExpandAll = ref(false)
const tableData = ref<MenuType[]>([])
const selectedMenus = ref<MenuType[]>([])
const currentMenu = ref<MenuType | null>(null)

const searchForm = reactive({
  keyword: '',
  type: undefined as number | undefined,
  status: undefined as number | undefined
})

// 计算属性
const filteredTableData = computed(() => {
  if (!searchForm.keyword && !searchForm.type && searchForm.status === undefined) {
    return tableData.value
  }
  
  const filterNode = (nodes: MenuType[]): MenuType[] => {
    return nodes.filter(node => {
      // 关键词搜索
      const matchKeyword = !searchForm.keyword || 
        node.title.includes(searchForm.keyword) ||
        (node.path && node.path.includes(searchForm.keyword))
      
      // 类型过滤
      const matchType = searchForm.type === undefined || node.type === searchForm.type
      
      // 状态过滤
      const matchStatus = searchForm.status === undefined || node.status === searchForm.status
      
      // 检查子节点
      const hasMatchedChildren = node.children && node.children.length > 0 
        ? filterNode(node.children).length > 0 
        : false
      
      const nodeMatched = matchKeyword && matchType && matchStatus
      
      if (nodeMatched || hasMatchedChildren) {
        if (node.children && node.children.length > 0) {
          node.children = filterNode(node.children)
        }
        return true
      }
      
      return false
    })
  }
  
  return filterNode(tableData.value)
})

// 方法
const handleSearch = () => {
  // 搜索时自动展开所有节点
  if (searchForm.keyword || searchForm.type !== undefined || searchForm.status !== undefined) {
    defaultExpandAll.value = true
  } else {
    defaultExpandAll.value = false
  }
}

const handleRefresh = () => {
  loadTableData()
}

const handleSelectionChange = (selection: MenuType[]) => {
  selectedMenus.value = selection
}

const handleRowClick = (row: MenuType) => {
  currentMenu.value = row
  emit('menuSelect', row)
  showMenuDetail.value = true
}

const handleAdd = () => {
  if (menuManagement) {
    menuManagement.handleAddMenu()
  }
}

const handleEdit = (row: MenuType) => {
  if (menuManagement) {
    menuManagement.handleEditMenu(row)
  }
}

const handleAddChild = (row: MenuType) => {
  if (menuManagement) {
    menuManagement.handleAddMenu(row)
  }
}

const handleCopy = (row: MenuType) => {
  if (menuManagement) {
    menuManagement.handleCopyMenu(row)
  }
}

const handleDelete = (row: MenuType) => {
  if (menuManagement) {
    menuManagement.handleDeleteMenu(row)
  }
}

const handleStatusChange = async (row: MenuType) => {
  try {
    await updateMenuStatus(row.id, row.status)
    ElMessage.success(row.status ? '菜单已启用' : '菜单已禁用')
  } catch (error) {
    // 恢复原状态
    row.status = row.status ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

const handleVisibilityChange = async (row: MenuType) => {
  try {
    await updateMenuVisibility(row.id, row.visible)
    ElMessage.success(row.visible ? '菜单已显示' : '菜单已隐藏')
  } catch (error) {
    // 恢复原状态
    row.visible = !row.visible
    ElMessage.error('可见性更新失败')
  }
}

const expandAll = () => {
  defaultExpandAll.value = true
  nextTick(() => {
    const expandKeys = getAllNodeKeys(tableData.value)
    expandKeys.forEach(key => {
      tableRef.value?.toggleRowExpansion({ id: key }, true)
    })
  })
}

const collapseAll = () => {
  defaultExpandAll.value = false
  nextTick(() => {
    const expandKeys = getAllNodeKeys(tableData.value)
    expandKeys.forEach(key => {
      tableRef.value?.toggleRowExpansion({ id: key }, false)
    })
  })
}

const getAllNodeKeys = (nodes: MenuType[]): number[] => {
  const keys: number[] = []
  
  const traverse = (nodeList: MenuType[]) => {
    nodeList.forEach(node => {
      keys.push(node.id)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  
  traverse(nodes)
  return keys
}

const getMenuTypeText = (type: number): string => {
  switch (type) {
    case 1: return '目录'
    case 2: return '菜单'
    case 3: return '按钮'
    default: return '未知'
  }
}

const getMenuTypeTagType = (type: number) => {
  switch (type) {
    case 1: return 'warning' as const
    case 2: return 'success' as const
    case 3: return 'info' as const
    default: return 'info' as const
  }
}

const loadTableData = async () => {
  loading.value = true
  
  try {
    const result = await getMenuTree()
    
    // 如果result是包装对象，需要取出data字段
    let menuList = result
    if (result && typeof result === 'object' && 'data' in result) {
      menuList = (result as any).data
    }
    
    tableData.value = Array.isArray(menuList) ? menuList : []
  } catch (error) {
    console.error('加载菜单失败:', error)
    ElMessage.error('加载菜单列表失败')
    tableData.value = []
  } finally {
    loading.value = false
  }
}

const handleBatchAction = async (command: string) => {
  switch (command) {
    case 'sync-routes':
      await syncMenusToRoutes()
      break
    case 'export-config':
      exportMenuConfig()
      break
    case 'import-config':
      importMenuConfig()
      break
    default:
      break
  }
}

const syncMenusToRoutes = async () => {
  try {
    const loadingInstance = ElMessage({
      message: '正在同步菜单到路由...',
      type: 'info',
      duration: 0
    })
    
    RouteManager.syncMenusToRoutes(tableData.value)
    
    loadingInstance.close()
    ElMessage.success('菜单路由同步完成')
  } catch (error) {
    console.error('同步菜单到路由失败:', error)
    ElMessage.error('同步菜单到路由失败')
  }
}

const exportMenuConfig = () => {
  try {
    const config = JSON.stringify(tableData.value, null, 2)
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `menu-config-${new Date().getTime()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('菜单配置已导出')
  } catch (error) {
    ElMessage.error('导出菜单配置失败')
  }
}

const importMenuConfig = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (event: any) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e: any) => {
      try {
        const config = JSON.parse(e.target.result)
        ElMessage.success('菜单配置导入成功，请保存后生效')
        // 这里可以添加导入后的处理逻辑
        console.log('导入的配置:', config)
      } catch (error) {
        ElMessage.error('菜单配置格式错误')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

// 生命周期
onMounted(() => {
  loadTableData()
})

// 暴露方法给父组件
defineExpose({
  refreshTable: loadTableData,
  createMenu,
  updateMenu,
  deleteMenu,
  getSelectedMenus: () => selectedMenus.value
})
</script>

<style scoped lang="scss">
.menu-table {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .left-actions {
      display: flex;
      gap: 8px;
    }
    
    .right-search {
      display: flex;
      gap: 8px;
    }
  }
  
  .table-container {
    flex: 1;
    overflow: hidden;
    
    .el-table {
      height: 100%;
    }
    
    .menu-title {
      display: flex;
      align-items: center;
      
      .menu-icon {
        margin-right: 8px;
        color: var(--el-color-primary);
        font-size: 16px;
        
        &.default-icon {
          color: var(--el-text-color-secondary);
        }
      }
      
      .title-text {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
    
    .route-info {
      .route-path {
        margin-bottom: 4px;
      }
      
      .route-name {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        
        .label {
          font-weight: 500;
        }
        
        .value {
          margin-left: 4px;
        }
      }
    }
    
    .component-path {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      padding: 2px 6px;
      border-radius: 3px;
    }
    
    .text-muted {
      color: var(--el-text-color-placeholder);
    }
  }
}

:deep(.el-table) {
  .el-table__row {
    &:hover {
      background-color: var(--el-fill-color-light);
    }
    
    &.current-row {
      background-color: var(--el-color-primary-light-9);
    }
  }
  
  .el-table__cell {
    .cell {
      display: flex;
      align-items: center;
    }
  }
}

:deep(.el-tag) {
  border: none;
  font-weight: 500;
}

:deep(.el-switch) {
  &.is-disabled {
    .el-switch__core {
      background-color: var(--el-fill-color-darker);
    }
  }
}

// 抽屉样式
:deep(.el-drawer) {
  .el-drawer__header {
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding: 16px 20px 12px;
    
    .el-drawer__title {
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .el-drawer__body {
    padding: 20px;
  }
}
</style> 