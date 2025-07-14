<template>
  <div class="menu-permission">
    <!-- 操作工具栏 -->
    <div class="permission-toolbar">
      <div class="toolbar-left">
        <el-button size="small" @click="expandAll" :disabled="loading">
          <el-icon><ArrowDown /></el-icon>展开全部
        </el-button>
        <el-button size="small" @click="collapseAll" :disabled="loading">
          <el-icon><ArrowRight /></el-icon>折叠全部
        </el-button>
        <el-button type="primary" size="small" @click="checkAll" :disabled="loading">
          <el-icon><Check /></el-icon>全选
        </el-button>
        <el-button size="small" @click="uncheckAll" :disabled="loading">
          <el-icon><Close /></el-icon>取消全选
        </el-button>
      </div>
      
      <div class="toolbar-right">
        <el-tag type="info" size="small">
          已选择权限：{{ checkedPermissions.length }}
        </el-tag>
      </div>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-box">
      <el-input
        v-model="filterText"
        placeholder="搜索菜单名称或权限标识"
        clearable
        size="small"
        @input="handleFilter"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <!-- 菜单权限树 -->
    <div class="tree-container">
      <el-tree
        ref="menuTreeRef"
        v-loading="loading"
        :data="menuTreeData"
        :props="treeProps"
        :filter-node-method="filterNode"
        node-key="id"
        show-checkbox
        :check-strictly="checkStrictly"
        :default-checked-keys="defaultCheckedKeys"
        :default-expanded-keys="defaultExpandedKeys"
        @check="handleMenuCheck"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
      >
        <template #default="{ node, data }">
          <div class="menu-node">
            <div class="node-content">
              <div class="node-main">
                <el-icon v-if="data.icon" class="node-icon">
                  <component :is="data.icon" />
                </el-icon>
                <el-icon v-else class="node-icon default-icon">
                  <Menu />
                </el-icon>
                <span class="node-title">{{ data.title }}</span>
                <el-tag v-if="data.type" :type="getMenuTypeTag(data.type)" size="small">
                  {{ getMenuTypeText(data.type) }}
                </el-tag>
              </div>
              
              <div class="node-info">
                <span v-if="data.path" class="node-path">{{ data.path }}</span>
                <span v-if="data.permission" class="node-permission">{{ data.permission }}</span>
              </div>
            </div>
            
            <!-- 权限详情 -->
            <div v-if="data.children && data.children.length === 0" class="permission-details">
              <el-tag
                v-for="perm in getNodePermissions(data)"
                :key="perm"
                size="small"
                type="info"
                class="permission-tag"
              >
                {{ perm }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
    
    <!-- 权限统计 -->
    <div class="permission-summary">
      <el-card shadow="never" size="small">
        <template #header>
          <div class="summary-header">
            <span>权限统计</span>
            <el-button type="text" size="small" @click="showPermissionList = !showPermissionList">
              {{ showPermissionList ? '隐藏' : '显示' }}详情
            </el-button>
            <el-button type="danger" size="small" @click="uncheckAll" :disabled="loading || checkedPermissions.length === 0">
              一键清空
            </el-button>
          </div>
        </template>
        
        <div class="summary-content">
          <el-row :gutter="16">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ menuStats.totalMenus }}</div>
                <div class="stat-label">总菜单</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ menuStats.checkedMenus }}</div>
                <div class="stat-label">已选菜单</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ menuStats.totalPermissions }}</div>
                <div class="stat-label">总权限</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">{{ checkedPermissions.length }}</div>
                <div class="stat-label">已选权限</div>
              </div>
            </el-col>
          </el-row>
          
          <!-- 权限列表 -->
          <el-collapse-transition>
            <div v-show="showPermissionList" class="permission-list">
              <el-divider>已选择的权限</el-divider>
              <div class="permission-tags" style="max-height: 120px; overflow-y: auto;">
                <el-tag
                  v-for="permission in checkedPermissions"
                  :key="permission"
                  size="small"
                  closable
                  @close="removePermission(permission)"
                >
                  {{ permission }}
                </el-tag>
                <span v-if="checkedPermissions.length === 0" class="empty-text">
                  暂无选择权限
                </span>
              </div>
            </div>
          </el-collapse-transition>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { ElTree } from 'element-plus'
import { 
  ArrowDown, 
  ArrowRight, 
  Check, 
  Close, 
  Search, 
  Menu 
} from '@element-plus/icons-vue'
import type { Menu as MenuType } from '@/types/system'
import { getMenuTree } from '@/api/system/menu'
import { getRolePermissions } from '@/api/system/role'

// Props
const props = defineProps<{
  roleId: number | null
}>()

// Emits
const emit = defineEmits<{
  permissionChange: [permissions: string[]]
}>()

// 响应式数据
const menuTreeRef = ref<InstanceType<typeof ElTree>>()
const loading = ref(false)
const filterText = ref('')
const checkStrictly = ref(false)
const showPermissionList = ref(false)
const menuTreeData = ref<MenuType[]>([])
const checkedPermissions = ref<string[]>([])
const defaultCheckedKeys = ref<number[]>([])
const defaultExpandedKeys = ref<number[]>([])

const treeProps = {
  children: 'children',
  label: 'title',
  disabled: 'disabled'
}

// 计算属性
const menuStats = computed(() => {
  const stats = {
    totalMenus: 0,
    checkedMenus: 0,
    totalPermissions: 0
  }
  
  const countMenus = (menus: MenuType[]) => {
    menus.forEach(menu => {
      stats.totalMenus++
      if (menu.permission) {
        stats.totalPermissions++
      }
      if (menu.children && menu.children.length > 0) {
        countMenus(menu.children)
      }
    })
  }
  
  countMenus(menuTreeData.value)
  
  // 统计已选菜单
  if (menuTreeRef.value) {
    const checkedNodes = menuTreeRef.value.getCheckedNodes()
    stats.checkedMenus = checkedNodes.length
  }
  
  return stats
})

// 方法
const handleFilter = () => {
  menuTreeRef.value?.filter(filterText.value)
}

const filterNode = (value: string, data: MenuType) => {
  if (!value) return true
  return (
    data.title.includes(value) ||
    (data.permission && data.permission.includes(value)) ||
    (data.path && data.path.includes(value))
  )
}

const expandAll = () => {
  const expandKeys = getAllNodeKeys(menuTreeData.value)
  defaultExpandedKeys.value = expandKeys
}

const collapseAll = () => {
  defaultExpandedKeys.value = []
}

const checkAll = () => {
  const allKeys = getAllNodeKeys(menuTreeData.value)
  allKeys.forEach(key => {
    menuTreeRef.value?.setChecked(key, true, false)
  })
  updateCheckedPermissions()
}

const uncheckAll = () => {
  menuTreeRef.value?.setCheckedKeys([])
  updateCheckedPermissions()
}

const handleMenuCheck = () => {
  updateCheckedPermissions()
}

const handleNodeExpand = (data: MenuType) => {
  if (!defaultExpandedKeys.value.includes(data.id)) {
    defaultExpandedKeys.value.push(data.id)
  }
}

const handleNodeCollapse = (data: MenuType) => {
  const index = defaultExpandedKeys.value.indexOf(data.id)
  if (index > -1) {
    defaultExpandedKeys.value.splice(index, 1)
  }
}

const updateCheckedPermissions = () => {
  if (!menuTreeRef.value) return
  
  const checkedNodes = menuTreeRef.value.getCheckedNodes() as MenuType[]
  const permissions = new Set<string>()
  
  checkedNodes.forEach(node => {
    const nodePermissions = getNodePermissions(node)
    nodePermissions.forEach(perm => permissions.add(perm))
  })
  
  checkedPermissions.value = Array.from(permissions).sort()
  emit('permissionChange', checkedPermissions.value)
}

const removePermission = (permission: string) => {
  // 找到包含该权限的节点并取消选中
  const findAndUncheckNode = (nodes: MenuType[]) => {
    nodes.forEach(node => {
      const nodePermissions = getNodePermissions(node)
      if (nodePermissions.includes(permission)) {
        menuTreeRef.value?.setChecked(node.id, false, false)
      }
      if (node.children && node.children.length > 0) {
        findAndUncheckNode(node.children)
      }
    })
  }
  
  findAndUncheckNode(menuTreeData.value)
  updateCheckedPermissions()
}

const getNodePermissions = (node: MenuType): string[] => {
  const permissions: string[] = []
  
  if (node.permission) {
    permissions.push(node.permission)
  }
  
  // 根据菜单类型添加默认权限
  if (node.type === 2) { // 菜单类型
    const basePermission = node.permission || `menu:${node.path?.replace(/\//g, ':')}`
    permissions.push(`${basePermission}:view`)
  }
  
  return permissions
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

const getMenuTypeTag = (type: number) => {
  switch (type) {
    case 1: return 'warning' as const // 目录
    case 2: return 'success' as const // 菜单
    case 3: return 'info' as const    // 按钮
    default: return 'info' as const
  }
}

const getMenuTypeText = (type: number): string => {
  switch (type) {
    case 1: return '目录'
    case 2: return '菜单'
    case 3: return '按钮'
    default: return '未知'
  }
}

const loadMenuTree = async () => {
  loading.value = true
  try {
    menuTreeData.value = await getMenuTree()
    
    // 设置默认展开的节点（第一层和第二层）
    const expandKeys: number[] = []
    menuTreeData.value.forEach(menu => {
      expandKeys.push(menu.id)
      if (menu.children) {
        menu.children.forEach(child => {
          expandKeys.push(child.id)
        })
      }
    })
    defaultExpandedKeys.value = expandKeys
  } catch (error) {
    ElMessage.error('加载菜单权限失败')
  } finally {
    loading.value = false
  }
}

const loadRolePermissions = async () => {
  if (!props.roleId) return
  
  try {
    const permissions = await getRolePermissions(props.roleId)
    // 安全地转换为字符串数组
    const permissionStrings = Array.isArray(permissions) 
      ? permissions.map(p => String(p))
      : []
    
    checkedPermissions.value = permissionStrings
    
    // 根据权限设置选中状态
    nextTick(() => {
      setCheckedByPermissions(permissionStrings)
    })
  } catch (error) {
    ElMessage.error('加载角色权限失败')
  }
}

const setCheckedByPermissions = (permissions: string[]) => {
  if (!menuTreeRef.value) return
  
  const setNodeChecked = (nodes: MenuType[]) => {
    nodes.forEach(node => {
      const nodePermissions = getNodePermissions(node)
      const hasPermission = nodePermissions.some(perm => permissions.includes(perm))
      
      if (hasPermission) {
        menuTreeRef.value?.setChecked(node.id, true, false)
      }
      
      if (node.children && node.children.length > 0) {
        setNodeChecked(node.children)
      }
    })
  }
  
  setNodeChecked(menuTreeData.value)
}

// 监听角色ID变化
watch(() => props.roleId, (newRoleId) => {
  if (newRoleId) {
    loadRolePermissions()
  } else {
    uncheckAll()
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  loadMenuTree()
})

// 暴露方法
defineExpose({
  getSelectedPermissions: () => checkedPermissions.value,
  setSelectedPermissions: (permissions: string[]) => {
    checkedPermissions.value = permissions
    nextTick(() => {
      setCheckedByPermissions(permissions)
    })
  },
  refreshTree: loadMenuTree
})
</script>

<style scoped lang="scss">
.menu-permission {
  .permission-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding: 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    
    .toolbar-left {
      display: flex;
      gap: 8px;
    }
  }
  
  .search-box {
    margin-bottom: 12px;
  }
  
  .tree-container {
    max-height: 400px;
    overflow: auto;
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    padding: 8px;
    
    .menu-node {
      width: 100%;
      
      .node-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        
        .node-main {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .node-icon {
            color: var(--el-color-primary);
            font-size: 16px;
            
            &.default-icon {
              color: var(--el-text-color-secondary);
            }
          }
          
          .node-title {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }
        
        .node-info {
          display: flex;
          gap: 12px;
          margin-left: 24px;
          
          .node-path {
            font-size: 12px;
            color: var(--el-color-primary);
            background: var(--el-color-primary-light-9);
            padding: 2px 6px;
            border-radius: 3px;
          }
          
          .node-permission {
            font-size: 12px;
            color: var(--el-color-success);
            background: var(--el-color-success-light-9);
            padding: 2px 6px;
            border-radius: 3px;
          }
        }
      }
      
      .permission-details {
        margin-top: 8px;
        margin-left: 24px;
        
        .permission-tag {
          margin-right: 4px;
          margin-bottom: 4px;
        }
      }
    }
  }
  
  .permission-summary {
    margin-top: 16px;
    
    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .summary-content {
      .stat-item {
        text-align: center;
        
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--el-color-primary);
        }
        
        .stat-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
          margin-top: 4px;
        }
      }
      
      .permission-list {
        margin-top: 16px;
        
        .permission-tags {
          .el-tag {
            margin-right: 8px;
            margin-bottom: 8px;
          }
          
          .empty-text {
            color: var(--el-text-color-placeholder);
            font-style: italic;
          }
        }
      }
    }
  }
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 0;
  
  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

:deep(.el-tree-node__expand-icon) {
  padding: 4px;
}

:deep(.el-card__body) {
  padding: 16px;
}
</style> 