<template>
  <div class="role-table">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="left-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增角色
        </el-button>
      </div>

      <div class="right-search">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索角色名、编码、描述"
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button
          :loading="loading"
          icon="Refresh"
          circle
          title="刷新"
          @click="handleRefresh"
        />
      </div>
    </div>

    <!-- 角色表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
      >
        <!-- 多选列已移除 -->
        <el-table-column
          prop="name"
          label="角色名"
          width="180"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <div class="role-name">
              <el-icon class="role-icon">
                <UserFilled />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="code"
          label="编码"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="description"
          label="描述"
          width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="description">{{ row.description || "暂无描述" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="权限数量" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ row && (typeof row.permissionCount === 'number' ? row.permissionCount : (Array.isArray(row.permissions) ? row.permissions.length : 0)) }}
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
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            <span>{{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" :disabled="row.code === 'admin'" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              type="success"
              size="small"
              :disabled="row.code === 'admin'"
              @click="handlePermission(row)"
            >
              配置权限
            </el-button>
            <el-button type="warning" size="small" :disabled="row.code === 'admin'" @click="handleCopy(row)">
              复制
            </el-button>
            <el-button
              type="danger"
              size="small"
              :disabled="row.code === 'admin'"
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
        :current-page="pagination.current"
        :page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @update:current-page="val => { pagination.current = val; loadTableData(); }"
        @update:page-size="val => { pagination.size = val; pagination.current = 1; loadTableData(); }"
      />
    </div>

    <!-- 角色表单对话框 -->
    <el-dialog
      v-model="showForm"
      :title="
        formMode === 'create'
          ? '新增角色'
          : formMode === 'edit'
            ? '编辑角色'
            : '复制角色'
      "
      width="600px"
    >
      <RoleForm
        ref="formRef"
        :form-data="formData"
        :form-mode="formMode"
        @submit="handleFormSubmit"
        @cancel="handleFormCancel"
      />
    </el-dialog>

    <!-- 用户列表对话框 -->
    <el-dialog
      v-model="showUserDialog"
      :title="`角色【${currentRole?.name}】下的用户`"
      width="800px"
      @close="resetUserDialog"
    >
      <div v-loading="loadingUsers">
        <el-table
          v-if="roleUsers.length > 0"
          :data="roleUsers"
          max-height="400"
        >
          <el-table-column prop="realName" label="姓名" width="120" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="email" label="邮箱" width="180" />
          <el-table-column prop="departmentName" label="部门" width="150">
            <template #default="{ row }">
              <span>{{ row.department?.name || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 1 ? "启用" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160">
            <template #default="{ row }">
              <span>{{ row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss') : '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无用户" />
        <el-pagination
          v-if="pagination.total > pagination.size"
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          :disabled="loadingUsers"
          style="margin-top: 12px; text-align: right"
          @current-change="handleUserPageChange"
          @size-change="handleUserSizeChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Search,
  UserFilled
} from "@element-plus/icons-vue";
import type { Role } from "@/views/system/role/types/role";
import type { User } from "@/views/system/user/types/user";
import {
  getRoleList,
  deleteRole,
  getRoleUsers,
  copyRole,
  updateRoleSort
} from "@/api/system/role";
import { batchDeleteUsers } from "@/api/system/user";
import RoleForm from "./components/RoleForm.vue";
import { getRoleById } from "@/api/system/role";
import Sortable from 'sortablejs';
// Emits
const emit = defineEmits<{
  rolePermission: [roleId: number];
}>();

// 响应式数据
const tableRef = ref();
const formRef = ref();
const loading = ref(false);
const loadingUsers = ref(false);
const showForm = ref(false);
const showUserDialog = ref(false);
const formMode = ref<"create" | "edit" | "copy">("create");
const tableData = ref<Role[]>([]);
const roleUsers = ref<User[]>([]);
const currentRole = ref<Role | null>(null);

const searchForm = reactive({
  keyword: ""
});

const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
});

const formData = ref<Partial<Role>>({
  name: "",
  code: "",
  description: "",
  menus: [],
});

// 计算属性
const searchParams = computed(() => ({
  ...searchForm,
  page: pagination.current,
  size: pagination.size
}));

// 方法
const handleSearch = () => {
  pagination.current = 1;
  loadTableData();
};

const handleRefresh = () => {
  loadTableData();
};

const handleAdd = () => {
  formMode.value = "create";
  formData.value = {
    name: "",
    code: "",
    description: "",
    menus: [],
  };
  showForm.value = true;
};

const handleEdit = async (row: Role) => {
  if (row.code === 'admin') return;
  formMode.value = "edit";
  const detail = await getRoleById(row.id);
  formData.value = {
    ...detail
  };
  showForm.value = true;
};

const handleCopy = (row: Role) => {
  if (row.code === 'admin') return;
  formMode.value = "copy";
  console.log(formData.value)
  formData.value = {
    ...row,
    name: `${row.name}_副本`,
    code: `${row.code}_copy`,
  };
  console.log(formData.value)
  showForm.value = true;
};

const handleDelete = async (row: Role) => {
  if (row.code === 'admin') return;
  try {
    if (row.userCount > 0) {
      await ElMessageBox.confirm(
        `该角色下还有 ${row.userCount} 个用户，是否同时删除这些用户并删除角色？`,
        "警告",
        { type: "warning" }
      );
      // 获取该角色下所有用户
      const result = await getRoleUsers(row.id, { page: 1, size: 9999 });
      const userIds = result.records.map(u => u.id);
      if (userIds.length > 0) {
        await batchDeleteUsers(userIds);
      }
    } else {
      await ElMessageBox.confirm(
        `确认删除角色 \"${row.name}\" 吗？删除后不可恢复！`,
        "警告",
        { type: "warning" }
      );
    }
    // 删除角色
    await deleteRole(row.id);
    ElMessage.success("角色及其下所有用户已删除");
    loadTableData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handlePermission = (row: Role) => {
  if (row.code === 'admin') return;
  emit("rolePermission", row.id);
};

const handleViewUsers = async (row: Role) => {
  currentRole.value = row;
  showUserDialog.value = true;
  pagination.current = 1;
  loadRoleUsers();
};

const loadRoleUsers = async () => {
  if (!currentRole.value) return;
  loadingUsers.value = true;
  try {
    const result = await getRoleUsers(currentRole.value.id, {
      page: pagination.current,
      size: pagination.size
    });
    roleUsers.value = result.records;
    pagination.total = result.total;
  } catch (error) {
    ElMessage.error("加载用户列表失败");
  } finally {
    loadingUsers.value = false;
  }
};

const handleUserPageChange = (page: number) => {
  pagination.current = page;
  loadRoleUsers();
};

const handleUserSizeChange = (size: number) => {
  pagination.size = size;
  pagination.current = 1;
  loadRoleUsers();
};

const resetUserDialog = () => {
  roleUsers.value = [];
  pagination.current = 1;
  pagination.total = 0;
};

const handleFormSubmit = async () => {
  try {
    showForm.value = false;
    ElMessage.success(
      formMode.value === "create"
        ? "新增成功"
        : formMode.value === "edit"
          ? "编辑成功"
          : "复制成功"
    );
    loadTableData();
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

const handleFormCancel = () => {
  showForm.value = false;
};

const handleSizeChange = (size: number) => {
  pagination.size = size;
  loadTableData();
};

const handleCurrentChange = (current: number) => {
  pagination.current = current;
  loadTableData();
};

const loadTableData = async () => {
  loading.value = true;
  try {
    const result = await getRoleList(searchParams.value);
    tableData.value = result.records;
    pagination.total = result.total;
  } catch (error) {
    ElMessage.error("加载角色列表失败");
  } finally {
    loading.value = false;
  }
};

// 监听搜索参数变化
watch(
  searchParams,
  () => {
    // 防抖处理可以在这里添加
  },
  { deep: true }
);

// 生命周期
onMounted(() => {
  loadTableData();
  nextTick(() => {
    initRowDrag();
  });
});

function initRowDrag() {
  const tableBody = document.querySelector('.role-table .el-table__body-wrapper tbody') as HTMLElement | null;
  if (!tableBody) return;
  Sortable.create(tableBody, {
    animation: 150,
    handle: '.el-table__row',
    onEnd: async (evt) => {
      if (evt.oldIndex === evt.newIndex) return;
      // 重新排序tableData
      const movedRow = tableData.value.splice(evt.oldIndex, 1)[0];
      tableData.value.splice(evt.newIndex, 0, movedRow);
      // 生成排序参数
      const sortItems = tableData.value.map((item, idx) => ({ id: item.id, sort: idx }));
      try {
        await updateRoleSort(sortItems);
        ElMessage.success('排序已更新');
        loadTableData();
      } catch (e) {
        ElMessage.error('排序更新失败');
      }
    }
  });
}

// 暴露方法
defineExpose({
  refreshTable: loadTableData
});
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
