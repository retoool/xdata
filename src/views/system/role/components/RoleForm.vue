<template>
  <div class="role-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入角色名称"
          maxlength="50"
          show-word-limit
          clearable
        >
          <template #prefix>
            <el-icon><UserFilled /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      
      <el-form-item label="角色编码" prop="code">
        <el-input
          v-model="formData.code"
          placeholder="请输入角色编码（英文字母、数字、下划线）"
          maxlength="50"
          clearable
          :disabled="formMode === 'edit' && formData.code === 'admin'"
        >
          <template #prefix>
            <el-icon><Key /></el-icon>
          </template>
        </el-input>
        <div class="form-tip">
          角色编码用于系统权限识别，创建后不可修改（管理员角色除外）
        </div>
      </el-form-item>
      
      <el-form-item label="角色描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入角色描述信息"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="角色状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">
            <el-tag type="success" size="small">启用</el-tag>
            <span style="margin-left: 8px;">角色可正常使用</span>
          </el-radio>
          <el-radio :label="0">
            <el-tag type="danger" size="small">禁用</el-tag>
            <span style="margin-left: 8px;">角色将被禁用，用户无法使用此角色权限</span>
          </el-radio>
        </el-radio-group>
      </el-form-item>
      
      <!-- 预设权限模板（仅新建时显示） -->
      <el-form-item v-if="formMode === 'create'" label="权限模板" prop="template">
        <el-select 
          v-model="selectedTemplate" 
          placeholder="选择权限模板（可选）"
          clearable
          style="width: 100%"
          @change="handleTemplateChange"
        >
          <el-option
            v-for="template in permissionTemplates"
            :key="template.value"
            :label="template.label"
            :value="template.value"
          >
            <div class="template-option">
              <div class="template-name">{{ template.label }}</div>
              <div class="template-desc">{{ template.description }}</div>
            </div>
          </el-option>
        </el-select>
        <div class="form-tip">
          选择权限模板可快速配置常用权限，创建后可在权限配置中详细调整
        </div>
      </el-form-item>
      
      <!-- 角色信息预览（编辑模式） -->
      <el-form-item v-if="formMode === 'edit'" label="角色信息">
        <div class="role-info">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="权限数量">
              <el-tag type="info" size="small">
                {{ formData.permissions?.length || 0 }} 个
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="用户数量">
              <el-tag :type="formData.userCount > 0 ? 'warning' : 'info'" size="small">
                {{ formData.userCount || 0 }} 人
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formData.createTime || '未知' }}
            </el-descriptions-item>
            <el-descriptions-item label="最后更新">
              {{ formData.updateTime || '未知' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-form-item>
    </el-form>
    
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ getSubmitButtonText() }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Role, RoleFormData, FormMode } from '@/types/system'
import { UserFilled, Key } from '@element-plus/icons-vue'
import { 
  checkRoleName, 
  checkRoleCode,
  createRole,
  updateRole
} from '@/api/system/role'

// Props
const props = defineProps<{
  formData: Partial<RoleFormData>
  formMode: FormMode
}>()

// Emits
const emit = defineEmits<{
  submit: [data: Role]
  cancel: []
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const submitting = ref(false)
const selectedTemplate = ref('')

const formData = reactive<RoleFormData>({
  id: undefined,
  name: '',
  code: '',
  description: '',
  permissions: [],
  status: 1,
  userCount: 0,
  createTime: '',
  updateTime: ''
})

// 权限模板定义
const permissionTemplates = ref([
  {
    label: '只读用户',
    value: 'readonly',
    description: '仅具有查看权限，无法进行增删改操作',
    permissions: [
      'system:user:view',
      'system:role:view',
      'system:menu:view',
      'system:dept:view'
    ]
  },
  {
    label: '普通管理员',
    value: 'manager',
    description: '具有用户管理权限，但无法管理角色和菜单',
    permissions: [
      'system:user:view',
      'system:user:create',
      'system:user:update',
      'system:user:delete',
      'system:dept:view',
      'system:dept:create',
      'system:dept:update',
      'system:role:view'
    ]
  },
  {
    label: '高级管理员',
    value: 'advanced',
    description: '具有大部分管理权限，但无法管理菜单',
    permissions: [
      'system:user:view',
      'system:user:create',
      'system:user:update',
      'system:user:delete',
      'system:user:reset-password',
      'system:dept:view',
      'system:dept:create',
      'system:dept:update',
      'system:dept:delete',
      'system:role:view',
      'system:role:create',
      'system:role:update'
    ]
  }
])

// 计算属性
const isCodeDisabled = computed(() => {
  return props.formMode === 'edit' && formData.code !== 'admin'
})

// 表单验证规则
const formRules: FormRules<RoleFormData> = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度为2-50个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        
        checkRoleName(
          value, 
          props.formMode === 'edit' ? formData.id : undefined
        )
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error('该角色名称已存在'))
            } else {
              callback()
            }
          })
          .catch(() => {
            callback(new Error('角色名称验证失败'))
          })
      },
      trigger: 'blur'
    }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色编码长度为2-50个字符', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9_]+$/, 
      message: '角色编码只能包含字母、数字和下划线', 
      trigger: 'blur' 
    },
    {
      validator: (rule, value, callback) => {
        if (!value || isCodeDisabled.value) return callback()
        
        checkRoleCode(
          value, 
          props.formMode === 'edit' ? formData.id : undefined
        )
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error('该角色编码已存在'))
            } else {
              callback()
            }
          })
          .catch(() => {
            callback(new Error('角色编码验证失败'))
          })
      },
      trigger: 'blur'
    }
  ],
  description: [
    { max: 200, message: '描述长度不能超过200个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择角色状态', trigger: 'change' }
  ]
}

// 方法
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    let result: Role
    if (props.formMode === 'create') {
      result = await createRole(formData)
    } else {
      result = await updateRole(formData.id!, formData)
    }
    
    emit('submit', result)
  } catch (error) {
    ElMessage.error('请检查表单数据')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const handleTemplateChange = (template: string) => {
  if (!template) {
    formData.permissions = []
    return
  }
  
  const selectedTemplateData = permissionTemplates.value.find(t => t.value === template)
  if (selectedTemplateData) {
    formData.permissions = [...selectedTemplateData.permissions]
    ElMessage.success(`已应用"${selectedTemplateData.label}"权限模板`)
  }
}

const getSubmitButtonText = () => {
  if (props.formMode === 'create') return '创建角色'
  if (props.formMode === 'edit') return '更新角色'
  if (props.formMode === 'copy') return '复制角色'
  return '提交'
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  selectedTemplate.value = ''
}

// 监听props变化，更新表单数据
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      id: newData.id,
      name: newData.name || '',
      code: newData.code || '',
      description: newData.description || '',
      permissions: newData.permissions || [],
      status: newData.status ?? 1,
      userCount: newData.userCount,
      createTime: newData.createTime,
      updateTime: newData.updateTime
    })
  }
}, { immediate: true, deep: true })

// 暴露方法
defineExpose({
  resetForm,
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>

<style scoped lang="scss">
.role-form {
  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 4px;
    line-height: 1.4;
  }
  
  .template-option {
    .template-name {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .template-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-top: 2px;
    }
  }
  
  .role-info {
    .el-descriptions {
      background: var(--el-fill-color-lighter);
      border-radius: 6px;
    }
  }
  
  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-radio) {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  
  .el-radio__label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

:deep(.el-select-dropdown__item) {
  height: auto;
  padding: 12px 20px;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: var(--el-fill-color-lighter);
}
</style> 