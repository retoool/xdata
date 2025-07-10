<template>
  <div class="user-table">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-nav">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item 
          v-for="(item, index) in selectedDepartmentPath" 
          :key="index"
          :class="{ 'is-link': index < selectedDepartmentPath.length - 1 }"
          @click="handleBreadcrumbClick(index)"
        >
          {{ item }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="left-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增用户
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedUsers.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </div>
      
      <div class="right-search">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索用户名、姓名、工号、邮箱"
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button @click="showAdvancedSearch = !showAdvancedSearch">
          <el-icon><Filter /></el-icon>高级搜索
        </el-button>
      </div>
    </div>
    
    <!-- 高级搜索 -->
    <el-collapse-transition>
      <div v-show="showAdvancedSearch" class="advanced-search">
        <el-form :model="searchForm" label-width="80px" inline>
          <el-form-item label="用户状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable>
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户角色">
            <el-select v-model="searchForm.roleId" placeholder="全部" clearable>
              <el-option 
                v-for="role in roleOptions" 
                :key="role.id" 
                :label="role.name" 
                :value="role.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="searchForm.createTimeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleResetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-collapse-transition>
    
    <!-- 用户表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              {{ row.realName?.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="employeeNo" label="工号" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column label="角色" width="150">
          <template #default="{ row }">
            <el-tag 
              v-for="role in row.roles" 
              :key="role.id" 
              size="small" 
              style="margin-right: 4px"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录" width="160" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="warning" size="small" @click="handleResetPassword(row)">
              重置密码
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
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
    
    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="showForm"
      :title="formMode === 'create' ? '新增用户' : '编辑用户'"
      width="600px"
    >
      <UserForm
        ref="formRef"
        :form-data="formData"
        :form-mode="formMode"
        :department-id="selectedDepartmentId"
        @submit="handleFormSubmit"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Search, Filter } from '@element-plus/icons-vue'
import type { User, Role } from '@/types/system'
import { 
  getUserList, 
  createUser, 
  updateUser, 
  deleteUser, 
  batchDeleteUsers, 
  updateUserStatus, 
  resetUserPassword 
} from '@/api/system/user'
import { getAllRoles } from '@/api/system/role'
import UserForm from './components/UserForm.vue'

// Props
const props = defineProps<{
  selectedDepartmentId: number | null
  selectedDepartmentPath: string[]
}>()

// Emits
const emit = defineEmits<{
  departmentBreadcrumbClick: [departmentId: number]
}>()

// 响应式数据
const tableRef = ref()
const formRef = ref()
const loading = ref(false)
const showForm = ref(false)
const showAdvancedSearch = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const tableData = ref<User[]>([])
const selectedUsers = ref<User[]>([])
const roleOptions = ref<Role[]>([])

const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
  roleId: undefined as number | undefined,
  createTimeRange: [] as string[]
})

const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

const formData = ref<Partial<User>>({
  username: '',
  realName: '',
  email: '',
  phone: '',
  employeeNo: '',
  departmentId: undefined,
  roleIds: [],
  status: 1
})

// 计算属性
const searchParams = computed(() => ({
  ...searchForm,
  departmentId: props.selectedDepartmentId,
  page: pagination.current,
  size: pagination.size
}))

// 方法
const handleSearch = () => {
  pagination.current = 1
  loadTableData()
}

const handleResetSearch = () => {
  Object.assign(searchForm, {
    keyword: '',
    status: undefined,
    roleId: undefined,
    createTimeRange: []
  })
  handleSearch()
}

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const handleAdd = () => {
  formMode.value = 'create'
  formData.value = {
    username: '',
    realName: '',
    email: '',
    phone: '',
    employeeNo: '',
    departmentId: props.selectedDepartmentId || undefined,
    roleIds: [],
    status: 1
  }
  showForm.value = true
}

const handleEdit = (row: User) => {
  formMode.value = 'edit'
  formData.value = { 
    ...row,
    roleIds: row.roles?.map(r => r.id) || []
  }
  showForm.value = true
}

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(`确认删除用户 "${row.realName}" 吗？`, '警告', {
      type: 'warning'
    })
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      '警告',
      { type: 'warning' }
    )
    const ids = selectedUsers.value.map(user => user.id)
    await batchDeleteUsers(ids)
    ElMessage.success('批量删除成功')
    loadTableData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

const handleStatusChange = async (row: User) => {
  try {
    await updateUserStatus(row.id, row.status)
    ElMessage.success(row.status ? '用户已启用' : '用户已禁用')
  } catch (error: any) {
    // 恢复原状态
    row.status = row.status ? 0 : 1
    console.error('状态更新失败:', error)
    ElMessage.error(error.message || '状态更新失败')
  }
}

const handleResetPassword = async (row: User) => {
  try {
    await ElMessageBox.confirm(`确认重置用户 "${row.realName}" 的密码吗？`, '确认', {
      type: 'warning'
    })
    const newPassword = await resetUserPassword(row.id)
    ElMessage.success(`密码重置成功，新密码为：${newPassword}`)
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error(error.message || '重置密码失败')
    }
  }
}

const handleFormSubmit = async (data: User) => {
  try {
    if (formMode.value === 'create') {
      await createUser(data)
      ElMessage.success('新增成功')
    } else {
      await updateUser(data.id, data)
      ElMessage.success('编辑成功')
    }
    showForm.value = false
    loadTableData()
  } catch (error: any) {
    console.error('提交失败:', error)
    ElMessage.error(error.message || '操作失败')
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

const handleBreadcrumbClick = (index: number) => {
  // TODO: 实现面包屑点击逻辑
  emit('departmentBreadcrumbClick', index)
}

const loadTableData = async () => {
  loading.value = true
  try {
    const response = await getUserList(searchParams.value)
    tableData.value = response.records || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const loadRoleOptions = async () => {
  try {
    const response = await getAllRoles()
    roleOptions.value = response || []
  } catch (error) {
    console.error('获取角色列表失败:', error)
    roleOptions.value = []
  }
}

// 监听部门变化
watch(() => props.selectedDepartmentId, () => {
  pagination.current = 1
  loadTableData()
}, { immediate: true })

// 生命周期
onMounted(() => {
  loadRoleOptions()
})
</script>

<style scoped lang="scss">
.user-table {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  
  .breadcrumb-nav {
    margin-bottom: 16px;
    
    :deep(.el-breadcrumb__item) {
      &.is-link {
        cursor: pointer;
        
        .el-breadcrumb__inner:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }
  
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
  
  .advanced-search {
    background: var(--el-fill-color-lighter);
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 16px;
  }
  
  .table-container {
    flex: 1;
    overflow: hidden;
    
    .el-table {
      height: 100%;
    }
  }
  
  .pagination {
    display: flex;
    justify-content: center;
    padding: 16px 0;
  }
}
</style> 