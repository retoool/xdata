<template>
  <div class="menu-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="right"
    >
      <!-- 基本信息 -->
      <el-card shadow="never" class="form-section">
        <template #header>
          <div class="section-title">
            <el-icon><InfoFilled /></el-icon>
            <span>基本信息</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="formData.type" @change="handleTypeChange">
                <el-radio :value="1">
                  <el-tag type="warning" size="small">目录</el-tag>
                  <span style="margin-left: 8px;">目录级别</span>
                </el-radio>
                <el-radio :value="2">
                  <el-tag type="success" size="small">菜单</el-tag>
                  <span style="margin-left: 8px;">页面级别</span>
                </el-radio>
                <el-radio :value="3">
                  <el-tag type="info" size="small">按钮</el-tag>
                  <span style="margin-left: 8px;">权限级别</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select
                v-model="formData.parentId"
                :data="parentMenuOptions"
                :props="treeSelectProps"
                placeholder="选择上级菜单"
                clearable
                check-strictly
                :render-after-expand="false"
                style="width: 100%"
              >
                <template #default="{ data }">
                  <div class="tree-node">
                    <el-icon v-if="data.icon">
                      <component :is="data.icon" />
                    </el-icon>
                    <span>{{ data.title }}</span>
                    <el-tag 
                      v-if="data.type"
                      :type="getMenuTypeTagType(data.type)" 
                      size="small" 
                      style="margin-left: 8px;"
                    >
                      {{ getMenuTypeText(data.type) }}
                    </el-tag>
                  </div>
                </template>
              </el-tree-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="title">
              <el-input
                v-model="formData.title"
                placeholder="请输入菜单名称"
                maxlength="50"
                show-word-limit
                clearable
                @input="handleTitleChange"
              >
                <template #prefix>
                  <el-icon><MenuIcon /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item 
              v-if="formData.type !== 3" 
              label="菜单图标" 
              prop="icon"
            >
              <div class="icon-selector">
                <el-input
                  v-model="formData.icon"
                  placeholder="选择或输入图标"
                  readonly
                  style="flex: 1"
                >
                  <template #prefix>
                    <el-icon v-if="formData.icon">
                      <component :is="formData.icon" />
                    </el-icon>
                    <el-icon v-else>
                      <Picture />
                    </el-icon>
                  </template>
                </el-input>
                <el-button @click="showIconSelector">选择图标</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="排序号" prop="sort">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            :max="9999"
            placeholder="排序号"
            style="width: 200px"
          />
          <div class="form-tip">数字越小越靠前</div>
        </el-form-item>
      </el-card>
      
      <!-- 路由信息 -->
      <el-card v-if="formData.type !== 3" shadow="never" class="form-section">
        <template #header>
          <div class="section-title">
            <el-icon><Link /></el-icon>
            <span>路由信息</span>
            <el-button 
              v-if="canPreviewRoute"
              type="primary" 
              size="small" 
              style="margin-left: auto;"
              @click="previewRoute"
            >
              <el-icon><View /></el-icon>
              预览路由
            </el-button>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路由地址" prop="path">
              <el-input
                v-model="formData.path"
                placeholder="请输入路由地址"
                maxlength="200"
                clearable
                @input="handlePathChange"
              >
                <template #prefix>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>
              <div class="form-tip">
                访问的路由地址，如：/user，外链时以http(s)://开头
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item 
              v-if="formData.type === 2" 
              label="路由名称" 
              prop="name"
            >
              <el-input
                v-model="formData.name"
                placeholder="请输入路由名称"
                maxlength="50"
                clearable
              >
                <template #prefix>
                  <el-icon><Document /></el-icon>
                </template>
                <template #suffix>
                  <el-button 
                    v-if="formData.path"
                    type="primary" 
                    size="small" 
                    text
                    @click="generateRouteName"
                  >
                    自动生成
                  </el-button>
                </template>
              </el-input>
              <div class="form-tip">
                路由名称，需要唯一，用于缓存和权限控制
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item 
          v-if="formData.type === 2" 
          label="组件路径" 
          prop="component"
        >
          <el-autocomplete
            v-model="formData.component"
            :fetch-suggestions="searchComponents"
            placeholder="请输入或选择组件路径"
            maxlength="200"
            clearable
            style="width: 100%"
            @select="handleComponentSelect"
          >
            <template #prefix>
              <el-icon><Files /></el-icon>
            </template>
            <template #suffix>
              <div class="component-actions">
                <el-button 
                  v-if="formData.path || formData.name"
                  type="primary" 
                  size="small" 
                  text
                  @click="suggestComponent"
                >
                  智能建议
                </el-button>
                <el-popover 
                  v-if="formData.component"
                  trigger="hover"
                  :content="componentValidationMessage"
                >
                  <template #reference>
                    <el-icon 
                      :class="[
                        'component-status',
                        isComponentValid ? 'valid' : 'invalid'
                      ]"
                    >
                      <Check v-if="isComponentValid" />
                      <Close v-else />
                    </el-icon>
                  </template>
                </el-popover>
              </div>
            </template>
            <template #default="{ item }">
              <div class="component-suggestion">
                <span class="path">{{ item.value }}</span>
                <el-tag v-if="item.exists" type="success" size="small">存在</el-tag>
                <el-tag v-else type="warning" size="small">建议</el-tag>
              </div>
            </template>
          </el-autocomplete>
          <div class="form-tip">
            组件路径，如：@/views/user/index
          </div>
        </el-form-item>
        
        <el-form-item 
          v-if="formData.type === 1" 
          label="重定向地址" 
          prop="redirect"
        >
          <el-input
            v-model="formData.redirect"
            placeholder="请输入重定向地址"
            maxlength="200"
            clearable
          >
            <template #prefix>
              <el-icon><Position /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">
            设置该路由在侧边栏和面包屑中点击的跳转地址
          </div>
        </el-form-item>
        
        <!-- 路由验证结果 -->
        <el-alert
          v-if="routeValidation && !routeValidation.valid"
          type="error"
          :closable="false"
          show-icon
        >
          <template #title>
            路由配置验证失败
          </template>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li v-for="error in routeValidation.errors" :key="error">{{ error }}</li>
          </ul>
        </el-alert>
      </el-card>
      

      
      <!-- 显示设置 -->
      <el-card shadow="never" class="form-section">
        <template #header>
          <div class="section-title">
            <el-icon><Setting /></el-icon>
            <span>显示设置</span>
          </div>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :value="1">
                  <el-tag type="success" size="small">启用</el-tag>
                  <span style="margin-left: 8px;">正常使用</span>
                </el-radio>
                <el-radio :value="0">
                  <el-tag type="danger" size="small">禁用</el-tag>
                  <span style="margin-left: 8px;">停用菜单</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-if="formData.type !== 3" :span="12">
            <el-form-item label="显示状态" prop="visible">
              <el-radio-group v-model="formData.visible">
                <el-radio :value="true">
                  <el-tag type="success" size="small">显示</el-tag>
                  <span style="margin-left: 8px;">在菜单中显示</span>
                </el-radio>
                <el-radio :value="false">
                  <el-tag type="warning" size="small">隐藏</el-tag>
                  <span style="margin-left: 8px;">在菜单中隐藏</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row v-if="formData.type === 2" :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否缓存" prop="cache">
              <el-radio-group v-model="formData.cache">
                <el-radio :value="true">
                  <el-tag type="success" size="small">缓存</el-tag>
                  <span style="margin-left: 8px;">缓存该页面</span>
                </el-radio>
                <el-radio :value="false">
                  <el-tag type="info" size="small">不缓存</el-tag>
                  <span style="margin-left: 8px;">不缓存该页面</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="固定标签" prop="affix">
              <el-radio-group v-model="formData.affix">
                <el-radio :value="true">
                  <el-tag type="warning" size="small">固定</el-tag>
                  <span style="margin-left: 8px;">固定在标签栏</span>
                </el-radio>
                <el-radio :value="false">
                  <el-tag type="info" size="small">不固定</el-tag>
                  <span style="margin-left: 8px;">可关闭标签</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item v-if="formData.type === 1" label="总是显示" prop="alwaysShow">
          <el-radio-group v-model="formData.alwaysShow">
            <el-radio :value="true">
              <el-tag type="warning" size="small">是</el-tag>
              <span style="margin-left: 8px;">总是显示根菜单</span>
            </el-radio>
            <el-radio :value="false">
              <el-tag type="info" size="small">否</el-tag>
              <span style="margin-left: 8px;">当只有一个子菜单时隐藏父菜单</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-card>
    </el-form>
    
    <!-- 表单底部操作 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ getSubmitButtonText() }}
      </el-button>
    </div>
    
    <!-- 路由预览对话框 -->
    <el-dialog
      v-model="showRoutePreview"
      title="路由配置预览"
      width="800px"
    >
      <RoutePreview
        v-if="showRoutePreview"
        :menu="formData"
        @test-route="testRoute"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, inject } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Menu, MenuFormData, FormMode } from '@/types/system'
import { 
  InfoFilled, 
  Menu as MenuIcon, 
  Picture, 
  Link, 
  Document, 
  Files, 
  Position, 
  Setting,
  View,
  Check,
  Close
} from '@element-plus/icons-vue'
import { getMenuTree, checkMenuName, checkMenuPath } from '@/api/system/menu'
import { RouteManager } from '@/utils/routeManager'
import RoutePreview from './RoutePreview.vue'

// Props
const props = defineProps<{
  formData: Partial<MenuFormData>
  formMode: FormMode
  parentMenu?: Menu | null
}>()

// Emits
const emit = defineEmits<{
  submit: [data: MenuFormData]
  cancel: []
}>()

// 注入父组件方法
const menuManagement = inject<any>('menuManagement')

// 响应式数据
const formRef = ref<FormInstance>()
const submitting = ref(false)
const parentMenuOptions = ref<Menu[]>([])
const availableComponents = ref<string[]>([])
const showRoutePreview = ref(false)
const routeValidation = ref<{ valid: boolean; errors: string[] } | null>(null)

const formData = reactive<MenuFormData>({
  id: undefined,
  title: '',
  name: '',
  path: '',
  component: '',
  icon: '',
  type: 2,
  parentId: null,
  sort: 0,
  status: 1,
  isHidden: false,
  isKeepAlive: false,
  isAffix: false,
  visible: true,
  cache: false,
  affix: false,
  redirect: '',
  alwaysShow: false
})

const treeSelectProps = {
  value: 'id',
  label: 'title',
  children: 'children'
}

// 计算属性
const getSubmitButtonText = () => {
  if (props.formMode === 'create') return '创建菜单'
  if (props.formMode === 'edit') return '更新菜单'
  if (props.formMode === 'copy') return '复制菜单'
  return '提交'
}

const canPreviewRoute = computed(() => {
  return formData.type !== 3 && formData.path && formData.title
})

const isComponentValid = computed(() => {
  if (!formData.component || formData.type !== 2) return true
  return RouteManager.validateComponentPath(formData.component)
})

const componentValidationMessage = computed(() => {
  if (!formData.component) return ''
  return isComponentValid.value ? '组件路径有效' : '组件路径不存在'
})

// 表单验证规则
const formRules: FormRules<MenuFormData> = {
  title: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 50, message: '菜单名称长度为2-50个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        
        checkMenuName(
          value, 
          formData.parentId,
          props.formMode === 'edit' ? formData.id : undefined
        )
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error('同一级别下菜单名称不能重复'))
            } else {
              callback()
            }
          })
          .catch(() => {
            callback(new Error('菜单名称验证失败'))
          })
      },
      trigger: 'blur'
    }
  ],
  type: [
    { required: true, message: '请选择菜单类型', trigger: 'change' }
  ],
  path: [
    {
      validator: (rule, value, callback) => {
        if (formData.type === 3) return callback() // 按钮类型不需要路径
        if (!value) {
          callback(new Error('请输入路由地址'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    {
      validator: async (rule, value, callback) => {
        if (!value || formData.type === 3) return callback()
        
        try {
          const isAvailable = await checkMenuPath(
            value,
            props.formMode === 'edit' ? formData.id : undefined
          )
          if (!isAvailable) {
            callback(new Error('路由地址已存在'))
          } else {
            callback()
          }
        } catch {
          callback(new Error('路由地址验证失败'))
        }
      },
      trigger: 'blur'
    }
  ],
  name: [
    {
      validator: (rule, value, callback) => {
        if (formData.type === 2 && !value) {
          callback(new Error('请输入路由名称'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9]*$/,
      message: '路由名称只能包含字母和数字，且以字母开头',
      trigger: 'blur'
    }
  ],
  component: [
    {
      validator: (rule, value, callback) => {
        if (formData.type === 2 && !value) {
          callback(new Error('请输入组件路径'))
        } else if (value && !RouteManager.validateComponentPath(value)) {
          callback(new Error('组件路径不存在'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择菜单状态', trigger: 'change' }
  ]
}

// 方法
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 路由验证
    const validation = RouteManager.validateMenuRoute(formData)
    if (!validation.valid) {
      routeValidation.value = validation
      ElMessage.error('路由配置验证失败，请检查并修正')
      return
    }
    
    submitting.value = true
    emit('submit', formData)
  } catch (error) {
    ElMessage.error('请检查表单数据')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleTypeChange = (type: number) => {
  // 根据类型调整表单字段
  if (type === 1) { // 目录
    formData.component = ''
    formData.cache = false
    formData.affix = false
  } else if (type === 3) { // 按钮
    formData.path = ''
    formData.name = ''
    formData.component = ''
    formData.icon = ''
    formData.redirect = ''
    formData.visible = true // 按钮总是隐藏
    formData.cache = false
    formData.affix = false
    formData.alwaysShow = false
  }
  
  // 清除路由验证结果
  routeValidation.value = null
}

const handleTitleChange = () => {
  // 自动生成路由名称
  if (formData.title && !formData.name && formData.type === 2) {
    generateRouteName()
  }
}

const handlePathChange = () => {
  // 路径变化时清除路由验证结果
  routeValidation.value = null
  
  // 自动建议组件路径
  if (formData.path && formData.type === 2 && !formData.component) {
    suggestComponent()
  }
}

const generateRouteName = () => {
  if (formData.path) {
    const name = formData.path
      .split('/')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    formData.name = name
  }
}



const searchComponents = (queryString: string, cb: Function) => {
  const suggestions = availableComponents.value
    .filter(component => component.toLowerCase().includes(queryString.toLowerCase()))
    .map(component => ({
      value: component,
      exists: true
    }))
  
  // 添加智能建议
  if (formData.path || formData.name) {
    const smartSuggestions = RouteManager.suggestComponentPath(formData.path, formData.name)
      .filter(suggestion => !suggestions.some(s => s.value === suggestion))
      .map(suggestion => ({
        value: suggestion,
        exists: false
      }))
    
    suggestions.push(...smartSuggestions)
  }
  
  cb(suggestions.slice(0, 10)) // 限制显示数量
}

const handleComponentSelect = (item: { value: string }) => {
  formData.component = item.value
}

const suggestComponent = () => {
  const suggestions = RouteManager.suggestComponentPath(formData.path, formData.name)
  if (suggestions.length > 0) {
    formData.component = suggestions[0]
  }
}

const previewRoute = () => {
  showRoutePreview.value = true
}

const testRoute = (path: string) => {
  // 在新窗口中测试路由
  const url = `${window.location.origin}/#${path}`
  window.open(url, '_blank')
}

const showIconSelector = () => {
  if (menuManagement) {
    menuManagement.showIconSelector(formData.icon)
  }
}

const setIcon = (icon: string) => {
  formData.icon = icon
}

const getMenuTypeText = (type: number): string => {
  switch (type) {
    case 1: return '目录'
    case 2: return '菜单'
    case 3: return '按钮'
    default: return '未知'
  }
}

const getMenuTypeTagType = (type: number) => {
  switch (type) {
    case 1: return 'warning' as const
    case 2: return 'success' as const
    case 3: return 'info' as const
    default: return 'info' as const
  }
}

const loadParentMenuOptions = async () => {
  try {
    const menuTree = await getMenuTree()
    
    // 构建父菜单选项，排除按钮类型和当前编辑的菜单及其子菜单
    const buildOptions = (menus: Menu[], level = 0): Menu[] => {
      const options: Menu[] = []
      
      menus.forEach(menu => {
        // 排除按钮类型菜单
        if (menu.type === 3) return
        
        // 排除当前编辑的菜单及其子菜单
        if (props.formMode === 'edit' && formData.id) {
          if (menu.id === formData.id || isDescendant(menu, formData.id)) {
            return
          }
        }
        
        options.push({
          ...menu,
          disabled: level >= 2 // 最多支持3级菜单
        })
        
        if (menu.children && menu.children.length > 0) {
          const childOptions = buildOptions(menu.children, level + 1)
          options.push(...childOptions)
        }
      })
      
      return options
    }
    
    parentMenuOptions.value = buildOptions(menuTree)
  } catch (error) {
    ElMessage.error('加载父菜单选项失败')
  }
}

const isDescendant = (menu: Menu, targetId: number): boolean => {
  if (!menu.children) return false
  
  return menu.children.some(child => 
    child.id === targetId || isDescendant(child, targetId)
  )
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  routeValidation.value = null
}

// 监听props变化，更新表单数据
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      id: newData.id,
      title: newData.title || '',
      name: newData.name || '',
      path: newData.path || '',
      component: newData.component || '',
      icon: newData.icon || '',
      type: newData.type ?? 2,
      parentId: newData.parentId || props.parentMenu?.id || null,
      sort: newData.sort ?? 0,
      status: newData.status ?? 1,
      visible: newData.visible ?? true,
      cache: newData.cache ?? false,
      affix: newData.affix ?? false,
      redirect: newData.redirect || '',
      alwaysShow: newData.alwaysShow ?? false
    })
  }
}, { immediate: true, deep: true })

// 监听父菜单变化
watch(() => props.parentMenu, (newParentMenu) => {
  if (newParentMenu && !formData.parentId) {
    formData.parentId = newParentMenu.id
  }
}, { immediate: true })

// 监听表单数据变化，实时验证路由
watch(() => [formData.path, formData.name, formData.component, formData.type], () => {
  if (formData.type !== 3 && (formData.path || formData.name)) {
    routeValidation.value = RouteManager.validateMenuRoute(formData)
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  loadParentMenuOptions()
  availableComponents.value = RouteManager.getAvailableComponents()
})

// 暴露方法
defineExpose({
  resetForm,
  setIcon,
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>

<style scoped lang="scss">
.menu-form {
  .form-section {
    margin-bottom: 20px;
    
    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }
  }
  
  .form-tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-top: 4px;
  }
  
  .icon-selector {
    display: flex;
    gap: 8px;
  }
  
  .tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-light);
  }
  
  .component-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .component-status {
    cursor: help;
    
    &.valid {
      color: var(--el-color-success);
    }
    
    &.invalid {
      color: var(--el-color-error);
    }
  }
  
  .component-suggestion {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    
    .path {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style> 