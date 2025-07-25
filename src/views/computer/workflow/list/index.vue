<template>
  <div class="workflow-page">
    <div class="category-tree" :class="{ collapsed: isTreeCollapsed }">
      <CategoryTree ref="categoryTreeRef" @node-select="handleNodeSelect" />
    </div>
    <div class="content-area" :class="{ expanded: isTreeCollapsed }">
      <WorkflowTable
        ref="workflowTableRef"
        :selected-category-id="selectedCategoryIds"
        :selected-category-path="selectedCategoryPath"
        @category-click="handleCategoryClick"
      />
    </div>
    <div class="collapse-button" @click="toggleTreeCollapse">
      <el-icon :class="{ rotated: isTreeCollapsed }">
        <ArrowLeft />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ArrowLeft } from "@element-plus/icons-vue";
import CategoryTree from "./CategoryTree.vue";
import WorkflowTable from "./WorkflowTable.vue";
import { useWorkflowStoreHook } from "@/store/modules/workflow";

const workflowStore = useWorkflowStoreHook();
const workflowTableRef = ref();
const categoryTreeRef = ref();
const selectedCategoryIds = ref<number[] | null>(null);
const selectedCategoryPath = ref<string[] | null>(null);
const isTreeCollapsed = ref(false);

const handleNodeSelect = (payload: { ids: number[]; node: any }) => {
  selectedCategoryIds.value = payload.ids;
  // 获取分类树数据源
  dataSource.value = categoryTreeRef.value?.getDataSource() || [];
  // 构建分类路径
  selectedCategoryPath.value = buildCategoryPath(payload.node);

  // 保存到状态管理
  workflowStore.setSelectedCategory(payload.ids, selectedCategoryPath.value);
  // 通过 props 更新，不需要手动调用 setCategoryId
};

// 构建分类路径
const buildCategoryPath = (node: any): string[] => {
  if (!node) return [];

  const path: string[] = [];
  let currentNode = node;

  // 从当前节点向上遍历到根节点
  while (currentNode) {
    path.unshift(currentNode.label);
    // 查找父节点
    currentNode = findParentNode(dataSource.value, currentNode.id);
  }

  return path;
};

// 查找父节点
const findParentNode = (nodes: any[], targetId: number): any => {
  for (const node of nodes) {
    if (node.children) {
      for (const child of node.children) {
        if (child.id === targetId) {
          return node;
        }
      }
      const found = findParentNode(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
};

// 分类树数据源
const dataSource = ref<any[]>([]);

const handleCategoryClick = (payload: { path: string[]; index: number }) => {
  // 根据分类路径查找对应的分类节点并选中
  categoryTreeRef.value?.selectNodeByPath(payload.path);
};

// 切换分类树收起/展开状态
const toggleTreeCollapse = () => {
  isTreeCollapsed.value = !isTreeCollapsed.value;
  // 保存到状态管理
  workflowStore.setTreeCollapsed(isTreeCollapsed.value);
};

// 恢复状态
const restoreState = () => {
  // 恢复分类树折叠状态
  isTreeCollapsed.value = workflowStore.getIsTreeCollapsed;

  // 恢复选中的分类
  const storedCategoryId = workflowStore.getSelectedCategoryId;
  const storedCategoryPath = workflowStore.getSelectedCategoryPath;

  if (storedCategoryId && storedCategoryPath) {
    selectedCategoryIds.value = Array.isArray(storedCategoryId)
      ? storedCategoryId
      : [storedCategoryId];
    selectedCategoryPath.value = storedCategoryPath;

    // 通知分类树恢复选中状态
    setTimeout(() => {
      if (categoryTreeRef.value?.selectNodeByPath) {
        categoryTreeRef.value.selectNodeByPath(storedCategoryPath);
      }
    }, 100);
  }
};

// 组件挂载时恢复状态
onMounted(() => {
  restoreState();
});
</script>

<style scoped>
.workflow-page {
  display: flex;
  height: calc(100% - 24px);
  position: relative;
}

.category-tree {
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

.category-tree.collapsed {
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
  background: linear-gradient(
    to right,
    var(--el-border-color-lighter) 0%,
    var(--el-bg-color) 70%
  );
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

.category-tree.collapsed ~ .collapse-button {
  left: 1px;
  border-left: 1px solid var(--el-border-color-lighter);
  border-radius: 0 8px 8px 0;
}
</style>
