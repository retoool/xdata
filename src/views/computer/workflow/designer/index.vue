<template>
  <div class="workflow-designer-page" :class="{ 'panel-collapsed': isPanelCollapsed }">
    <!-- 左侧算子面板 -->
    <div class="side-panel" :class="{ 'collapsed': isPanelCollapsed }">
      <div class="panel-header">
        <div class="panel-title">
          <el-icon><Component /></el-icon>
          <span>算子库</span>
        </div>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索算子"
          clearable
          size="small"
          @input="handleSearch"
          @clear="handleSearchClear"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="panel-content">
        <div v-if="loading" class="loading-container">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载算子中...</span>
        </div>
        <div v-else-if="operatorCategories.length === 0" class="empty-container">
          <el-icon><Box /></el-icon>
          <span>暂无算子数据</span>
        </div>
        <el-collapse v-else v-model="activeCategories" accordion class="operator-categories">
          <el-collapse-item
            v-for="category in filteredCategories"
            :key="category.id"
            :title="category.name"
            :name="String(category.id)"
          >
            <template #title>
              <div class="category-title">
                <el-icon><FolderOpened /></el-icon>
                <span>{{ category.name }}</span>
                <el-tag size="small" type="info">{{ category.operators.length }}</el-tag>
              </div>
            </template>
            <div class="operators-list">
              <div
                v-for="operator in category.operators"
                :key="operator.id"
                class="operator-item"
                draggable="true"
                @dragstart="handleDragStart($event, operator)"
                @click="handleOperatorPreview(operator)"
              >
                <div class="operator-icon">
                  <el-icon><Operation /></el-icon>
                </div>
                <div class="operator-content">
                  <div class="operator-name">{{ operator.name }}</div>
                  <div class="operator-description">{{ operator.description }}</div>
                  <div class="operator-meta">
                    <el-tag size="small" :type="getOperatorTypeTagType(operator.type)">
                      {{ getOperatorTypeLabel(operator.type) }}
                    </el-tag>
                    <span class="operator-version">v{{ operator.version || '1.0.0' }}</span>
                  </div>
                </div>
              </div>
              <div v-if="category.operators.length === 0" class="empty-operators">
                <span>此分类下暂无算子</span>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div

    <!-- 右侧设计器区域 -->
    <div class="content-area" :class="{ 'expanded': isPanelCollapsed }">
      <!-- 工具栏 -->
      <div class="content-toolbar">
        <div class="toolbar-left">
          <el-button @click="handleBack">
            <el-icon><Back /></el-icon>
            返回列表
          </el-button>
          <el-divider direction="vertical" />
          
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>
              <el-link @click="handleBack" :underline="false">工作流管理</el-link>
            </el-breadcrumb-item>
            <el-breadcrumb-item>
              {{ isNewWorkflow ? '新建工作流' : '编辑工作流' }}
            </el-breadcrumb-item>
          </el-breadcrumb>
          
          <el-divider direction="vertical" />
          
          <!-- 工作流标题 -->
          <div class="workflow-title-section">
            <span v-if="!isEditingTitle" class="workflow-title" @click="startEditTitle">
              {{ workflowData.name || '新建工作流' }}
              <el-icon v-if="isNewWorkflow" class="edit-icon"><Edit /></el-icon>
            </span>
            <el-input
              v-else
              v-model="editingTitle"
              ref="titleInputRef"
              size="small"
              style="width: 200px;"
              @blur="finishEditTitle"
              @keyup.enter="finishEditTitle"
              @keyup.esc="cancelEditTitle"
            />
            <el-tag size="small" :type="getStatusTagType(workflowData.status)" style="margin-left: 8px;">
              {{ getStatusLabel(workflowData.status) }}
            </el-tag>
          </div>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" @click="handleSave">
            <el-icon><Save /></el-icon>
            保存
          </el-button>
          <el-button 
            type="success" 
            :disabled="workflowData.status === 'published'"
            @click="handlePublish"
          >
            <el-icon><Upload /></el-icon>
            发布
          </el-button>
          
          <!-- 帮助按钮 -->
          <el-tooltip placement="bottom" popper-class="shortcuts-tooltip">
            <template #content>
              <div class="shortcuts-help">
                <div class="help-title">快捷键</div>
                <div class="help-item">
                  <kbd>Ctrl</kbd> + <kbd>S</kbd> - 保存工作流
                </div>
                <div class="help-item">
                  <kbd>Ctrl</kbd> + <kbd>Enter</kbd> - 发布工作流
                </div>
                <div class="help-item">
                  <kbd>Esc</kbd> - 取消选择/取消编辑
                </div>
                <div class="help-item">
                  <kbd>Ctrl</kbd> + 鼠标点击 - 在新窗口打开
                </div>
              </div>
            </template>
            <el-button type="info" text>
              <el-icon><QuestionFilled /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <!-- 设计器主体 -->
      <div class="designer-main">
        <!-- 画布区域 -->
        <div class="designer-canvas" ref="canvasRef">
          <VueFlow
            v-model="nodes"
            :edges="edges"
            :node-types="nodeTypes"
            @connect="handleConnect"
            @dragover="handleDragOver"
            @drop="handleDrop"
            :default-viewport="{ zoom: 1 }"
            :min-zoom="0.2"
            :max-zoom="4"
          >
            <Background pattern-color="#aaa" :gap="8" />
            <MiniMap />
            <Controls />
            <div class="vue-flow__controls">
              <button class="vue-flow__controls-button" @click="handleFitView">
                <el-icon><Search /></el-icon>
              </button>
            </div>
          </VueFlow>
        </div>

        <!-- 右侧属性面板 -->
        <div class="properties-panel" v-if="selectedNode">
          <PropertiesPanel 
            :selected-node="selectedNode"
            @close="selectedNode = null"
            @update="handleNodeUpdate"
          />
        </div>
      </div>
    </div>

    <!-- 折叠按钮 -->
    <div class="collapse-button" @click="togglePanelCollapse">
      <el-icon :class="{ 'rotated': isPanelCollapsed }">
        <ArrowLeft />
      </el-icon>
    </div>

    <!-- 工作流保存组件 -->
    <WorkflowSaver
      ref="workflowSaverRef"
      :nodes="nodes"
      :edges="edges"
      :workflow-id="workflowData.id"
      :workflow-name="workflowData.name"
      @save-success="handleSaveSuccess"
      @publish-success="handlePublishSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, nextTick, markRaw, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { TagProps } from 'element-plus'
import {
  ArrowLeft as Back,
  Document as Save,
  Upload,
  Search,
  Connection as ConnectionIcon,
  CircleClose as Close,
  Cpu as Component,
  Loading,
  Box,
  FolderOpened,
  Operation,
  Edit,
  QuestionFilled,
  ArrowLeft
} from '@element-plus/icons-vue'
import CustomNodeVue from './components/CustomNode.vue'
import PropertiesPanel from './components/PropertiesPanel.vue'
import WorkflowSaver from './components/WorkflowSaver.vue'
import { getWorkflow, updateWorkflow, publishWorkflow } from '@/api/workflow'
import type { WorkflowUpdateParams } from '@/api/workflow'
import type { NodeData, NodeParam, CustomNode, OperatorCategory, WorkflowData } from './types'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import type { Node, Edge, Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import { Controls } from '@vue-flow/controls'
import { fetchCategoryTree } from '@/api/operatorCategoryTree'
import type { Operator as ApiOperator } from '@/api/operator'
import { fetchOperators as fetchOperatorList } from '@/api/operator'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import '@vue-flow/controls/dist/style.css'

// Vue Flow 相关
const {
  onConnect,
  addNodes,
  getNode,
  getNodes,
  getEdges,
  setEdges,
  addEdges,
  removeNodes,
  updateNode,
  fitView
} = useVueFlow({
  defaultViewport: { x: 0, y: 0, zoom: 1 }
})

// 画布相关
const canvasRef = ref<HTMLElement>()
const workflowSaverRef = ref()
const nodes = ref<CustomNode[]>([])
const edges = ref<Edge[]>([])
const selectedNode = ref<NodeData | null>(null)

// 算子面板相关
const searchKeyword = ref('')
const activeCategories = ref<(string | number)[]>([])
const operatorCategories = ref<OperatorCategory[]>([])
const loading = ref(true)

// 面板折叠状态
const isPanelCollapsed = ref(false)

// 路由和数据
const route = useRoute()
const router = useRouter()

// 工作流数据
const workflowData = reactive<WorkflowData>({
  id: 0,
  name: '',
  categoryId: 0,
  description: '',
  status: 'draft',
  version: '',
  author: '',
  tags: [],
  nodes: [],
  edges: [],
  createTime: '',
  updateTime: ''
})

// 是否是新建工作流
const isNewWorkflow = computed(() => {
  return route.params.id === 'new'
})

// 是否正在编辑标题
const isEditingTitle = ref(false)
// 编辑中的标题
const editingTitle = ref(workflowData.name)
// 标题输入框引用
const titleInputRef = ref<HTMLInputElement>()

// 过滤后的分类列表
const filteredCategories = computed(() => {
  if (!searchKeyword.value) {
    return operatorCategories.value
  }
  
  return operatorCategories.value.map(category => ({
    ...category,
    operators: category.operators.filter(op => 
      op.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      op.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  })).filter(category => category.operators.length > 0)
})

// 状态标签类型
const getStatusTagType = (status: string): TagProps['type'] => {
  const statusMap: Record<string, TagProps['type']> = {
    'draft': 'info',
    'published': 'success',
    'running': 'primary',
    'stopped': 'warning',
    'error': 'danger'
  }
  return statusMap[status] || 'info'
}

// 状态标签
const getStatusLabel = (status: string) => {
  const statusMap = {
    'draft': '草稿',
    'published': '已发布',
    'running': '运行中',
    'stopped': '已停止',
    'error': '异常'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

// 算子类型标签
const getOperatorTypeTagType = (type: string): TagProps['type'] => {
  const typeMap: Record<string, TagProps['type']> = {
    'basic': 'primary',
    'script': 'success',
    'external': 'warning'
  }
  return typeMap[type] || 'info'
}

// 算子类型标签
const getOperatorTypeLabel = (type: string) => {
  const typeMap = {
    'basic': '基础算子',
    'script': '脚本算子',
    'external': '外部算子'
  }
  return typeMap[type as keyof typeof typeMap] || type
}

// 加载工作流数据
const loadWorkflowData = async () => {
  const workflowId = route.params.id as string
  if (!workflowId || workflowId === 'new') {
    // 新建工作流
    workflowData.name = '新建工作流'
    workflowData.status = 'draft'
    return
  }

  try {
    const data = await getWorkflow(Number(workflowId)) as any;
    Object.assign(workflowData, data);
    // 转换节点数据为 Vue Flow 格式
    if (data.nodes) {
      nodes.value = data.nodes.map((nodeData: NodeData) => ({
        id: nodeData.id,
        type: 'custom',
        position: nodeData.position,
        data: {
          ...nodeData,
          onSelect: handleNodeSelect,
          onUpdate: handleNodeUpdate,
          onDelete: handleNodeDelete
        }
      }));
    }
    if (data.edges) {
      edges.value = data.edges;
    }
    // 加载完数据后自动适应视图
    nextTick(() => {
      fitView({ padding: 0.2 });
    });
  } catch (error) {
    console.error('加载工作流数据失败:', error);
    ElMessage.error('加载工作流数据失败');
  }
}

// 节点操作
const handleNodeSelect = (node: NodeData) => {
  selectedNode.value = node
}

// 节点更新处理
const handleNodeUpdate = (node: NodeData) => {
  // 检查所有参数是否有错误
  const nodeParams = node.params || [];
  const hasErrors = nodeParams.some(param => param.error);
  
  // 更新节点状态
  node.hasErrors = hasErrors;
  
  // 更新节点
  const index = nodes.value.findIndex(n => n.id === node.id);
  if (index !== -1) {
    const updatedNode: CustomNode = {
      id: node.id,
      type: 'custom',
      position: node.position,
      data: node,
      style: {
        borderColor: hasErrors ? 'var(--el-color-danger)' : undefined
      }
    };
    nodes.value[index] = updatedNode;
  }
}

const handleNodeDelete = (nodeId: string) => {
  removeNodes([nodeId])
  if (selectedNode.value?.id === nodeId) {
    selectedNode.value = null
  }
}

const handleParamChange = (param: NodeParam, value: any) => {
  // 参数验证
  let error = undefined;
  
  // 必填验证
  if (param.required && (value === undefined || value === null || value === '')) {
    error = '该字段为必填项';
  }
  // 类型验证
  else if (param.type === 'number') {
    // 数字类型验证
    if (typeof value !== 'number') {
      error = '请输入有效的数字';
    } else if (param.min !== undefined && value < param.min) {
      error = `值不能小于 ${param.min}`;
    } else if (param.max !== undefined && value > param.max) {
      error = `值不能大于 ${param.max}`;
    }
  } else if (param.type === 'enum') {
    // 枚举类型验证
    if (!param.options?.some(opt => opt.value === value)) {
      error = '请选择有效的选项';
    }
  }

  // 更新参数值和错误状态
  param.value = value;
  param.error = error;

  // 更新节点
  if (selectedNode.value) {
    handleNodeUpdate(selectedNode.value);
  }

  // 显示错误提示
  if (error) {
    ElMessage.error(error);
  }
}

// 验证所有节点的参数
const validateNodes = () => {
  let hasErrors = false;
  const errorMessages: string[] = [];

  nodes.value.forEach(node => {
    const nodeParams = node.data.params || [];
    nodeParams.forEach(param => {
      if (param.required && (param.value === undefined || param.value === null || param.value === '')) {
        hasErrors = true;
        errorMessages.push(`节点"${node.data.name}"的"${param.label}"为必填项`);
      }
      if (param.error) {
        hasErrors = true;
        errorMessages.push(`节点"${node.data.name}"的"${param.label}"${param.error}`);
      }
    });
  });

  if (hasErrors) {
    ElMessage.error(errorMessages.join('\n'));
  }

  return !hasErrors;
}

// 保存工作流
const handleSave = async () => {
  if (workflowSaverRef.value) {
    await workflowSaverRef.value.saveWorkflow()
  }
}

// 发布工作流
const handlePublish = async () => {
  if (workflowSaverRef.value) {
    await workflowSaverRef.value.publishWorkflow()
  }
}

// 保存成功处理
const handleSaveSuccess = () => {
  ElMessage.success('保存成功')
  // 可以在这里做一些额外处理
}

// 发布成功处理
const handlePublishSuccess = () => {
  ElMessage.success('发布成功')
  // 刷新工作流数据
  loadWorkflowData()
}

// 返回列表
const handleBack = () => {
  router.push('/computer/workflow/list')
}

// 拖拽操作
const handleDragStart = (event: DragEvent, operator: any) => {
  if (event.dataTransfer) {
    // 传递完整的算子数据
    event.dataTransfer.setData('application/json', JSON.stringify({
      id: operator.id,
      name: operator.name,
      type: operator.type,
      description: operator.description,
      params: []
    }))
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const data = event.dataTransfer?.getData('application/json')
  if (!data) return

  try {
    const operatorData = JSON.parse(data)
    const bounds = canvasRef.value?.getBoundingClientRect()
    if (!bounds) return

    const position = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    }
    
    // 创建新节点
    const newNode: CustomNode = {
      id: `node-${Date.now()}`,
      type: 'custom',
      position,
      data: {
        id: `node-${Date.now()}`,
        name: operatorData.name,
        type: operatorData.type,
        description: operatorData.description,
        position,
        params: operatorData.params.map((param: NodeParam) => ({
          ...param,
          value: param.default || param.value,
          error: undefined
        })),
        onSelect: handleNodeSelect,
        onUpdate: handleNodeUpdate,
        onDelete: handleNodeDelete
      },
      style: {
        background: 'var(--el-bg-color)',
        border: '1px solid var(--el-border-color)',
        borderRadius: '4px',
        padding: '10px',
        minWidth: '150px'
      }
    }

    // 添加节点
    addNodes([newNode])
  } catch (error) {
    console.error('创建节点失败:', error)
    ElMessage.error('创建节点失败')
  }
}

// 连线操作
const handleConnect = (params: Connection) => {
  const edge: Edge = {
    id: `edge-${Date.now()}`,
    source: params.source,
    target: params.target,
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'var(--el-color-primary)' }
  }
  addEdges([edge])
}

// 注册节点类型
const nodeTypes: any = {
  custom: CustomNodeVue
}

// 加载算子数据
const loadOperatorData = async () => {
  try {
    loading.value = true;
    // 加载分类树
    const treeRes = await fetchCategoryTree() as { id: number; label: string }[]
    // 转换数据结构
    operatorCategories.value = treeRes.map(category => ({
      id: category.id,
      name: category.label,
      operators: []
    }))
    
    // 加载每个分类下的算子
    for (const category of operatorCategories.value) {
      const operatorsRes = await fetchOperatorList({ categoryId: category.id })
      category.operators = operatorsRes.records.map(op => ({
        ...op,
        params: []  // 暂时使用空数组，后续可以根据inputSchema生成参数
      }))
    }
  } catch (error) {
    console.error('加载算子数据失败:', error)
    ElMessage.error('加载算子数据失败')
  } finally {
    loading.value = false;
  }
}

// 搜索算子
const handleSearch = (value: string) => {
  // 过滤逻辑在 computed 中处理
}

// 清空搜索
const handleSearchClear = () => {
  // 清空关键词，computed 会自动更新
}

// 适应视图
const handleFitView = () => {
  fitView({ padding: 0.2 })
}

// 预览算子详情
const handleOperatorPreview = (operator: any) => {
  ElMessage.info(`预览算子: ${operator.name}`);
  // 可以在这里打开一个弹窗或模态框显示更详细的算子信息
}

// 切换面板折叠状态
const togglePanelCollapse = () => {
  isPanelCollapsed.value = !isPanelCollapsed.value;
};

// 开始编辑标题
const startEditTitle = () => {
  editingTitle.value = workflowData.name;
  isEditingTitle.value = true;
  nextTick(() => {
    titleInputRef.value?.focus();
  });
};

// 完成编辑标题
const finishEditTitle = () => {
  if (editingTitle.value.trim() && editingTitle.value.trim() !== workflowData.name) {
    workflowData.name = editingTitle.value.trim();
    // 对于新建工作流，只是更新本地数据，保存时会一起提交
    if (!isNewWorkflow.value && workflowData.id) {
      // 对于已存在的工作流，立即调用更新接口
      updateWorkflow({ id: workflowData.id, name: workflowData.name }).then(() => {
        ElMessage.success('工作流名称更新成功');
      }).catch(() => {
        ElMessage.error('工作流名称更新失败');
      });
    }
  }
  isEditingTitle.value = false;
};

// 取消编辑标题
const cancelEditTitle = () => {
  editingTitle.value = workflowData.name;
  isEditingTitle.value = false;
};



// 在组件挂载时加载数据
onMounted(() => {
  loadWorkflowData()
  loadOperatorData()
  
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除事件监听
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 键盘事件处理
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+S 保存
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    handleSave()
  }
  // Ctrl+Enter 发布
  else if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault()
    if (workflowData.status !== 'published') {
      handlePublish()
    }
  }
  // Esc 取消选择
  else if (event.key === 'Escape') {
    selectedNode.value = null
    isEditingTitle.value = false
  }
}
</script>



<style lang="scss" scoped>
.workflow-designer-page {  
  height: calc(100% - 24px);
  max-height: calc(100% - 24px); /* 严格限制最大高度 */
  min-height: 600px;
  display: flex;
  overflow: hidden;
  position: relative;
}

.side-panel {
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
  transition: all 0.3s ease;
  height: 100%;
  max-height: 100%; /* 严格限制侧边栏高度 */

  &.collapsed {
    width: 0;
    min-width: 0;
    max-width: 0;
    margin-right: 0;
    opacity: 0;
  }

  .panel-header {
    padding: 12px;
    border-bottom: 1px solid var(--el-border-color-light);
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0; /* 防止头部被压缩 */

    .panel-title {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);

      svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  .panel-content {
    flex: 1;
    overflow: hidden; /* 防止内容溢出 */
    display: flex;
    flex-direction: column;
    min-height: 0; /* 重要：允许flex子项收缩 */
    height: calc(100% - 80px); /* 精确计算高度，减去头部高度 */
    max-height: calc(100% - 80px); /* 严格限制高度 */

    /* 算子分类折叠面板的滚动样式 */
    .operator-categories {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      margin: 0;
      max-height: 100%; /* 确保不超出父容器 */

      /* 强制 el-collapse 遵守高度限制 */
      :deep(.el-collapse) {
        height: 100% !important;
        max-height: 100% !important;
        overflow: hidden !important;
      }

      :deep(.el-collapse-item) {
        max-height: none;
      }

      :deep(.el-collapse-item__content) {
        max-height: none;
        overflow: visible;
      }

      /* 强制限制整个折叠面板区域 */
      &.operator-categories {
        contain: layout size;
      }

      /* 自定义滚动条样式 */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: var(--el-fill-color-lighter);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--el-border-color-dark);
        border-radius: 3px;
        
        &:hover {
          background: var(--el-border-color-darker);
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 12px;
      color: var(--el-text-color-secondary);
      height: 100%;

      .is-loading {
        font-size: 24px;
        margin-bottom: 8px;
      }
    }

    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 12px;
      color: var(--el-text-color-secondary);
      height: 100%;

      svg {
        font-size: 40px;
        margin-bottom: 8px;
      }
    }

    .category-title {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      width: 100%;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    .operators-list {
      .operator-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        margin-bottom: 8px;
        cursor: pointer;
        user-select: none;
        background-color: var(--el-bg-color);

        &:hover {
          background-color: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary);
        }

        .operator-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background-color: var(--el-color-primary-light-9);
          border-radius: 4px;
          color: var(--el-color-primary);

          svg {
            width: 16px;
            height: 16px;
          }
        }

        .operator-content {
          flex: 1;
          display: flex;
          flex-direction: column;

          .operator-name {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
          }

          .operator-description {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 2px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .operator-meta {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 4px;
            font-size: 12px;
            color: var(--el-text-color-secondary);

            .operator-version {
              background-color: var(--el-color-info-light-9);
              color: var(--el-color-info);
              padding: 2px 6px;
              border-radius: 4px;
            }
          }
        }
      }

      .empty-operators {
        padding: 12px;
        text-align: center;
        color: var(--el-text-color-secondary);
        font-size: 12px;
      }
    }
  }
}

.content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  max-height: 100%; /* 确保不超出父容器高度 */
  overflow: hidden;

  &.expanded {
    margin-left: 0;
  }

  .content-toolbar {
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color-light);
    background-color: var(--el-bg-color);
    z-index: 1;
    flex-shrink: 0;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .workflow-title-section {
        display: flex;
        align-items: center;
        gap: 8px;

        .workflow-title {
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;

          .edit-icon {
            font-size: 14px;
            color: var(--el-color-info);
            cursor: pointer;
            transition: color 0.2s;

            &:hover {
              color: var(--el-color-primary);
            }
          }
        }
      }
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .designer-main {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    min-height: 0;

    .designer-canvas {
      flex: 1;
      position: relative;
      overflow: hidden;
      background-color: var(--el-bg-color-page);
      min-height: 0;

      :deep(.vue-flow) {
        width: 100%;
        height: 100%;
      }

      :deep(.vue-flow__edge-path) {
        stroke-width: 2;
      }

      :deep(.vue-flow__controls) {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background-color: var(--el-bg-color);
        border: 1px solid var(--el-border-color-light);
        border-radius: 4px;
        overflow: hidden;
      }

      :deep(.vue-flow__controls-button) {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: none;
        cursor: pointer;
        padding: 4px;
        color: var(--el-text-color-regular);

        &:hover {
          background-color: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
        }

        &:active {
          background-color: var(--el-color-primary-light-8);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }

      :deep(.vue-flow__minimap) {
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid var(--el-border-color-light);
        background-color: var(--el-bg-color);
      }

      :deep(.vue-flow__background) {
        background-color: var(--el-bg-color-page);
      }
    }

    .properties-panel {
      width: 300px;
      border-left: 1px solid var(--el-border-color-light);
      display: flex;
      flex-direction: column;
      background-color: var(--el-bg-color);
      z-index: 1;

      .properties-header {
        padding: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--el-border-color-light);

        .header-title {
          font-size: 14px;
          font-weight: 500;
        }
      }

      .properties-content {
        flex: 1;
        overflow: auto;
        padding: 16px;
      }
    }
  }
}

.collapse-button {
  position: absolute;
  left: 320px;
  top: 40%;
  transform: translateY(-50%);
  width: 20px;
  height: 48px;
  background: linear-gradient(to right, var(--el-border-color-lighter) 0%, var(--el-bg-color) 70%);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 0 8px 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.03);
  
  border: 1px solid var(--el-border-color-lighter);
  border-left: none;
  box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.03);

  &:hover {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);
    box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.08);
    
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

.side-panel.collapsed ~ .collapse-button {
  left: 1px;
  border-left: 1px solid var(--el-border-color-lighter);
  border-radius: 0 8px 8px 0;
}
</style>

<style lang="scss">
// 全局样式：快捷键帮助提示
.shortcuts-tooltip {
  .shortcuts-help {
    .help-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--el-text-color-primary);
    }

    .help-item {
      margin-bottom: 6px;
      font-size: 12px;
      color: var(--el-text-color-regular);
      display: flex;
      align-items: center;
      
      kbd {
        display: inline-block;
        padding: 2px 6px;
        margin: 0 2px;
        font-size: 11px;
        line-height: 1;
        color: var(--el-text-color-primary);
        background-color: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color);
        border-radius: 3px;
        font-family: monospace;
      }
    }
  }
}
</style> 