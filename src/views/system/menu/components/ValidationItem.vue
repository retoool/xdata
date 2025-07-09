<template>
  <div class="validation-item">
    <div class="status-icon">
      <el-icon v-if="valid" class="success">
        <SuccessFilled />
      </el-icon>
      <el-icon v-else class="error">
        <CircleCloseFilled />
      </el-icon>
    </div>
    <div class="message">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'

// Props
defineProps<{
  valid: boolean
  message: string
}>()
</script>

<style scoped lang="scss">
.validation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .status-icon {
    .el-icon {
      font-size: 16px;
      
      &.success {
        color: var(--el-color-success);
      }
      
      &.error {
        color: var(--el-color-error);
      }
    }
  }
  
  .message {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}
</style> 