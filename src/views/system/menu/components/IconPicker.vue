<template>
  <div class="icon-picker">
    <div class="icon-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索图标名称"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    
    <div class="icon-grid">
      <div 
        v-for="icon in filteredIcons" 
        :key="icon"
        class="icon-item"
        :class="{ active: currentIcon === icon }"
        @click="selectIcon(icon)"
      >
        <el-icon>
          <component :is="icon" />
        </el-icon>
        <span class="icon-name">{{ icon }}</span>
      </div>
    </div>
    
    <div class="icon-picker-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Search,
  Setting,
  User,
  Menu,
  House,
  Document,
  Folder,
  Files,
  Monitor,
  DataLine,
  PieChart,
  Tools,
  Key,
  Lock,
  Bell,
  Message,
  Phone,
  Location,
  Edit,
  Delete,
  Plus,
  Minus,
  Check,
  Close,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Refresh,
  Download,
  Upload,
  Share,
  Star,
  Calendar,
  Clock,
  Warning,
  QuestionFilled,
  InfoFilled,
  SuccessFilled,
  CircleClose
} from '@element-plus/icons-vue'

// Props
const props = defineProps<{
  currentIcon?: string
}>()

// Emits
const emit = defineEmits<{
  iconSelect: [icon: string]
  cancel: []
}>()

// 响应式数据
const searchKeyword = ref('')
const selectedIcon = ref(props.currentIcon || '')

// 常用图标列表
const iconList = [
  'Setting', 'User', 'Menu', 'House', 'Document', 'Folder', 'Files',
  'Monitor', 'DataLine', 'PieChart', 'Tools', 'Key', 'Lock', 'Bell',
  'Message', 'Phone', 'Location', 'Edit', 'Delete', 'Plus', 'Minus',
  'Check', 'Close', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
  'Refresh', 'Download', 'Upload', 'Share', 'Star', 'Calendar', 'Clock',
  'Warning', 'QuestionFilled', 'InfoFilled', 'SuccessFilled', 'CircleClose'
]

// 计算属性
const filteredIcons = computed(() => {
  if (!searchKeyword.value) {
    return iconList
  }
  return iconList.filter(icon => 
    icon.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const currentIcon = computed(() => selectedIcon.value)

// 方法
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const selectIcon = (icon: string) => {
  selectedIcon.value = icon
}

const handleConfirm = () => {
  emit('iconSelect', selectedIcon.value)
}

const handleCancel = () => {
  emit('cancel')
}

// 生命周期
onMounted(() => {
  selectedIcon.value = props.currentIcon || ''
})
</script>

<style scoped lang="scss">
.icon-picker {
  .icon-search {
    margin-bottom: 16px;
  }
  
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 16px;
    padding: 8px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: var(--el-fill-color-light);
      }
      
      &.active {
        background-color: var(--el-color-primary);
        color: white;
      }
      
      .el-icon {
        font-size: 20px;
        margin-bottom: 4px;
      }
      
      .icon-name {
        font-size: 11px;
        text-align: center;
        word-break: break-all;
      }
    }
  }
  
  .icon-picker-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style> 