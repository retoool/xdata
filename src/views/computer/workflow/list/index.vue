<template>
  <div class="workflow-page">
    <div class="category-tree" :class="{ 'collapsed': isTreeCollapsed }">
      <CategoryTree 
        ref="categoryTreeRef"
        @node-select="handleNodeSelect"
      />
    </div>
    <div class="content-area" :class="{ 'expanded': isTreeCollapsed }">
      <WorkflowTable 
        ref="workflowTableRef"
        :selected-category-id="selectedCategoryIds"
        :selected-category-path="selectedCategoryPath"
        @category-click="handleCategoryClick"
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
import { ref } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import CategoryTree from "./CategoryTree.vue";
import WorkflowTable from "./WorkflowTable.vue";

const workflowTableRef = ref()
const categoryTreeRef = ref()
const selectedCategoryIds = ref<number[] | null>(null)
const selectedCategoryPath = ref<string[] | null>(null)
const isTreeCollapsed = ref(false)

const handleNodeSelect = (payload: { ids: number[], node: any }) => {
  selectedCategoryIds.value = payload.ids
  // 获取分类树数据源
  dataSource.value = categoryTreeRef.value?.getDataSource() || []
  // 构建分类路径
  selectedCategoryPath.value = buildCategoryPath(payload.node)
  // 通过 props 更新，不需要手动调用 setCategoryId
}

// 构建分类路径
const buildCategoryPath = (node: any): string[] => {
  if (!node) return []
  
  const path: string[] = []
  let currentNode = node
  
  // 从当前节点向上遍历到根节点
  while (currentNode) {
    path.unshift(currentNode.label)
    // 查找父节点
    currentNode = findParentNode(dataSource.value, currentNode.id)
  }
  
  return path
}

// 查找父节点
const findParentNode = (nodes: any[], targetId: number): any => {
  for (const node of nodes) {
    if (node.children) {
      for (const child of node.children) {
        if (child.id === targetId) {
          return node
        }
      }
      const found = findParentNode(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

// 分类树数据源
const dataSource = ref<any[]>([])

const handleCategoryClick = (payload: { path: string[], index: number }) => {
  // 根据分类路径查找对应的分类节点并选中
  categoryTreeRef.value?.selectNodeByPath(payload.path);
}

// 切换分类树收起/展开状态
const toggleTreeCollapse = () => {
  isTreeCollapsed.value = !isTreeCollapsed.value;
}
</script>

<style scoped>
.workflow-page {
  display: flex;
  height: 100%;
  position: relative;
}

.category-tree {
  width: 320px;
  min-width: 0;
  max-width: 420px;
  margin-right: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.5s ease;
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
  transition: all 0.3s ease;
}

.content-area.expanded {
  margin-left: 0;
}

/* 最简单的展开收起按钮 */
.collapse-button {
  position: absolute;
  left: 320px;
  top: 40%;
  transform: translateY(-50%);
  width: 28px;
  height: 64px;
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
  border-radius: 0 12px 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.18);
  border: none;
  outline: none;
}
.collapse-button:hover {
  background: linear-gradient(135deg, var(--el-color-primary-dark-2) 0%, var(--el-color-primary) 100%);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.28);
}
.collapse-button .el-icon {
  color: #fff;
  font-size: 16px;
  transition: transform 0.3s ease;
}
.collapse-button .el-icon.rotated {
  transform: rotate(180deg);
}
.category-tree.collapsed ~ .collapse-button {
  left: 0;
  /* 当侧边栏收起时，按钮位置调整 */
  transform: translateY(-50%);
}
</style> 