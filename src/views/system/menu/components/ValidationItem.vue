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
import { SuccessFilled, CircleCloseFilled } from "@element-plus/icons-vue";

// Props
defineProps<{
  valid: boolean;
  message: string;
}>();
</script>

<style scoped lang="scss">
.validation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--el-fill-color-light);
  }

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    transition: all 0.2s ease;
    
    .el-icon {
      font-size: 14px;
      transition: all 0.2s ease;

      &.success {
        color: var(--el-color-success);
      }

      &.error {
        color: var(--el-color-danger);
      }
    }
    
    &:hover {
      transform: scale(1.1);
    }
  }

  .message {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    flex: 1;
  }
}
</style>
