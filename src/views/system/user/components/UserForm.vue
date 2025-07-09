<template>
  <div class="user-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <!-- 头像上传 -->
      <el-form-item label="用户头像" prop="avatar">
        <div class="avatar-upload">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="handleAvatarUpload"
            accept="image/*"
            class="avatar-uploader"
          >
            <el-avatar
              v-if="formData.avatar"
              :src="formData.avatar"
              :size="80"
              class="avatar-preview"
            />
            <div v-else class="avatar-placeholder">
              <el-icon><Plus /></el-icon>
              <div class="upload-text">上传头像</div>
            </div>
          </el-upload>
          <div class="avatar-tips">
            <p>支持 JPG、PNG 格式</p>
            <p>建议尺寸：200x200像素</p>
            <p>文件大小不超过 2MB</p>
          </div>
        </div>
      </el-form-item>
      
      <!-- 基本信息 -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="formData.username"
              placeholder="请输入用户名"
              maxlength="50"
              clearable
              :disabled="formMode === 'edit'"
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
              placeholder="请输入真实姓名"
              maxlength="20"
              clearable
            >
              <template #prefix>
                <el-icon><Avatar /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="邮箱地址" prop="email">
            <el-input
              v-model="formData.email"
              placeholder="请输入邮箱地址"
              maxlength="100"
              clearable
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
              placeholder="请输入手机号码"
              maxlength="11"
              clearable
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="工号" prop="employeeNo">
            <el-input
              v-model="formData.employeeNo"
              placeholder="请输入工号"
              maxlength="20"
              clearable
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
      <el-row v-if="formMode === 'create'" :gutter="16">
        <el-col :span="12">
          <el-form-item label="登录密码" prop="password">
            <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入登录密码"
              maxlength="50"
              show-password
              clearable
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
              v-model="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              maxlength="50"
              show-password
              clearable
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
            <span>{{ role.name }}</span>
            <span style="color: var(--el-text-color-secondary); margin-left: 8px;">
              {{ role.description }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      
      <!-- 状态设置 -->
      <el-form-item label="用户状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">
            <el-tag type="success" size="small">启用</el-tag>
            正常使用系统
          </el-radio>
          <el-radio :label="0">
            <el-tag type="danger" size="small">禁用</el-tag>
            禁止登录系统
          </el-radio>
        </el-radio-group>
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
import type { FormInstance, FormRules, UploadRequestOptions } from 'element-plus'
import type { 
  User, 
  UserFormData, 
  FormMode, 
  Department, 
  Role 
} from '@/types/system'
import { 
  checkUsername, 
  checkEmail, 
  checkEmployeeNo,
  uploadAvatar 
} from '@/api/system/user'
import { getDepartmentTree } from '@/api/system/department'
import { getAllRoles } from '@/api/system/role'
import { 
  Plus, 
  User as UserIcon, 
  Avatar, 
  Message, 
  Phone, 
  Postcard, 
  Lock 
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
const confirmPassword = ref('')
const departmentOptions = ref<Department[]>([])
const roleOptions = ref<Role[]>([])

const formData = reactive<UserFormData>({
  id: undefined,
  username: '',
  password: '',
  realName: '',
  avatar: '',
  employeeNo: '',
  email: '',
  phone: '',
  departmentId: undefined,
  roleIds: [],
  status: 1
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
        
        checkUsername(value, formData.id)
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
    { min: 2, max: 20, message: '姓名长度为2-20个字符', trigger: 'blur' }
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change']
    },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        
        checkEmail(value, formData.id)
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
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ],
  employeeNo: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        
        checkEmployeeNo(value, formData.id)
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
    { min: 6, max: 50, message: '密码长度为6-50个字符', trigger: 'blur' }
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
  ],
  status: [
    { required: true, message: '请选择用户状态', trigger: 'change' }
  ]
}

// 方法
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
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

// 头像上传相关
const beforeAvatarUpload = (rawFile: File) => {
  const isImage = rawFile.type.startsWith('image/')
  const isLt2M = rawFile.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarUpload = async (options: UploadRequestOptions) => {
  try {
    const avatarUrl = await uploadAvatar(options.file as File)
    formData.avatar = avatarUrl
    ElMessage.success('头像上传成功')
  } catch (error) {
    ElMessage.error('头像上传失败')
  }
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
  confirmPassword.value = ''
}

// 监听props变化，更新表单数据
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      id: newData.id,
      username: newData.username || '',
      password: '', // 编辑时不显示原密码
      realName: newData.realName || '',
      avatar: newData.avatar || '',
      employeeNo: newData.employeeNo || '',
      email: newData.email || '',
      phone: newData.phone || '',
      departmentId: newData.departmentId || props.departmentId,
      roleIds: newData.roleIds || [],
      status: newData.status ?? 1
    })
  }
}, { immediate: true, deep: true })

// 监听部门ID变化
watch(() => props.departmentId, (newDepartmentId) => {
  if (newDepartmentId && !formData.departmentId) {
    formData.departmentId = newDepartmentId
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
  .avatar-upload {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    
    .avatar-uploader {
      .avatar-preview {
        border: 2px solid var(--el-border-color);
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: var(--el-color-primary);
        }
      }
      
      .avatar-placeholder {
        width: 80px;
        height: 80px;
        border: 2px dashed var(--el-border-color);
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: var(--el-fill-color-lighter);
        
        &:hover {
          border-color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
        
        .el-icon {
          font-size: 20px;
          color: var(--el-text-color-secondary);
          margin-bottom: 4px;
        }
        
        .upload-text {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
    
    .avatar-tips {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      line-height: 1.5;
      
      p {
        margin: 0 0 2px 0;
      }
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