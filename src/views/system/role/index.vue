<template>
  <div class="role-management-page">
    <div class="role-content">
      <RoleTable ref="roleTableRef" @role-permission="handleRolePermission" />
    </div>

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="showPermissionDialog"
      title="配置权限"
      width="800px"
      :before-close="handlePermissionDialogClose"
    >
      <MenuPermission
        ref="menuPermissionRef"
        :role-id="currentRoleId"
        @permission-change="handlePermissionChange"
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

const handlePermissionChange = (permissions: number[]) => {
  // 权限变化处理
  console.log("权限发生变化:", permissions);
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
.role-management-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .role-content {
    flex: 1;
    overflow: hidden;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

:deep(.el-dialog__body) {
  padding: 20px;
  max-height: 60vh;
  overflow: auto;
}
</style>
