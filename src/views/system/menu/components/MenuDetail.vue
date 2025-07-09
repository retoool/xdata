<template>
  <div class="menu-detail">
    <div v-if="menu" class="detail-content">
      <!-- 基本信息 -->
      <el-card shadow="never" class="detail-section">
        <template #header>
          <div class="section-title">
            <el-icon><InfoFilled /></el-icon>
            <span>基本信息</span>
          </div>
        </template>
        
        <div class="detail-item">
          <label>菜单名称：</label>
          <span>{{ menu.title }}</span>
        </div>
        
        <div class="detail-item">
          <label>菜单类型：</label>
          <el-tag :type="getMenuTypeTag(menu.type)" size="small">
            {{ getMenuTypeText(menu.type) }}
          </el-tag>
        </div>
        
        <div v-if="menu.icon" class="detail-item">
          <label>菜单图标：</label>
          <div class="icon-display">
            <el-icon>
              <component :is="menu.icon" />
            </el-icon>
            <span>{{ menu.icon }}</span>
          </div>
        </div>
        
        <div v-if="menu.name" class="detail-item">
          <label>路由名称：</label>
          <span>{{ menu.name }}</span>
        </div>
        
        <div v-if="menu.path" class="detail-item">
          <label>路由路径：</label>
          <code>{{ menu.path }}</code>
        </div>
        
        <div v-if="menu.component" class="detail-item">
          <label>组件路径：</label>
          <code>{{ menu.component }}</code>
        </div>
        
        <div v-if="menu.redirect" class="detail-item">
          <label>重定向：</label>
          <code>{{ menu.redirect }}</code>
        </div>
      </el-card>
      

      
      <!-- 显示设置 -->
      <el-card shadow="never" class="detail-section">
        <template #header>
          <div class="section-title">
            <el-icon><Setting /></el-icon>
            <span>显示设置</span>
          </div>
        </template>
        
        <div class="detail-item">
          <label>排序值：</label>
          <el-tag type="info" size="small">{{ menu.sort || 0 }}</el-tag>
        </div>
        
        <div class="detail-item">
          <label>状态：</label>
          <el-tag :type="menu.status ? 'success' : 'danger'" size="small">
            {{ menu.status ? '启用' : '禁用' }}
          </el-tag>
        </div>
        
        <div class="detail-item">
          <label>可见性：</label>
          <el-tag :type="menu.visible ? 'success' : 'warning'" size="small">
            {{ menu.visible ? '显示' : '隐藏' }}
          </el-tag>
        </div>
        
        <div v-if="menu.cache !== undefined" class="detail-item">
          <label>页面缓存：</label>
          <el-tag :type="menu.cache ? 'success' : 'info'" size="small">
            {{ menu.cache ? '启用' : '禁用' }}
          </el-tag>
        </div>
        
        <div v-if="menu.affix !== undefined" class="detail-item">
          <label>固定标签：</label>
          <el-tag :type="menu.affix ? 'success' : 'info'" size="small">
            {{ menu.affix ? '是' : '否' }}
          </el-tag>
        </div>
      </el-card>
      
      <!-- 时间信息 -->
      <el-card shadow="never" class="detail-section">
        <template #header>
          <div class="section-title">
            <el-icon><Clock /></el-icon>
            <span>时间信息</span>
          </div>
        </template>
        
        <div v-if="menu.createTime" class="detail-item">
          <label>创建时间：</label>
          <span>{{ menu.createTime }}</span>
        </div>
        
        <div v-if="menu.updateTime" class="detail-item">
          <label>更新时间：</label>
          <span>{{ menu.updateTime }}</span>
        </div>
      </el-card>
      
      <!-- 操作按钮 -->
      <div class="detail-actions">
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon>编辑
        </el-button>
        <el-button type="success" @click="handleAddChild">
          <el-icon><Plus /></el-icon>新增子菜单
        </el-button>
        <el-button 
          type="danger" 
          :disabled="menu.children && menu.children.length > 0"
          @click="handleDelete"
        >
          <el-icon><Delete /></el-icon>删除
        </el-button>
      </div>
    </div>
    
    <div v-else class="empty-state">
      <el-empty description="请选择一个菜单查看详情" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  InfoFilled,
  Setting,
  Clock,
  Edit,
  Plus,
  Delete
} from '@element-plus/icons-vue'
import type { Menu } from '@/types/system'

// Props
const props = defineProps<{
  menu: Menu | null
}>()

// Emits
const emit = defineEmits<{
  edit: [menu: Menu]
  delete: [menu: Menu]
  addChild: [menu: Menu]
}>()

// 方法
const getMenuTypeText = (type: number): string => {
  switch (type) {
    case 1: return '目录'
    case 2: return '菜单'
    case 3: return '按钮'
    default: return '未知'
  }
}

const getMenuTypeTag = (type: number) => {
  switch (type) {
    case 1: return 'warning' as const
    case 2: return 'success' as const
    case 3: return 'info' as const
    default: return 'info' as const
  }
}

const handleEdit = () => {
  if (props.menu) {
    emit('edit', props.menu)
  }
}

const handleDelete = () => {
  if (props.menu) {
    emit('delete', props.menu)
  }
}

const handleAddChild = () => {
  if (props.menu) {
    emit('addChild', props.menu)
  }
}
</script>

<style scoped lang="scss">
.menu-detail {
  height: 100%;
  
  .detail-content {
    .detail-section {
      margin-bottom: 16px;
      
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }
      
      .detail-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        label {
          width: 80px;
          color: var(--el-text-color-regular);
          font-size: 14px;
          flex-shrink: 0;
        }
        
        span, code {
          flex: 1;
          word-break: break-all;
        }
        
        code {
          background-color: var(--el-fill-color-light);
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }
        
        .icon-display {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .el-icon {
            font-size: 16px;
          }
        }
        
        .text-muted {
          color: var(--el-text-color-placeholder);
        }
      }
    }
    
    .detail-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .el-button {
        justify-content: flex-start;
        
        .el-icon {
          margin-right: 6px;
        }
      }
    }
  }
  
  .empty-state {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style> 