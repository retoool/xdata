<template>
  <div class="role-management-page">
    <div class="role-content">
      <RoleTable 
        ref="roleTableRef"
        @role-permission="handleRolePermission"
      />
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
          <el-button @click="handlePermissionCancel">取消</el-button>
          <el-button type="primary" @click="handleSavePermission" :loading="savingPermission">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSystemStore } from '@/store/modules/system'
import RoleTable from './RoleTable.vue'
import MenuPermission from './components/MenuPermission.vue'

const systemStore = useSystemStore()
const roleTableRef = ref()
const menuPermissionRef = ref()

// 响应式数据
const showPermissionDialog = ref(false)
const currentRoleId = ref<number | null>(null)
const savingPermission = ref(false)
const originalPermissions = ref<string[]>([])

// 方法
const handleRolePermission = (roleId: number) => {
  currentRoleId.value = roleId
  showPermissionDialog.value = true
  // 记录原始权限状态，用于取消时恢复
  originalPermissions.value = [...(menuPermissionRef.value?.getSelectedPermissions() || [])]
}

const handlePermissionChange = (permissions: string[]) => {
  // 权限变化处理
  console.log('权限发生变化:', permissions)
}

const handleSavePermission = async () => {
  if (!currentRoleId.value) return
  
  try {
    savingPermission.value = true
    const permissions = menuPermissionRef.value?.getSelectedPermissions() || []
    
    // TODO: 调用保存权限的API
    // await updateRolePermissions(currentRoleId.value, permissions)
    
    ElMessage.success('权限配置保存成功')
    showPermissionDialog.value = false
    
    // 刷新角色列表
    roleTableRef.value?.refreshTable()
  } catch (error) {
    ElMessage.error('权限配置保存失败')
  } finally {
    savingPermission.value = false
  }
}

const handlePermissionCancel = () => {
  // 恢复原始权限状态
  if (menuPermissionRef.value && originalPermissions.value.length > 0) {
    menuPermissionRef.value.setSelectedPermissions(originalPermissions.value)
  }
  showPermissionDialog.value = false
}

const handlePermissionDialogClose = (done: () => void) => {
  // 检查是否有未保存的更改
  const currentPermissions = menuPermissionRef.value?.getSelectedPermissions() || []
  const hasChanges = JSON.stringify(currentPermissions.sort()) !== JSON.stringify(originalPermissions.value.sort())
  
  if (hasChanges) {
    ElMessageBox.confirm('有未保存的权限配置，确认关闭吗？', '提示', {
      type: 'warning'
    }).then(() => {
      handlePermissionCancel()
      done()
    }).catch(() => {
      // 用户取消
    })
  } else {
    done()
  }
}
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