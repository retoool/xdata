<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">主题示例页面</h1>
          <p class="page-description">展示统一的样式布局规范和组件设计</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            创建示例
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area" :class="{ 'no-gap': isSidebarCollapsed, 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- 侧边栏 -->
      <div 
        class="sidebar" 
        :class="{ collapsed: isSidebarCollapsed }"
      >
        <div class="toolbar">
          <div class="toolbar-left">
            <h3>分类管理</h3>
          </div>
          <div class="toolbar-right">
            <el-button type="primary" size="small" @click="addCategory">
              <el-icon><Plus /></el-icon>
              新增
            </el-button>
          </div>
        </div>
        
        <div class="tree-container">
          <el-tree
            ref="treeRef"
            :data="categoryTree"
            :props="treeProps"
            node-key="id"
            :default-expanded-keys="[1]"
            :render-content="renderTreeNode"
            @node-click="handleNodeClick"
          />
        </div>
        
        <!-- 折叠按钮 -->
        <div 
          class="sidebar-collapse"
          @click="toggleSidebar"
        >
          <el-icon :class="{ rotated: isSidebarCollapsed }">
            <ArrowLeft />
          </el-icon>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="main-content" :class="{ expanded: isSidebarCollapsed }">
        <!-- 工具栏 -->
        <div class="toolbar">
          <div class="toolbar-left">
            <el-breadcrumb>
              <el-breadcrumb-item>示例管理</el-breadcrumb-item>
              <el-breadcrumb-item>数据列表</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="toolbar-right">
            <el-select v-model="searchForm.status" placeholder="状态" clearable @change="handleSearch">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
            <el-select v-model="searchForm.type" placeholder="类型" clearable @change="handleSearch">
              <el-option label="类型A" value="A" />
              <el-option label="类型B" value="B" />
              <el-option label="类型C" value="C" />
            </el-select>
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新增数据
            </el-button>
          </div>
        </div>

        <!-- 表格容器 -->
        <div class="table-container">
          <el-table
            ref="tableRef"
            :data="tableData"
            :loading="loading"
            height="100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" />
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="名称" min-width="150">
              <template #default="{ row }">
                <div class="name-cell">
                  <el-avatar :size="32" :src="row.avatar" />
                  <span>{{ row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getTagType(row.type)">{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="handleStatusChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页器 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="formMode === 'create' ? '新增数据' : '编辑数据'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="类型A" value="A" />
                <el-option label="类型B" value="B" />
                <el-option label="类型C" value="C" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="formData.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="formData.sort" :min="0" :max="999" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ formMode === 'create' ? '创建' : '更新' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Folder,
  Document,
  Star,
  ArrowLeft
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const showCreateDialog = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selectedUsers = ref([])
const submitting = ref(false)
const isSidebarCollapsed = ref(false)

// 搜索表单
const searchForm = reactive({
  status: undefined as number | undefined,
  type: undefined as string | undefined
})

// 分页数据
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 表单数据
const formData = reactive({
  id: undefined,
  name: '',
  type: '',
  status: 1,
  sort: 0,
  description: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度为2-50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ]
}

// 树形数据
const categoryTree = ref([
  {
    id: 1,
    name: '根分类',
    children: [
      {
        id: 2,
        name: '分类A',
        children: [
          { id: 4, name: '子分类A-1' },
          { id: 5, name: '子分类A-2' }
        ]
      },
      {
        id: 3,
        name: '分类B',
        children: [
          { id: 6, name: '子分类B-1' }
        ]
      }
    ]
  }
])

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: '示例数据1',
    type: 'A',
    status: 1,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    name: '示例数据2',
    type: 'B',
    status: 0,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createTime: '2024-01-14 15:20:00'
  },
  {
    id: 3,
    name: '示例数据3',
    type: 'C',
    status: 1,
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    createTime: '2024-01-13 09:15:00'
  }
])

// 树形配置
const treeProps = {
  value: 'id',
  label: 'name',
  children: 'children'
}

// 计算属性
const searchParams = computed(() => ({
  ...searchForm,
  page: pagination.current,
  size: pagination.size
}))

// 方法
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const handleSearch = () => {
  pagination.current = 1
  loadTableData()
}

const loadTableData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    pagination.total = 100
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleNodeClick = (data: any) => {
  console.log('选中节点:', data)
}

const renderTreeNode = (h: any, { data, node }: any) => {
  return h('div', {
    class: 'custom-tree-node',
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
    h('el-icon', { class: 'node-icon' }, () => h(Folder)),
    h('span', { class: 'node-label' }, data.name),
    h('span', { class: 'node-count' }, `(${data.children?.length || 0})`)
  ])
}

const addCategory = () => {
  ElMessage.success('新增分类功能')
}

const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

const getTagType = (type: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
    A: 'primary',
    B: 'success',
    C: 'warning'
  }
  return typeMap[type] || 'info'
}

const handleStatusChange = (row: any) => {
  ElMessage.success(`${row.name} 状态已${row.status === 1 ? '启用' : '禁用'}`)
}

const handleEdit = (row: any) => {
  formMode.value = 'edit'
  Object.assign(formData, row)
  showCreateDialog.value = true
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${row.name} 吗？`, '确认删除', {
      type: 'warning'
    })
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  loadTableData()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadTableData()
}

const handleSubmit = async () => {
  try {
    // 模拟提交
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success(formMode.value === 'create' ? '创建成功' : '更新成功')
    showCreateDialog.value = false
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 生命周期
onMounted(() => {
  loadTableData()
})
</script>

<style scoped lang="scss">
// 页面容器
.page-container {
  height: 100%;
  padding: 16px;
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// 页面头部
.page-header {
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: var(--el-bg-color);
    border-radius: 8px;
    border: 1px solid var(--el-border-color-lighter);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .header-left {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        transition: color 0.3s ease;
      }
      
      .page-description {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
        transition: color 0.3s ease;
      }
    }
  }
}

// 内容区域
.content-area {
  position: relative;
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 当侧边栏收起时，去掉gap
  &.no-gap {
    gap: 0;
  }
}

// 侧边栏
.sidebar {
  position: relative;
  width: 280px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: visible;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  &.collapsed {
    transform: translateX(-100%);

    .toolbar,
    .tree-container {
      pointer-events: none;
    }
    
    .sidebar-collapse {
      right: -12px;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
  }
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-light);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      transition: opacity 0.2s ease;
    }
  }
  
  .tree-container {
    flex: 1;
    overflow: auto;
    padding: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .custom-tree-node {
      display: flex;
      align-items: center;
      width: 100%;
      min-height: 32px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      cursor: pointer;
      
      &:hover {
        background-color: var(--el-fill-color-light);
        transform: translateX(2px);
      }
      
      .node-icon {
        margin-right: 8px;
        color: var(--el-text-color-regular);
        font-size: 16px;
        transition: color 0.2s ease;
      }
      
      .node-label {
        flex: 1;
        color: var(--el-text-color-primary);
        font-size: 14px;
        transition: color 0.2s ease;
      }
      
      .node-count {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        margin-left: 4px;
        transition: opacity 0.2s ease;
      }
    }
  }
  
  // 侧边栏折叠按钮
  .sidebar-collapse {
    position: absolute;
    top: 50%;
    right: -12px;
    z-index: 1002;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 34px;
    cursor: pointer;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    transform: translateY(-50%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    
    &:hover {
      background: var(--el-fill-color-light);
      border-color: var(--el-border-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-50%) scale(1.05);
      
      .el-icon {
        color: var(--el-text-color-primary);
        transform: scale(1.1);
      }
    }
    
    &:active {
      transform: translateY(-50%) scale(0.95);
    }
    
    .el-icon {
      color: var(--el-text-color-regular);
      font-size: 14px;
      transition: all 0.2s ease;
      
      &.rotated {
        transform: rotate(180deg);
      }
    }
  }
  
  // 鼠标悬停时显示按钮
  &:hover .sidebar-collapse {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }
}

// 主内容区
.main-content {
  flex: 1;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  &.expanded {
    margin-left: -280px;
  }
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .toolbar-left,
    .toolbar-right {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  
  .table-container {
    flex: 1;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    
    .name-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    :deep(.el-table) {
      height: 100%;
      
      .el-table__header {
        background: var(--el-fill-color-light);
        transition: background-color 0.3s ease;
        
        .el-table__cell {
          background: var(--el-fill-color-light);
          font-weight: 600;
          color: var(--el-text-color-primary);
          transition: all 0.2s ease;
        }
      }
      
      .el-table__row {
        transition: all 0.2s ease;
        
        &:hover {
          background: var(--el-fill-color-light);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
      
      .el-avatar {
        border: 2px solid var(--el-border-color-lighter);
        transition: all 0.2s ease;
        
        &:hover {
          border-color: var(--el-color-primary);
          transform: scale(1.05);
        }
      }
      
      .el-tag {
        border-radius: 4px;
        font-weight: 500;
        transition: all 0.2s ease;
        
        &:hover {
          transform: scale(1.05);
        }
      }
      
      .el-switch {
        .el-switch__core {
          border-radius: 12px;
          transition: all 0.2s ease;
        }
      }
    }
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

// 弹窗样式
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  
  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);
    
    .el-dialog__title {
      font-weight: 600;
      font-size: 16px;
      color: var(--el-text-color-primary);
    }
  }
  
  .el-dialog__body {
    padding: 24px;
    background: var(--el-bg-color);
  }
  
  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color);
  }
}

// 表单样式
:deep(.el-form) {
  .el-form-item__label {
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
  
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
  
  .el-select {
    .el-input__wrapper {
      border-radius: 4px;
    }
  }
}

// 按钮样式
:deep(.el-button) {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
}

// 输入框样式
:deep(.el-input__wrapper) {
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

// 选择器样式
:deep(.el-select .el-input__wrapper) {
  border-radius: 4px;
}

// 树形组件样式
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

// 响应式设计
@media (max-width: 1024px) {
  .content-area {
    flex-direction: column;
    gap: 12px;
  }
  
  .sidebar {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }
  
  .page-header {
    .header-content {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
      text-align: center;
    }
  }
  
  .toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    
    .toolbar-left,
    .toolbar-right {
      justify-content: center;
    }
  }
}
</style> 