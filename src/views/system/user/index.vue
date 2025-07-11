<template>
  <div class="user-management-page">
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
    <div class="content-area" :class="{ 'expanded': isTreeCollapsed }">
      <UserTable 
        ref="userTableRef"
        :selected-department-id="selectedDepartmentId"
        :selected-department-path="selectedDepartmentPath"
        @department-breadcrumb-click="handleDepartmentBreadcrumbClick"
      />
    </div>
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
const handleDepartmentSelect = ({ ids, node }: { ids: number[]; node: any }) => {
  systemStore.setSelectedDepartment(ids[0] ?? null, node ? [node.label] : [])
}

const handleDepartmentCreate = (department: any) => {
  // 部门创建成功后刷新部门树
  departmentTreeRef.value?.loadTree()
}

const handleDepartmentUpdate = (department: any) => {
  // 部门更新成功后刷新部门树
  departmentTreeRef.value?.loadTree()
}

const handleDepartmentDelete = (departmentId: number) => {
  // 部门删除成功后刷新部门树
  departmentTreeRef.value?.loadTree()
  // 如果删除的是当前选中的部门，清空选择
  if (selectedDepartmentId.value === departmentId) {
    systemStore.clearSelectedDepartment()
  }
}

const handleDepartmentBatchDelete = (departmentIds: number[]) => {
  // 部门批量删除成功后刷新部门树
  departmentTreeRef.value?.loadTree()
  // 如果删除的部门中包含当前选中的部门，清空选择
  if (selectedDepartmentId.value && departmentIds.includes(selectedDepartmentId.value)) {
    systemStore.clearSelectedDepartment()
  }
}

const handleDepartmentBreadcrumbClick = (departmentId: number) => {
  // 面包屑点击时选中对应部门
  departmentTreeRef.value?.setCurrentKey(departmentId)
}

// 树形控制
const toggleTreeCollapse = () => {
  systemStore.toggleDepartmentTree()
}
</script>

<style scoped>
.user-management-page {
  display: flex;
  height: calc(100% - 24px);
  position: relative;
}

.department-tree {
  width: 320px;
  min-width: 0;
  max-width: 420px;
  margin-right: 16px;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.5s ease;
  height: 100%;
}

.department-tree.collapsed {
  width: 0;
  min-width: 0;
  max-width: 0;
  margin-right: 0;
  opacity: 0;
}

.content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.content-area.expanded {
  margin-left: 0;
}

/* 现代化的展开收起按钮 */
.collapse-button {
  position: absolute;
  left: 320px;
  top: 40%;
  transform: translateY(-50%);
  width: 20px;
  height: 48px;
  background: var(--el-bg-color);
  backdrop-filter: blur(10px);
  border: 1px solid var(--el-border-color-lighter);
  border-left: none;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  background: linear-gradient(to right, var(--el-border-color-lighter) 0%, var(--el-bg-color) 70%);
  box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.03);
}

.collapse-button:hover {
  background: var(--el-fill-color-light);
  border-color: var(--el-border-color);
  box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.08);
}

.collapse-button:hover .el-icon {
  color: var(--el-text-color-primary);
  transform: scale(1.1);
}

.collapse-button:active {
  transform: translateY(-50%) scale(0.95);
}

.collapse-button .el-icon {
  color: var(--el-text-color-regular);
  font-size: 14px;
  transition: all 0.2s ease;
}

.collapse-button .el-icon.rotated {
  transform: rotate(180deg);
}

.department-tree.collapsed ~ .collapse-button {
  left: 1px;
  border-left: 1px solid var(--el-border-color-lighter);
  border-radius: 0 8px 8px 0;
}
</style> 