<template>
  <div class="user-management-page">
    <!-- 左侧部门树 -->
    <div class="department-tree" :class="{ 'collapsed': isTreeCollapsed }">
      <DepartmentTree 
        ref="departmentTreeRef"
        @node-select="handleDepartmentSelect"
        @node-create="handleDepartmentCreate"
        @node-update="handleDepartmentUpdate"
        @node-delete="handleDepartmentDelete"
        @batch-delete="handleDepartmentBatchDelete"
      />
    </div>
    
    <!-- 右侧用户列表 -->
    <div class="content-area" :class="{ 'expanded': isTreeCollapsed }">
      <UserTable 
        ref="userTableRef"
        :selected-department-id="selectedDepartmentId"
        :selected-department-path="selectedDepartmentPath"
        @department-breadcrumb-click="handleDepartmentBreadcrumbClick"
      />
    </div>
    
    <!-- 展开/收起按钮 -->
    <div class="collapse-button" @click="toggleTreeCollapse">
      <el-icon :class="{ 'rotated': isTreeCollapsed }">
        <ArrowLeft />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useSystemStore } from '@/store/modules/system'
import DepartmentTree from './DepartmentTree.vue'
import UserTable from './UserTable.vue'

const systemStore = useSystemStore()
const departmentTreeRef = ref()
const userTableRef = ref()

// 响应式数据
const isTreeCollapsed = computed(() => systemStore.isDepartmentTreeCollapsed)
const selectedDepartmentId = computed(() => systemStore.selectedDepartmentId)
const selectedDepartmentPath = computed(() => systemStore.selectedDepartmentPath)

// 部门相关操作
const handleDepartmentSelect = (departmentId: number | null, path: string[]) => {
  systemStore.setSelectedDepartment(departmentId, path)
}

const handleDepartmentCreate = () => {
  // TODO: 实现部门创建逻辑
}

const handleDepartmentUpdate = () => {
  // TODO: 实现部门更新逻辑
}

const handleDepartmentDelete = () => {
  // TODO: 实现部门删除逻辑
}

const handleDepartmentBatchDelete = () => {
  // TODO: 实现部门批量删除逻辑
}

const handleDepartmentBreadcrumbClick = (departmentId: number) => {
  // TODO: 实现面包屑点击逻辑
}

// 树形控制
const toggleTreeCollapse = () => {
  systemStore.toggleDepartmentTree()
}
</script>

<style scoped lang="scss">
.user-management-page {
  display: flex;
  height: 100%;
  position: relative;
  
  .department-tree {
    width: 280px;
    border-right: 1px solid var(--el-border-color);
    transition: all 0.3s ease;
    background: var(--el-bg-color);
    
    &.collapsed {
      width: 0;
      overflow: hidden;
    }
  }
  
  .content-area {
    flex: 1;
    overflow: hidden;
    transition: all 0.3s ease;
    
    &.expanded {
      margin-left: 0;
    }
  }
  
  .collapse-button {
    position: absolute;
    left: 280px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    width: 20px;
    height: 40px;
    background: var(--el-color-primary);
    border-radius: 0 8px 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: all 0.3s ease;
    
    &:hover {
      background: var(--el-color-primary-light-3);
    }
    
    .el-icon {
      transition: transform 0.3s ease;
      
      &.rotated {
        transform: rotate(180deg);
      }
    }
  }
}
</style> 