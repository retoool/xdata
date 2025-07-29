<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- 主要内容区域 -->
      <div class="profile-content">
        <!-- 左侧：头像和基本信息 -->
        <div class="profile-left">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <el-avatar 
                :size="120" 
                :src="userInfo?.avatar || '/src/assets/user.svg'"
                class="profile-avatar"
              >
                {{ userInfo?.realName?.charAt(0) || userInfo?.username?.charAt(0) }}
              </el-avatar>
            </div>
            <div class="avatar-info">
              <h1 class="user-name">{{ userInfo?.realName || userInfo?.username }}</h1>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="quick-actions">
            <el-button type="primary" @click="handleEditProfile">
              <el-icon><Edit /></el-icon>
              编辑资料
            </el-button>
            <el-button @click="handleChangePassword">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-button>
            <el-button type="danger" @click="showLogoutDialog = true" :disabled="userInfo?.id === 1" :title="userInfo?.id === 1 ? '系统管理员不能注销' : ''">
              <el-icon><Warning /></el-icon>
              注销用户
            </el-button>
          </div>
        </div>

        <!-- 右侧：详细信息 -->
        <div class="profile-right">
          <!-- 基本信息卡片 -->
          <el-card class="info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><UserIcon /></el-icon>
                <span>基本信息</span>
              </div>
            </template>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">用户名：</span>
                <span class="info-value">{{ userInfo?.username || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">真实姓名：</span>
                <span class="info-value">{{ userInfo?.realName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">工号：</span>
                <span class="info-value">{{ userInfo?.employeeNo || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">所属部门：</span>
                <span class="info-value">{{ userInfo?.departmentName || '-' }}</span>
              </div>
            </div>
          </el-card>

          <!-- 联系方式卡片 -->
          <el-card class="info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><Message /></el-icon>
                <span>联系方式</span>
              </div>
            </template>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">邮箱地址：</span>
                <span class="info-value">{{ userInfo?.email || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">手机号码：</span>
                <span class="info-value">{{ userInfo?.phone || '-' }}</span>
              </div>
            </div>
          </el-card>

          <!-- 系统信息卡片 -->
          <el-card class="info-card" shadow="never">
            <template #header>
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <span>系统信息</span>
              </div>
            </template>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">用户角色：</span>
                <span class="info-value">
                  <el-tag 
                    v-for="role in userInfo?.roles.map(role => role.name)" 
                    :key="role"
                    size="small" 
                    style="margin-right: 4px; margin-bottom: 4px;"
                  >
                    {{ role }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">最后登录：</span>
                <span class="info-value">{{ formatDateTime(userInfo?.lastLoginTime) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间：</span>
                <span class="info-value">{{ formatDateTime(userInfo?.createTime) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">更新时间：</span>
                <span class="info-value">{{ formatDateTime(userInfo?.updateTime) }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑个人资料"
      width="600px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <!-- 头像生成 -->
        <el-form-item label="用户头像" prop="avatar">
          <div class="avatar-section">
            <div class="avatar-display">
              <el-avatar
                :src="editForm.avatar || '/src/assets/user.svg'"
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
        
        <!-- 原有的表单项 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input 
                v-model="editForm.realName" 
                placeholder="请输入真实姓名" 
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工号" prop="employeeNo">
              <el-input 
                v-model="editForm.employeeNo" 
                placeholder="请输入工号" 
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱地址" prop="email">
              <el-input 
                v-model="editForm.email" 
                placeholder="请输入邮箱地址" 
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input 
                v-model="editForm.phone" 
                placeholder="请输入手机号码" 
                maxlength="11"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProfile" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="600px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input 
                v-model="passwordForm.oldPassword" 
                type="password" 
                placeholder="请输入当前密码"
                show-password
                maxlength="18"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="新密码" prop="newPassword">
              <el-input 
                v-model="passwordForm.newPassword" 
                type="password" 
                placeholder="请输入新密码"
                show-password
                maxlength="18"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码"
                show-password
                maxlength="18"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSavePassword" :loading="changingPassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>

    <!-- 注销用户确认对话框 -->
    <el-dialog
      v-model="showLogoutDialog"
      title="注销用户"
      width="400px"
    >
      <div class="logout-warning">
        <el-icon class="warning-icon"><Warning /></el-icon>
        <p class="warning-text">注销用户后，该账号将无法登录系统，且无法恢复。确定要注销吗？</p>
      </div>
      <template #footer>
        <el-button @click="showLogoutDialog = false">取消</el-button>
        <el-button type="danger" @click="handleLogoutUser" :loading="loggingOut">
          确认注销
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStoreHook } from '@/store/modules/user'
import { 
  User as UserIcon, 
  Message, 
  Setting, 
  Edit, 
  Lock,
  Warning,
  Refresh
} from '@element-plus/icons-vue'
import { changePassword, updateUserInfo, logoutUser, getCurrentUser, UpdateUserInfoData } from '@/api/system/user'
import multiavatar from '@multiavatar/multiavatar'
import type { User } from './types/user'
// 用户store
const userStore = useUserStoreHook()

// 响应式数据
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const showLogoutDialog = ref(false) // 新增：注销用户对话框
const saving = ref(false)
const changingPassword = ref(false)
const loggingOut = ref(false) // 新增：注销用户loading状态
const editFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const userInfo = ref<User>()

// 在编辑表单中添加头像相关字段
const editForm = reactive({
  realName: '',
  employeeNo: '',
  email: '',
  phone: '',
  avatar: ''
})

// 随机头像方法
const randomAvatar = () => {
  var seed = Date.now().toString() + Math.random().toString(36).slice(2)
  const svg = multiavatar(seed)
  editForm.avatar = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

// 编辑表单验证规则
const editRules: FormRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度为2-50个字符', trigger: 'blur' }
  ],
  employeeNo: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback() // 工号可选
        if (value.length > 50) {
          callback(new Error('工号不能超过50个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  email: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback() // 邮箱可选
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(value)) {
          callback(new Error('请输入正确的邮箱地址'))
        } else if (value.length > 100) {
          callback(new Error('邮箱地址不能超过100个字符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback() // 手机号可选
        const phonePattern = /^1[3-9]\d{9}$/
        if (!phonePattern.test(value)) {
          callback(new Error('请输入正确的手机号码'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码表单验证规则
const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 18, message: '密码长度为8-18个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        if (/[\u4E00-\u9FA5]/.test(value)) {
          callback(new Error('密码不能包含中文字符'))
          return
        }
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
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const formatDateTime = (dateTime: string | undefined) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleEditProfile = () => {
  if (userInfo.value) {
    editForm.realName = userInfo.value.realName || ''
    editForm.employeeNo = userInfo.value.employeeNo || ''
    editForm.email = userInfo.value.email || ''
    editForm.phone = userInfo.value.phone || ''
    editForm.avatar = userInfo.value.avatar || ''
    showEditDialog.value = true
  }
}

// 更新用户信息方法
const handleSaveProfile = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    saving.value = true
    
    // 准备更新的数据，只包含可更新的字段
    const updateData: UpdateUserInfoData = {
      realName: editForm.realName,
      employeeNo: editForm.employeeNo,
      email: editForm.email,
      phone: editForm.phone,
      avatar: editForm.avatar
    }
    
    // 调用更新用户信息的API
    await updateUserInfo(updateData)
    
    // 更新本地状态
    userStore.SET_AVATAR(editForm.avatar)
    userStore.SET_NICKNAME(editForm.realName || '')
    
    ElMessage.success('个人资料更新成功')
    showEditDialog.value = false
  } catch (error: any) {
    console.error('更新个人资料失败:', error)
    ElMessage.error(error.message || '更新失败，请重试')
  } finally {
    saving.value = false
  }
}

const handleChangePassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showPasswordDialog.value = true
}

const handleSavePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    changingPassword.value = true
    
    // 调用修改密码API
    await changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    
    ElMessage.success('密码修改成功，请重新登录')
    showPasswordDialog.value = false
    
    // 密码修改成功后需要重新登录
    setTimeout(() => {
      userStore.logout()
    }, 1500)
  } catch (error: any) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.message || '修改密码失败，请重试')
  } finally {
    changingPassword.value = false
  }
}

const handleLogoutUser = async () => {
  // 前端校验：系统管理员不能注销
  if (userInfo.value?.id === 1) {
    ElMessage.warning('系统管理员不能注销')
    return
  }
  
  loggingOut.value = true
  try {
    // 调用注销用户API
    await logoutUser()
    // 清除本地状态并跳转到登录页
    await userStore.logout()
    ElMessage.success('用户已注销，请重新登录')
    showLogoutDialog.value = false
  } catch (error: any) {
    console.error('注销用户失败:', error)
    ElMessage.error(error.message || '注销失败，请重试')
  } finally {
    loggingOut.value = false
  }
}

// 生命周期
onMounted(async () => {
  try {
    userInfo.value = await getCurrentUser()
    userStore.SET_AVATAR(userInfo.value?.avatar || '')
    userStore.SET_USERNAME(userInfo.value?.username || '')
    userStore.SET_NICKNAME(userInfo.value?.realName || '')
    userStore.SET_ROLES(userInfo.value?.roles.map(role => role.name) || [])
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
})
</script>

<style scoped lang="scss">
.profile-page {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: calc(100vh - 48px);
  transition: background-color 0.3s ease;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  
  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 8px 0;
  }
  
  .page-subtitle {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}

.profile-content {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.profile-left {
      .avatar-section {
      background: var(--el-bg-color);
      border-radius: 12px;
      padding: 32px 24px;
      text-align: center;
      box-shadow: var(--el-box-shadow-light);
      border: 1px solid var(--el-border-color-lighter);
      transition: all 0.3s ease;
    
    .avatar-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 20px;
      
      .profile-avatar {
        border: 4px solid var(--el-color-primary-light-8);
        transition: all 0.3s ease;
        box-shadow: var(--el-box-shadow);
        
        &:hover {
          border-color: var(--el-color-primary);
          transform: scale(1.05);
        }
      }
    }
    
    .avatar-info {
      .user-name {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 8px 0;
        line-height: 1.4;
      }
      
      .user-role {
        font-size: 14px;
        color: var(--el-text-color-regular);
        margin: 0 0 12px 0;
        line-height: 1.4;
      }
      
      .user-status {
        margin: 0;
      }
    }
  }
  
  .quick-actions {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 0; // 将间距设置为0
    
    .el-button {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      border-radius: 8px;
      font-weight: 500;
      width: 100%;
      padding: 0 16px;
      margin: 6px 0; // 添加垂直方向的小间距
      
      .el-icon {
        margin-right: 8px;
        font-size: 16px;
      }
    }
    
    // 保留之前的按钮样式
    .el-button--primary {
      background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, var(--el-color-primary-dark-2) 0%, var(--el-color-primary) 100%);
      }
    }
    
    .el-button--danger {
      background: linear-gradient(135deg, var(--el-color-danger) 0%, var(--el-color-danger-light-3) 100%);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, var(--el-color-danger-dark-2) 0%, var(--el-color-danger) 100%);
      }
    }
    
    .el-button:not(.el-button--primary):not(.el-button--danger) {
      background: var(--el-fill-color-lighter);
      color: var(--el-text-color-primary);
      border: 1px solid var(--el-border-color-light);
      
      &:hover {
        background: var(--el-fill-color-light);
      }
    }
  }
}

.profile-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  .info-card {
    border-radius: 12px;
    border: 1px solid var(--el-border-color-lighter);
    box-shadow: var(--el-box-shadow-light);
    transition: all 0.3s ease;
    background: var(--el-bg-color);
    
    &:hover {
      box-shadow: var(--el-box-shadow);
      transform: translateY(-2px);
    }
    
    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      background: var(--el-fill-color-extra-light);
      
      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        font-size: 16px;
        
        .el-icon {
          font-size: 18px;
          color: var(--el-color-primary);
        }
      }
    }
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
  
  .info-list {
    .info-item {
      display: flex;
      align-items: flex-start;
      padding: 16px 0;
      border-bottom: 1px solid var(--el-border-color-extra-light);
      
      &:last-child {
        border-bottom: none;
      }
      
      .info-label {
        width: 120px;
        font-weight: 500;
        color: var(--el-text-color-regular);
        flex-shrink: 0;
        font-size: 14px;
        line-height: 1.6;
      }
      
      .info-value {
        flex: 1;
        color: var(--el-text-color-primary);
        word-break: break-all;
        font-size: 14px;
        line-height: 1.6;
        
        .el-tag {
          margin-right: 6px;
          margin-bottom: 4px;
          border-radius: 6px;
          font-weight: 500;
        }
      }
    }
  }
}

// 对话框样式优化
:deep(.el-dialog) {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color);
  
  .el-dialog__header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
    
    .el-dialog__title {
      font-weight: 600;
      font-size: 16px;
      color: var(--el-text-color-primary);
    }
  }
  
  .el-dialog__body {
    padding: 24px;
    background: var(--el-bg-color);
  }
  
  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-extra-light);
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  
  &:hover {
    box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
  }
  
  &.is-focused {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
  
  .profile-content {
    gap: 16px;
  }
  
  .profile-left .avatar-section {
    padding: 24px 20px;
  }
  
  .profile-right .info-card :deep(.el-card__body) {
    padding: 20px;
  }
  
  .info-list .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    
    .info-label {
      width: auto;
      font-weight: 600;
    }
  }
}

// 新增样式
.logout-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.6;

  .warning-icon {
    font-size: 20px;
    color: var(--el-color-danger);
  }
  
  .warning-text {
    margin: 0;
    color: var(--el-text-color-regular);
  }
}

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
</style> 