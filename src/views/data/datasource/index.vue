<template>
  <div class="datasource-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">数据源管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            新增数据源
          </el-button>
        </div>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :model="searchForm" inline>
          <el-form-item label="数据源名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入数据源名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="数据源类型">
            <el-select
              v-model="searchForm.type"
              placeholder="请选择数据源类型"
              clearable
              style="width: 150px"
            >
              <el-option label="MySQL" value="mysql" />
              <el-option label="PostgreSQL" value="postgresql" />
              <el-option label="Oracle" value="oracle" />
              <el-option label="SQL Server" value="sqlserver" />
              <el-option label="MongoDB" value="mongodb" />
              <el-option label="Redis" value="redis" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading"
        empty-text="暂无数据"
      >
        <el-table-column prop="name" label="数据源名称" width="200" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="host" label="主机地址" width="180" />
        <el-table-column prop="port" label="端口" width="80" />
        <el-table-column prop="database" label="数据库" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'connected' ? 'success' : 'danger'">
              {{ row.status === 'connected' ? '已连接' : '未连接' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="Connection"
              @click="handleTest(row)"
            >
              测试连接
            </el-button>
            <el-button
              type="success"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Edit, Delete, Connection } from '@element-plus/icons-vue'

defineOptions({
  name: "DataSource"
})

// 搜索表单
const searchForm = reactive({
  name: '',
  type: ''
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: 'MySQL主库',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'xdata',
    status: 'connected',
    createTime: '2024-01-20 10:30:00'
  },
  {
    id: 2,
    name: 'Redis缓存',
    type: 'redis',
    host: '192.168.1.100',
    port: 6379,
    database: 'cache',
    status: 'connected',
    createTime: '2024-01-19 15:20:00'
  },
  {
    id: 3,
    name: 'PostgreSQL数据仓库',
    type: 'postgresql',
    host: '192.168.1.101',
    port: 5432,
    database: 'warehouse',
    status: 'disconnected',
    createTime: '2024-01-18 09:15:00'
  }
])

// 加载状态
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 3
})

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colorMap = {
    mysql: 'primary',
    postgresql: 'success',
    oracle: 'warning',
    sqlserver: 'info',
    mongodb: 'danger',
    redis: ''
  }
  return colorMap[type] || ''
}

// 搜索
const handleSearch = () => {
  console.log('搜索数据源:', searchForm)
  // TODO: 实现搜索逻辑
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.type = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  console.log('新增数据源')
  ElMessage.info('新增数据源功能开发中...')
  // TODO: 打开新增对话框
}

// 编辑
const handleEdit = (row: any) => {
  console.log('编辑数据源:', row)
  ElMessage.info('编辑数据源功能开发中...')
  // TODO: 打开编辑对话框
}

// 测试连接
const handleTest = async (row: any) => {
  console.log('测试连接:', row)
  loading.value = true
  try {
    // 模拟测试连接
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('连接测试成功！')
  } catch (error) {
    ElMessage.error('连接测试失败！')
  } finally {
    loading.value = false
  }
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除数据源"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    console.log('删除数据源:', row)
    ElMessage.success('删除成功！')
    // TODO: 实现删除逻辑
  } catch (error) {
    // 用户取消删除
  }
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.size = size
  handleSearch()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.page = page
  handleSearch()
}

// 初始化
onMounted(() => {
  console.log('数据源管理页面已加载')
})
</script>

<style scoped>
.datasource-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.search-area {
  margin-bottom: 20px;
  padding: 20px;
  background-color: var(--el-bg-color-page);
  border-radius: 6px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 