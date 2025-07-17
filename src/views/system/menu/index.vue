<template>
  <div class="menu-management">
    <el-container>
      <el-main class="page-content">
        <MenuTable ref="menuTableRef" @menu-select="handleMenuSelect" />
      </el-main>
    </el-container>
    
    <!-- 菜单表单对话框 -->
    <el-dialog
      v-model="showMenuForm"
      :title="getFormTitle()"
      width="800px"
      :close-on-click-modal="false"
      @close="handleFormClose"
    >
      <MenuForm
        ref="menuFormRef"
        :form-data="menuFormData"
        :form-mode="menuFormMode"
        :parent-menu="currentParentMenu"
        @submit="handleMenuFormSubmit"
        @cancel="handleFormCancel"
      />
    </el-dialog>
    
    <!-- 图标选择对话框 -->
    <el-dialog
      v-model="showIconPicker"
      title="选择图标"
      width="600px"
      @close="handleIconPickerClose"
    >
      <IconPicker
        v-if="showIconPicker"
        :current-icon="currentIcon"
        @icon-select="handleIconSelect"
        @cancel="handleIconPickerCancel"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, provide } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Menu as MenuIcon } from '@element-plus/icons-vue'
import type { Menu, MenuFormData, FormMode } from '@/types/system'
import { useSystemStore } from '@/store/modules/system'
import MenuTable from './MenuTable.vue'
import MenuForm from './components/MenuForm.vue'
import IconPicker from './components/IconPicker.vue'

// Store
const systemStore = useSystemStore()

// 组件引用
const menuTableRef = ref()
const menuFormRef = ref()

// 响应式数据
const showMenuForm = ref(false)
const showIconPicker = ref(false)
const menuFormMode = ref<FormMode>('create')
const currentSelectedMenu = ref<Menu | null>(null)
const currentParentMenu = ref<Menu | null>(null)
const currentIcon = ref('')

const menuFormData = ref<Partial<MenuFormData>>({
  title: '',
  name: '',
  path: '',
  component: '',
  icon: '',
  type: 2,
  parentId: null,
  sort: 0,
  permission: '',
  status: 1,
  visible: true,
  cache: false,
  affix: false,
  redirect: '',
  alwaysShow: false,
  isFrame: false
})

// 计算属性和方法
const getFormTitle = () => {
  const modeTexts = {
    create: '新增菜单',
    edit: '编辑菜单',
    copy: '复制菜单'
  }
  return modeTexts[menuFormMode.value] || '菜单管理'
}

const handleMenuSelect = (menu: Menu | null) => {
  currentSelectedMenu.value = menu
  systemStore.setSelectedMenu(menu)
}

const handleAddMenu = (parentMenu?: Menu) => {
  menuFormMode.value = 'create'
  currentParentMenu.value = parentMenu || null
  
  // 计算默认排序值
  const defaultSort = parentMenu?.children?.length 
    ? Math.max(...parentMenu.children.map(item => item.sort || 0)) + 1
    : 0
  
  menuFormData.value = {
    title: '',
    name: '',
    path: '',
    component: '',
    icon: '',
    type: parentMenu ? 2 : 1, // 有父级默认为菜单，否则为目录
    parentId: parentMenu?.id || null,
    sort: defaultSort,
    permission: '',
    status: 1,
    visible: true,
    cache: false,
    affix: false,
    redirect: '',
    alwaysShow: false,
    isFrame: false
  }
  
  showMenuForm.value = true
}

const handleEditMenu = (menu: Menu) => {
  menuFormMode.value = 'edit'
  currentParentMenu.value = null
  menuFormData.value = { 
    ...menu,
    parentId: menu.parentId || 0, // 确保第一级菜单的parentId为0
    isFrame: menu.isFrame ?? false
  }
  showMenuForm.value = true
}

const handleCopyMenu = (menu: Menu) => {
  menuFormMode.value = 'copy'
  currentParentMenu.value = null
  menuFormData.value = {
    ...menu,
    id: undefined,
    title: `${menu.title}_副本`,
    name: menu.name ? `${menu.name}_copy` : '',
    path: menu.path ? `${menu.path}_copy` : '',
    permission: menu.permission ? `${menu.permission}:copy` : '',
    isFrame: menu.isFrame ?? false
  }
  showMenuForm.value = true
}

const handleDeleteMenu = async (menu: Menu) => {
  // 检查是否有子菜单
  if (menu.children && menu.children.length > 0) {
    ElMessage.warning('请先删除子菜单')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认删除菜单 "${menu.title}" 吗？删除后不可恢复！`,
      '警告',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    
    // 调用删除API
    await menuTableRef.value?.deleteMenu(menu.id)
    ElMessage.success('删除成功')
    
    // 刷新菜单列表
    await refreshMenuTable()
    
    // 如果删除的是当前选中的菜单，清空选中状态
    if (currentSelectedMenu.value?.id === menu.id) {
      handleMenuSelect(null)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleMenuFormSubmit = async (formData: MenuFormData) => {
  try {
    if (menuFormMode.value === 'create') {
      await menuTableRef.value?.createMenu(formData)
      ElMessage.success('新增成功')
    } else if (menuFormMode.value === 'edit') {
      await menuTableRef.value?.updateMenu(formData.id!, formData)
      ElMessage.success('编辑成功')
    } else if (menuFormMode.value === 'copy') {
      await menuTableRef.value?.createMenu(formData)
      ElMessage.success('复制成功')
    }
    
    showMenuForm.value = false
    await refreshMenuTable()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleFormCancel = () => {
  showMenuForm.value = false
}

const handleFormClose = () => {
  if (menuFormRef.value) {
    menuFormRef.value.resetForm()
  }
}

const handleIconSelect = async (icon: string) => {
  if (menuFormRef.value) {
    await menuFormRef.value.setIcon(icon)
  }
  showIconPicker.value = false
}

const handleIconPickerCancel = () => {
  showIconPicker.value = false
}

const handleIconPickerClose = () => {
  currentIcon.value = ''
}

const refreshMenuTable = async () => {
  if (menuTableRef.value) {
    await menuTableRef.value.refreshTable()
  }
}

const showIconSelector = (currentIconValue: string = '') => {
  currentIcon.value = currentIconValue
  showIconPicker.value = true
}

// 生命周期
onMounted(() => {
  // 初始化时清空选中状态
  handleMenuSelect(null)
})

// 暴露给子组件的方法
const menuManagementMethods = {
  handleAddMenu,
  handleEditMenu,
  handleCopyMenu,
  handleDeleteMenu,
  showIconSelector
}

// 向菜单表格组件提供方法
provide('menuManagement', menuManagementMethods)
</script>

<style scoped lang="scss">
.menu-management {
  height: 100%;
  background: var(--el-bg-color-page);
  
  .el-container {
    height: 100%;
  }
  
  .page-content {
    padding: 0;
    overflow: hidden;
  }
}

// 对话框样式优化
:deep(.el-dialog) {
  .el-dialog__header {
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding: 16px 20px 12px;
    
    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .el-dialog__body {
    padding: 20px;
  }
}

// 全局动画
.el-dialog-fade-enter-active,
.el-dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.el-dialog-fade-enter-from,
.el-dialog-fade-leave-to {
  opacity: 0;
}
</style> 