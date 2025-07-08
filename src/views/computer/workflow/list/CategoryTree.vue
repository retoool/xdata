<template>
  <div class="custom-tree-container">
    <div class="tree-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchText"
          placeholder="搜索分类..."
          clearable
          class="search-input"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="toolbar-right">
        <el-tooltip :content="batchSelectMode ? '退出批量选择' : '批量选择'" placement="top">
          <el-button 
            :type="batchSelectMode ? 'warning' : 'info'" 
            @click="toggleBatchSelect" 
            class="toolbar-btn"
            :icon="batchSelectMode ? Close : Select"
          />
        </el-tooltip>
        <el-tooltip v-if="!batchSelectMode" content="新增根节点" placement="top">
          <el-button type="primary" @click="addRootNode" class="toolbar-btn" :icon="Plus" />
        </el-tooltip>
        <el-tooltip v-if="batchSelectMode" content="批量删除" placement="top">
          <el-button 
            type="danger" 
            @click="batchDelete" 
            :disabled="checkedKeys.length === 0" 
            class="toolbar-btn" 
            :icon="Delete" 
          />
        </el-tooltip>
      </div>
    </div>
    
    <div class="tree-scroll-area" @contextmenu="handleTreeAreaContextMenu">
      <el-tree
        :data="dataSource"
        :show-checkbox="batchSelectMode"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"
        :render-content="renderContent"
        ref="treeRef"
        @check="handleCheck"
        @node-click="handleNodeClick"
        draggable
        :allow-drop="allowDrop"
        @node-drop="handleDrop"
        :filter-node-method="filterNode"
        highlight-current
        :current-node-key="currentKey"
        class="custom-tree"
      />
      
      <!-- 空状态 -->
      <div v-if="dataSource.length === 0" class="empty-state">
        <el-icon class="empty-icon"><FolderOpened /></el-icon>
        <p class="empty-text">暂无分类数据</p>
        <el-button type="primary" @click="addRootNode" :icon="Plus">新增根节点</el-button>
      </div>
    </div>
    
    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      :style="{ position: 'fixed', left: contextMenu.x + 'px', top: contextMenu.y + 'px', zIndex: 9999 }"
      class="context-menu"
      @mousedown.stop
    >
      <div class="context-menu-item" @click="handleContextAdd">
        <el-icon><Plus /></el-icon>
        {{ contextMenu.data ? '新增子节点' : '新增根节点' }}
      </div>
      <div v-if="contextMenu.data" class="context-menu-item" @click="handleContextRename">
        <el-icon><Edit /></el-icon>
        重命名
      </div>
      <div v-if="contextMenu.data" class="context-menu-item danger" @click="handleContextDelete">
        <el-icon><Delete /></el-icon>
        删除
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElButton, ElTree, ElMessageBox, ElMessage, ElInput, ElTooltip, ElIcon } from 'element-plus'
import { Plus, Delete, Close, Search, Edit, FolderOpened, Select } from '@element-plus/icons-vue'
import type { RenderContentContext, RenderContentFunction } from 'element-plus'
import {
  getCategoryTree,
  addCategoryNode,
  updateCategoryNode as editCategoryNode,
  deleteCategoryNode,
  batchDeleteCategoryNodes,
  moveCategoryNode
} from '@/api/workflowCategory';

interface Tree {
  id: number
  label: string
  children?: Tree[]
}
type Node = RenderContentContext['node']
type Data = RenderContentContext['data']

let id = 1000
const treeRef = ref<InstanceType<typeof ElTree>>();
const batchSelectMode = ref(false);
const checkedKeys = ref<number[]>([]);
const searchText = ref('');
const currentKey = ref<number | string | null>(null);

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  node: null as null | Node,
  data: null as null | Data,
});

const dataSource = ref<Tree[]>([]);

const emit = defineEmits<{
  'node-select': [{ ids: number[], node: any }];
}>();

// 辅助函数：查找第一个叶子节点
type TreeNode = Tree & { children?: TreeNode[] }
function findFirstLeafNode(nodes: TreeNode[]): TreeNode | null {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) {
      return node;
    } else {
      const found = findFirstLeafNode(node.children);
      if (found) return found;
    }
  }
  return null;
}

// 递归获取某节点及其所有子节点id
function getAllNodeIds(node: TreeNode): number[] {
  let ids = [node.id];
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      ids = ids.concat(getAllNodeIds(child));
    }
  }
  return ids;
}

// 递归获取某节点下所有叶子节点id
function getAllLeafNodeIds(node: TreeNode): number[] {
  let ids: number[] = [];
  if (!node.children || node.children.length === 0) {
    ids.push(node.id);
  } else {
    for (const child of node.children) {
      ids = ids.concat(getAllLeafNodeIds(child));
    }
  }
  return ids;
}

const selectFirstLeafAndEmit = () => {
  nextTick(() => {
    const firstLeaf = findFirstLeafNode(dataSource.value as TreeNode[]);
    if (firstLeaf) {
      treeRef.value?.setCurrentKey(firstLeaf.id);
      const ids = [firstLeaf.id];
      emit('node-select', { ids, node: firstLeaf });
    }
  });
};

const loadTree = async () => {
  try {
    const { data } = await getCategoryTree();
    dataSource.value = data;
    currentKey.value = undefined;
    treeRef.value?.setCurrentKey(null);
    checkedKeys.value = [];
    treeRef.value?.setCheckedKeys([]);
  } catch (error) {
    ElMessage.error('获取分类树失败');
  }
};

const append = async (data: Data) => {
  if (!data) return;
  const id = data.id;
  const { value } = await ElMessageBox.prompt('请输入节点名称', '新增子节点', {
    inputValue: '',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });
  if (value && value.trim()) {
    try {
      await addCategoryNode({ 
        parentId: id, 
        label: value.trim()
      });
      loadTree();
    } catch (error) {
      ElMessage.error('新增失败');
    }
  } else if (value !== undefined) {
    ElMessage.error('节点名称不能为空');
  }
};

const addRootNode = async () => {
  const { value } = await ElMessageBox.prompt('请输入节点名称', '新增根节点', {
    inputValue: '',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });
  if (value) {
    try {
      await addCategoryNode({ 
        label: value
      });
      loadTree();
    } catch (error) {
      ElMessage.error('新增失败');
    }
  }
};

const remove = (node: Node, data: Data) => {
  const parent = node.parent
  const children: Tree[] = parent.data.children || parent.data
  const index = children.findIndex((d) => d.id === data.id)
  children.splice(index, 1)
  dataSource.value = [...dataSource.value]
}

const batchDelete = async () => {
  if (!treeRef.value) return;
  const keys = checkedKeys.value;
  
  if (keys.length === 0) {
    ElMessage.warning('请选择要删除的分类');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${keys.length} 个分类吗？这些分类下的所有子分类也会被删除。`,
      '确认批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await batchDeleteCategoryNodes(keys);
    ElMessage.success('批量删除成功');
    checkedKeys.value = [];
    treeRef.value.setCheckedKeys([]);
    loadTree();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败，请重试');
    }
  }
}

const toggleBatchSelect = () => {
  batchSelectMode.value = !batchSelectMode.value;
  if (!batchSelectMode.value) {
    checkedKeys.value = [];
    treeRef.value?.setCheckedKeys([]);
  }
}

const handleCheck = (_: any, checked: any) => {
  checkedKeys.value = checked.checkedKeys;
}

const showContextMenu = (event: MouseEvent, node: Node, data: Data) => {
  event.preventDefault();
  contextMenu.value.visible = true;
  contextMenu.value.x = event.clientX;
  contextMenu.value.y = event.clientY;
  contextMenu.value.node = node;
  contextMenu.value.data = data;
  document.body.style.userSelect = 'none';
};

const hideContextMenu = () => {
  contextMenu.value.visible = false;
  contextMenu.value.node = null;
  contextMenu.value.data = null;
  document.body.style.userSelect = '';
};

const handleContextAdd = () => {
  if (contextMenu.value.data) {
    const data = contextMenu.value.data;
    hideContextMenu();
    append(data);
  } else {
    hideContextMenu();
    addRootNode();
  }
};

// 递归获取节点及其所有子节点的id
function getAllChildNodeIds(node: TreeNode): number[] {
  let ids = [node.id];
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      ids = ids.concat(getAllChildNodeIds(child));
    }
  }
  return ids;
}

const handleContextDelete = async () => {
  if (contextMenu.value.data) {
    const data = contextMenu.value.data;
    const id = data.id;
    hideContextMenu();
    
    try {
      await ElMessageBox.confirm(
        `确定要删除分类"${data.label}"吗？该分类下的所有子分类也会被删除。`,
        '确认删除',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      
      await deleteCategoryNode(id);
      ElMessage.success('删除成功');
      loadTree();
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败，请重试');
      }
    }
  }
};

const handleContextRename = async () => {
  if (contextMenu.value.data) {
    const id = contextMenu.value.data.id;
    const oldLabel = contextMenu.value.data.label;
    hideContextMenu();
    const { value } = await ElMessageBox.prompt('请输入新名称', '重命名', {
      inputValue: oldLabel,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });
    if (value) {
      try {
        await editCategoryNode({ id, label: value });
        loadTree();
      } catch (error) {
        ElMessage.error('重命名失败');
      }
    }
  }
};

const handleClickOutside = (e: MouseEvent) => {
  if (contextMenu.value.visible) {
    hideContextMenu();
  }
};

onMounted(() => {
  loadTree();
  window.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleClickOutside);
});

const renderContent: RenderContentFunction = (h, { node, data }) => {
  return h(
    'div',
    {
      class: 'custom-tree-node',
      onContextmenu: (event: MouseEvent) => showContextMenu(event, node, data),
      style: {
        width: '100%',
        minHeight: '32px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer'
      }
    },
    [
      h('span', {
        style: {
          flex: '1',
          minWidth: '0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, node.label),
    ]
  )
}

const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  return true;
}

function findAndRemoveNode(nodes: Tree[], id: number): [Tree | null, Tree[]] {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      const node = nodes.splice(i, 1)[0];
      return [node, nodes];
    }
    if (nodes[i].children) {
      const [found, children] = findAndRemoveNode(nodes[i].children!, id);
      if (found) return [found, nodes];
    }
  }
  return [null, nodes];
}

const handleDrop = async (draggingNode: any, dropNode: any, dropType: 'before' | 'after' | 'inner', ev: DragEvent) => {
  try {
    await moveCategoryNode({
      id: draggingNode.data.id,
      targetId: dropNode.data.id,
      position: dropType
    });
    loadTree();
  } catch (error) {
    ElMessage.error('移动失败');
  }
}

const handleSearch = () => {
  treeRef.value?.filter(searchText.value);
};

const handleNodeClick = (data: Tree) => {
  const nodeObj = treeRef.value?.getNode(data.id);
  const fullNode = nodeObj ? nodeObj.data : data;
  currentKey.value = fullNode.id;
  const ids = getAllChildNodeIds(fullNode as TreeNode);
  emit('node-select', { ids, node: fullNode });
};

const selectNodeByPath = (path: string[]) => {
  if (!path || path.length === 0) return;
  
  const findNodeByPath = (nodes: Tree[], targetPath: string[], currentIndex: number): Tree | null => {
    if (currentIndex >= targetPath.length) return null;
    
    const targetLabel = targetPath[currentIndex];
    for (const node of nodes) {
      if (node.label === targetLabel) {
        if (currentIndex === targetPath.length - 1) {
          return node;
        } else if (node.children) {
          const found = findNodeByPath(node.children, targetPath, currentIndex + 1);
          if (found) return found;
        }
      }
    }
    return null;
  };
  
  const targetNode = findNodeByPath(dataSource.value, path, 0);
  if (targetNode) {
    handleNodeClick(targetNode);
  }
};

const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.label.toLowerCase().includes(value.toLowerCase());
};

function removeNodeById(nodes: Tree[], id: number): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1);
      return true;
    }
    if (nodes[i].children && removeNodeById(nodes[i].children!, id)) {
      return true;
    }
  }
  return false;
}

defineExpose({
  clearCurrentKey: () => { currentKey.value = undefined; },
  selectNodeByPath,
  getDataSource: () => dataSource.value
})

const handleTreeAreaContextMenu = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.closest('.el-tree-node')) {
    return;
  }
  
  event.preventDefault();
  contextMenu.value.visible = true;
  contextMenu.value.x = event.clientX;
  contextMenu.value.y = event.clientY;
  contextMenu.value.node = null;
  contextMenu.value.data = null;
  document.body.style.userSelect = 'none';
};
</script>

<style scoped>
.custom-tree-container {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 16px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-light);
  box-sizing: border-box;
  overflow: hidden;
}
html.dark .custom-tree-container {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  border-color: var(--pure-border-color);
}

.tree-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  border: 1px solid var(--el-border-color-light);
  flex-shrink: 0;
}
html.dark .tree-toolbar {
  background: var(--el-bg-color-page);
  border-color: var(--pure-border-color);
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.search-input {
  width: 180px;
  min-width: 120px;
}
.search-input :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color);
  transition: border-color 0.3s, box-shadow 0.3s;
  height: 32px;
  background: var(--el-bg-color);
}
.search-input :deep(.el-input__wrapper:hover) {
  border-color: var(--el-color-primary);
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.15);
}
.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.toolbar-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: box-shadow 0.3s, transform 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  padding: 0;
}
.toolbar-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
html.dark .toolbar-btn {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
html.dark .toolbar-btn:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tree-scroll-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);
  position: relative;
}
html.dark .tree-scroll-area {
  border-color: var(--pure-border-color);
}
.tree-scroll-area::-webkit-scrollbar {
  width: 4px;
}
.tree-scroll-area::-webkit-scrollbar-track {
  background: var(--el-fill-color-light);
  border-radius: 2px;
}
html.dark .tree-scroll-area::-webkit-scrollbar-track {
  background: var(--el-bg-color-page);
}
.tree-scroll-area::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 2px;
}
.tree-scroll-area::-webkit-scrollbar-thumb:hover {
  background: var(--el-text-color-placeholder);
}

.custom-tree {
  padding: 12px;
}
.custom-tree :deep(.el-tree-node) {
  margin-bottom: 2px;
}
.custom-tree :deep(.el-tree-node__content) {
  height: 32px;
  border-radius: 4px;
  margin: 1px 0;
  cursor: pointer;
  user-select: none;
  background: transparent;
  transition: color 0.3s, box-shadow 0.3s;
}
.custom-tree :deep(.el-tree-node__content:hover) {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
}
html.dark .custom-tree :deep(.el-tree-node__content:hover) {
  background: var(--el-fill-color-dark);
}
.custom-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  transition: none;
}
html.dark .custom-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}
.custom-tree :deep(.el-tree-node.is-current > .el-tree-node__content:hover) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
  color: white !important;
}
.custom-tree :deep(.el-tree-node__expand-icon) {
  color: var(--el-text-color-regular);
  transition: color 0.3s;
  font-size: 12px;
}
.custom-tree :deep(.el-tree-node__expand-icon:hover) {
  color: var(--el-color-primary);
  transform: scale(1.1);
}
.custom-tree :deep(.el-tree-node__label) {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 13px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 4px;
  width: 100%;
  min-height: 32px;
  cursor: pointer;
  user-select: none;
  position: relative;
  color: var(--el-text-color-primary);
}
.custom-tree-node:hover {
  background: var(--el-color-primary-light-9);
}
html.dark .custom-tree-node:hover {
  background: var(--el-color-primary-dark-2);
}
.custom-tree-node:hover::after {
  content: '';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: var(--el-text-color-placeholder);
  border-radius: 50%;
  opacity: 0.6;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
  color: var(--el-text-color-regular);
  text-align: center;
  padding: 20px;
}
.empty-icon {
  font-size: 32px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 12px;
}
.empty-text {
  font-size: 14px;
  margin-bottom: 16px;
  color: var(--el-text-color-regular);
}
.context-menu {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 140px;
  padding: 4px 0;
  backdrop-filter: blur(10px);
  z-index: 9999;
}
html.dark .context-menu {
  border-color: var(--pure-border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}
.context-menu-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-primary);
}
.context-menu-item:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
html.dark .context-menu-item:hover {
  background: var(--el-color-primary) !important;
  color: #fff !important;
}
.context-menu-item.danger:hover {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}
html.dark .context-menu-item.danger:hover {
  background: var(--el-color-danger-dark-2);
}
.context-menu-item .el-icon {
  font-size: 14px;
}
@media (max-width: 768px) {
  .custom-tree-container {
    padding: 12px;
  }
  .search-input {
    width: 140px;
  }
  .toolbar-btn {
    width: 28px;
    height: 28px;
  }
  .tree-toolbar {
    padding: 8px;
    gap: 8px;
  }
}
</style> 