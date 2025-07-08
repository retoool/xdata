<template>
  <div class="workflow-table-container">
    <!-- 工具栏 -->
    <div class="table-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKeyword"
          placeholder="请输入关键字搜索"
          clearable
          style="width: 180px;"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="toolbar-right">
        <el-dropdown @command="handleAddCommand">
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            新增工作流
            <el-icon style="margin-left: 4px;"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="form">使用表单创建</el-dropdown-item>
              <el-dropdown-item command="designer">直接进入设计器</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-scroll-area">
      <el-table
        ref="tableRef"
        :data="tableData"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        style="width: 100%"
        border
        :header-cell-style="getHeaderCellStyle"
        height="100%"
      >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="工作流名称" min-width="150" sortable="custom">
        <template #default="{ row }">
          <el-link 
            type="primary" 
            :underline="false"
            @click="handleDesign(row, $event)"
            style="font-weight: 500;"
          >
            {{ row.name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag 
            :type="getStatusTagType(row.status)" 
            size="small"
            class="status-tag"
          >
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="所属分类" width="150">
        <template #default="{ row }">
          <span>{{ row.category || '未分类' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="version" label="版本" width="80" />
      <el-table-column prop="author" label="作者" width="100" />
      <el-table-column prop="tags" label="标签" width="150">
        <template #default="{ row }">
          <el-tag
            v-for="tag in row.tags"
            :key="tag"
            size="small"
            style="margin-right: 4px; margin-bottom: 4px;"
          >
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" sortable="custom" />
      <el-table-column prop="updateTime" label="更新时间" width="160" sortable="custom" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button 
            type="success" 
            size="small" 
            @click="handleDesign(row, $event)"
          >
            设计
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 同级分类选择菜单 -->
    <div
      v-if="siblingMenuVisible"
      :style="{ 
        position: 'fixed', 
        left: siblingMenuPosition.x + 'px', 
        top: siblingMenuPosition.y + 'px', 
        zIndex: 9999 
      }"
      class="sibling-categories-menu"
      @mousedown.stop
      @click.stop
    >
      <div class="menu-header">
        <el-icon style="margin-right: 4px;"><ArrowDown /></el-icon>
        选择同级分类
      </div>
      <div 
        v-for="category in siblingCategories" 
        :key="category"
        class="menu-item"
        :class="{ 'menu-item-active': category === currentCategoryPath[currentCategoryIndex] }"
        @click="selectSiblingCategory(category)"
      >
        {{ category }}
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="工作流名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入工作流名称" />
        </el-form-item>
        <el-form-item label="所属分类" prop="categoryId">
          <el-cascader
            v-model="formData.categoryPath"
            :options="categoryOptions"
            :props="{
              value: 'id',
              label: 'label',
              children: 'children',
              checkStrictly: true
            }"
            placeholder="请选择所属分类"
            style="width: 100%;"
            @change="handleCategoryChange"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入工作流描述"
          />
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="formData.version" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="formData.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="标签">
          <el-tag
            v-for="tag in formData.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="tagInputRef"
            v-model="inputValue"
            class="tag-input"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag" size="small" @click="showInput">
            + 新增标签
          </el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Download, Delete, ArrowDown } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  getWorkflowList, 
  createWorkflow, 
  updateWorkflow, 
  deleteWorkflow, 
  batchDeleteWorkflow,
  batchExportWorkflow
} from '@/api/workflow'
import { getCategoryTree } from '@/api/workflowCategory'
import type { WorkflowData } from '@/views/computer/workflow/designer/types'
import { useRouter } from 'vue-router'

// 响应式数据
const router = useRouter()
const loading = ref(false)
const tableRef = ref()
const tableData = ref<WorkflowData[]>([])
const selectedRows = ref<WorkflowData[]>([])
const searchKeyword = ref('')

// 获取表格头部样式
const getHeaderCellStyle = () => {
  return {
    background: 'var(--el-fill-color-light)',
    color: 'var(--el-text-color-primary)'
  }
}

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 排序
const sortParams = reactive({
  prop: '',
  order: ''
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const formData = reactive({
  id: 0,
  name: '',
  categoryId: 0,
  categoryPath: [] as number[],
  description: '',
  version: '',
  author: '',
  tags: [] as string[]
})

// 查询用的分类ID，支持多个分类ID
const queryCategoryId = ref<number | number[] | null>(null)

// 分类选项数据
const categoryOptions = ref<any[]>([])

// 加载分类树数据
const loadCategoryTree = async () => {
  try {
    const { data } = await getCategoryTree()
    categoryOptions.value = data || []
  } catch (error) {
    console.error('加载分类树失败:', error)
    ElMessage.error('加载分类树失败')
    categoryOptions.value = []
  }
}

// 标签输入
const inputVisible = ref(false)
const inputValue = ref('')
const tagInputRef = ref()

// 同级分类菜单
const siblingMenuVisible = ref(false)
const siblingMenuPosition = ref({ x: 0, y: 0 })
const siblingCategories = ref<string[]>([])
const currentCategoryPath = ref<string[]>([])
const currentCategoryIndex = ref(0)

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入工作流名称', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入工作流描述', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ]
}

// 获取工作流列表
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      ...sortParams
    }
    
    // 只有当queryCategoryId不为null/undefined时才添加categoryId参数
    if (queryCategoryId.value !== null && queryCategoryId.value !== undefined) {
      params.categoryId = queryCategoryId.value;
    }
    
         const { data } = await getWorkflowList(params)
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 排序
const handleSortChange = ({ prop, order }: any) => {
  sortParams.prop = prop
  sortParams.order = order
  loadData()
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadData()
}

// 选择
const handleSelectionChange = (rows: WorkflowData[]) => {
  selectedRows.value = rows
}

// 新增命令处理
const handleAddCommand = (command: string) => {
  if (command === 'form') {
    handleAdd()
  } else if (command === 'designer') {
    handleCreateAndDesign()
  }
}

// 新增（表单方式）
const handleAdd = () => {
  dialogTitle.value = '新增工作流'
  resetForm()
  dialogVisible.value = true
}

// 创建并进入设计器
const handleCreateAndDesign = () => {
  // 直接跳转到设计器，使用 'new' 作为ID表示新建
  router.push('/computer/workflow/designer/new')
}

// 编辑
const handleEdit = (row: WorkflowData) => {
  dialogTitle.value = '编辑工作流'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 设计
const handleDesign = (row: WorkflowData, event?: MouseEvent) => {
  // 跳转到工作流设计器
  const designerUrl = `/computer/workflow/designer/${row.id}`
  
  // 如果按住 Ctrl 键或 Cmd 键（Mac），则在新窗口打开
  if (event && (event.ctrlKey || event.metaKey)) {
    window.open(designerUrl, '_blank')
  } else {
    // 默认在当前窗口打开
    router.push(designerUrl)
  }
}

// 删除
const handleDelete = async (row: WorkflowData) => {
  try {
    await ElMessageBox.confirm('确定要删除这个工作流吗？', '提示', {
      type: 'warning'
    })
    
    await deleteWorkflow(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 用户取消删除
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的工作流')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个工作流吗？`, '提示', {
      type: 'warning'
    })
    
         const ids = selectedRows.value.map(row => row.id)
     await batchDeleteWorkflow(ids)
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadData()
  } catch (error) {
    // 用户取消删除
  }
}

// 导出
const handleExport = async () => {
  try {
    const ids = selectedRows.value.map(row => row.id)
    await batchExportWorkflow(ids)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (formData.id) {
          await updateWorkflow({ ...formData })
          ElMessage.success('更新成功')
        } else {
                     await createWorkflow({ ...formData })
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(formData.id ? '更新失败' : '新增失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: 0,
    name: '',
    categoryId: 0,
    categoryPath: [],
    description: '',
    version: '',
    author: '',
    tags: []
  })
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleDialogClose = () => {
  resetForm()
}

// 分类选择
const handleCategoryChange = (values: number[]) => {
  if (values && values.length > 0) {
    formData.categoryId = values[values.length - 1]
  }
}

// 标签相关
const removeTag = (tag: string) => {
  const index = formData.tags.indexOf(tag)
  if (index > -1) {
    formData.tags.splice(index, 1)
  }
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !formData.tags.includes(inputValue.value)) {
    formData.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 分类相关方法
const handleCategoryClick = (categoryPath: string[], index: number) => {
  const path = categoryPath.slice(0, index + 1)
  emit('category-click', { path, index })
}

const handleCategoryRightClick = (event: MouseEvent, categoryPath: string[], index: number) => {
  // 显示同级分类菜单
  const siblings = getSiblingCategories(categoryPath, index)
  if (siblings.length > 1) {
    siblingCategories.value = siblings
    currentCategoryPath.value = categoryPath
    currentCategoryIndex.value = index
    siblingMenuPosition.value = { x: event.clientX, y: event.clientY }
    siblingMenuVisible.value = true
  }
}

// 获取同级分类
const getSiblingCategories = (categoryPath: string[], clickIndex: number): string[] => {
  if (!categoryPath || !Array.isArray(categoryPath) || clickIndex < 0 || clickIndex >= categoryPath.length) {
    return []
  }
  
  const parentPath = categoryPath.slice(0, clickIndex)
  const currentCategory = categoryPath[clickIndex]
  
  if (!categoryOptions.value || categoryOptions.value.length === 0) {
    return [currentCategory]
  }
  
  const findSiblings = (nodes: any[], path: string[]): string[] => {
    if (path.length === 0) {
      return nodes.map(node => node.label).filter(Boolean)
    }
    
    const currentLevel = path[0]
    const node = nodes.find(n => n.label === currentLevel)
    
    if (!node || !node.children) {
      return [currentCategory]
    }
    
    if (path.length === 1) {
      return node.children.map(child => child.label).filter(Boolean)
    }
    
    return findSiblings(node.children, path.slice(1))
  }
  
  const siblings = findSiblings(categoryOptions.value, parentPath)
  
  if (siblings.length === 0) {
    return [currentCategory]
  }
  
  if (!siblings.includes(currentCategory)) {
    siblings.push(currentCategory)
  }
  
  return siblings
}

// 选择同级分类
const selectSiblingCategory = (categoryName: string) => {
  try {
    if (!categoryName || typeof categoryName !== 'string') {
      throw new Error('分类名称无效')
    }
    
    if (!currentCategoryPath.value || !Array.isArray(currentCategoryPath.value)) {
      throw new Error('当前分类路径无效')
    }
    
    if (currentCategoryIndex.value < 0 || currentCategoryIndex.value >= currentCategoryPath.value.length) {
      throw new Error('当前分类索引超出范围')
    }
    
    const newPath = [...currentCategoryPath.value.slice(0, currentCategoryIndex.value + 1)];
    newPath[currentCategoryIndex.value] = categoryName;
    
    emit('category-click', { path: newPath, index: currentCategoryIndex.value });
    
    siblingMenuVisible.value = false;
  } catch (error) {
    console.error('选择同级分类时出错:', error);
    ElMessage.error(`切换分类失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 关闭所有菜单
const closeAllMenus = () => {
  siblingMenuVisible.value = false;
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (siblingMenuVisible.value) {
      siblingMenuVisible.value = false;
    }
  }
}

// 简化的分类显示，不需要复杂的路径计算

// 获取状态标签
const getStatusLabel = (status: string) => {
  const statusMap = {
    'draft': '草稿',
    'published': '已发布',
    'running': '运行中',
    'stopped': '已停止',
    'error': '异常'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 获取状态标签样式
const getStatusTagType = (status: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const statusMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    'draft': 'info',
    'published': 'success',
    'running': 'primary',
    'stopped': 'warning',
    'error': 'danger'
  }
  return statusMap[status] || 'info'
}

// 定义props和emits
const props = defineProps<{
  selectedCategoryId?: number | number[] | null;
  selectedCategoryPath?: string[] | null;
}>()

const emit = defineEmits<{
  'category-click': [{ path: string[], index: number }];
}>()

// 暴露方法给父组件
const setCategoryId = (categoryId: number | number[]) => {
  queryCategoryId.value = categoryId;
  loadData()
}

// 监听props变化
watch(() => props.selectedCategoryId, (newCategoryId) => {
  if (newCategoryId) {
    queryCategoryId.value = newCategoryId;
  } else {
    queryCategoryId.value = null;
  }
  loadData()
}, { immediate: true })

// 初始化
onMounted(async () => {
  await loadCategoryTree()
  document.addEventListener('click', closeAllMenus);
  document.addEventListener('keydown', handleKeydown);
})

// 组件卸载时移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('click', closeAllMenus);
  document.removeEventListener('keydown', handleKeydown);
})

// 暴露方法
defineExpose({
  setCategoryId,
  loadData
})
</script>

<style scoped>
.workflow-table-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  padding: 24px 24px 16px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-light);
}

html.dark .workflow-table-container {
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.2);
  border-color: var(--pure-border-color);
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.table-scroll-area {
  flex: 1 1 0;
  height: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-fill-color-light);
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

html.dark .table-scroll-area {
  border-color: var(--pure-border-color);
  background: var(--el-bg-color-page);
}

::v-deep(.el-table) {
  background: transparent;
}

::v-deep(.el-table__body-wrapper) {
  background: var(--el-bg-color);
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
}

html.dark .pagination-container {
  border-top-color: var(--pure-border-color);
}

.tag-input {
  width: 90px;
  margin-left: 8px;
  vertical-align: bottom;
}

.button-new-tag {
  margin-left: 8px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.category-path {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  font-size: 14px;
  line-height: 1.4;
  padding: 2px 0;
  white-space: nowrap;
}

.category-item {
  display: flex;
  align-items: center;
}

.category-name {
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 2px 4px;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}

.category-name:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

html.dark .category-name:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.category-last {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
}

.category-last:hover {
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
}

html.dark .category-last {
  background: var(--el-bg-color-page);
}

html.dark .category-last:hover {
  background: var(--el-fill-color-dark);
}

.category-other {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
}

.category-other:hover {
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color);
}

html.dark .category-other {
  background: var(--el-bg-color-page);
}

html.dark .category-other:hover {
  background: var(--el-fill-color-dark);
}

.category-selected.category-last {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  font-weight: 600;
}

.category-selected.category-other {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  font-weight: 600;
}

html.dark .category-selected.category-last {
  background: var(--el-bg-color-page);
}

html.dark .category-selected.category-other {
  background: var(--el-bg-color-page);
}

.category-unselected.category-last {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
}

.category-unselected.category-other {
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
}

html.dark .category-unselected.category-last {
  background: var(--el-bg-color-page);
}

html.dark .category-unselected.category-other {
  background: var(--el-bg-color-page);
}

.category-separator {
  color: var(--el-text-color-placeholder);
  margin: 0 4px;
  font-weight: normal;
  font-size: 12px;
  opacity: 0.7;
}

.sibling-categories-menu {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: 0 8px 24px 0 rgba(0,0,0,0.15);
  min-width: 160px;
  padding: 6px 0;
  margin-top: 4px;
  z-index: 9999;
  animation: menuFadeIn 0.2s ease-out;
}

html.dark .sibling-categories-menu {
  border-color: var(--pure-border-color);
  box-shadow: 0 8px 24px 0 rgba(0,0,0,0.3);
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sibling-categories-menu .menu-header {
  padding: 10px 16px 8px 16px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-light);
  font-weight: 500;
}

html.dark .sibling-categories-menu .menu-header {
  border-bottom-color: var(--pure-border-color);
  background: var(--el-bg-color-page);
}

.sibling-categories-menu .menu-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  color: var(--el-text-color-regular);
  position: relative;
}

.sibling-categories-menu .menu-item:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding-left: 20px;
}

html.dark .sibling-categories-menu .menu-item:hover {
  background: var(--el-color-primary-dark-2);
}

.sibling-categories-menu .menu-item-active {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-weight: 500;
  padding-left: 20px;
}

html.dark .sibling-categories-menu .menu-item-active {
  background: var(--el-color-primary-dark-2);
}

.sibling-categories-menu .menu-item-active::before {
  content: '✓';
  position: absolute;
  left: 8px;
  color: var(--el-color-primary);
  font-weight: bold;
}

.status-tag {
  cursor: default;
}

html.dark .sibling-categories-menu .menu-item:hover,
html.dark .sibling-categories-menu .menu-item-active {
  background: var(--el-color-primary) !important;
  color: #fff !important;
}
</style>