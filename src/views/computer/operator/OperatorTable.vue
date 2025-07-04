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
        :header-cell-style="{ background: '#fafbfc', color: '#606266' }"
      >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="算子名称" min-width="150" sortable="custom" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type) as any">
            {{ getTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="version" label="版本" width="80" />
      <el-table-column prop="author" label="作者" width="100" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">
            {{ row.status === 'active' ? '启用' : '禁用' }}
          </el-tag>
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
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
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
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
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
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Download, Delete } from '@element-plus/icons-vue'
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

// 响应式数据
const loading = ref(false)
const tableRef = ref()
const tableData = ref<Operator[]>([])
const selectedRows = ref<Operator[]>([])
const searchKeyword = ref('')
const currentType = ref<OperatorType>(OperatorType.BASIC) // 当前选中的算子类型

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
  categoryId: '' as string,
  description: '',
  version: '',
  author: '',
  status: 'active' as 'active' | 'inactive',
  tags: [] as string[]
})

// 标签输入
const inputVisible = ref(false)
const inputValue = ref('')
const tagInputRef = ref()

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
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      categoryId: formData.categoryId || undefined,
      type: currentType.value, // 添加算子类型参数
      ...sortParams
    }
    console.log('Loading operators with params:', params);
    const res = await fetchOperators(params) as any
    if (res.code === 0) {
      tableData.value = res.data.list
      pagination.total = res.data.total
      console.log('Loaded operators:', tableData.value.length, 'total:', pagination.total);
    } else {
      ElMessage.error(res.msg || '获取数据失败')
    }
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
    
    const res = await deleteOperator(row.id) as any
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadData()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    // 用户取消删除
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
    const res = await batchDeleteOperators(ids) as any
    if (res.code === 0) {
      ElMessage.success('批量删除成功')
      loadData()
    } else {
      ElMessage.error(res.msg || '批量删除失败')
    }
  } catch (error) {
    // 用户取消删除
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
    
    // 只取第一个分类id用于保存
    const submitData = { ...formData, categoryId: Number(String(formData.categoryId).split(',')[0]) }
    let res: any
    
    if (formData.id) {
      res = await updateOperator(formData.id, submitData)
    } else {
      res = await addOperator(submitData)
    }
    
    if (res.code === 0) {
      ElMessage.success(formData.id ? '更新成功' : '新增成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
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
    categoryId: '',
    description: '',
    version: '',
    author: '',
    status: 'active' as 'active' | 'inactive',
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

// 工具函数
const getTypeLabel = (type: OperatorType) => {
  const typeMap = {
    [OperatorType.BASIC]: '基础算子',
    [OperatorType.SCRIPT]: '脚本算子',
    [OperatorType.EXTERNAL]: '外部算子'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type: OperatorType) => {
  const typeMap = {
    [OperatorType.BASIC]: 'primary',
    [OperatorType.SCRIPT]: 'success',
    [OperatorType.EXTERNAL]: 'warning'
  }
  return typeMap[type] || 'info'
}

// 定义props
const props = defineProps<{
  selectedCategoryId?: number | number[];
}>()

// 暴露方法给父组件
const setCategoryId = (categoryId: number | number[]) => {
  if (Array.isArray(categoryId)) {
    formData.categoryId = categoryId.join(',');
  } else {
    formData.categoryId = String(categoryId);
  }
  console.log('Setting categoryId:', formData.categoryId);
  loadData()
}

// 设置当前算子类型
const setOperatorType = (type: OperatorType) => {
  currentType.value = type;
  console.log('Setting operator type:', type);
  loadData()
}

// 监听props变化
watch(() => props.selectedCategoryId, (newCategoryId) => {
  if (newCategoryId) {
    if (Array.isArray(newCategoryId)) {
      if (newCategoryId.length > 0) {
        formData.categoryId = newCategoryId.join(',');
        console.log('Props changed, categoryId:', formData.categoryId);
      } else {
        // 如果是空数组，清空categoryId，显示该类型下的所有算子
        formData.categoryId = '';
        console.log('Props changed, empty array, showing all operators of current type');
      }
    } else {
      formData.categoryId = String(newCategoryId);
      console.log('Props changed, categoryId:', formData.categoryId);
    }
  } else {
    // 如果没有选中分类，清空categoryId，显示该类型下的所有算子
    formData.categoryId = '';
    console.log('Props changed, no category selected, showing all operators of current type');
  }
  loadData()
}, { immediate: true })

// 初始化
onMounted(() => {
  loadData()
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
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  padding: 24px 24px 16px 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
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
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafbfc;
  width: 100%;
  min-height: 0;
}

::v-deep(.el-table) {
  background: transparent;
}

::v-deep(.el-table__body-wrapper) {
  background: #fff;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
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
</style> 