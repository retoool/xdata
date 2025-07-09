<template>
  <div class="role-table">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="left-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增角色
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedRoles.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
      
      <div class="right-search">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索角色名称、编码、描述"
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select 
          v-model="searchForm.status" 
          placeholder="状态" 
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </div>
    </div>
    
    <!-- 角色表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="角色名称" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="role-name">
              <el-icon class="role-icon">
                <UserFilled />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="角色编码" width="150" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="description">{{ row.description || '暂无描述' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="权限数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ row.permissions?.length || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户数量" width="100" align="center">
          <template #default="{ row }">
            <el-link 
              v-if="row.userCount > 0"
              type="primary" 
              @click="handleViewUsers(row)"
            >
              {{ row.userCount }}
            </el-link>
            <span v-else class="text-muted">0</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="row.code === 'admin'"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" size="small" @click="handlePermission(row)">
              配置权限
            </el-button>
            <el-button type="warning" size="small" @click="handleCopy(row)">
              复制
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              :disabled="row.code === 'admin' || row.userCount > 0"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>
    
    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="showForm"
      :title="formMode === 'create' ? '新增角色' : formMode === 'edit' ? '编辑角色' : '复制角色'"
      width="600px"
    >
      <RoleForm
        ref="formRef"
        :form-data="formData"
        :form-mode="formMode"
        @submit="handleFormSubmit"
      />
    </el-dialog>
    
    <!-- 用户列表对话框 -->
    <el-dialog
      v-model="showUserDialog"
      :title="`角色【${currentRole?.name}】下的用户`"
      width="800px"
    >
      <div v-loading="loadingUsers">
        <el-table :data="roleUsers" max-height="400">
          <el-table-column prop="realName" label="姓名" width="120" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="email" label="邮箱" width="180" />
          <el-table-column prop="departmentName" label="部门" width="150" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Delete, 
  Refresh, 
  Search, 
  UserFilled 
} from '@element-plus/icons-vue'
import type { Role, User } from '@/types/system'
import { 
  getRoleList,
  updateRoleStatus,
  deleteRole,
  batchDeleteRoles,
  getRoleUsers,
  copyRole
} from '@/api/system/role'
import RoleForm from './components/RoleForm.vue'

// Emits
const emit = defineEmits<{
  rolePermission: [roleId: number]
}>()

// 响应式数据
const tableRef = ref()
const formRef = ref()
const loading = ref(false)
const loadingUsers = ref(false)
const showForm = ref(false)
const showUserDialog = ref(false)
const formMode = ref<'create' | 'edit' | 'copy'>('create')
const tableData = ref<Role[]>([])
const selectedRoles = ref<Role[]>([])
const roleUsers = ref<User[]>([])
const currentRole = ref<Role | null>(null)

const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

const formData = ref<Partial<Role>>({
  name: '',
  code: '',
  description: '',
  permissions: [],
  status: 1
})

// 计算属性
const searchParams = computed(() => ({
  ...searchForm,
  page: pagination.current,
  size: pagination.size
}))

// 方法
const handleSearch = () => {
  pagination.current = 1
  loadTableData()
}

const handleRefresh = () => {
  loadTableData()
}

const handleSelectionChange = (selection: Role[]) => {
  selectedRoles.value = selection
}

const handleAdd = () => {
  formMode.value = 'create'
  formData.value = {
    name: '',
    code: '',
    description: '',
    permissions: [],
    status: 1
  }
  showForm.value = true
}

const handleEdit = (row: Role) => {
  formMode.value = 'edit'
  formData.value = { ...row }
  showForm.value = true
}

const handleCopy = (row: Role) => {
  formMode.value = 'copy'
  formData.value = {
    ...row,
    id: undefined,
    name: `${row.name}_副本`,
    code: `${row.code}_copy`,
    userCount: 0
  }
  showForm.value = true
}

const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      `确认删除角色 "${row.name}" 吗？删除后不可恢复！`,
      '警告',
      { type: 'warning' }
    )
    
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedRoles.value.length === 0) {
    ElMessage.warning('请选择要删除的角色')
    return
  }
  
  // 检查是否包含管理员角色或有用户的角色
  const adminRoles = selectedRoles.value.filter(role => role.code === 'admin')
  const rolesWithUsers = selectedRoles.value.filter(role => role.userCount > 0)
  
  if (adminRoles.length > 0) {
    ElMessage.warning('不能删除管理员角色')
    return
  }
  
  if (rolesWithUsers.length > 0) {
    ElMessage.warning('不能删除已分配给用户的角色')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedRoles.value.length} 个角色吗？`,
      '警告',
      { type: 'warning' }
    )
    
    const ids = selectedRoles.value.map(role => role.id)
    await batchDeleteRoles(ids)
    ElMessage.success('批量删除成功')
    loadTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleStatusChange = async (row: Role) => {
  try {
    await updateRoleStatus(row.id, row.status)
    ElMessage.success(row.status ? '角色已启用' : '角色已禁用')
  } catch (error) {
    // 恢复原状态
    row.status = row.status ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

const handlePermission = (row: Role) => {
  emit('rolePermission', row.id)
}

const handleViewUsers = async (row: Role) => {
  currentRole.value = row
  showUserDialog.value = true
  loadingUsers.value = true
  
  try {
    roleUsers.value = await getRoleUsers(row.id)
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loadingUsers.value = false
  }
}

const handleFormSubmit = async (data: Role) => {
  try {
    if (formMode.value === 'copy') {
      await copyRole(data.id!, data.name, data.code)
    } else {
      // 创建或更新逻辑将在具体的API中处理
    }
    
    showForm.value = false
    ElMessage.success(
      formMode.value === 'create' ? '新增成功' : 
      formMode.value === 'edit' ? '编辑成功' : '复制成功'
    )
    loadTableData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  loadTableData()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  loadTableData()
}

const loadTableData = async () => {
  loading.value = true
  try {
    const result = await getRoleList(searchParams.value)
    tableData.value = result.records
    pagination.total = result.total
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 监听搜索参数变化
watch(searchParams, () => {
  // 防抖处理可以在这里添加
}, { deep: true })

// 生命周期
onMounted(() => {
  loadTableData()
})

// 暴露方法
defineExpose({
  refreshTable: loadTableData,
  getSelectedRoles: () => selectedRoles.value
})
</script>

<style scoped lang="scss">
.role-table {
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
    
    .role-name {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .role-icon {
        color: var(--el-color-primary);
        font-size: 16px;
      }
    }
    
    .description {
      color: var(--el-text-color-regular);
    }
    
    .text-muted {
      color: var(--el-text-color-placeholder);
    }
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }
}

:deep(.el-table .el-table__cell) {
  .cell {
    display: flex;
    align-items: center;
  }
}

:deep(.el-switch.is-disabled .el-switch__core) {
  background-color: var(--el-fill-color-darker);
}
</style> 