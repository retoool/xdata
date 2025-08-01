<template>
  <div class="markdown-editor-container" :class="{ 'fullscreen': isFullscreen }">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button size="small" @click="insertMarkdown('**', '**')" title="粗体">
            <strong>B</strong>
          </el-button>
          <el-button size="small" @click="insertMarkdown('*', '*')" title="斜体">
            <em>I</em>
          </el-button>
          <el-button size="small" @click="insertMarkdown('~~', '~~')" title="删除线">
            <del>S</del>
          </el-button>
        </el-button-group>
        <el-button-group>
          <el-button size="small" @click="insertMarkdown('# ', '')" title="标题">
            H1
          </el-button>
          <el-button size="small" @click="insertMarkdown('## ', '')" title="二级标题">
            H2
          </el-button>
          <el-button size="small" @click="insertMarkdown('### ', '')" title="三级标题">
            H3
          </el-button>
        </el-button-group>
        <el-button-group>
          <el-button size="small" @click="insertMarkdown('- ', '')" title="无序列表">
            •
          </el-button>
          <el-button size="small" @click="insertMarkdown('1. ', '')" title="有序列表">
            1.
          </el-button>
          <el-button size="small" @click="insertMarkdown('> ', '')" title="引用">
            "
          </el-button>
        </el-button-group>
        <el-button-group>
          <el-button size="small" @click="insertMarkdown('```\n', '\n```')" title="代码块">
            &lt;/&gt;
          </el-button>
          <el-button size="small" @click="insertMarkdown('[', '](url)')" title="链接">
            🔗
          </el-button>
        </el-button-group>
      </div>
      <div class="toolbar-right">
        <el-button 
          size="small" 
          @click="togglePreview" 
          :type="isPreviewMode ? 'primary' : 'default'"
          :icon="isPreviewMode ? 'Edit' : 'View'"
          title="预览"
        >
          {{ isPreviewMode ? '编辑' : '预览' }}
        </el-button>
        <el-button 
          size="small" 
          @click="toggleSplit" 
          :type="isSplitMode ? 'primary' : 'default'"
          :icon="isSplitMode ? 'Close' : 'Grid'"
          title="分屏"
        >
          {{ isSplitMode ? '退出分屏' : '分屏' }}
        </el-button>
        <el-button 
          size="small" 
          @click="toggleFullscreen" 
          :type="isFullscreen ? 'primary' : 'default'"
          :icon="isFullscreen ? 'Close' : 'FullScreen'"
          title="全屏"
        >
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </el-button>
      </div>
    </div>
    
    <div class="editor-content" :class="{ 'split-mode': isSplitMode }">
      <!-- 编辑模式 -->
      <div v-if="!isPreviewMode && !isSplitMode" class="edit-mode">
        <textarea
          ref="markdownTextarea"
          v-model="localContent"
          class="markdown-textarea"
          :placeholder="placeholder"
          @input="handleInput"
          @keydown="handleKeydown"
          @scroll="handleScroll"
        ></textarea>
      </div>
      
      <!-- 预览模式 -->
      <div v-else-if="isPreviewMode && !isSplitMode" class="preview-mode">
        <div 
          class="markdown-preview" 
          v-html="markdownHtml"
          @dblclick="handlePreviewDoubleClick"
          @scroll="handleScroll"
        ></div>
      </div>
      
      <!-- 分屏模式 -->
      <div v-else-if="isSplitMode" class="split-mode">
        <div class="split-edit" :style="{ flex: `${splitRatio} 1 0%` }">
          <textarea
            ref="markdownTextarea"
            v-model="localContent"
            class="markdown-textarea"
            :placeholder="placeholder"
            @input="handleInput"
            @keydown="handleKeydown"
            @scroll="handleScroll"
          ></textarea>
        </div>
        <div 
          class="split-resizer"
          @mousedown="startResize"
          @dblclick="resetSplitRatio"
          :title="`双击重置到中间位置 (当前: ${Math.round(splitRatio)}%)`"
        >
          <div class="split-ratio-indicator" v-if="isResizing">
            {{ Math.round(splitRatio) }}%
          </div>
          <div class="split-hint">|</div>
        </div>
        <div class="split-preview" :style="{ flex: `${100 - splitRatio} 1 0%` }">
          <div 
            class="markdown-preview" 
            v-html="markdownHtml"
            @scroll="handleScroll"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { marked } from 'marked'
import { Edit, View, FullScreen, Close, Grid } from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '写下今天的故事...支持Markdown语法'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// 响应式数据
const isFullscreen = ref(false)
const isPreviewMode = ref(false)
const isSplitMode = ref(false)
const splitRatio = ref(50) // 分割线位置，默认50%（中间）
const isResizing = ref(false)
const localContent = ref(props.modelValue)
const markdownTextarea = ref<HTMLTextAreaElement>()
const markdownHtml = ref('')

// 计算属性
const computedMarkdownHtml = computed(() => {
  if (!localContent.value) return '<p class="empty-content">暂无内容</p>'
  return marked(localContent.value) as string
})

// 监听内容变化
watch(() => props.modelValue, (newValue) => {
  localContent.value = newValue
  markdownHtml.value = computedMarkdownHtml.value
}, { immediate: true })

// 监听本地内容变化
watch(localContent, (newValue) => {
  markdownHtml.value = computedMarkdownHtml.value
  emit('update:modelValue', newValue)
})

// 切换预览模式
const togglePreview = () => {
  isPreviewMode.value = !isPreviewMode.value
  if (isPreviewMode.value) {
    // 进入预览模式时，退出分屏模式
    isSplitMode.value = false
  } else {
    // 切换到编辑模式时，聚焦到文本框
    nextTick(() => {
      if (markdownTextarea.value) {
        markdownTextarea.value.focus()
      }
    })
  }
}

// 处理预览区域双击事件
const handlePreviewDoubleClick = () => {
  if (isPreviewMode.value) {
    togglePreview()
  }
}

// 切换分屏模式
const toggleSplit = () => {
  isSplitMode.value = !isSplitMode.value
  if (isSplitMode.value) {
    // 进入分屏模式时，退出预览模式
    isPreviewMode.value = false
    // 重置分割线到中间位置
    splitRatio.value = 50
  }
}

// 开始拖动分割线
const startResize = (event: MouseEvent) => {
  event.preventDefault()
  isResizing.value = true
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return
    
    const container = document.querySelector('.split-mode') as HTMLElement
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const ratio = ((e.clientX - rect.left) / rect.width) * 100
    
    // 限制分割线在20%-80%之间
    splitRatio.value = Math.max(20, Math.min(80, ratio))
  }
  
  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 重置分割线到中间位置
const resetSplitRatio = () => {
  splitRatio.value = 50
}

// 切换全屏模式
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    // 进入全屏模式
    document.body.style.overflow = 'hidden'
    // 聚焦到编辑器
    nextTick(() => {
      if (markdownTextarea.value) {
        markdownTextarea.value.focus()
      }
    })
  } else {
    // 退出全屏模式
    document.body.style.overflow = ''
  }
}

// 处理输入
const handleInput = () => {
  // 输入时实时更新预览内容
  markdownHtml.value = computedMarkdownHtml.value
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  // 支持 Tab 键缩进
  if (event.key === 'Tab') {
    event.preventDefault()
    const textarea = event.target as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    // 插入两个空格作为缩进
    const newValue = localContent.value.substring(0, start) + '  ' + localContent.value.substring(end)
    localContent.value = newValue
    
    // 设置光标位置
    nextTick(() => {
      textarea.setSelectionRange(start + 2, start + 2)
    })
  }
  
  // ESC 键退出全屏
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
  
  // 分屏模式下的键盘快捷键
  if (isSplitMode.value) {
    // Ctrl/Cmd + 左箭头：向左调整分割线
    if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft') {
      event.preventDefault()
      splitRatio.value = Math.max(20, splitRatio.value - 5)
    }
    // Ctrl/Cmd + 右箭头：向右调整分割线
    if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight') {
      event.preventDefault()
      splitRatio.value = Math.min(80, splitRatio.value + 5)
    }
    // Ctrl/Cmd + 0：重置到中间位置
    if ((event.ctrlKey || event.metaKey) && event.key === '0') {
      event.preventDefault()
      resetSplitRatio()
    }
  }
}

// 处理滚动同步
const handleScroll = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement
  const scrollTop = textarea.scrollTop
  const scrollHeight = textarea.scrollHeight
  const clientHeight = textarea.clientHeight
  
  // 计算滚动比例
  const scrollRatio = scrollTop / (scrollHeight - clientHeight)
  
  // 同步预览区域的滚动
  const previewElement = document.querySelector('.markdown-preview') as HTMLElement
  if (previewElement) {
    const previewScrollHeight = previewElement.scrollHeight
    const previewClientHeight = previewElement.clientHeight
    const targetScrollTop = scrollRatio * (previewScrollHeight - previewClientHeight)
    previewElement.scrollTop = targetScrollTop
  }
}

// 插入 Markdown 语法
const insertMarkdown = (before: string, after: string) => {
  if (isPreviewMode.value) {
    // 如果是预览模式，先切换到编辑模式
    isPreviewMode.value = false
    nextTick(() => {
      insertMarkdown(before, after)
    })
    return
  }
  
  // 确保在编辑模式或分屏模式下
  if (isSplitMode.value) {
    isPreviewMode.value = false
  }
  
  const textarea = markdownTextarea.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = localContent.value.substring(start, end)
    
    const newText = localContent.value.substring(0, start) + 
                   before + selectedText + after + 
                   localContent.value.substring(end)
    
    localContent.value = newText
    
    nextTick(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    })
  }
}

// 组件挂载
onMounted(() => {
  // 初始化时聚焦到文本框
  if (markdownTextarea.value) {
    markdownTextarea.value.focus()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  // 确保退出全屏模式
  if (isFullscreen.value) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.markdown-editor-container {
  width: 100%;
  height: calc(100vh - 240px);
  min-height: 200px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &:hover {
    border-color: var(--el-border-color);
  }
  
  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    border-radius: 0;
    border: none;
    background: var(--el-bg-color);
    
    .editor-content {
      height: calc(100vh - 60px);
    }
    
    .markdown-textarea,
    .markdown-preview {
      height: 100%;
    }
    
    &.split-mode {
      .split-edit,
      .split-preview {
        height: 100%;
      }
      
      .split-resizer {
        height: 100%;
      }
    }
  }
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);
  flex-wrap: wrap;
  flex-shrink: 0;
  
  .toolbar-left {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .el-button-group {
    .el-button {
      border-radius: 4px;
      font-weight: 500;
      
      &:hover {
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
        transform: translateY(-1px);
      }
    }
  }
}

.editor-content {
  flex: 1;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.split-mode {
  display: flex;
  gap: 0;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
  min-height: 0;
  
  .split-edit,
  .split-preview {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
}

.split-edit {
  background: var(--el-fill-color-light);
  border-right: 1px solid var(--el-border-color-lighter);
  min-width: 0;
  flex-shrink: 0;
  
  .markdown-textarea {
    height: 100%;
    width: 100%;
    border: none;
    border-radius: 0;
    resize: none;
    background: var(--el-fill-color-light);
  }
}

.split-preview {
  background: var(--el-bg-color);
  border-left: 1px solid var(--el-border-color-lighter);
  min-width: 0;
  flex-shrink: 0;
  
  .markdown-preview {
    height: 100%;
    width: 100%;
    border: none;
    border-radius: 0;
    cursor: default;
    background: var(--el-bg-color);
    
    &:hover {
      background-color: transparent;
    }
  }
}

.split-resizer {
  width: 6px;
  background: var(--el-border-color);
  cursor: col-resize;
  position: relative;
  transition: all 0.2s ease;
  border-left: 1px solid var(--el-border-color);
  border-right: 1px solid var(--el-border-color);
  flex-shrink: 0;
  
  &:hover {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    
    &::after {
      background: var(--el-color-primary);
      opacity: 1;
    }
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 24px;
    background: var(--el-bg-color);
    border-radius: 2px;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1px;
    height: 12px;
    background: var(--el-border-color);
    border-radius: 1px;
    opacity: 0.6;
  }
  
  &:active {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    
    &::before {
      background: var(--el-color-primary);
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.2);
    }
    
    &::after {
      background: var(--el-color-primary);
      opacity: 1;
    }
  }
  
  .split-ratio-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--el-color-primary);
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .split-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--el-text-color-regular);
    font-size: 8px;
    font-weight: normal;
    pointer-events: none;
    opacity: 0.5;
  }
}

.edit-mode {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.markdown-textarea {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  overflow-y: auto;
  
  &::placeholder {
    color: var(--el-text-color-placeholder);
  }
  
  &:focus {
    box-shadow: none;
  }
}

.preview-mode {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.markdown-preview {
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1;
  padding: 16px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  overflow-y: auto;
  overflow-x: hidden;
  cursor: pointer;
  transition: background-color 0.2s ease;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  
  &:hover {
    background-color: var(--el-fill-color-extra-light);
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 16px 0 8px 0;
    color: var(--el-text-color-primary);
    font-weight: 600;
  }
  
  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 18px; }
  
  p {
    margin: 8px 0;
  }
  
  ul, ol {
    margin: 8px 0;
    padding-left: 24px;
  }
  
  li {
    margin: 4px 0;
  }
  
  blockquote {
    margin: 12px 0;
    padding: 8px 16px;
    border-left: 4px solid var(--el-color-primary);
    background: var(--el-fill-color-extra-light);
    color: var(--el-text-color-regular);
  }
  
  code {
    background: var(--el-fill-color-light);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 13px;
  }
  
  pre {
    background: var(--el-fill-color-light);
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 12px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  a {
    color: var(--el-color-primary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .empty-content {
    color: var(--el-text-color-placeholder);
    text-align: center;
    padding: 40px 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-toolbar {
    padding: 8px 12px;
    gap: 4px;
    
    .toolbar-left {
      gap: 4px;
    }
    
    .toolbar-right {
      gap: 4px;
    }
    
    .el-button-group {
      .el-button {
        padding: 6px 8px;
        font-size: 12px;
      }
    }
  }
  
  .markdown-textarea,
  .markdown-preview {
    padding: 12px;
    min-height: 300px;
  }
}
</style> 