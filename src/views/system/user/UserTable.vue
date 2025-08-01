<template>
  <div class="user-table">
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
        <el-select v-model="searchForm.status" placeholder="用户状态" clearable style="width: 120px" @change="handleSearch">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-select v-model="searchForm.roleId" placeholder="用户角色" clearable style="width: 120px" @change="handleSearch">
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        @selection-change="handleSelectionChange"
        fit
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar
              :size="40"
              :src="row.avatar || defaultAvatar"
              :icon="!row.avatar ? UserIcon : undefined"
            >
              {{ !row.avatar ? row.realName?.charAt(0) : "" }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="realName" label="真实姓名" min-width="120" />
        <el-table-column prop="employeeNo" label="工号" min-width="120" />
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column label="角色" min-width="150">
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
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              :disabled="row.id === 1"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="最后登录" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.lastLoginTime) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :disabled="row.id === 1"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="warning"
              size="small"
              :disabled="row.id === 1"
              @click="handleResetPassword(row)"
            >
              重置密码
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="row.id === 1"
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

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      :show-close="true"
      @close="handleDialogClose"
    >
      <UserForm
        ref="formRef"
        :form-data="getFormData()"
        :form-mode="formMode"
        :department-id="props.selectedDepartmentId"
      />
      
      <template #footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button 
          type="primary" 
          :loading="dialogLoading"
          @click="handleFormSubmit"
        >
          {{ formMode === 'create' ? '创建用户' : '更新用户' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Delete,
  User as UserIcon
} from "@element-plus/icons-vue";
import { User } from "./types/user";
import { Role } from "@/views/system/role/types/role";
import {
  getUserList,
  deleteUser,
  batchDeleteUsers,
  updateUserStatus,
  resetUserPassword,
  createUser,
  updateUser
} from "@/api/system/user";
import { getAllRoles } from "@/api/system/role";
import UserForm from "./components/UserForm.vue";

// Props
const props = defineProps<{
  selectedDepartmentId: number | null;
  selectedDepartmentPath: string[];
}>();

// Emits
const emit = defineEmits<{
  departmentBreadcrumbClick: [departmentId: number];
}>();

// 响应式数据
const tableRef = ref();
const loading = ref(false);
const formMode = ref<"create" | "edit">("create");
const tableData = ref<User[]>([]);
const selectedUsers = ref<User[]>([]);
const roleOptions = ref<Role[]>([]);

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref("");
const dialogLoading = ref(false);
const formRef = ref();
const currentEditUser = ref<User | null>(null);

// 默认头像
const defaultAvatar = ref("");

const searchForm = reactive({
  status: undefined as number | undefined,
  roleId: undefined as number | undefined
});

const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
});

// 计算属性
const searchParams = computed(() => ({
  ...searchForm,
  departmentId: props.selectedDepartmentId,
  page: pagination.current,
  size: pagination.size
}));

// 时间格式化方法
const formatDateTime = (dateTime: string | undefined) => {
  if (!dateTime) return "-";
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// 方法
const handleSearch = () => {
  pagination.current = 1;
  loadTableData();
};

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection;
};

const handleAdd = () => {
  // 先设置对话框状态
  dialogVisible.value = true;
  dialogTitle.value = "新增用户";
  formMode.value = "create";
  
  // 使用 nextTick 确保组件状态稳定后再设置数据
  nextTick(() => {
    currentEditUser.value = null;
  });
};

const handleEdit = (row: User) => {
  // 先设置对话框状态
  dialogVisible.value = true;
  dialogTitle.value = "编辑用户";
  formMode.value = "edit";
  
  // 使用 nextTick 确保组件状态稳定后再设置数据
  nextTick(() => {
    currentEditUser.value = { ...row };
  });
};

// 对话框相关方法
const handleDialogClose = () => {
  dialogVisible.value = false;
  dialogLoading.value = false;
  currentEditUser.value = null;
};

const getFormData = () => {
  if (formMode.value === "create") {
    return {
      username: "",
      realName: "",
      email: "",
      phone: "",
      employeeNo: "",
      departmentId: props.selectedDepartmentId || 1,
      roleIds: [],
      status: 1
    };
  }
  // 编辑模式需要从选中的行获取数据
  if (currentEditUser.value) {
    return {
      ...currentEditUser.value,
      roleIds: currentEditUser.value.roles?.map(r => r.id) || []
    };
  }
  return {};
};

const handleFormSubmit = async () => {
  try {
    dialogLoading.value = true;
    
    // 调用 UserForm 的 submitForm 方法
    if (formRef.value) {
      await formRef.value.submitForm();
      // 提交成功后关闭对话框并刷新数据
      handleDialogClose();
      loadTableData();
    }
  } catch (error: any) {
    // 如果是验证错误，不需要额外处理，UserForm已经处理了
    if (error && typeof error === 'object' && Object.keys(error).length > 0) {
      console.log("表单验证失败，已由UserForm处理");
    } else {
      console.error("提交失败:", error);
    }
  } finally {
    dialogLoading.value = false;
  }
};

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      "确认删除该用户吗？删除后将无法恢复。",
      "确认删除",
      { type: "warning" }
    );
    await deleteUser(row.id);
    ElMessage.success("删除成功");
    loadTableData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("删除失败:", error);
      ElMessage.error(error.message || "删除失败");
    }
  }
};

const handleBatchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning("请选择要删除的用户");
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      "警告",
      { type: "warning" }
    );
    const ids = selectedUsers.value.map(user => user.id);
    await batchDeleteUsers(ids);
    ElMessage.success("批量删除成功");
    loadTableData();
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("批量删除失败:", error);
      ElMessage.error(error.message || "批量删除失败");
    }
  }
};

const handleStatusChange = async (row: User) => {
  // 保护系统管理员，不允许禁用
  if (row.id === 1 && row.status === 0) {
    ElMessage.error("系统管理员不允许禁用");
    row.status = 1; // 恢复为启用状态
    return;
  }

  try {
    console.log("更新用户状态:", { id: row.id, status: row.status });
    await updateUserStatus(row.id, row.status);
    ElMessage.success(row.status ? "用户已启用" : "用户已禁用");
  } catch (error: any) {
    // 恢复原状态
    row.status = row.status ? 0 : 1;
    console.error("状态更新失败:", error);
    console.error("错误详情:", error.response?.data || error);
    ElMessage.error(error.message || "状态更新失败");
  }
};

const handleResetPassword = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确认重置用户 "${row.realName}" 的密码吗？`,
      "确认",
      {
        type: "warning"
      }
    );
    const newPassword = await resetUserPassword(row.id);
    ElMessage.success(`密码重置成功，新密码为：${newPassword}`);
  } catch (error: any) {
    if (error !== "cancel") {
      console.error("重置密码失败:", error);
      ElMessage.error(error.message || "重置密码失败");
    }
  }
};

const loadTableData = async () => {
  loading.value = true;
  try {
    const response = await getUserList(searchParams.value);
    tableData.value = response.records || [];
    pagination.total = response.total || 0;
  } catch (error) {
    console.error("获取用户列表失败:", error);
    ElMessage.error("获取用户列表失败");
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const loadRoleOptions = async () => {
  try {
    const response = await getAllRoles();
    roleOptions.value = response || [];
  } catch (error) {
    console.error("获取角色列表失败:", error);
    roleOptions.value = [];
  }
};

// 监听部门变化
watch(
  () => props.selectedDepartmentId,
  () => {
    pagination.current = 1;
    loadTableData();
  },
  { immediate: true }
);

// 生命周期
onMounted(() => {
  loadRoleOptions();
  // 设置默认头像 - 直接引用SVG文件
  defaultAvatar.value = "/src/assets/user.svg";
});
</script>

<style scoped lang="scss">
.user-table {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
    margin-bottom: 16px;
    
    .left-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .right-search {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .table-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
    
    .el-table {
      flex: 1;
      width: 100%;
      
      :deep(.el-table__header) {
        background: var(--el-fill-color-light);
        
        .el-table__cell {
          background: var(--el-fill-color-light);
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
      }
      
      :deep(.el-table__row) {
        transition: all 0.2s ease;
        
        &:hover {
          background: var(--el-fill-color-light);
        }
      }
      
      :deep(.el-table__body-wrapper) {
        width: 100%;
      }
      
      :deep(.el-table__header-wrapper) {
        width: 100%;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    padding: 16px 0;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
  }
}

/* 弹窗样式已统一在 @/style/dialog.scss 中定义 */

// 表单组件统一样式
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
</style>
