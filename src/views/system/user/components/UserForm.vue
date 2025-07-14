<template>
  <div class="user-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <!-- 头像生成 -->
      <el-form-item label="用户头像" prop="avatar">
        <div class="avatar-section">
          <div class="avatar-display">
            <el-avatar
              :src="formData.avatar || generateAvatar(avatarSeed)"
              :size="80"
              class="avatar-preview"
            />
          </div>
          <div class="avatar-info">
            <p class="avatar-tip">头像将根据用户名自动生成</p>
            <p class="avatar-tip">支持多元化头像风格</p>
            <el-button size="small" type="primary" @click="randomAvatar" style="margin-top: 8px;">
              <el-icon><Refresh /></el-icon>
              随机头像
            </el-button>
          </div>
        </div>
      </el-form-item>
      
      <!-- 基本信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名（3-50个字符）"
              maxlength="50"
              clearable
              :disabled="formMode === 'edit'"
              show-word-limit
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="真实姓名" prop="realName">
            <el-input
              v-model="formData.realName"
              placeholder="请输入真实姓名（2-50个字符）"
              maxlength="50"
              clearable
              show-word-limit
            >
              <template #prefix>
                <el-icon><Avatar /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="邮箱地址" prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入邮箱地址（可选）"
              maxlength="100"
              clearable
              show-word-limit
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="请输入手机号码（可选）"
              maxlength="11"
              clearable
              show-word-limit
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="工号" prop="employeeNo">
            <el-input
              v-model="formData.employeeNo"
              placeholder="请输入工号（可选）"
              maxlength="50"
              clearable
              show-word-limit
            >
              <template #prefix>
                <el-icon><Postcard /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门" prop="departmentId">
            <el-tree-select
              v-model="formData.departmentId"
              :data="departmentOptions"
              :props="treeSelectProps"
              placeholder="请选择所属部门"
              clearable
              check-strictly
              :render-after-expand="false"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 密码设置（仅新增时显示） -->
      <el-row v-if="formMode === 'create'" :gutter="20">
        <el-col :span="12">
          <el-form-item label="登录密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入登录密码（8-18个字符）"
              maxlength="18"
              show-password
              clearable
              show-word-limit
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              maxlength="18"
              show-password
              clearable
              show-word-limit
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <!-- 角色分配 -->
      <el-form-item label="用户角色" prop="roleIds">
        <el-select
          v-model="formData.roleIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择用户角色"
          style="width: 100%"
          :max-collapse-tags="3"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
            :disabled="role.status === 0"
          >
            <div class="role-option">
              <span class="role-name">{{ role.name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      

    </el-form>
    
    <!-- 表单底部操作 -->
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ formMode === 'create' ? '创建用户' : '更新用户' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { 
  User as UserType, 
  UserFormData, 
  FormMode, 
  Department, 
  Role 
} from '@/types/system'
import { 
  checkUsername, 
  checkEmail, 
  checkEmployeeNo
} from '@/api/system/user'
import { getDepartmentTree } from '@/api/system/department'
import { getAllRoles } from '@/api/system/role'
import multiavatar from '@multiavatar/multiavatar'
import { 
  User, 
  Avatar, 
  Message, 
  Phone, 
  Postcard, 
  Lock,
  Refresh
} from '@element-plus/icons-vue'

// Props
const props = defineProps<{
  formData: Partial<UserFormData>
  formMode: FormMode
  departmentId?: number | null
}>()

// Emits
const emit = defineEmits<{
  submit: [data: UserFormData]
  cancel: []
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const submitting = ref(false)
const departmentOptions = ref<Department[]>([])
const roleOptions = ref<Role[]>([])
const avatarSeed = ref('') // 头像种子，默认与用户名同步

const formData = reactive<UserFormData & { confirmPassword: string }>({
  id: undefined,
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  avatar: '',
  employeeNo: '',
  email: '',
  phone: '',
  departmentId: undefined,
  roleIds: [],
  status: 1 // 默认启用状态，但不在表单中显示
})

const treeSelectProps = {
  value: 'id',
  label: 'name',
  children: 'children'
}

// 计算属性
const isUsernameDisabled = computed(() => props.formMode === 'edit')

// 表单验证规则
const formRules: FormRules<UserFormData & { confirmPassword: string }> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为3-50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value || props.formMode === 'edit') return callback()
        
        // 用户名唯一性验证
        const excludeId = formData.id || undefined
        checkUsername(value, excludeId)
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error('该用户名已存在'))
            } else {
              callback()
            }
          })
          .catch(() => {
            callback(new Error('用户名验证失败'))
          })
      },
      trigger: 'blur'
    }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50个字符', trigger: 'blur' }
  ],
  email: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback() // 邮箱可选
        
        // 邮箱格式验证
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(value)) {
          callback(new Error('请输入正确的邮箱地址'))
          return
        }
        
        // 邮箱长度验证
        if (value.length > 100) {
          callback(new Error('邮箱地址不能超过100个字符'))
          return
        }
        
        // 邮箱唯一性验证
        const excludeId = formData.id || undefined
        checkEmail(value, excludeId)
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error('该邮箱地址已被使用'))
            } else {
              callback()
            }
          })
          .catch(() => {
            callback(new Error('邮箱验证失败'))
          })
      },
      trigger: 'blur'
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback() // 手机号可选
        
        // 手机号格式验证（中国手机号：1开头，第二位3-9，总共11位）
        const phonePattern = /^1[3-9]\d{9}$/
        if (!phonePattern.test(value)) {
          callback(new Error('请输入正确的手机号码'))
          return
        }
        
        callback()
      },
      trigger: 'blur'
    }
  ],
  employeeNo: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback() // 工号可选
        
        // 工号长度验证
        if (value.length > 50) {
          callback(new Error('工号不能超过50个字符'))
          return
        }
        
        // 工号唯一性验证
        const excludeId = formData.id || undefined
        checkEmployeeNo(value, excludeId)
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error('该工号已存在'))
            } else {
              callback()
            }
          })
          .catch(() => {
            callback(new Error('工号验证失败'))
          })
      },
      trigger: 'blur'
    }
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  password: [
    ...(props.formMode === 'create' ? [
      { required: true, message: '请输入登录密码', trigger: 'blur' }
    ] : []),
    { min: 8, max: 18, message: '密码长度为8-18个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        
        // 检查是否包含中文字符
        if (/[\u4E00-\u9FA5]/.test(value)) {
          callback(new Error('密码不能包含中文字符'))
          return
        }
        
        // 密码复杂度验证
        const hasLower = /[a-z]/.test(value)
        const hasUpper = /[A-Z]/.test(value)
        const hasDigit = /\d/.test(value)
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value)
        
        const typeCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
        
        if (typeCount < 2) {
          callback(new Error('密码至少包含字母、数字、特殊字符中的两种'))
          return
        }
        
        callback()
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    ...(props.formMode === 'create' ? [
      { required: true, message: '请确认密码', trigger: 'blur' }
    ] : []),
    {
      validator: (rule, value, callback) => {
        if (props.formMode === 'create' && value !== formData.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  roleIds: [
    { 
      type: 'array',
      required: true, 
      message: '请至少选择一个角色', 
      trigger: 'change' 
    }
  ]
}

// 方法
const generateAvatar = (seed) => {
  if (!seed) return ''
  const svg = multiavatar(seed)
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

const randomAvatar = () => {
  // 用当前时间戳+随机数做种子
  avatarSeed.value = Date.now().toString() + Math.random().toString(36).slice(2)
  // 清空上传的头像
  formData.avatar = ''
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    // 自动生成头像
    if (!formData.avatar && avatarSeed.value) {
      formData.avatar = generateAvatar(avatarSeed.value)
    }
    // 准备提交数据，移除确认密码字段
    const submitData = { ...formData }
    if (props.formMode === 'edit') {
      delete submitData.password
    }
    emit('submit', submitData)
  } catch (error) {
    ElMessage.error('请检查表单数据')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}



// 加载数据
const loadDepartmentOptions = async () => {
  try {
    departmentOptions.value = await getDepartmentTree()
  } catch (error) {
    ElMessage.error('加载部门列表失败')
  }
}

const loadRoleOptions = async () => {
  try {
    roleOptions.value = await getAllRoles()
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  }
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  formData.confirmPassword = ''
}

// 监听props变化，更新表单数据
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      id: newData.id,
      username: newData.username || '',
      password: '', // 编辑时不显示原密码
      confirmPassword: '', // 重置确认密码
      realName: newData.realName || '',
      avatar: newData.avatar || '/src/assets/user.svg',
      employeeNo: newData.employeeNo || '',
      email: newData.email || '',
      phone: newData.phone || '',
      departmentId: newData.departmentId || props.departmentId,
      roleIds: newData.roleIds || []
      // 状态由后端管理，不在表单中显示
    })
    // 如果有头像，设置种子
    if (newData.avatar) {
      avatarSeed.value = newData.username || ''
    }
  }
}, { immediate: true, deep: true })

// 监听用户名变化，自动预览头像
watch(() => formData.username, (val) => {
  if (val) {
    avatarSeed.value = val
    formData.avatar = ''
  }else{
    formData.avatar = '/src/assets/user.svg'
  }
})

// 监听部门ID变化
watch(() => props.departmentId, (newDepartmentId) => {
  if (newDepartmentId && !formData.departmentId) {
    formData.departmentId = newDepartmentId
  } else if (!formData.departmentId) {
    formData.departmentId = 1 // 系统部门作为默认值
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  loadDepartmentOptions()
  loadRoleOptions()
})

// 暴露方法
defineExpose({
  resetForm,
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>

<style scoped lang="scss">
.user-form {
  .avatar-section {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .avatar-display {
      .avatar-preview {
        border: 2px solid var(--el-border-color);
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
    }
    
    .avatar-info {
      flex: 1;
      
      .avatar-tip {
        color: var(--el-text-color-secondary);
        font-size: 13px;
        line-height: 1.6;
        margin: 0 0 4px 0;
      }
    }
  }
  
  .role-option {
    display: flex;
    align-items: center;
    padding: 2px 0;
    
    .role-name {
      font-weight: 600;
      color: var(--el-text-color-primary);
      font-size: 14px;
      line-height: 1.4;
    }
  }
  

  
  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-radio) {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  .el-radio__label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

:deep(.el-select .el-tag) {
  max-width: 120px;
}

:deep(.el-select-dropdown) {
  .role-option {
    display: flex;
    align-items: center;
    padding: 6px 0;
    
    .role-name {
      font-weight: 600;
      color: var(--el-text-color-primary);
      font-size: 14px;
      line-height: 1.4;
    }
  }
  
  .el-select-dropdown__item {
    padding: 8px 12px;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: var(--el-color-primary-light-9);
    }
    
    &.selected {
      background-color: var(--el-color-primary-light-8);
      color: var(--el-color-primary);
    }
    
    &.is-disabled {
      background-color: var(--el-fill-color-lighter);
      color: var(--el-text-color-placeholder);
      cursor: not-allowed;
      
      .role-option {
        .role-name {
          color: var(--el-text-color-placeholder);
        }
      }
    }
  }
}

:deep(.el-select) {
  .el-select__tags {
    .el-tag {
      margin: 2px 4px 2px 0;
      border-radius: 6px;
      border: 1px solid var(--el-color-primary-light-7);
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      
      .el-tag__content {
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
        font-size: 12px;
      }
      
      .el-tag__close {
        color: var(--el-color-primary);
        
        &:hover {
          background-color: var(--el-color-primary);
          color: white;
        }
      }
    }
  }
  
  .el-select__wrapper {
    border-radius: 6px;
    
    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }
    
    &.is-focused {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }
}

:deep(.el-tree-select) {
  .el-select__wrapper {
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    
    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
    
    &.is-focused {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }
}
</style> 