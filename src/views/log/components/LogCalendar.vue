<template>
  <div class="log-calendar">
    <el-calendar v-model="currentDate">
      <template #date-cell="{ data }">
        <div class="calendar-cell" @click="selectDate(data.day)">
          <span class="date-number">{{ getDayNumber(data.day) }}</span>
          <div class="log-indicator" v-if="hasLog(data.day)">
            <el-icon><Document /></el-icon>
          </div>
          <div class="mood-indicator" v-if="getMood(data.day)">
            <el-icon :class="getMoodClass(getMood(data.day))">
              <component :is="getMoodIcon(getMood(data.day))" />
            </el-icon>
          </div>
          <!-- <div class="cell-overlay" v-if="isToday(data.day)">
            <span class="today-label">今天</span>
          </div> -->
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import type { DailyLog } from '@/api/log'

// Props
interface Props {
  selectedDate: string
  logs?: DailyLog[] | null
}

const props = withDefaults(defineProps<Props>(), {
  logs: () => []
})

// Emits
const emit = defineEmits<{
  'update:selectedDate': [value: string]
  'dateChange': [value: string]
}>()

// 响应式数据
const currentDate = ref(new Date())

// 监听selectedDate变化
watch(() => props.selectedDate, (newDate) => {
  if (newDate) {
    currentDate.value = new Date(newDate)
  }
}, { immediate: true })

// 获取日期数字
const getDayNumber = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getDate().toString()
}

// 检查是否有日志 - 添加null值防护
const hasLog = (date: Date | string): boolean => {
  if (!props.logs || !Array.isArray(props.logs)) {
    return false
  }
  const dateStr = typeof date === 'string' ? date : formatDate(date)
  return props.logs.some(log => log.logDate === dateStr)
}

// 获取心情评分 - 添加null值防护
const getMood = (date: Date | string): number => {
  if (!props.logs || !Array.isArray(props.logs)) {
    return 0
  }
  const dateStr = typeof date === 'string' ? date : formatDate(date)
  const log = props.logs.find(log => log.logDate === dateStr)
  return log?.mood || 0
}

// 获取心情图标
const getMoodIcon = (mood: number): string => {
  const icons = [
    'Face',
    'Face1',
    'Face2',
    'Face3',
    'Face4',
    'Face5'
  ]
  return icons[mood] || icons[0]
}

// 获取心情样式类
const getMoodClass = (mood: number): string => {
  const classes = [
    'mood-0',
    'mood-1',
    'mood-2',
    'mood-3',
    'mood-4',
    'mood-5'
  ]
  return classes[mood] || classes[0]
}

// 格式化日期
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 检查是否为今天
const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return dateObj.toDateString() === today.toDateString()
}

// 选择日期
const selectDate = (date: Date | string) => {
  const dateStr = typeof date === 'string' ? date : formatDate(date)
  emit('update:selectedDate', dateStr)
  emit('dateChange', dateStr)
}
</script>

<style scoped>
.log-calendar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-calendar) {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  border: none;
  
  .el-calendar__header {
    padding: 0 0 16px 0;
    border: none;
    background: transparent;
    
    .el-calendar__title {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .el-calendar__button-group {
      .el-button {
        border-radius: 6px;
        font-weight: 500;
        
        &:hover {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary);
        }
      }
    }
  }
  
  .el-calendar__body {
    flex: 1;
    padding: 0;

    .el-calendar-table .el-calendar-day{
      height: 100%; 
    }

    .el-calendar-table {
      border: none;
      table-layout: fixed;
      height: 30px;
      
      .el-calendar-table__header {
        th {
          background: var(--el-fill-color-extra-light);
          border: none;
          padding: 8px 4px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          font-size: 13px;
          text-align: center;
        }
      }
      
      .el-calendar-table__body {
        td {
          border: none;
          padding: 2px;
          height: auto;
          
          .el-calendar-day {
            height: 20px; 
            min-height: 32px;
            border: none;
            background: transparent;
            
            &:hover {
              background: transparent;
            }
          }
        }
      }
    }
  }
}

.calendar-cell {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 32px;
  padding: 4px 2px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  
  &:hover {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.is-selected {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    
    .date-number {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
  
  &.is-today {
    background: var(--el-color-primary-light-8);
    border-color: var(--el-color-primary);
    
    .date-number {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }
  
  &.is-other-month {
    opacity: 0.4;
    
    .date-number {
      color: var(--el-text-color-placeholder);
    }
  }
}

.date-number {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
  transition: all 0.2s ease;
  line-height: 1;
}

.log-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: var(--el-color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 6px;
  animation: pulse 2s infinite;
  
  .el-icon {
    font-size: 6px;
  }
}

.mood-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s ease;
  
  &.mood-0 {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-placeholder);
  }
  
  &.mood-1 {
    background: var(--el-color-danger-light-8);
    color: var(--el-color-danger);
  }
  
  &.mood-2 {
    background: var(--el-color-warning-light-8);
    color: var(--el-color-warning);
  }
  
  &.mood-3 {
    background: var(--el-color-info-light-8);
    color: var(--el-color-info);
  }
  
  &.mood-4 {
    background: var(--el-color-success-light-8);
    color: var(--el-color-success);
  }
  
  &.mood-5 {
    background: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
  }
}

.cell-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.today-label {
  background: var(--el-color-primary);
  color: white;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calendar-cell {
    min-height: 28px;
    padding: 3px 1px;
    
    .date-number {
      font-size: 12px;
    }
  }
  
  .log-indicator {
    width: 10px;
    height: 10px;
    top: 1px;
    right: 1px;
    
    .el-icon {
      font-size: 5px;
    }
  }
  
  .mood-indicator {
    width: 14px;
    height: 14px;
    bottom: 1px;
    right: 1px;
    font-size: 8px;
  }
  
  .today-label {
    font-size: 7px;
    padding: 1px 4px;
  }
}

@media (max-width: 480px) {
  :deep(.el-calendar) {
    .el-calendar__header {
      padding: 0 0 12px 0;
      
      .el-calendar__title {
        font-size: 16px;
      }
    }
    
    .el-calendar-table {
      .el-calendar-table__header {
        th {
          padding: 6px 2px;
          font-size: 12px;
        }
      }
      
      .el-calendar-table__body {
        td {
          padding: 1px;
          
          .el-calendar-day {
            min-height: 24px;
          }
        }
      }
    }
  }
  
  .calendar-cell {
    min-height: 24px;
    padding: 2px 1px;
    
    .date-number {
      font-size: 11px;
    }
  }
  
  .log-indicator {
    width: 8px;
    height: 8px;
    
    .el-icon {
      font-size: 4px;
    }
  }
  
  .mood-indicator {
    width: 12px;
    height: 12px;
    font-size: 7px;
  }
  
  .today-label {
    font-size: 6px;
    padding: 1px 3px;
  }
}
</style> 