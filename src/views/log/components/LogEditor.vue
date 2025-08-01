<template>
  <div class="log-editor">
    <div class="editor-content">
      <!-- 日期显示 -->
      <div class="date-display-section">
        <div class="date-display">
            <el-icon><Calendar /></el-icon>
            <span class="selected-date">{{ formatDisplayDate(log.logDate) }}</span>
          </div>
        <div class="header-right">
        <el-button 
          @click="handleSave" 
          type="primary" 
          size="default"
          :loading="loading"
          :disabled="!canSave"
          :icon="Check"
        >
          {{ loading ? '保存中...' : '保存' }}
        </el-button>
        <el-button 
          @click="handleClear" 
          size="default" 
          :disabled="loading"
          :icon="Delete"
        >
          清空
        </el-button>
        <el-button 
          v-if="log.id"
          @click="handleDelete" 
          type="danger" 
          size="default"
          :disabled="loading"
          :icon="Delete"
        >
          删除
        </el-button>
      </div>
      </div>

      <div :model="log" label-width="80px" size="default">
        <!-- Markdown编辑器 -->
        <div class="content-form-item">
          <MarkdownEditor 
            v-model="log.content"
            placeholder="记录今天的工作内容...支持Markdown语法"
            @update:modelValue="handleContentChange"
          />
        </div>

        <!-- 模板 -->
        <div>
          <div class="template-buttons">
            <el-button @click="insertTemplate('daily')" size="small" :icon="Calendar">
              日报模板
            </el-button>
            <el-button @click="insertTemplate('weekly')" size="small" :icon="Document">
              周报模板
            </el-button>
            <el-button @click="insertTemplate('project')" size="small" :icon="Briefcase">
              项目模板
            </el-button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Calendar, 
  Check, 
  Delete, 
  Warning,
  Sunny, 
  Cloudy, 
  Lightning, 
  Briefcase,
  Reading,
  House,
  Document
} from '@element-plus/icons-vue'
import MarkdownEditor from './MarkdownEditor.vue'

interface DailyLog {
  id?: number
  userId?: number
  logDate: string
  content: string
  mood: number
  weather: string
  tags: string
  isPublic: boolean
}

const props = defineProps<{
  log: DailyLog
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:log': [log: DailyLog]
  'save': [log: DailyLog]
  'delete': [log: DailyLog]
}>()

const log = ref<DailyLog>({ ...props.log })
const hasUnsavedChanges = ref(false)

// 常用标签
const commonTags = [
  '工作', '项目', '会议', '开发', '测试', '部署', 
  '文档', '代码', '设计', '沟通', '计划', '总结'
]

// 计算属性
const canSave = computed(() => {
  return log.value.content.trim().length > 0 && !props.loading
})

// 监听log变化
watch(() => props.log, (newLog) => {
  log.value = { ...newLog }
}, { deep: true })

// 监听内容变化
const handleContentChange = () => {
  hasUnsavedChanges.value = true
  emit('update:log', log.value)
}

// 添加标签
const addTag = (tag: string) => {
  const currentTags = log.value.tags ? log.value.tags.split(',').map(t => t.trim()) : []
  if (!currentTags.includes(tag)) {
    currentTags.push(tag)
    log.value.tags = currentTags.join(', ')
    handleContentChange()
  }
}

// 插入模板
const insertTemplate = (type: string) => {
  const templates = {
    daily: `# 日报

## 今日工作
- [ ] 任务1
- [ ] 任务2
- [ ] 任务3

## 完成情况
- 已完成：
- 进行中：
- 待处理：

## 总结
`,
    weekly: `# 周报

## 本周工作
- [ ] 任务1
- [ ] 任务2
- [ ] 任务3

## 完成情况
- 已完成：
- 进行中：
- 待处理：

## 总结
`,
    project: `# 项目日志

## 项目名称
- 项目A
- 项目B

## 今日工作
- [ ] 任务1
- [ ] 任务2
- [ ] 任务3

## 完成情况
- 已完成：
- 进行中：
- 待处理：

## 总结
`
  }
  
  const template = templates[type as keyof typeof templates]
  if (template) {
    log.value.content = template
    handleContentChange()
  }
}

// 保存
const handleSave = () => {
  if (!canSave.value) return
  emit('save', log.value)
  hasUnsavedChanges.value = false
}

// 清空
const handleClear = () => {
  ElMessageBox.confirm('确定要清空所有内容吗？', '确认清空', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    log.value.content = ''
    log.value.weather = ''
    log.value.tags = ''
    log.value.isPublic = false
    handleContentChange()
    ElMessage.success('内容已清空')
  }).catch(() => {
    // 用户取消
  })
}

// 删除
const handleDelete = () => {
  if (!log.value.id) {
    ElMessage.warning('当前日志未保存，无法删除')
    return
  }
  
  ElMessageBox.confirm('确定要删除这条日志吗？删除后将无法恢复。', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('delete', log.value)
  }).catch(() => {
    // 用户取消
  })
}

// 格式化显示日期
const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return '今日工作'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨日工作'
  } else {
    return dateStr
  }
}

</script>

<style scoped>
.log-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

.editor-content {
  flex: 1;
  height: 100%;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.date-display-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.date-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;

  .el-icon {
    color: var(--el-color-primary);
    font-size: 20px;
  }
}

.editor-status {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--el-color-warning-light-5);
  animation: pulse 2s infinite;
  
  .el-icon {
    font-size: 14px;
  }
}

.weather-option {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .el-icon {
    color: var(--el-color-primary);
  }
}

.tag-suggestions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.content-form-item {
  flex: 1;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.template-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
  
  .el-button {
    border-radius: 6px;
    font-weight: 500;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.public-hint {
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: var(--el-fill-color-light);
  }
}

.footer-left {
  display: flex;
  gap: 12px;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-content {
    padding: 16px 20px;
  }
  
  .date-display-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .date-display {
    min-width: auto;
    width: 100%;
  }
  
  .editor-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
  }
  
  .footer-left {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .editor-content {
    padding: 12px 16px;
  }
  
  .date-display-section {
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  
  .editor-status {
    padding: 4px 8px;
    font-size: 12px;
    
    .el-icon {
      font-size: 12px;
    }
  }
  
  .editor-footer {
    padding: 12px 16px;
  }
  
  .footer-left {
    gap: 8px;
    
    .el-button {
      font-size: 12px;
      padding: 8px 12px;
    }
  }
}
</style> 