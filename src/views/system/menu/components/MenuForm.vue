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
                node-key="id"
              >
                <template #default="{ data }">
                  <div class="tree-node" style="display: flex; align-items: center; gap: 8px; width: 100%;">
                    <el-icon v-if="data.icon" class="tree-node-icon" style="color: var(--el-text-color-primary); font-size: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;">
                      <component :is="useRenderIcon(data.icon)" />
                    </el-icon>
                    <el-icon v-else class="tree-node-icon" style="color: var(--el-text-color-primary); font-size: 16px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 16px; height: 16px;">
                      <MenuIcon />
                    </el-icon>
                    <span class="tree-node-title" style="color: var(--el-text-color-primary); font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; opacity: 1; visibility: visible; line-height: 1.4; display: flex; align-items: center;">{{ data.title || '无标题' }}</span>
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
                <div class="icon-preview">
                  <div class="icon-wrapper" :title="formData.icon || '未选择图标'">
                    <component v-if="formData.icon" :is="useRenderIcon(formData.icon)" class="preview-icon" />
                    <el-icon v-else class="preview-icon placeholder">
                      <Picture />
                    </el-icon>
                  </div>
                </div>
                <el-button @click="showIconSelector">选择图标</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
      
      <!-- 路由信息 -->
      <el-card v-if="formData.type !== 3" shadow="never" class="form-section">
        <template #header>
          <div class="section-title">
            <el-icon><Link /></el-icon>
            <span>路由信息</span>
            <el-button 
              v-if="formData.path"
              type="primary"
              @click="testRoute(formData.path)"
              size="small" 
              style="margin-left: auto;"
            >
              <el-icon><VideoPlay /></el-icon>
              测试路由
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
                访问的路由地址，如：/user或user，外链时以http(s)://开头
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item 
              v-if="formData.type === 2 && !/^https?:\/\//.test(formData.path)" 
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
          v-if="formData.type === 2 && !/^https?:\/\//.test(formData.path)" 
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
            组件路径请填写如 <b>user/index</b>、<b>welcome/index</b> 这种格式，不要加 <b>@/views/</b> 前缀。
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
        
        <!-- 外链内嵌配置，仅菜单类型为2且为外链时显示 -->
        <el-form-item v-if="formData.type === 2 && /^https?:\/\//.test(formData.path)" label="内嵌显示(iframe)" prop="isFrame">
          <el-switch v-model="formData.isFrame" active-text="在主内容区内嵌" inactive-text="新窗口打开" />
          <div class="form-tip">勾选后，外链菜单将在主内容区以 iframe 方式内嵌显示，否则在新窗口打开</div>
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
import { 
  validateComponentPath, 
  suggestComponentPath, 
  validateMenuRoute, 
  getAvailableComponents 
} from '@/router/utils'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import { loadCustomIcons, registerCustomIcon } from '@/utils/customIconManager'
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
const routeValidation = ref<{ valid: boolean; errors: string[] } | null>(null)

const formData = reactive<MenuFormData>({
  id: undefined,
  title: '',
  name: '',
  path: '',
  component: '',
  icon: '',
  type: 2,
  parentId: 0, // 默认为0（根目录）
  sort: 0,
  status: 1,
  isHidden: false,
  isKeepAlive: false,
  isAffix: false,
  visible: true,
  cache: false,
  affix: false,
  redirect: '',
  alwaysShow: false,
  isFrame: false // 新增：外链内嵌配置
})

const treeSelectProps = {
  value: 'id',
  label: 'title',
  children: 'children',
  emitPath: false,
  checkStrictly: true
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
  return validateComponentPath(formData.component)
})

const componentValidationMessage = computed(() => {
  if (!formData.component) return ''
  return isComponentValid.value ? '组件路径有效' : '组件路径不存在'
})

// 获取当前选中的菜单数据
const selectedMenuData = computed(() => {
  if (formData.parentId === 0) {
    return {
      id: 0,
      title: '根目录',
      icon: '',
      type: 1
    }
  }
  
  // 递归查找选中的菜单
  const findMenu = (menus: Menu[], targetId: number): Menu | null => {
    for (const menu of menus) {
      if (menu.id === targetId) {
        return menu
      }
      if (menu.children && menu.children.length > 0) {
        const found = findMenu(menu.children, targetId)
        if (found) return found
      }
    }
    return null
  }
  
  return findMenu(parentMenuOptions.value, formData.parentId) || null
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
        // 外链不需要路由名称
        if (/^https?:\/\//.test(formData.path)) {
          callback()
        } else
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
        // 外链不需要组件路径
        if (/^https?:\/\//.test(formData.path)) {
          callback()
        } else
        if (formData.type === 2 && !value) {
          callback(new Error('请输入组件路径'))
        } else if (value && !validateComponentPath(value)) {
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
  ],
  isFrame: [
    { required: true, message: '请选择内嵌显示方式', trigger: 'change' }
  ]
}

// 方法
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 外链菜单直接通过校验
    if (/^https?:\/\//.test(formData.path)) {
      routeValidation.value = { valid: true, errors: [] }
    } else {
      routeValidation.value = validateMenuRoute(formData)
      if (!routeValidation.value.valid) {
        ElMessage.error('路由配置验证失败，请检查并修正')
        return
      }
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
    formData.isFrame = false // 按钮类型不支持内嵌
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
  let suggestions = availableComponents.value
    .filter(component => component.toLowerCase().includes(queryString.toLowerCase()))
    .map(component => ({
      value: component.replace(/^@\/views\//, ''), // 只保留相对路径
      exists: true
    }));

  // 添加智能建议
  if (formData.path || formData.name) {
    const smartSuggestions = suggestComponentPath(formData.path, formData.name)
      .map(suggestion => ({
        value: suggestion.replace(/^@\/views\//, ''), // 只保留相对路径
        exists: false
      }));

    suggestions = suggestions.concat(smartSuggestions);
  }

  // 去重（只保留第一个出现的 value）
  const seen = new Set();
  const uniqueSuggestions = suggestions.filter(item => {
    if (seen.has(item.value)) return false;
    seen.add(item.value);
    return true;
  });

  cb(uniqueSuggestions.slice(0, 10)); // 限制显示数量
};

const handleComponentSelect = (item: { value: string }) => {
  formData.component = item.value
}

const suggestComponent = () => {
  if (!formData.path) return;
  // 去掉开头的 /，并补全 index
  let path = formData.path.replace(/^\//, '');
  if (!path) return;
  formData.component = `${path}/index`;
};

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

const setIcon = async (icon: string) => {
  formData.icon = icon
  
  // 如果是自定义图标，确保它已经被注册
  if (icon && icon.startsWith('custom/')) {
    try {
      const customIconData = await loadCustomIcons()
      const customIcon = customIconData.find(ci => ci.iconName === icon)
      if (customIcon) {
        registerCustomIcon(customIcon.iconName, customIcon.svgContent)
      }
    } catch (error) {
      console.warn('Failed to register custom icon:', error)
    }
  }
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

    // 构建父菜单选项，规则与菜单移动一致
    const buildOptions = (menus: Menu[], level = 0): Menu[] => {
      if (!menus || menus.length === 0) return []
      
      menus = [...menus].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      return menus
        .filter(menu => {
          // 规则限制
          if (formData.type === 1) {
            // 目录只能选根目录或目录（根目录在外层加，不在这里）
            return menu.type === 1
          } else if (formData.type === 2) {
            // 菜单只能选目录
            return menu.type === 1
          } else if (formData.type === 3) {
            // 按钮只能选菜单
            return menu.type === 2
          }
          return true
        })
        .map(menu => {
          const children = menu.children && menu.children.length > 0
            ? buildOptions(menu.children, level + 1)
            : []
          return {
            ...menu,
            children,
            disabled: false // 具体禁用逻辑已在filter中处理
          }
        })
    }

    // 添加根目录选项
    parentMenuOptions.value = [
      {
        id: 0,
        title: '根目录',
        name: 'root',
        icon: '',
        path: '',
        component: '',
        parentId: null,
        sort: 0,
        level: 1,
        type: 1,
        status: 1,
        isHidden: false,
        isKeepAlive: false,
        isAffix: false,
        visible: true,
        cache: false,
        affix: false,
        redirect: '',
        alwaysShow: false,
        permission: '',
        disabled: false, // 根目录本身可选
        children: buildOptions(menuTree),
        createTime: '',
        updateTime: ''
      }
    ]
  } catch (error) {
    console.error('加载父菜单选项失败:', error)
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
      parentId: newData.parentId || props.parentMenu?.id || 0, // 默认为0（根目录）
      sort: newData.sort ?? 0,
      status: newData.status ?? 1,
      visible: newData.visible ?? true,
      cache: newData.cache ?? false,
      affix: newData.affix ?? false,
      redirect: newData.redirect || '',
      alwaysShow: newData.alwaysShow ?? false,
      isFrame: newData.isFrame ?? false // 监听新增字段
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
    if (/^https?:\/\//.test(formData.path)) {
      routeValidation.value = { valid: true, errors: [] }
    } else {
      routeValidation.value = validateMenuRoute(formData)
    }
  }
}, { deep: true })

// 生命周期
onMounted(async () => {
  loadParentMenuOptions()
  availableComponents.value = getAvailableComponents()
  
  // 加载自定义图标
  await loadCustomIcons()
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
    align-items: center;
    
    .icon-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color-light);
        border-radius: 4px;
        transition: all 0.2s ease;
        cursor: pointer;
        
        &:hover {
          border-color: var(--el-color-primary-light-6);
          background-color: var(--el-color-primary-light-9);
        }
        
        .preview-icon {
          color: var(--el-text-color-primary);
          font-size: 18px;
          
          &.placeholder {
            color: var(--el-text-color-placeholder);
          }
        }
      }
    }
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