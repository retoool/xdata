<template>
  <div class="department-tree">
    <!-- 头部工具栏 -->
    <div class="tree-header">
      <div class="title">部门管理</div>
      <div class="actions">
        <el-button 
          type="primary" 
          size="small" 
          @click="handleAdd(null)"
        >
          新增
        </el-button>
        <el-button 
          type="danger" 
          size="small" 
          :disabled="checkedKeys.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>
    </div>
    
    <!-- 搜索框 -->
    <div class="search-box">
      <el-input
        v-model="filterText"
        placeholder="搜索部门名称"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <!-- 部门树 -->
    <div class="tree-container">
      <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        :filter-node-method="filterNode"
        :default-expand-all="true"
        :show-checkbox="true"
        :check-strictly="false"
        node-key="id"
        @node-contextmenu="handleContextMenu"
        @node-click="handleNodeClick"
        @check="handleCheck"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <el-icon class="node-icon">
              <OfficeBuilding />
            </el-icon>
            <span class="node-label">{{ data.name }}</span>
            <span class="node-count">({{ data.userCount || 0 }})</span>
          </div>
        </template>
      </el-tree>
    </div>
    
    <!-- 右键菜单 -->
    <el-dropdown
      ref="contextMenuRef"
      :style="{ position: 'absolute', left: menuPosition.x + 'px', top: menuPosition.y + 'px' }"
      :show-timeout="0"
      :hide-timeout="0"
      trigger="contextmenu"
    >
      <span></span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="handleAdd(contextNode?.id)">
            <el-icon><Plus /></el-icon>新增子部门
          </el-dropdown-item>
          <el-dropdown-item @click="handleEdit(contextNode)">
            <el-icon><Edit /></el-icon>编辑
          </el-dropdown-item>
          <el-dropdown-item @click="handleDelete(contextNode)" divided>
            <el-icon><Delete /></el-icon>删除
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    
    <!-- 部门表单对话框 -->
    <el-dialog
      v-model="showForm"
      :title="formMode === 'create' ? '新增部门' : '编辑部门'"
      width="500px"
    >
      <DepartmentForm
        ref="formRef"
        :form-data="formData"
        :form-mode="formMode"
        @submit="handleFormSubmit"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, OfficeBuilding, Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { Department } from '@/types/system'
import DepartmentForm from './components/DepartmentForm.vue'

// Emits
const emit = defineEmits<{
  nodeSelect: [departmentId: number | null, path: string[]]
  nodeCreate: [department: Department]
  nodeUpdate: [department: Department]
  nodeDelete: [departmentId: number]
  batchDelete: [departmentIds: number[]]
}>()

// 响应式数据
const treeRef = ref()
const formRef = ref()
const contextMenuRef = ref()
const filterText = ref('')
const showForm = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const treeData = ref<Department[]>([])
const checkedKeys = ref<number[]>([])
const contextNode = ref<Department | null>(null)
const menuPosition = reactive({ x: 0, y: 0 })

const formData = ref<Partial<Department>>({
  name: '',
  parentId: null,
  sort: 0,
  description: ''
})

const treeProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

// 方法
const handleSearch = () => {
  treeRef.value?.filter(filterText.value)
}

const filterNode = (value: string, data: Department) => {
  if (!value) return true
  return data.name.includes(value)
}

const handleNodeClick = (data: Department) => {
  const path = getNodePath(data)
  emit('nodeSelect', data.id, path)
}

const handleCheck = (data: Department, { checkedKeys: keys }: any) => {
  checkedKeys.value = keys
}

const handleContextMenu = (event: MouseEvent, data: Department) => {
  event.preventDefault()
  contextNode.value = data
  menuPosition.x = event.clientX
  menuPosition.y = event.clientY
  nextTick(() => {
    contextMenuRef.value?.handleOpen()
  })
}

const handleAdd = (parentId: number | null = null) => {
  formMode.value = 'create'
  formData.value = {
    name: '',
    parentId,
    sort: 0,
    description: ''
  }
  showForm.value = true
}

const handleEdit = (node: Department | null) => {
  if (!node) return
  formMode.value = 'edit'
  formData.value = { ...node }
  showForm.value = true
}

const handleDelete = async (node: Department | null) => {
  if (!node) return
  
  try {
    await ElMessageBox.confirm(
      '确认删除该部门吗？删除后该部门下的子部门和用户将一并删除！',
      '警告',
      { type: 'warning' }
    )
    emit('nodeDelete', node.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleBatchDelete = async () => {
  if (checkedKeys.value.length === 0) {
    ElMessage.warning('请选择要删除的部门')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${checkedKeys.value.length} 个部门吗？`,
      '警告',
      { type: 'warning' }
    )
    emit('batchDelete', checkedKeys.value)
    checkedKeys.value = []
    ElMessage.success('批量删除成功')
  } catch {
    // 用户取消
  }
}

const handleFormSubmit = (data: Department) => {
  if (formMode.value === 'create') {
    emit('nodeCreate', data)
  } else {
    emit('nodeUpdate', data)
  }
  showForm.value = false
  ElMessage.success(formMode.value === 'create' ? '新增成功' : '编辑成功')
}

const getNodePath = (node: Department): string[] => {
  // TODO: 实现获取节点路径的逻辑
  return [node.name]
}

const loadTreeData = async () => {
  // TODO: 加载部门树数据
  treeData.value = []
}

// 生命周期
onMounted(() => {
  loadTreeData()
})

// 暴露方法
defineExpose({
  refreshTree: loadTreeData
})
</script>

<style scoped lang="scss">
.department-tree {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .tree-header {
    padding: 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .title {
      font-weight: 600;
      font-size: 16px;
      color: var(--el-text-color-primary);
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .search-box {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-light);
  }
  
  .tree-container {
    flex: 1;
    overflow: auto;
    padding: 8px;
    
    .tree-node {
      display: flex;
      align-items: center;
      gap: 6px;
      
      .node-icon {
        color: var(--el-color-primary);
      }
      
      .node-label {
        flex: 1;
      }
      
      .node-count {
        color: var(--el-text-color-secondary);
        font-size: 12px;
      }
    }
  }
}

:deep(.el-tree-node__content) {
  height: 36px;
  
  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
</style> 