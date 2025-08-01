<template>
  <div class="page-container">
    <div class="content-area">
      <!-- 左侧日历 -->
      <div class="sidebar">
        <div class="tree-container">
          <LogCalendar 
            v-model:selected-date="selectedDate"
            :logs="monthlyLogs"
            @date-change="handleDateChange"
          />
        </div>
        <div class="sidebar-footer">
          <div class="stats-info">
            <div class="stat-item">
              <el-icon><Document /></el-icon>
              <span class="stat-label">本月工作日志</span>
              <span class="stat-value">{{ monthlyLogs.length }}</span>
            </div>
            <div class="stat-item">
              <el-icon><Timer /></el-icon>
              <span class="stat-label">连续天数</span>
              <span class="stat-value">{{ consecutiveDays }}</span>
            </div>
            <div class="stat-item">
              <el-icon><TrendCharts /></el-icon>
              <span class="stat-label">本月进度</span>
              <span class="stat-value">{{ monthlyProgress }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧编辑器 -->
      <div class="content-main">
        <div class="table-container">
          <LogEditor 
            v-model:log="currentLog"
            :loading="loading"
            @save="handleSave"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Refresh, 
  Calendar, 
  Document, 
  Timer, 
  TrendCharts
} from '@element-plus/icons-vue'
import { logApi, type DailyLog } from '@/api/log'
import LogCalendar from './components/LogCalendar.vue'
import LogEditor from './components/LogEditor.vue'

// 响应式数据
const selectedDate = ref(formatDate(new Date()))
const currentLog = ref<DailyLog>({
  userId: 0,
  logDate: selectedDate.value,
  content: '',
  mood: 0,
  weather: '',
  tags: '',
  isPublic: false
})
const monthlyLogs = ref<DailyLog[]>([])
const loading = ref(false)
const refreshing = ref(false)

// 计算属性
const consecutiveDays = computed(() => {
  // 计算连续天数逻辑
  return 0
})

const monthlyProgress = computed(() => {
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  return Math.round((today.getDate() / daysInMonth) * 100)
})

// 格式化日期
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 跳转到今天
const goToToday = () => {
  selectedDate.value = formatDate(new Date())
  loadLogByDate(selectedDate.value)
}

// 处理日期变化
const handleDateChange = (date: string) => {
  selectedDate.value = date
  loadLogByDate(date)
}

// 加载指定日期的日志
const loadLogByDate = async (date: string) => {
  loading.value = true
  try {
    const log = await logApi.getLogByDate(date)
    if (log && log.content) {
      currentLog.value = { ...log, userId: log.userId || 0 }
    } else {
      // 如果没有日志，创建新的空日志
      currentLog.value = {
        userId: 0,
        logDate: date,
        content: '',
        mood: 0,
        weather: '',
        tags: '',
        isPublic: false
      }
    }
  } catch (error) {
    console.error('加载日志失败:', error)
    ElMessage.error('加载日志失败')
    // 创建新的空日志
    currentLog.value = {
      userId: 0,
      logDate: date,
      content: '',
      mood: 0,
      weather: '',
      tags: '',
      isPublic: false
    }
  } finally {
    loading.value = false
  }
}

// 保存日志
const handleSave = async (log: DailyLog) => {
  loading.value = true
  try {
    let savedLog
    if (log.id) {
      // 更新现有日志
      savedLog = await logApi.updateLog(log.id, log)
    } else {
      // 创建新日志
      savedLog = await logApi.createLog(log)
    }
    
    ElMessage.success('保存成功')
    // 更新当前日志的ID
    if (savedLog && savedLog.id) {
      currentLog.value.id = savedLog.id
    }
    // 重新加载月度日志
    loadMonthlyLogs()
  } catch (error) {
    console.error('保存日志失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 删除日志
const handleDelete = async (log: DailyLog) => {
  if (!log.id) {
    ElMessage.warning('没有可删除的日志')
    return
  }
  
  loading.value = true
  try {
    await logApi.deleteLog(log.id)
    ElMessage.success('删除成功')
    // 清空当前日志
    currentLog.value = {
      userId: 0,
      logDate: selectedDate.value,
      content: '',
      mood: 0,
      weather: '',
      tags: '',
      isPublic: false
    }
    // 重新加载月度日志
    loadMonthlyLogs()
  } catch (error) {
    console.error('删除日志失败:', error)
    ElMessage.error('删除失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  refreshing.value = true
  try {
    await Promise.all([
      loadLogByDate(selectedDate.value),
      loadMonthlyLogs()
    ])
    ElMessage.success('刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 加载月度日志
const loadMonthlyLogs = async () => {
  try {
    const year = new Date(selectedDate.value).getFullYear()
    const month = new Date(selectedDate.value).getMonth() + 1
    const logs = await logApi.getLogsByMonth(year, month)
    monthlyLogs.value = Array.isArray(logs) ? logs : []
  } catch (error) {
    console.error('加载月度日志失败:', error)
    monthlyLogs.value = []
  }
}

// 组件挂载
onMounted(() => {
  loadLogByDate(selectedDate.value)
  loadMonthlyLogs()
})

// 监听日期变化
watch(selectedDate, (newDate) => {
  loadLogByDate(newDate)
})
</script>

<style scoped>
.page-container {
  height: 100%;
  padding: 12px;
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: var(--el-border-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .page-title {
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 24px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        color: var(--el-color-primary);
        font-size: 24px;
      }
    }

    .page-subtitle {
      color: var(--el-text-color-secondary);
      font-size: 14px;
      font-weight: 400;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.content-area {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  gap: 16px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 0;
}

.sidebar {
  position: relative;
  width: 330px;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  overflow: visible;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  
  &:hover {
    border-color: var(--el-border-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: var(--el-border-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    h3 {
      margin: 0;
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
    }

    .calendar-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.tree-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 16px 24px;
}

.sidebar-footer {
  margin-top: 8px;
  padding: 20px 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);
  flex-shrink: 0;
  border-radius: 0 0 12px 12px;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  border: 1px solid var(--el-border-color-lighter);
  
  &:hover {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .el-icon {
    color: var(--el-color-primary);
    font-size: 16px;
  }
}

.stat-label {
  color: var(--el-text-color-regular);
  font-weight: 500;
  flex: 1;
}

.stat-value {
  color: var(--el-text-color-primary);
  font-weight: 600;
  font-size: 16px;
}



.content-main {
  flex: 1;
  height: 100%;
  background: var(--el-bg-color);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  
  &:hover {
    border-color: var(--el-border-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      border-color: var(--el-border-color);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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

    .main-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.table-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--el-fill-color-extra-light);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  span {
    color: var(--el-text-color-regular);
    font-size: 14px;
  }
}

kbd {
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  color: var(--el-text-color-primary);
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .sidebar {
    width: 300px;
  }
}

@media (max-width: 1200px) {
  .content-area {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: 350px;
  }
  
  .content-main {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 12px;
  }
  
  .content-area {
    gap: 12px;
  }
  
  .sidebar {
    height: 300px;
  }
  
  .page-header {
    padding: 16px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .header-left {
      .page-title {
        font-size: 20px;
      }
      .page-subtitle {
        font-size: 13px;
      }
    }

    .header-right {
      width: 100%;
      justify-content: space-between;
    }
  }
  
  .sidebar-header {
    padding: 16px 20px;
    
    .header-left h3 {
      font-size: 16px;
    }
  }
  
  .tree-container {
    padding: 12px 20px;
  }
  
  .sidebar-footer {
    padding: 16px 20px;
  }
  
  .stat-item {
    padding: 10px 14px;
    font-size: 13px;
    
    .el-icon {
      font-size: 14px;
    }
  }
  
  .stat-value {
    font-size: 14px;
  }
  

}

@media (max-width: 480px) {
  .page-container {
    padding: 8px;
  }
  

  
  .sidebar-header {
    padding: 12px 16px;
    
    .header-left h3 {
      font-size: 14px;
    }
  }
  
  .stat-item {
    padding: 8px 12px;
    font-size: 12px;
  }
  

}
</style> 