<template>
  <div class="operator-table-container">
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
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增算子
        </el-button>
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
      <el-table-column prop="name" label="算子名称" min-width="150" sortable="custom" />
      <el-table-column prop="type" label="算子类型" width="100">
        <template #default="{ row }">
          <el-tag 
            :type="getOperatorTypeTagType(row.type)" 
            size="small"
            class="operator-type-tag"
            @contextmenu.prevent="handleOperatorTypeRightClick($event, row.type)"
            :title="`右键查看其他算子类型`"
          >
            {{ getOperatorTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="categoryPath" label="所属分类" :width="getCategoryColumnWidth()">
        <template #default="{ row }">
          <div class="category-path">
            <span 
              v-for="(category, index) in row.categoryPath" 
              :key="index"
              class="category-item"
            >
              <span 
                class="category-name"
                :class="{
                  'category-last': index === row.categoryPath.length - 1,
                  'category-other': index < row.categoryPath.length - 1,
                  'category-selected': isCategorySelected(row.categoryPath, index),
                  'category-unselected': !isCategorySelected(row.categoryPath, index)
                }"
                @click="handleCategoryClick(row.categoryPath, index)"
                @contextmenu.prevent="handleCategoryRightClick($event, row.categoryPath, index)"
                :title="`点击跳转到 ${category}，右键查看同级分类`"
              >
                {{ category }}
              </span>
              <span v-if="index < row.categoryPath.length - 1" class="category-separator">/</span>
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="version" label="版本" width="80" />
      <el-table-column prop="author" label="作者" width="100" />
      <el-table-column prop="relatedTaskName" label="关联任务" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.relatedTaskName" type="success" size="small">
            {{ row.relatedTaskName }}
          </el-tag>
          <span v-else class="unlinked-text">未关联</span>
        </template>
      </el-table-column>
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
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
        background
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

    <!-- 算子类型选择菜单 -->
    <div
      v-if="operatorTypeMenuVisible"
      :style="{ 
        position: 'fixed', 
        left: operatorTypeMenuPosition.x + 'px', 
        top: operatorTypeMenuPosition.y + 'px', 
        zIndex: 9999 
      }"
      class="operator-type-menu"
      @mousedown.stop
      @click.stop
    >
      <div class="menu-header">
        <el-icon style="margin-right: 4px;"><ArrowDown /></el-icon>
        选择算子类型
      </div>
      <div 
        v-for="type in operatorTypes" 
        :key="type"
        class="menu-item"
        :class="{ 'menu-item-active': type === currentOperatorType }"
        @click="selectOperatorType(type)"
      >
        {{ type }}
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
        <el-form-item label="算子名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入算子名称" />
        </el-form-item>
        <el-form-item label="算子类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择算子类型" style="width: 100%;">
            <el-option label="基础算子" value="basic" />
            <el-option label="脚本算子" value="script" />
            <el-option label="外部算子" value="external" />
          </el-select>
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
            placeholder="请输入算子描述"
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
  fetchOperators, 
  addOperator, 
  updateOperator, 
  deleteOperator, 
  batchDeleteOperators,
  exportOperators,
  type Operator,
  OperatorType
} from '@/api/operator'
import { fetchCategoryTree } from '@/api/operatorCategoryTree'

// 响应式数据
const loading = ref(false)
const tableRef = ref()
const tableData = ref<Operator[]>([])
const selectedRows = ref<Operator[]>([])
const searchKeyword = ref('')
const currentType = ref<OperatorType>(OperatorType.BASIC) // 当前选中的算子类型

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
  type: 'basic' as OperatorType,
  categoryId: 0,
  categoryPath: [] as number[],
  description: '',
  version: '',
  author: '',
  tags: [] as string[]
})

// 查询用的分类ID，支持多个分类ID
const queryCategoryId = ref<number | number[] | null>(null)

// 分类选项数据 - 从props获取或使用默认数据
const categoryOptions = ref<any[]>([])

// 加载分类树数据
const loadCategoryTree = async () => {
  try {
    const data = await fetchCategoryTree(currentType.value) as any[];
    categoryOptions.value = data || [];
  } catch (error) {
    console.error('加载分类树失败:', error);
    ElMessage.error('加载分类树失败');
    categoryOptions.value = [];
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

// 算子类型菜单相关状态
const operatorTypeMenuVisible = ref(false)
const operatorTypeMenuPosition = ref({ x: 0, y: 0 })
const operatorTypes = ref<string[]>([])
const currentOperatorType = ref<string>('')

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入算子名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择算子类型', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入算子描述', trigger: 'blur' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者', trigger: 'blur' }
  ]
}

// 获取算子列表
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      type: currentType.value, // 添加算子类型参数
      ...sortParams
    }
    
    // 只有当queryCategoryId不为null/undefined时才添加categoryId参数
    if (queryCategoryId.value !== null && queryCategoryId.value !== undefined) {
      params.categoryId = queryCategoryId.value;
    }
    
    const data = await fetchOperators(params) as any;
    tableData.value = data.list;
    pagination.total = data.total;
  } catch (error) {
    ElMessage.error('获取数据失败');
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
const handleSelectionChange = (rows: Operator[]) => {
  selectedRows.value = rows
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增算子'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Operator) => {
  dialogTitle.value = '编辑算子'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: Operator) => {
  try {
    await ElMessageBox.confirm('确定要删除这个算子吗？', '提示', {
      type: 'warning'
    })
    
    await deleteOperator(row.id);
    ElMessage.success('删除成功');
    loadData();
  } catch (error) {
    // 用户取消删除或删除失败
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的算子')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个算子吗？`, '提示', {
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(row => row.id)
    await batchDeleteOperators(ids);
    ElMessage.success('批量删除成功');
    loadData();
  } catch (error) {
    // 用户取消删除或删除失败
  }
}

// 导出
const handleExport = async () => {
  try {
    const params = {
      keyword: searchKeyword.value
    }
    
    const res = await exportOperators(params)
    const blob = new Blob([res as BlobPart], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `算子列表_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 构建提交数据，移除categoryPath字段，只保留categoryId
    const { categoryPath, ...submitData } = formData;
    
    if (formData.id) {
      await updateOperator(formData.id, submitData);
    } else {
      await addOperator(submitData);
    }
    
    ElMessage.success(formData.id ? '更新成功' : '新增成功');
    dialogVisible.value = false;
    loadData();
  } catch (error) {
    // 表单验证失败
  }
}

// 对话框关闭
const handleDialogClose = () => {
  resetForm()
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: 0,
    name: '',
    type: 'basic' as OperatorType,
    categoryId: 0,
    categoryPath: [],
    description: '',
    version: '',
    author: '',
    tags: [] as string[]
  })
  formRef.value?.clearValidate()
}

// 标签相关
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    if (!formData.tags.includes(inputValue.value)) {
      formData.tags.push(inputValue.value)
    }
  }
  inputVisible.value = false
  inputValue.value = ''
}

const removeTag = (tag: string) => {
  const index = formData.tags.indexOf(tag)
  if (index > -1) {
    formData.tags.splice(index, 1)
  }
}

// 处理分类选择变化
const handleCategoryChange = (value: number[]) => {
  if (value && value.length > 0) {
    formData.categoryId = value[value.length - 1]; // 取最后一个ID作为分类ID
  } else {
    formData.categoryId = 0;
  }
}

// 处理分类点击跳转
const handleCategoryClick = (categoryPath: string[], clickIndex: number) => {
  try {
    // 参数验证
    if (!categoryPath || !Array.isArray(categoryPath)) {
      throw new Error('分类路径无效')
    }
    
    if (clickIndex < 0 || clickIndex >= categoryPath.length) {
      throw new Error('点击索引超出范围')
    }
    
    // 构建到点击位置的完整路径
    const targetPath = categoryPath.slice(0, clickIndex + 1)
    
    // 发出事件通知父组件进行分类跳转
    debugEmit('category-click', { path: targetPath, index: clickIndex })
  } catch (error) {
    console.error('处理分类点击时出错:', error)
    ElMessage.error(`分类跳转失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

// 处理分类右键点击
const handleCategoryRightClick = (event: MouseEvent, categoryPath: string[], clickIndex: number) => {
  // 右键点击直接显示同级分类选择菜单
  showSiblingCategoriesMenu(event, categoryPath, clickIndex)
}

// 显示同级分类菜单
const showSiblingCategoriesMenu = (event: MouseEvent, categoryPath: string[], clickIndex: number) => {
  // 参数验证
  if (!categoryPath || !Array.isArray(categoryPath)) {
    console.error('分类路径无效:', categoryPath)
    return
  }
  
  if (clickIndex < 0 || clickIndex >= categoryPath.length) {
    console.error('点击索引超出范围:', clickIndex, '分类路径长度:', categoryPath.length)
    return
  }
  
  // 获取同级分类列表
  const siblingCategoriesList = getSiblingCategories(categoryPath, clickIndex)
  
  if (siblingCategoriesList.length > 1) {
    siblingCategories.value = siblingCategoriesList
    currentCategoryPath.value = categoryPath
    currentCategoryIndex.value = clickIndex
    
    // 使用鼠标位置
    siblingMenuPosition.value = { x: event.clientX, y: event.clientY }
    
    siblingMenuVisible.value = true
  } else {
    // 如果没有同级分类，显示所有分类
    const allCategories = categoryOptions.value.map(node => node.label)
    siblingCategories.value = allCategories
    currentCategoryPath.value = categoryPath
    currentCategoryIndex.value = clickIndex
    siblingMenuPosition.value = { x: event.clientX, y: event.clientY }
    siblingMenuVisible.value = true
  }
}

// 获取同级分类列表
const getSiblingCategories = (categoryPath: string[], clickIndex: number): string[] => {
  // 参数验证
  if (!categoryPath || !Array.isArray(categoryPath) || clickIndex < 0 || clickIndex >= categoryPath.length) {
    return []
  }
  
  // 从分类树数据中获取同级分类
  const parentPath = categoryPath.slice(0, clickIndex)
  const currentCategory = categoryPath[clickIndex]
  
  // 如果分类选项为空，返回当前分类
  if (!categoryOptions.value || categoryOptions.value.length === 0) {
    return [currentCategory]
  }
  
  // 从分类选项中查找同级分类
  const findSiblings = (nodes: any[], path: string[]): string[] => {
    if (path.length === 0) {
      // 根级别，返回所有顶级分类
      return nodes.map(node => node.label).filter(Boolean)
    }
    
    const currentLevel = path[0]
    const node = nodes.find(n => n.label === currentLevel)
    
    if (!node || !node.children) {
      return [currentCategory]
    }
    
    if (path.length === 1) {
      // 找到父级，返回其所有子分类
      return node.children.map(child => child.label).filter(Boolean)
    }
    
    // 递归查找下一级
    return findSiblings(node.children, path.slice(1))
  }
  
  const siblings = findSiblings(categoryOptions.value, parentPath)
  
  // 如果找不到同级分类，返回当前分类
  if (siblings.length === 0) {
    return [currentCategory]
  }
  
  // 确保当前分类在列表中
  if (!siblings.includes(currentCategory)) {
    siblings.push(currentCategory)
  }
  
  return siblings
}

// 选择同级分类
const selectSiblingCategory = (categoryName: string) => {
  try {
    // 参数验证
    if (!categoryName || typeof categoryName !== 'string') {
      throw new Error('分类名称无效')
    }
    
    if (!currentCategoryPath.value || !Array.isArray(currentCategoryPath.value)) {
      throw new Error('当前分类路径无效')
    }
    
    if (currentCategoryIndex.value < 0 || currentCategoryIndex.value >= currentCategoryPath.value.length) {
      throw new Error('当前分类索引超出范围')
    }
    
    // 创建新的分类路径
    const newPath = [...currentCategoryPath.value.slice(0, currentCategoryIndex.value + 1)];
    newPath[currentCategoryIndex.value] = categoryName;
    
    // 发出事件通知父组件进行分类切换
    debugEmit('category-click', { path: newPath, index: currentCategoryIndex.value });
    
    // 关闭菜单
    siblingMenuVisible.value = false;
  } catch (error) {
    console.error('选择同级分类时出错:', error);
    ElMessage.error(`切换分类失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 关闭同级分类菜单
const closeSiblingMenu = () => {
  siblingMenuVisible.value = false;
}

// 关闭所有菜单
const closeAllMenus = () => {
  siblingMenuVisible.value = false;
  operatorTypeMenuVisible.value = false;
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (siblingMenuVisible.value) {
      closeSiblingMenu();
    }
    if (operatorTypeMenuVisible.value) {
      closeOperatorTypeMenu();
    }
  }
}

// 处理算子类型右键点击
const handleOperatorTypeRightClick = (event: MouseEvent, operatorType: OperatorType) => {
  showOperatorTypeMenu(event, operatorType)
}

// 显示算子类型菜单
const showOperatorTypeMenu = (event: MouseEvent, currentType: OperatorType) => {
  const allTypes = [
    { value: OperatorType.BASIC, label: '基础算子' },
    { value: OperatorType.SCRIPT, label: '脚本算子' },
    { value: OperatorType.EXTERNAL, label: '外部算子' }
  ]
  
  operatorTypes.value = allTypes.map(type => type.label)
  currentOperatorType.value = getOperatorTypeLabel(currentType)
  operatorTypeMenuPosition.value = { x: event.clientX, y: event.clientY }
  operatorTypeMenuVisible.value = true
}

// 选择算子类型
const selectOperatorType = (typeLabel: string) => {
  const typeMap = {
    '基础算子': OperatorType.BASIC,
    '脚本算子': OperatorType.SCRIPT,
    '外部算子': OperatorType.EXTERNAL
  }
  
  const newType = typeMap[typeLabel as keyof typeof typeMap]
  if (newType && newType !== currentType.value) {
    setOperatorType(newType)
    // 发出事件通知父组件进行类型切换
    emit('type-change', newType)
  }
  
  closeOperatorTypeMenu()
}

// 关闭算子类型菜单
const closeOperatorTypeMenu = () => {
  operatorTypeMenuVisible.value = false
}

// 计算分类列宽度
const getCategoryColumnWidth = (): number => {
  if (!tableData.value || tableData.value.length === 0) {
    return 200; // 默认宽度
  }
  
  let maxWidth = 200; // 最小宽度
  
  // 遍历当前页的所有数据，找到最长的分类路径
  tableData.value.forEach(row => {
    if (row.categoryPath && row.categoryPath.length > 0) {
      // 计算分类路径的显示宽度
      const pathWidth = calculatePathWidth(row.categoryPath);
      maxWidth = Math.max(maxWidth, pathWidth);
    }
  });
  
  return maxWidth;
}

// 计算分类路径的显示宽度
const calculatePathWidth = (categoryPath: string[]): number => {
  if (!categoryPath || categoryPath.length === 0) {
    return 0;
  }
  
  // 基础宽度：每个分类名称的宽度 + 分隔符宽度
  let totalWidth = 0;
  
  categoryPath.forEach((category, index) => {
    // 计算分类名称的实际宽度
    const categoryWidth = calculateTextWidth(category);
    totalWidth += categoryWidth;
    
    // 分隔符宽度（如果不是最后一个）
    if (index < categoryPath.length - 1) {
      totalWidth += 20; // 分隔符宽度
    }
  });
  
  // 添加内边距（左右各12px，确保字符不会贴边）
  totalWidth += 36
  
  return totalWidth;
}

// 计算文本的实际显示宽度
const calculateTextWidth = (text: string): number => {
  if (!text) return 0;
  
  // 创建临时元素来测量文本宽度
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return text.length * 14; // 降级方案
  
  // 设置字体样式，与CSS中的字体保持一致
  context.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
  
  // 测量文本宽度
  const textWidth = context.measureText(text).width;
  
  // 返回测量结果，最小宽度40px
  return Math.max(textWidth, 40);
}

// 判断分类是否被选中
const isCategorySelected = (categoryPath: string[], index: number) => {
  if (!props.selectedCategoryPath || !props.selectedCategoryPath.length) {
    return false;
  }
  
  // 检查当前分类路径是否与选中的分类路径匹配
  const currentPath = categoryPath.slice(0, index + 1);
  const selectedPath = props.selectedCategoryPath;
  
  // 如果路径长度不同，不匹配
  if (currentPath.length !== selectedPath.length) {
    return false;
  }
  
  // 检查每个路径段是否匹配
  for (let i = 0; i < currentPath.length; i++) {
    if (currentPath[i] !== selectedPath[i]) {
      return false;
    }
  }
  
  return true;
}

// 获取算子类型标签
const getOperatorTypeLabel = (type: OperatorType) => {
  const typeMap = {
    [OperatorType.BASIC]: '基础算子',
    [OperatorType.SCRIPT]: '脚本算子',
    [OperatorType.EXTERNAL]: '外部算子'
  }
  return typeMap[type] || type
}

// 获取算子类型标签样式
const getOperatorTypeTagType = (type: OperatorType): 'primary' | 'success' | 'warning' | 'info' => {
  const typeMap: Record<OperatorType, 'primary' | 'success' | 'warning' | 'info'> = {
    [OperatorType.BASIC]: 'primary',
    [OperatorType.SCRIPT]: 'success',
    [OperatorType.EXTERNAL]: 'warning'
  }
  return typeMap[type] || 'info'
}

// 定义props和emits
const props = defineProps<{
  selectedCategoryId?: number | number[] | null;
  selectedCategoryPath?: string[] | null;
  currentOperatorType?: OperatorType;
}>()

const emit = defineEmits<{
  'category-click': [{ path: string[], index: number }];
  'type-change': [type: OperatorType];
}>()

// 创建带调试信息的emit函数
const debugEmit = (eventName: string, payload: any) => {
  try {
    // 验证事件名称
    if (!eventName || typeof eventName !== 'string') {
      throw new Error(`事件名称无效: ${eventName}`)
    }
    
    emit(eventName as any, payload)
  } catch (error) {
    console.error(`发出事件 ${eventName} 时出错:`, error)
    throw error
  }
}

// 暴露方法给父组件
const setCategoryId = (categoryId: number | number[]) => {
  // 直接保存传入的分类ID，支持多个分类ID查询
  queryCategoryId.value = categoryId;
  loadData()
}

// 设置当前算子类型
const setOperatorType = (type: OperatorType) => {
  currentType.value = type;
  loadCategoryTree() // 重新加载分类树
  loadData()
  
  // 清空当前选中的分类，避免数据不一致
  queryCategoryId.value = null;
  selectedRows.value = [];
}

// 监听props变化
watch(() => props.selectedCategoryId, (newCategoryId) => {
  if (newCategoryId) {
    queryCategoryId.value = newCategoryId;
  } else {
    // 如果没有选中分类，设置为null，显示该类型下的所有算子
    queryCategoryId.value = null;
  }
  loadData()
}, { immediate: true })

// 监听外部传入的算子类型变化
watch(() => props.currentOperatorType, (newType) => {
  if (newType && newType !== currentType.value) {
    currentType.value = newType;
    loadCategoryTree();
    loadData();
  }
}, { immediate: true })

// 初始化
onMounted(async () => {
  // 加载分类树数据
  await loadCategoryTree()
  
  // 添加点击外部关闭菜单的事件监听
  document.addEventListener('click', closeAllMenus);
  // 添加键盘事件监听
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
  setOperatorType,
  loadData
})
</script>

<style scoped>
.operator-table-container {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 24px 24px 16px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
}

html.dark .operator-table-container {
  box-shadow: none;
  border-color: transparent;
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

/* 最后一个节点样式 */
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

/* 其他节点样式 */
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

/* 选中状态的分类样式 */
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

/* 未选中状态的分类样式 */
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

/* 同级分类菜单样式 */
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

/* 算子类型标签样式 */
.operator-type-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.operator-type-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

html.dark .operator-type-tag:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* 算子类型菜单样式 */
.operator-type-menu {
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

html.dark .operator-type-menu {
  border-color: var(--pure-border-color);
  box-shadow: 0 8px 24px 0 rgba(0,0,0,0.3);
}

.operator-type-menu .menu-header {
  padding: 10px 16px 8px 16px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-light);
  font-weight: 500;
}

html.dark .operator-type-menu .menu-header {
  border-bottom-color: var(--pure-border-color);
  background: var(--el-bg-color-page);
}

.operator-type-menu .menu-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  color: var(--el-text-color-regular);
  position: relative;
}

.operator-type-menu .menu-item:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding-left: 20px;
}

html.dark .operator-type-menu .menu-item:hover {
  background: var(--el-color-primary-dark-2);
}

.operator-type-menu .menu-item-active {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-weight: 500;
  padding-left: 20px;
}

html.dark .operator-type-menu .menu-item-active {
  background: var(--el-color-primary-dark-2);
}

.operator-type-menu .menu-item-active::before {
  content: '✓';
  position: absolute;
  left: 8px;
  color: var(--el-color-primary);
  font-weight: bold;
}

.unlinked-text {
  color: var(--el-text-color-placeholder);
}

html.dark .context-menu-item:hover,
html.dark .sibling-categories-menu .menu-item:hover,
html.dark .sibling-categories-menu .menu-item-active,
html.dark .operator-type-menu .menu-item:hover,
html.dark .operator-type-menu .menu-item-active {
  background: var(--el-color-primary) !important;
  color: #fff !important;
}
</style> 