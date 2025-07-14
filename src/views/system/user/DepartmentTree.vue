<template>
  <div class="custom-tree-container">
    <div class="tree-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchText"
          placeholder="搜索部门..."
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
        <el-tooltip v-if="!batchSelectMode" content="新增根部门" placement="top">
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
        <p class="empty-text">暂无部门数据</p>
        <el-button type="primary" @click="addRootNode" :icon="Plus">新增根部门</el-button>
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
        {{ contextMenu.data ? '新增子部门' : '新增根部门' }}
      </div>
      <div v-if="contextMenu.data && contextMenu.data.id !== 1" class="context-menu-item" @click="handleContextRename">
        <el-icon><Edit /></el-icon>
        重命名
      </div>
      <div v-if="contextMenu.data && contextMenu.data.id !== 1" class="context-menu-item danger" @click="handleContextDelete">
        <el-icon><Delete /></el-icon>
        删除
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch, h } from 'vue'
import { ElButton, ElTree, ElMessageBox, ElMessage, ElInput, ElTooltip, ElIcon } from 'element-plus'
import { Plus, Delete, Close, Search, Edit, FolderOpened, Select, OfficeBuilding } from '@element-plus/icons-vue'
import type { RenderContentContext, RenderContentFunction } from 'element-plus'
import type { Department } from '@/types/system'
import { getDepartmentTree, createDepartment, updateDepartment, deleteDepartment, batchDeleteDepartments } from '@/api/system/department'

interface Tree {
  id: number
  name: string
  children?: Tree[]
  userCount?: number
  parentId?: number | null
  sort?: number
  status?: number
}
type Node = RenderContentContext['node']
type Data = RenderContentContext['data']

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
  'node-create': [department: Department];
  'node-update': [department: Department];
  'node-delete': [departmentId: number];
  'batch-delete': [departmentIds: number[]];
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
function getAllChildNodeIds(node: TreeNode): number[] {
  let ids: number[] = [];
  if (!node.children || node.children.length === 0) {
    ids.push(node.id);
  } else {
    for (const child of node.children) {
      ids = ids.concat(getAllChildNodeIds(child));
    }
  }
  return ids;
}

const selectSystemDepartmentAndEmit = () => {
  nextTick(() => {
    // 选择系统部门作为默认部门
    const systemDept = dataSource.value.find(dept => dept.id === 1);
    if (systemDept) {
      treeRef.value?.setCurrentKey(systemDept.id);
      const ids = [systemDept.id];
      emit('node-select', { ids, node: systemDept });
    }
  });
};

const loadTree = async () => {
  try {
    const data = await getDepartmentTree() as any;
    // 将后端返回的数据转换为前端期望的格式
    const transformData = (res: any[]): Tree[] => {
      return res.map(dept => ({
        id: dept.id,
        name: dept.name, // 将 name 映射为 label
        userCount: dept.userCount,
        parentId: dept.parentId,
        sort: dept.sort,
        status: dept.status,
        children: dept.children ? transformData(dept.children) : undefined
      }));
    };
    
    dataSource.value = transformData(data);
    currentKey.value = undefined;
    treeRef.value?.setCurrentKey(null);
    checkedKeys.value = [];
    treeRef.value?.setCheckedKeys([]);
  } catch (error) {
    console.error('获取部门树失败:', error);
    ElMessage.error('获取部门树失败');
  }
};

const append = async (data: Data) => {
  if (!data) return;
  const id = data.id;
  const { value } = await ElMessageBox.prompt('请输入部门名称', '新增子部门', {
    inputValue: '',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });
  if (value && value.trim()) {
    try {
      await createDepartment({ 
        name: value.trim(),
        parentId: id,
        sort: 0,
        status: 1
      });
      ElMessage.success('新增成功');
      loadTree();
    } catch (error) {
      ElMessage.error('新增失败');
    }
  } else if (value !== undefined) {
    ElMessage.error('部门名称不能为空');
  }
};

const addRootNode = async () => {
  const { value } = await ElMessageBox.prompt('请输入部门名称', '新增根部门', {
    inputValue: '',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });
  if (value && value.trim()) {
    try {
      await createDepartment({ 
        name: value.trim(),
        parentId: null,
        sort: 0,
        status: 1
      });
      ElMessage.success('新增成功');
      loadTree();
    } catch (error) {
      ElMessage.error('新增失败');
    }
  } else if (value !== undefined) {
    ElMessage.error('部门名称不能为空');
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
    ElMessage.warning('请选择要删除的部门');
    return;
  }
  
  try {
    const confirmResult = await ElMessageBox.confirm(
      `确定要删除选中的 ${keys.length} 个部门吗？删除后将无法恢复。`,
      '确认批量删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    if (confirmResult !== 'confirm') {
      return;
    }
    
    await batchDeleteDepartments(keys);
    ElMessage.success('批量删除成功');
    checkedKeys.value = [];
    treeRef.value.setCheckedKeys([]);
    loadTree();
  } catch (error) {
    console.error('批量删除部门时出错:', error);
    ElMessage.error('批量删除失败，请重试');
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

// 处理树节点右键菜单
const handleNodeContextMenu = (event: MouseEvent, node: Node, data: Data) => {
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

const handleTreeAreaContextMenu = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    showContextMenu(event, null as any, null as any);
  }
};

const handleContextAdd = () => {
  const data = contextMenu.value.data;
  if (data) {
    append(data);
  } else {
    addRootNode();
  }
  hideContextMenu();
};

const handleContextRename = async () => {
  const data = contextMenu.value.data;
  if (!data) return;
  
  const { value } = await ElMessageBox.prompt('请输入新的部门名称', '重命名', {
    inputValue: data.name,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  });
  
  if (value && value.trim() && value !== data.name) {
    try {
      await updateDepartment(
        data.id,
        {
          name: value.trim(),
          parentId: data.parentId,
          sort: data.sort || 0,
          status: data.status || 1
        }
      );
      ElMessage.success('重命名成功');
      loadTree();
    } catch (error) {
      ElMessage.error('重命名失败');
    }
  }
  hideContextMenu();
};

const handleContextDelete = async () => {
  const data = contextMenu.value.data;
  if (!data) return;
  
  try {
    await ElMessageBox.confirm(
      '确认删除该部门吗？删除后该部门下的子部门和用户将一并删除！',
      '警告',
      { type: 'warning' }
    );
    
    await deleteDepartment(data.id);
    ElMessage.success('删除成功');
    loadTree();
  } catch {
    // 用户取消
  }
  hideContextMenu();
};

const handleNodeClick = (data: Data) => {
  const ids = [data.id];
  emit('node-select', { ids, node: data });
};

const handleSearch = () => {
  treeRef.value?.filter(searchText.value);
};

const filterNode = (value: string, data: Data) => {
  if (!value) return true;
  return data.name.includes(value);
};

// 修正 renderContent 参数类型
const renderContent = (h: any, { data, node }: { data: any; node: any }) => {
  const isSystemDepartment = data.id === 1;
  return h('div', { 
    class: 'custom-tree-node',
    onContextmenu: (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      handleNodeContextMenu(event, node, data);
    }
  }, [
    h(ElIcon, { class: 'node-icon' }, () => h(OfficeBuilding)),
    h('span', { class: 'node-label' }, data.name),
    h('span', { class: 'node-count' }, `(${data.userCount || 0})`)
  ]);
};

const allowDrop = (draggingNode: Node, dropNode: Node, type: string) => {
  return true;
};

const handleDrop = async (draggingNode: Node, dropNode: Node, dropType: string) => {
  // 处理拖拽逻辑
  console.log('拖拽:', draggingNode.data, dropNode.data, dropType);
};

// 监听搜索文本变化
watch(searchText, (val) => {
  treeRef.value?.filter(val);
});

// 监听外部传入的当前部门类型变化
const props = defineProps<{
  currentDepartmentId?: number;
}>();

// 监听props变化
watch(() => props.currentDepartmentId, (newVal) => {
  if (newVal && dataSource.value.length > 0) {
    treeRef.value?.setCurrentKey(newVal);
  }
}, { immediate: true });

// 暴露方法
defineExpose({
  loadTree,
  selectSystemDepartmentAndEmit,
  refreshTree: loadTree,
  setCurrentKey: (key: number | string | null) => {
    currentKey.value = key;
    treeRef.value?.setCurrentKey(key);
  }
});

// 生命周期
onMounted(() => {
  loadTree();
  document.addEventListener('click', hideContextMenu);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', hideContextMenu);
});
</script>

<style scoped lang="scss">
.custom-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border-radius: 8px;
  overflow: hidden;
  
  .tree-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    background: var(--el-bg-color-page);
    
    .toolbar-left {
      flex: 1;
      margin-right: 12px;
      
      .search-input {
        width: 100%;
        max-width: 200px;
      }
    }
    
    .toolbar-right {
      display: flex;
      gap: 8px;
      
      .toolbar-btn {
        padding: 6px 8px;
        min-width: 32px;
        height: 32px;
      }
    }
  }
  
  .tree-scroll-area {
    flex: 1;
    overflow: auto;
    padding: 8px;
    position: relative;
    
    .custom-tree {
      .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 4px 0;
        
        .node-icon {
          margin-right: 8px;
          color: var(--el-text-color-regular);
          font-size: 16px;
        }
        
        .node-label {
          flex: 1;
          color: var(--el-text-color-primary);
          font-size: 14px;
        }
        
        .node-count {
          color: var(--el-text-color-secondary);
          font-size: 12px;
          margin-left: 4px;
        }

        .system-badge {
          background-color: var(--el-color-info-light-9);
          color: var(--el-color-info);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          margin-left: 8px;
          font-weight: bold;
        }
      }
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      
      .empty-icon {
        font-size: 48px;
        color: var(--el-text-color-placeholder);
        margin-bottom: 16px;
      }
      
      .empty-text {
        color: var(--el-text-color-secondary);
        font-size: 14px;
        margin-bottom: 16px;
      }
    }
  }
  
  .context-menu {
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px 0;
    min-width: 120px;
    
    .context-menu-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      color: var(--el-text-color-primary);
      transition: background-color 0.2s;
      
      &:hover {
        background: var(--el-color-primary-light-9);
      }
      
      &.danger {
        color: var(--el-color-danger);
        
        &:hover {
          background: var(--el-color-danger-light-9);
        }
      }
      
      .el-icon {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }
}
</style> 