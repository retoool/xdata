<template>
  <div class="page-container">
    <div class="content-area">
      <div class="content-main">
        <RoleTable ref="roleTableRef" @role-permission="handleRolePermission" />
      </div>
    </div>

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="showPermissionDialog"
      title="配置权限"
      width="800px"
      :before-close="handlePermissionDialogClose"
      destroy-on-close
    >
      <MenuPermission
        ref="menuPermissionRef"
        :role-id="currentRoleId"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPermissionDialog = false">取消</el-button>
          <el-button
            type="primary"
            :loading="savingPermission"
            @click="handleSavePermission"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import RoleTable from "./RoleTable.vue";
import MenuPermission from "./components/MenuPermission.vue";
import { assignRoleMenus } from "@/api/system/role";

const roleTableRef = ref();
const menuPermissionRef = ref();

// 响应式数据
const showPermissionDialog = ref(false);
const currentRoleId = ref<number | null>(null);
const savingPermission = ref(false);
const originalPermissions = ref<number[]>([]);

// 方法
const handleRolePermission = (roleId: number) => {
  currentRoleId.value = roleId;
  showPermissionDialog.value = true;
  nextTick(() => {
    // 记录原始权限状态，用于取消时恢复
    originalPermissions.value = [
      ...(menuPermissionRef.value?.getSelectedMenus() || [])
    ];
  });
};

const handleSavePermission = async () => {
  if (!currentRoleId.value) return;
  try {
    savingPermission.value = true;
    // 获取所有勾选的菜单ID（string[]），转换为number[]，以适配后端API类型
    const menuIds = (menuPermissionRef.value?.getSelectedMenuIds() || []).map(id => Number(id));
    // 调用后端API保存角色权限
    await assignRoleMenus(currentRoleId.value, menuIds);
    ElMessage.success("权限配置保存成功");
    showPermissionDialog.value = false;
    // 刷新角色列表，确保权限变更实时生效
    roleTableRef.value?.refreshTable();
  } catch (error) {
    ElMessage.error("权限配置保存失败");
  } finally {
    savingPermission.value = false;
  }
};

const handlePermissionCancel = () => {
  // 恢复原始权限状态，防止误操作
  if (menuPermissionRef.value && originalPermissions.value.length > 0) {
    menuPermissionRef.value.setSelectedMenus(originalPermissions.value);
  }
};

const handlePermissionDialogClose = (done: () => void) => {
  handlePermissionCancel();
  done();
};
</script>

<style scoped lang="scss">
.page-container {
  height: 100%;
  padding: 16px;
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-area {
  position: relative;
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-main {
  flex: 1;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: var(--el-border-color);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  padding: 24px;
  max-height: 60vh;
  overflow: auto;
}
</style>
