<template>
  <div class="workflow-saver">
    <!-- 保存进度对话框 -->
    <el-dialog
      v-model="saveDialogVisible"
      title="保存工作流"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="save-progress">
        <el-steps :active="currentStep" finish-status="success">
          <el-step title="数据验证" />
          <el-step title="保存数据" />
          <el-step title="完成" />
        </el-steps>
        
        <div class="step-content">
          <div v-if="currentStep === 0" class="validation-step">
            <el-icon class="is-loading"><Loading /></el-icon>
            <p>正在验证工作流数据...</p>
            <ul class="validation-list">
              <li v-for="item in validationItems" :key="item.name" :class="item.status">
                <el-icon v-if="item.status === 'success'"><Check /></el-icon>
                <el-icon v-else-if="item.status === 'error'"><Close /></el-icon>
                <el-icon v-else class="is-loading"><Loading /></el-icon>
                {{ item.name }}
              </li>
            </ul>
          </div>
          
          <div v-else-if="currentStep === 1" class="saving-step">
            <el-icon class="is-loading"><Loading /></el-icon>
            <p>正在保存工作流数据...</p>
            <el-progress :percentage="saveProgress" />
          </div>
          
          <div v-else-if="currentStep === 2" class="success-step">
            <el-icon class="success-icon"><CircleCheck /></el-icon>
            <p>工作流保存成功！</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button v-if="currentStep === 2" type="primary" @click="closeSaveDialog">确定</el-button>
      </template>
    </el-dialog>

    <!-- 发布确认对话框 -->
    <el-dialog
      v-model="publishDialogVisible"
      title="发布工作流"
      width="600px"
    >
      <div class="publish-content">
        <el-alert
          title="发布提醒"
          type="warning"
          description="发布后的工作流将不能编辑，确定要发布吗？"
          show-icon
          :closable="false"
        />
        
        <div class="publish-info">
          <h4>发布信息</h4>
          <el-form label-width="80px">
            <el-form-item label="版本号">
              <el-input v-model="publishForm.version" placeholder="请输入版本号，如：1.0.0" />
            </el-form-item>
            <el-form-item label="发布说明">
              <el-input
                v-model="publishForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入发布说明"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="publishDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmPublish">确认发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Loading,
  Check,
  Close,
  CircleCheck
} from '@element-plus/icons-vue'
import type { CustomNode } from '../types'
import type { Edge } from '@vue-flow/core'

interface Props {
  nodes: CustomNode[]
  edges: Edge[]
  workflowId: number
  workflowName: string
}

interface Emits {
  (e: 'save-success'): void
  (e: 'publish-success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 保存对话框状态
const saveDialogVisible = ref(false)
const currentStep = ref(0)
const saveProgress = ref(0)

// 发布对话框状态
const publishDialogVisible = ref(false)
const publishForm = reactive({
  version: '',
  description: ''
})

// 验证项目
const validationItems = ref([
  { name: '检查节点完整性', status: 'pending' },
  { name: '验证节点参数', status: 'pending' },
  { name: '检查连线关系', status: 'pending' },
  { name: '验证工作流结构', status: 'pending' }
])

// 验证工作流数据
const validateWorkflow = async () => {
  const errors: string[] = []
  
  // 验证节点
  validationItems.value[0].status = 'loading'
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (props.nodes.length === 0) {
    errors.push('工作流至少需要一个节点')
    validationItems.value[0].status = 'error'
  } else {
    validationItems.value[0].status = 'success'
  }
  
  // 验证节点参数
  validationItems.value[1].status = 'loading'
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const nodeErrors = props.nodes.filter(node => 
    node.data.params?.some(param => param.error) || false
  )
  
  if (nodeErrors.length > 0) {
    errors.push(`${nodeErrors.length}个节点存在参数错误`)
    validationItems.value[1].status = 'error'
  } else {
    validationItems.value[1].status = 'success'
  }
  
  // 验证连线关系
  validationItems.value[2].status = 'loading'
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 检查孤立节点
  const connectedNodeIds = new Set()
  props.edges.forEach(edge => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })
  
  const isolatedNodes = props.nodes.filter(node => 
    !connectedNodeIds.has(node.id) && props.nodes.length > 1
  )
  
  if (isolatedNodes.length > 0) {
    errors.push(`${isolatedNodes.length}个节点未连接`)
    validationItems.value[2].status = 'error'
  } else {
    validationItems.value[2].status = 'success'
  }
  
  // 验证工作流结构
  validationItems.value[3].status = 'loading'
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 检查循环依赖
  const hasCycle = detectCycle()
  if (hasCycle) {
    errors.push('工作流存在循环依赖')
    validationItems.value[3].status = 'error'
  } else {
    validationItems.value[3].status = 'success'
  }
  
  return errors
}

// 检测循环依赖
const detectCycle = () => {
  const graph = new Map<string, string[]>()
  
  // 构建图
  props.nodes.forEach(node => {
    graph.set(node.id, [])
  })
  
  props.edges.forEach(edge => {
    const sources = graph.get(edge.source) || []
    sources.push(edge.target)
    graph.set(edge.source, sources)
  })
  
  // DFS检测循环
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  
  const dfs = (nodeId: string): boolean => {
    visited.add(nodeId)
    recursionStack.add(nodeId)
    
    const neighbors = graph.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true
      } else if (recursionStack.has(neighbor)) {
        return true
      }
    }
    
    recursionStack.delete(nodeId)
    return false
  }
  
  for (const nodeId of graph.keys()) {
    if (!visited.has(nodeId)) {
      if (dfs(nodeId)) return true
    }
  }
  
  return false
}

// 保存工作流
const saveWorkflow = async () => {
  try {
    currentStep.value = 0
    saveDialogVisible.value = true
    
    // 重置验证状态
    validationItems.value.forEach(item => {
      item.status = 'pending'
    })
    
    // 步骤1：验证数据
    const errors = await validateWorkflow()
    
    if (errors.length > 0) {
      ElMessage.error(`验证失败：${errors.join('；')}`)
      saveDialogVisible.value = false
      return false
    }
    
    // 步骤2：保存数据
    currentStep.value = 1
    saveProgress.value = 0
    
    // 模拟保存进度
    const progressInterval = setInterval(() => {
      saveProgress.value += 10
      if (saveProgress.value >= 100) {
        clearInterval(progressInterval)
      }
    }, 100)
    
    // 收集数据
    const workflowData = {
      id: props.workflowId,
      name: props.workflowName,
      nodes: props.nodes.map(node => ({
        id: node.id,
        name: node.data.name,
        type: node.data.type,
        description: node.data.description,
        position: node.position,
        params: node.data.params || []
      })),
      edges: props.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourcePort: edge.sourceHandle,
        targetPort: edge.targetHandle,
        label: typeof edge.label === 'string' ? edge.label : '',
        style: edge.style || {}
      }))
    }
    
    // 这里调用实际的保存API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 步骤3：完成
    currentStep.value = 2
    
    return true
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
    saveDialogVisible.value = false
    return false
  }
}

// 关闭保存对话框
const closeSaveDialog = () => {
  saveDialogVisible.value = false
  emit('save-success')
}

// 发布工作流
const publishWorkflow = () => {
  publishForm.version = ''
  publishForm.description = ''
  publishDialogVisible.value = true
}

// 确认发布
const confirmPublish = async () => {
  if (!publishForm.version.trim()) {
    ElMessage.error('请输入版本号')
    return
  }
  
  try {
    // 先保存
    const saveSuccess = await saveWorkflow()
    if (!saveSuccess) return
    
    // 再发布
    // 这里调用实际的发布API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    publishDialogVisible.value = false
    ElMessage.success('发布成功')
    emit('publish-success')
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败')
  }
}

// 暴露方法
defineExpose({
  saveWorkflow,
  publishWorkflow
})
</script>

<style lang="scss" scoped>
.workflow-saver {
  .save-progress {
    .step-content {
      margin-top: 20px;
      min-height: 120px;
      
      .validation-step,
      .saving-step,
      .success-step {
        text-align: center;
        
        .is-loading {
          font-size: 24px;
          margin-bottom: 12px;
          color: var(--el-color-primary);
        }
        
        .success-icon {
          font-size: 48px;
          color: var(--el-color-success);
          margin-bottom: 12px;
        }
      }
      
      .validation-list {
        list-style: none;
        padding: 0;
        margin-top: 16px;
        text-align: left;
        
        li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          
          &.success {
            color: var(--el-color-success);
          }
          
          &.error {
            color: var(--el-color-danger);
          }
          
          .is-loading {
            font-size: 14px;
          }
        }
      }
    }
  }
  
  .publish-content {
    .publish-info {
      margin-top: 20px;
      
      h4 {
        margin: 0 0 16px 0;
        color: var(--el-text-color-primary);
      }
    }
  }
}
</style> 