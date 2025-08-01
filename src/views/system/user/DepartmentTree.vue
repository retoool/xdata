<template>
  <div class="custom-tree-container">
    <!-- 工具栏 -->
    <div class="tree-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchText"
          placeholder="搜索部门..."
          clearable
          class="search-input"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="toolbar-right">
        <el-tooltip :content="batchSelectMode ? '退出批量选择' : '批量选择'" placement="top">
          <el-button 
            :type="batchSelectMode ? 'warning' : 'info'" 
            @click="toggleBatchSelect" 
            class="toolbar-btn"
            :icon="batchSelectMode ? Close : Select"
          />
        </el-tooltip>
        <el-tooltip v-if="!batchSelectMode" content="新增根部门" placement="top">
          <el-button type="primary" @click="addRootNode" class="toolbar-btn" :icon="Plus" />
        </el-tooltip>
        <el-tooltip v-if="batchSelectMode" content="批量删除" placement="top">
          <el-button 
            type="danger" 
            @click="batchDelete" 
            :disabled="checkedKeys.length === 0" 
            class="toolbar-btn" 
            :icon="Delete" 
          />
        </el-tooltip>
      </div>
    </div>
    
    <!-- 树形区域 -->
    <div class="tree-scroll-area" @contextmenu="handleTreeAreaContextMenu" v-loading="loading">
      <el-tree
        :data="dataSource"
        :show-checkbox="batchSelectMode"
        empty-text=""
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        :render-content="renderContent"
        ref="treeRef"
        @check="handleCheck"
        @node-click="handleNodeClick"
        :filter-node-method="filterNode"
        highlight-current
        :current-node-key="currentKey"
        class="custom-tree"
      />
      
      <!-- 空状态 -->
      <div v-if="!loading && dataSource.length === 0" class="empty-state">
        <el-icon class="empty-icon"><FolderOpened /></el-icon>
        <p class="empty-text">暂无部门数据</p>
        <el-button type="primary" @click="addRootNode" :icon="Plus">新增根部门</el-button>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      :style="{ position: 'fixed', left: contextMenu.x + 'px', top: contextMenu.y + 'px', zIndex: 9999 }"
      class="context-menu"
      @mousedown.stop
    >
      <div class="context-menu-item" @click="handleContextAdd">
        <el-icon><Plus /></el-icon>
        {{ contextMenu.data ? '新增子部门' : '新增根部门' }}
      </div>
      <div v-if="contextMenu.data && contextMenu.data.id !== 1" class="context-menu-item" @click="handleContextRename">
        <el-icon><Edit /></el-icon>
        重命名
      </div>
      <div v-if="contextMenu.data && contextMenu.data.id !== 1" class="context-menu-item danger" @click="handleContextDelete">
        <el-icon><Delete /></el-icon>
        删除
      </div>
    </div>

    <!-- 部门表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <DepartmentForm
        ref="formRef"
        :form-data="currentDepartment"
        :form-mode="dialogMode"
        :show-parent-select="false"
        @cancel="handleDialogClose"
      />
      
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button 
          type="primary" 
          :loading="dialogLoading"
          @click="handleFormSubmit"
        >
          {{ dialogMode === 'create' ? '创建部门' : '更新部门' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount, watch, h } from 'vue'
import { ElButton, ElTree, ElMessage, ElInput, ElTooltip, ElIcon, ElDialog, ElMessageBox } from 'element-plus'
import { Plus, Delete, Close, Search, Edit, FolderOpened, Select, OfficeBuilding } from '@element-plus/icons-vue'
import type { RenderContentContext } from 'element-plus'
import type { Department } from './types/department'
import { getDepartmentTree, createDepartment, updateDepartment, deleteDepartment, batchDeleteDepartments } from '@/api/system/department'
import DepartmentForm from './components/DepartmentForm.vue'

// 类型定义
interface Tree {
  id: number
  name: string
  children?: Tree[]
  userCount?: number
  parentId?: number | null
  sort?: number
  status?: number
}

type Node = RenderContentContext['node']
type Data = RenderContentContext['data']

// Props
const props = defineProps<{
  currentDepartmentId?: number
}>()

// Emits
const emit = defineEmits<{
  'node-select': [{ ids: number[], node: any }]
  'node-create': [department: Department]
  'node-update': [department: Department]
  'node-delete': [departmentId: number]
  'batch-delete': [departmentIds: number[]]
}>()

// 响应式数据
const treeRef = ref<InstanceType<typeof ElTree>>()
const dataSource = ref<Tree[]>([])
const searchText = ref('')
const currentKey = ref<number | string | null>(null)
const batchSelectMode = ref(false)
const checkedKeys = ref<number[]>([])
const loading = ref(false)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMode = ref<'create' | 'edit'>('create')
const dialogLoading = ref(false)
const currentDepartment = ref<Department | null>(null)
const formRef = ref()

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  node: null as null | Node,
  data: null as null | Data
})

// 数据加载
const loadTree = async () => {
  loading.value = true
  try {
    const data = await getDepartmentTree() as any
    const transformData = (res: any[]): Tree[] => {
      return res.map(dept => ({
        id: dept.id,
        name: dept.name,
        userCount: dept.userCount,
        parentId: dept.parentId,
        sort: dept.sort,
        status: dept.status,
        children: dept.children ? transformData(dept.children) : undefined
      }))
    }
    
    dataSource.value = transformData(data)
    currentKey.value = undefined
    treeRef.value?.setCurrentKey(null)
    checkedKeys.value = []
    treeRef.value?.setCheckedKeys([])
    
    // 数据加载完成后，自动选中系统部门（ID为1）
    nextTick(() => {
      const systemDept = dataSource.value.find(dept => dept.id === 1)
      if (systemDept) {
        treeRef.value?.setCurrentKey(systemDept.id)
        const ids = [systemDept.id]
        emit('node-select', { ids, node: systemDept })
      }
    })
  } catch (error) {
    console.error('获取部门树失败:', error)
    ElMessage.error('获取部门树失败')
  } finally {
    loading.value = false
  }
}

// 部门操作
const addRootNode = async () => {
  dialogMode.value = 'create'
  dialogTitle.value = '新增根部门'
  currentDepartment.value = {
    name: '',
    parentId: null,
    sort: 0
  } as Department
  dialogVisible.value = true
}

const append = async (data: Data) => {
  if (!data) return
  
  dialogMode.value = 'create'
  dialogTitle.value = '新增子部门'
  currentDepartment.value = {
    name: '',
    parentId: data.id,
    sort: 0
  } as Department
  dialogVisible.value = true
}

const handleContextRename = async () => {
  const data = contextMenu.value.data
  if (!data) return
  
  dialogMode.value = 'edit'
  dialogTitle.value = '重命名部门'
  currentDepartment.value = {
    id: data.id,
    name: data.name,
    parentId: data.parentId,
    sort: data.sort || 0
  } as Department
  dialogVisible.value = true
  
  hideContextMenu()
}

const handleContextDelete = async () => {
  const data = contextMenu.value.data
  if (!data) return
  
  try {
    await ElMessageBox.confirm(
      '确认删除该部门吗？删除后该部门下的子部门和用户将一并删除！',
      '确认删除',
      { type: 'warning' }
    )
    await deleteDepartment(data.id)
    ElMessage.success('删除成功')
    loadTree()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response.data.message)
    }
  }
  
  hideContextMenu()
}

// 批量操作
const batchDelete = async () => {
  if (!treeRef.value) return
  const keys = checkedKeys.value
  
  if (keys.length === 0) {
    ElMessage.warning('请选择要删除的部门')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${keys.length} 个部门吗？删除后将无法恢复。`,
      '确认批量删除',
      { type: 'warning' }
    )
    await batchDeleteDepartments(keys)
    ElMessage.success('批量删除成功')
    checkedKeys.value = []
    treeRef.value?.setCheckedKeys([])
    loadTree()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除部门时出错:', error)
      if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('批量删除失败，请重试')
      }
    }
  }
}

const toggleBatchSelect = () => {
  batchSelectMode.value = !batchSelectMode.value
  if (!batchSelectMode.value) {
    checkedKeys.value = []
    treeRef.value?.setCheckedKeys([])
  }
}

// 事件处理
const handleNodeClick = (data: Data) => {
  const ids = [data.id]
  emit('node-select', { ids, node: data })
}

const handleCheck = (_: any, checked: any) => {
  checkedKeys.value = checked.checkedKeys
}

const handleSearch = () => {
  treeRef.value?.filter(searchText.value)
}

const filterNode = (value: string, data: Data) => {
  if (!value) return true
  return data.name.includes(value)
}

// 右键菜单
const showContextMenu = (event: MouseEvent, node: Node, data: Data) => {
  event.preventDefault()
  contextMenu.value.visible = true
  contextMenu.value.x = event.clientX
  contextMenu.value.y = event.clientY
  contextMenu.value.node = node
  contextMenu.value.data = data
  document.body.style.userSelect = 'none'
}

const handleNodeContextMenu = (event: MouseEvent, node: Node, data: Data) => {
  event.preventDefault()
  contextMenu.value.visible = true
  contextMenu.value.x = event.clientX
  contextMenu.value.y = event.clientY
  contextMenu.value.node = node
  contextMenu.value.data = data
  document.body.style.userSelect = 'none'
}

const hideContextMenu = () => {
  contextMenu.value.visible = false
  contextMenu.value.node = null
  contextMenu.value.data = null
  document.body.style.userSelect = ''
}

const handleTreeAreaContextMenu = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    showContextMenu(event, null as any, null as any)
  }
}

const handleContextAdd = () => {
  const data = contextMenu.value.data
  if (data) {
    append(data)
  } else {
    addRootNode()
  }
  hideContextMenu()
}

// 渲染函数
const renderContent = (h: any, { data, node }: { data: any; node: any }) => {
  return h('div', { 
    class: 'custom-tree-node',
    onContextmenu: (event: MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      handleNodeContextMenu(event, node, data)
    },
    style: {
      width: '100%',
      minHeight: '32px',
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'background-color 0.2s'
    }
  }, [
    h(ElIcon, { class: 'node-icon' }, () => h(OfficeBuilding)),
    h('span', { class: 'node-label' }, data.name),
    h('span', { class: 'node-count' }, `(${data.userCount || 0})`)
  ])
}

// 工具方法
const selectSystemDepartmentAndEmit = () => {
  nextTick(() => {
    const systemDept = dataSource.value.find(dept => dept.id === 1)
    if (systemDept) {
      treeRef.value?.setCurrentKey(systemDept.id)
      const ids = [systemDept.id]
      emit('node-select', { ids, node: systemDept })
    }
  })
}

// 监听器
watch(searchText, (val) => {
  treeRef.value?.filter(val)
})

watch(() => props.currentDepartmentId, (newVal) => {
  if (newVal && dataSource.value.length > 0) {
    treeRef.value?.setCurrentKey(newVal)
  }
}, { immediate: true })

// 对话框相关方法
const handleDialogClose = () => {
  dialogVisible.value = false
  currentDepartment.value = null
}

const handleFormSubmit = async () => {
  try {
    dialogLoading.value = true
    
    // 调用 DepartmentForm 的 submitForm 方法
    if (formRef.value) {
      const formData = await formRef.value.submitForm()
      
      // 调用 API 保存数据
      if (dialogMode.value === 'create') {
        await createDepartment(formData)
        ElMessage.success('新增成功')
      } else {
        await updateDepartment(formData.id!, formData)
        ElMessage.success('更新成功')
      }
      
      // 提交成功后关闭对话框并刷新数据
      handleDialogClose()
      loadTree()
    }
  } catch (error: any) {
    // 确保错误消息显示
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else if (error.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('操作失败')
    }
  } finally {
    dialogLoading.value = false
  }
}

// 暴露方法
defineExpose({
  loadTree,
  selectSystemDepartmentAndEmit,
  refreshTree: loadTree,
  setCurrentKey: (key: number | string | null) => {
    currentKey.value = key
    treeRef.value?.setCurrentKey(key)
  }
})

// 生命周期
onMounted(() => {
  loadTree()
  document.addEventListener('click', hideContextMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', hideContextMenu)
})
</script>

<style scoped lang="scss">
.custom-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  
  .tree-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
    
    .toolbar-left {
      flex: 1;
      margin-right: 12px;
      
      .search-input {
        width: 100%;
        max-width: 200px;
      }
    }
    
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .toolbar-btn {
        padding: 6px 8px;
        min-width: 32px;
        height: 32px;
      }
    }
  }
  
  .tree-scroll-area {
    flex: 1;
    overflow: auto;
    padding: 8px;
    position: relative;
    
    .custom-tree {
      .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 32px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
        cursor: pointer;
        
        &:hover {
          background-color: var(--el-fill-color-light);
        }
        
        .node-icon {
          margin-right: 8px;
          color: var(--el-text-color-regular);
          font-size: 16px;
        }
        
        .node-label {
          flex: 1;
          color: var(--el-text-color-primary);
          font-size: 14px;
        }
        
        .node-count {
          color: var(--el-text-color-secondary);
          font-size: 12px;
          margin-left: 4px;
        }
      }
    }
    

    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      
      .empty-icon {
        font-size: 48px;
        color: var(--el-text-color-placeholder);
        margin-bottom: 16px;
      }
      
      .empty-text {
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 16px;
      }
    }
  }
  
  .context-menu {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px 0;
    min-width: 120px;
    
    .context-menu-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      color: var(--el-text-color-primary);
      transition: background-color 0.2s;
      
      &:hover {
        background: var(--el-color-primary-light-9);
      }
      
      &.danger {
        color: var(--el-color-danger);
        
        &:hover {
          background: var(--el-color-danger-light-9);
        }
      }
      
      .el-icon {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }
}

// 树形组件统一样式
:deep(.el-tree) {
  .el-tree-node {
    .el-tree-node__content {
      height: 32px;
      padding: 0 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--el-fill-color-light);
      }
      
      &.is-current {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }
    }
  }
}

// 按钮统一样式
:deep(.el-button) {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.el-button--primary {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    
    &:hover {
      background: var(--el-color-primary-light-3);
      border-color: var(--el-color-primary-light-3);
    }
  }
}



// 输入框统一样式
:deep(.el-input) {
  .el-input__wrapper {
    border-radius: 4px;
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }
    
    &.is-focused {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }
}
</style> 