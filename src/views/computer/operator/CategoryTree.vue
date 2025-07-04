<template>
  <div class="custom-tree-container">
    <!-- 类型切换按钮 -->
    <div class="type-switcher">
      <el-radio-group v-model="selectedOperatorType" @change="handleTypeChange">
        <el-radio-button value="basic" @click="handleRadioClick(OperatorType.BASIC)">基础算子</el-radio-button>
        <el-radio-button value="script" @click="handleRadioClick(OperatorType.SCRIPT)">脚本算子</el-radio-button>
        <el-radio-button value="external" @click="handleRadioClick(OperatorType.EXTERNAL)">外部算子</el-radio-button>
      </el-radio-group>
    </div>
    
    <div class="tree-toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchText"
          placeholder="请输入关键字搜索"
          clearable
          style="width: 180px;padding: 0;margin-left: 0px;"
          @input="handleSearch"
        />
      </div>
      <div class="toolbar-right">
        <el-tooltip :content="batchSelectMode ? '取消勾选' : '批量勾选'" placement="top">
          <el-button type="info" @click="toggleBatchSelect" style="width: 32px; height: 32px; padding: 0;margin-left: 0px;">
            <el-icon v-if="!batchSelectMode">
              <svg viewBox="0 0 1024 1024" width="24" height="24">
                <path d="M861.866667 832H311.466667c-64 0-119.466667-51.2-119.466667-119.466667V162.133333C192 93.866667 243.2 42.666667 311.466667 42.666667h550.4C930.133333 42.666667 981.333333 93.866667 981.333333 162.133333v550.4c0 68.266667-51.2 119.466667-119.466666 119.466667zM311.466667 128c-17.066667 0-34.133333 17.066667-34.133334 34.133333v550.4c0 17.066667 17.066667 34.133333 34.133334 34.133334h550.4c17.066667 0 34.133333-17.066667 34.133333-34.133334V162.133333c0-17.066667-17.066667-34.133333-34.133333-34.133333H311.466667z" fill="#ffffff"></path>
                <path d="M512 981.333333H145.066667C89.6 981.333333 42.666667 934.4 42.666667 878.933333V512c0-25.6 17.066667-42.666667 42.666666-42.666667s42.666667 17.066667 42.666667 42.666667v366.933333c0 8.533333 8.533333 17.066667 17.066667 17.066667H512c25.6 0 42.666667 17.066667 42.666667 42.666667s-17.066667 42.666666-42.666667 42.666666zM537.6 580.266667c-12.8 0-21.333333-4.266667-29.866667-12.8L405.333333 469.333333c-17.066667-17.066667-17.066667-42.666667 0-59.733333s42.666667-17.066667 59.733334 0l68.266666 68.266667 170.666667-170.666667c17.066667-17.066667 42.666667-17.066667 59.733333 0s17.066667 42.666667 0 59.733333l-200.533333 200.533334c-4.266667 8.533333-17.066667 12.8-25.6 12.8z" fill="#ffffff"></path>
              </svg>
            </el-icon>
            <el-icon v-else>
              <svg viewBox="0 0 1024 1024" width="24" height="24">
                <path d="M860.591104 70.452224 512.002048 419.044352 163.408896 70.452224c-25.668608-25.668608-67.288064-25.668608-92.957696 0-25.667584 25.667584-25.667584 67.284992 0 92.957696l348.594176 348.592128L70.4512 860.59008c-25.667584 25.668608-25.667584 67.290112 0 92.956672 25.669632 25.669632 67.289088 25.669632 92.957696 0l348.593152-348.587008 348.589056 348.587008c25.667584 25.669632 67.289088 25.669632 92.956672 0 25.668608-25.66656 25.668608-67.288064 0-92.956672L604.959744 512.002048 953.547776 163.40992c25.668608-25.669632 25.668608-67.290112 0-92.957696C927.880192 44.782592 886.263808 44.782592 860.591104 70.452224L860.591104 70.452224zM860.591104 70.452224" fill="#ffffff"></path>
              </svg>
            </el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="!batchSelectMode" content="新增根节点" placement="top">
          <el-button type="primary" @click="addRootNode" style="width: 32px; height: 32px; padding: 0;margin-left: 0px;">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip v-if="batchSelectMode" content="批量删除" placement="top">
          <el-button type="danger" @click="batchDelete" :disabled="checkedKeys.length === 0" style="width: 32px; height: 32px; padding: 0;margin-left: 0px;">
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <div class="tree-scroll-area">
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
      />
    </div>
    <div
      v-if="contextMenu.visible"
      :style="{ position: 'fixed', left: contextMenu.x + 'px', top: contextMenu.y + 'px', zIndex: 9999, minWidth: '140px' }"
      class="context-menu"
      @mousedown.stop
    >
      <div class="context-menu-item" @click="handleContextAdd">新增子节点</div>
      <div class="context-menu-item" @click="handleContextRename">重命名</div>
      <div class="context-menu-item" @click="handleContextDelete">删除</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElButton, ElTree, ElMessageBox, ElMessage, ElInput, ElTooltip, ElIcon, ElRadioGroup, ElRadioButton } from 'element-plus'
import { Plus, Delete, Close } from '@element-plus/icons-vue'
import type { RenderContentContext, RenderContentFunction } from 'element-plus'
import { OperatorType } from '@/api/operator'
import {
  fetchCategoryTree,
  addCategoryNode,
  editCategoryNode,
  deleteCategoryNode,
  batchDeleteCategoryNodes,
  moveCategoryNode
} from '@/api/operatorCategoryTree';
import { fetchOperators } from '@/api/operator';

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
const selectedOperatorType = ref<OperatorType>(OperatorType.BASIC);
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
  'type-change': [type: OperatorType];
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

// 递归获取某节点下所有叶子节点id（只有叶子节点才有算子）
function getAllLeafNodeIds(node: TreeNode): number[] {
  let ids: number[] = [];
  if (!node.children || node.children.length === 0) {
    // 如果是叶子节点，返回自己的id
    ids.push(node.id);
  } else {
    // 如果是父节点，递归获取所有子叶子节点
    for (const child of node.children) {
      ids = ids.concat(getAllLeafNodeIds(child));
    }
  }
  console.log(`getAllLeafNodeIds for node "${node.label}" (ID: ${node.id}):`, ids);
  return ids;
}

const selectFirstLeafAndEmit = () => {
  nextTick(() => {
    const firstLeaf = findFirstLeafNode(dataSource.value as TreeNode[]);
    if (firstLeaf) {
      treeRef.value?.setCurrentKey(firstLeaf.id);
      // 对于叶子节点，直接返回自己的id
      const ids = [firstLeaf.id];
      console.log('Auto selected first leaf:', firstLeaf.label, 'Leaf ID:', firstLeaf.id, 'Selected leaf IDs:', ids);
      emit('node-select', { ids, node: firstLeaf });
    }
  });
};

const loadTree = async () => {
  const res = await fetchCategoryTree(selectedOperatorType.value) as any;
  if (res.code !== 0) {
    ElMessage.error(res.msg || '获取分类树失败');
    return;
  }
  dataSource.value = res.data;
  // 加：每次加载树后清空选中状态
  currentKey.value = undefined;
  treeRef.value?.setCurrentKey(null);
  checkedKeys.value = [];
  treeRef.value?.setCheckedKeys([]);
  // 不再自动选中第一个叶子节点
  // selectFirstLeafAndEmit();
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
    const res = await addCategoryNode({ 
      parentId: id, 
      label: value.trim(),
      type: selectedOperatorType.value
    }) as any;
    if (res.code !== 0) {
      ElMessage.error(res.msg || '新增失败');
      return;
    }
    loadTree();
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
    const res = await addCategoryNode({ 
      label: value,
      type: selectedOperatorType.value
    }) as any;
    if (res.code !== 0) {
      ElMessage.error(res.msg || '新增失败');
      return;
    }
    loadTree();
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
  
  // 检查选中的分类及其所有子分类下是否有算子
  try {
    let totalOperators = 0;
    const categoriesWithOperators: { name: string; count: number }[] = [];
    
    for (const categoryId of keys) {
      // 获取当前节点及其所有子节点的id
      const categoryNode = treeRef.value.getNode(categoryId);
      if (!categoryNode) continue;
      
      const allCategoryIds = getAllChildNodeIds(categoryNode.data as TreeNode);
      
      for (const childCategoryId of allCategoryIds) {
        const operatorsRes = await fetchOperators({
          categoryId: childCategoryId,
          type: selectedOperatorType.value,
          pageSize: 1
        }) as any;
        
        if (operatorsRes.code === 0 && operatorsRes.data.total > 0) {
          totalOperators += operatorsRes.data.total;
          // 获取子分类名称
          const childCategoryNode = treeRef.value.getNode(childCategoryId);
          if (childCategoryNode) {
            const existingCategory = categoriesWithOperators.find(cat => cat.name === childCategoryNode.data.label);
            if (existingCategory) {
              existingCategory.count += operatorsRes.data.total;
            } else {
              categoriesWithOperators.push({
                name: childCategoryNode.data.label,
                count: operatorsRes.data.total
              });
            }
          }
        }
      }
    }
    
    if (totalOperators > 0) {
      // 构建提示信息
      let message = `选中的分类及其子分类下共有 ${totalOperators} 个算子，删除分类将同时删除该分类下的所有算子。\n\n`;
      
      if (categoriesWithOperators.length > 0) {
        message += '包含算子的分类：\n';
        categoriesWithOperators.forEach(cat => {
          message += `• ${cat.name}: ${cat.count} 个算子\n`;
        });
      }
      
      message += '\n确定要删除吗？';
      
      const confirmResult = await ElMessageBox.confirm(
        message,
        '确认批量删除',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: false
        }
      );
      
      if (confirmResult !== 'confirm') {
        return; // 用户取消删除
      }
    }
    
    // 执行批量删除操作
    const res = await batchDeleteCategoryNodes(keys, selectedOperatorType.value) as any;
    if (res.code !== 0) {
      ElMessage.error(res.msg || '批量删除失败');
      return;
    }
    
    ElMessage.success('批量删除成功');
    checkedKeys.value = [];
    treeRef.value.setCheckedKeys([]);
    loadTree();
  } catch (error) {
    console.error('批量删除分类时出错:', error);
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
    
    // 获取当前节点及其所有子节点的id
    const nodeObj = treeRef.value?.getNode(id);
    const fullNode = nodeObj ? nodeObj.data : data;
    const allCategoryIds = getAllChildNodeIds(fullNode as TreeNode);
    
    // 检查该分类及其所有子分类下是否有算子
    try {
      let totalOperators = 0;
      const categoriesWithOperators: { id: number; name: string; count: number }[] = [];
      
      for (const categoryId of allCategoryIds) {
        const operatorsRes = await fetchOperators({
          categoryId: categoryId,
          type: selectedOperatorType.value,
          pageSize: 1
        }) as any;
        
        if (operatorsRes.code === 0 && operatorsRes.data.total > 0) {
          totalOperators += operatorsRes.data.total;
          // 获取分类名称
          const categoryNode = treeRef.value?.getNode(categoryId);
          if (categoryNode) {
            categoriesWithOperators.push({
              id: categoryId,
              name: categoryNode.data.label,
              count: operatorsRes.data.total
            });
          }
        }
      }
      
      if (totalOperators > 0) {
        // 构建提示信息
        let message = `分类"${data.label}"及其子分类下共有 ${totalOperators} 个算子，删除分类将同时删除该分类下的所有算子。\n\n`;
        
        if (categoriesWithOperators.length > 0) {
          message += '包含算子的分类：\n';
          categoriesWithOperators.forEach(cat => {
            message += `• ${cat.name}: ${cat.count} 个算子\n`;
          });
        }
        
        message += '\n确定要删除吗？';
        
        const confirmResult = await ElMessageBox.confirm(
          message,
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: false
          }
        );
        
        if (confirmResult !== 'confirm') {
          return; // 用户取消删除
        }
      }
      
      // 执行删除操作
      const res = await deleteCategoryNode(id, selectedOperatorType.value) as any;
      if (res.code !== 0) {
        ElMessage.error(res.msg || '删除失败');
        return;
      }
      
      ElMessage.success('删除成功');
      loadTree();
    } catch (error) {
      console.error('删除分类时出错:', error);
      ElMessage.error('删除失败，请重试');
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
      const res = await editCategoryNode(id, { label: value }, selectedOperatorType.value) as any;
      if (res.code !== 0) {
        ElMessage.error(res.msg || '重命名失败');
        return;
      }
      loadTree();
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
  // 初次挂载时自动选中第一个叶子节点（loadTree 内已处理）
});
onBeforeUnmount(() => {
  window.removeEventListener('mousedown', handleClickOutside);
});

const renderContent: RenderContentFunction = (h, { node, data }) => {
  return h(
    'div',
    {
      class: [
        'custom-tree-node',
        currentKey.value === data.id ? 'custom-tree-node--active' : ''
      ],
      onContextmenu: (event: MouseEvent) => showContextMenu(event, node, data),
    },
    [
      h('span', null, node.label),
    ]
  )
}

const allowDrop = (draggingNode: any, dropNode: any, type: string) => {
  // 允许拖拽到任意节点（可根据需要自定义规则）
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

const handleDrop = async (draggingNode: any, dropNode: any, dropType: string, ev: DragEvent) => {
  const res = await moveCategoryNode({
    id: draggingNode.data.id,
    targetId: dropNode.data.id,
    type: dropType
  }, selectedOperatorType.value) as any;
  if (res.code !== 0) {
    ElMessage.error(res.msg || '移动失败');
    return;
  }
  loadTree();
}

const handleSearch = () => {
  treeRef.value?.filter(searchText.value);
};

const handleTypeChange = async (type: OperatorType) => {
  selectedOperatorType.value = type;
  // 重新加载对应类型的分类树，并清空所有选中
  await loadTree();
  emit('type-change', type);
};

const handleNodeClick = (data: Tree) => {
  // 通过 el-tree 实例获取完整节点数据（含 children）
  const nodeObj = treeRef.value?.getNode(data.id);
  const fullNode = nodeObj ? nodeObj.data : data;
  currentKey.value = fullNode.id; // 设置高亮节点
  // 如果是叶子节点，只返回自己的id
  // 如果是父节点，返回所有子叶子节点的id
  const ids = getAllLeafNodeIds(fullNode as TreeNode);
  console.log('Node clicked:', fullNode.label, 'Node ID:', fullNode.id, 'Is leaf:', !fullNode.children || fullNode.children.length === 0);
  console.log('Selected leaf IDs:', ids);
  emit('node-select', { ids, node: fullNode });
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
      // 如果在子节点中删除了，直接返回
      return true;
    }
  }
  return false;
}

watch(selectedOperatorType, () => {
  currentKey.value = undefined;
});

defineExpose({
  clearCurrentKey: () => { currentKey.value = undefined; }
})

const handleRadioClick = async (type: OperatorType) => {
  if (selectedOperatorType.value === type) {
    await loadTree();
    emit('type-change', type);
  }
};
</script>

<style>
.custom-tree-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  padding: 24px 24px 16px 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.type-switcher {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}
.tree-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  width: 100%;
}
.tree-scroll-area {
  flex: 1 1 0;
  height: 0;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 8px 0 8px 8px;
  background: #fafbfc;
  width: 100%;
  min-height: 0;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.context-menu {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.13);
  min-width: 120px;
  padding: 4px 0;
  margin-top: 2px;
}
.context-menu-item {
  padding: 10px 20px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.2s;
}
.context-menu-item:hover {
  background: #f0f6ff;
}
::v-deep(.el-tree) {
  height: 100%;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.custom-tree-node--active {
  background: #e6f7ff;
  border-radius: 4px;
}
</style>
