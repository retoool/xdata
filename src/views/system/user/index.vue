<template>
  <div class="page-container">
    <div class="content-area" :class="{ 'no-gap': isTreeCollapsed, 'sidebar-collapsed': isTreeCollapsed }">
      <!-- 侧边栏 -->
      <div class="sidebar" :class="{ collapsed: isTreeCollapsed }">
        <DepartmentTree
          ref="departmentTreeRef"
          @node-select="handleDepartmentSelect"
          @node-create="handleDepartmentCreate"
          @node-update="handleDepartmentUpdate"
          @node-delete="handleDepartmentDelete"
          @batch-delete="handleDepartmentBatchDelete"
        />
        
        <!-- 折叠按钮 -->
        <div class="sidebar-collapse" @click="toggleTreeCollapse">
          <el-icon :class="{ rotated: isTreeCollapsed }">
            <ArrowLeft />
          </el-icon>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="content-main" :class="{ expanded: isTreeCollapsed }">
        <UserTable
          ref="userTableRef"
          :selected-department-id="selectedDepartmentId"
          :selected-department-path="selectedDepartmentPath"
          @department-breadcrumb-click="handleDepartmentBreadcrumbClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ArrowLeft } from "@element-plus/icons-vue";
import DepartmentTree from "./DepartmentTree.vue";
import UserTable from "./UserTable.vue";

// 本地状态
const departmentTreeRef = ref();
const userTableRef = ref();
const isTreeCollapsed = ref(false);
const selectedDepartmentId = ref<number | null>(null);
const selectedDepartmentPath = ref<string[]>([]);

// 部门相关操作
const setSelectedDepartment = (id: number | null, path: string[] = []) => {
  selectedDepartmentId.value = id;
  selectedDepartmentPath.value = [...path];
};
const clearSelectedDepartment = () => {
  selectedDepartmentId.value = null;
  selectedDepartmentPath.value = [];
};
const toggleTreeCollapse = () => {
  isTreeCollapsed.value = !isTreeCollapsed.value;
};

// 响应式数据
// const isTreeCollapsed = computed(() => systemStore.isDepartmentTreeCollapsed)
// const selectedDepartmentId = computed(() => systemStore.selectedDepartmentId)
// const selectedDepartmentPath = computed(() => systemStore.selectedDepartmentPath)

const handleDepartmentSelect = ({
  ids,
  node
}: {
  ids: number[];
  node: any;
}) => {
  setSelectedDepartment(ids[0] ?? null, node ? [node.name] : []);
};

const handleDepartmentCreate = (department: any) => {
  departmentTreeRef.value?.loadTree();
};

const handleDepartmentUpdate = (department: any) => {
  departmentTreeRef.value?.loadTree();
};

const handleDepartmentDelete = (departmentId: number) => {
  departmentTreeRef.value?.loadTree();
  if (selectedDepartmentId.value === departmentId) {
    clearSelectedDepartment();
  }
};

const handleDepartmentBatchDelete = (departmentIds: number[]) => {
  departmentTreeRef.value?.loadTree();
  if (
    selectedDepartmentId.value &&
    departmentIds.includes(selectedDepartmentId.value)
  ) {
    clearSelectedDepartment();
  }
};

const handleDepartmentBreadcrumbClick = (departmentId: number) => {
  departmentTreeRef.value?.setCurrentKey(departmentId);
};

// 生命周期
onMounted(() => {
  // 部门树会在数据加载完成后自动选中系统部门
});
</script>

<style scoped lang="scss">
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-area {
  position: relative;
  background: var(--el-bg-color-lighter);
  // padding:12px;
  margin:12px;
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
  border-radius: 0px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 当侧边栏收起时，去掉gap
  &.no-gap {
    gap: 0;
  }
  
  // 当侧边栏收起时，主内容区域占据全宽
  &.sidebar-collapsed {
    .main-content {
      margin-left: -280px;
    }
  }
}

.sidebar {
  position: relative;
  width: 280px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  overflow: visible;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  
  // 收起状态
  &.collapsed {
    transform: translateX(-100%);

    .toolbar,
    .tree-container {
      pointer-events: none;
    }
    
    .sidebar-collapse {
      right: -12px;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
  }
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

  // 当侧边栏收起时，主内容区域占据全宽
  &.expanded {
    margin-left: -280px;
  }
}

.sidebar-collapse {
  position: absolute;
  top: 50%;
  right: -12px;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 34px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  transform: translateY(-50%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  
  &:hover {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-50%) scale(1.05);
    
    .el-icon {
      color: var(--el-text-color-primary);
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  .el-icon {
    color: var(--el-text-color-regular);
    font-size: 14px;
    transition: all 0.2s ease;
    
    &.rotated {
      transform: rotate(180deg);
    }
  }
}

// 鼠标悬停时显示按钮
.sidebar:hover .sidebar-collapse {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
</style>
