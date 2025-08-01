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
              :src="formData.avatar || '/src/assets/user.svg'"
              :size="80"
              class="avatar-preview"
            />
            <el-upload
              ref="uploadRef"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
              accept="image/*"
              class="avatar-upload"
            >
              <el-button
                circle
                size="small"
                type="primary"
                class="upload-btn"
              >
                <el-icon><Upload /></el-icon>
              </el-button>
            </el-upload>
          </div>
                      <div class="avatar-actions">
              <div class="action-group">
                <div class="group-header">
                  <h4 class="group-title">头像生成</h4>
                  <el-tooltip
                    content="随机生成：使用时间戳和随机数生成独特的头像图案，每次生成都会产生不同的视觉效果。
恢复默认：将头像重置为系统默认的占位图像。"
                    placement="top"
                    effect="dark"
                  >
                    <el-icon class="help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
                <div class="button-group">
                  <el-button
                    type="primary"
                    size="small"
                    @click="randomAvatar"
                    class="action-btn"
                  >
                    <el-icon><Refresh /></el-icon>
                    随机生成
                  </el-button>
                  <el-button
                    type="info"
                    size="small"
                    @click="resetToDefault"
                    class="action-btn"
                  >
                    <el-icon><RefreshLeft /></el-icon>
                    恢复默认
                  </el-button>
                </div>
              </div>
              
              <div class="action-group">
                <div class="group-header">
                  <h4 class="group-title">种子管理</h4>
                  <el-tooltip
                    content="导出种子：将当前头像的种子值复制到剪贴板，可以保存并分享给其他人使用相同的种子生成相同的头像。
输入种子：通过输入特定的种子值来生成对应的头像图案，确保每次使用相同种子都会产生相同的头像。"
                    placement="top"
                    effect="dark"
                  >
                    <el-icon class="help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
                <div class="button-group">
                  <el-button
                    type="warning"
                    size="small"
                    @click="exportSeed"
                    class="action-btn"
                  >
                    <el-icon><Download /></el-icon>
                    导出种子
                  </el-button>
                  <el-button
                    type="success"
                    size="small"
                    @click="showSeedDialog = true"
                    class="action-btn"
                  >
                    <el-icon><Edit /></el-icon>
                    输入种子
                  </el-button>
                </div>
              </div>
            </div>
        </div>
      </el-form-item>
      
      <!-- 种子输入对话框 -->
      <el-dialog
        v-model="showSeedDialog"
        title="输入种子生成头像"
        width="400px"
      >
        <el-form>
          <el-form-item label="种子值">
            <el-input
              v-model="seedInput"
              placeholder="请输入种子值"
              clearable
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showSeedDialog = false">取消</el-button>
          <el-button type="primary" @click="generateFromSeed">生成</el-button>
        </template>
      </el-dialog>

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
              :loading="!departmentOptionsLoaded"
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
          :loading="!roleOptionsLoaded"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          >
            <div class="role-option">
              <span class="role-name">{{ role.name }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed, nextTick } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import type { User as UserType, UserFormData } from "../types/user";
import { Department } from "../types/department";
import { Role } from "@/views/system/role/types/role";
import { checkUsername, checkEmail, checkEmployeeNo, createUser, updateUser } from "@/api/system/user";
import { getDepartmentTree } from "@/api/system/department";
import { getAllRoles } from "@/api/system/role";
import multiavatar from "@multiavatar/multiavatar";
import {
  User,
  Avatar,
  Message,
  Phone,
  Postcard,
  Lock,
  Refresh,
  Upload,
  RefreshLeft,
  Download,
  Edit,
  QuestionFilled
} from "@element-plus/icons-vue";

// Props
const props = defineProps<{
  formData: Partial<UserFormData>;
  formMode: FormMode;
  departmentId?: number | null;
}>();

// 响应式数据
const formRef = ref<FormInstance>();
const submitting = ref(false);
const departmentOptions = ref<Department[]>([]);
const departmentOptionsLoaded = ref(false);
const roleOptions = ref<Role[]>([]);
const roleOptionsLoaded = ref(false);
const showSeedDialog = ref(false);
const seedInput = ref("");
const currentSeed = ref("");


const formData = reactive<UserFormData & { confirmPassword: string }>({
  id: undefined,
  username: "",
  password: "",
  confirmPassword: "",
  realName: "",
  avatar: "",
  employeeNo: "",
  email: "",
  phone: "",
  departmentId: undefined,
  roleIds: [],
  status: 1 // 默认启用状态，但不在表单中显示
});

const treeSelectProps = {
  value: "id",
  label: "name",
  children: "children"
};

// 表单验证规则
const formRules: FormRules<UserFormData & { confirmPassword: string }> = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 50, message: "用户名长度为3-50个字符", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "用户名只能包含字母、数字和下划线",
      trigger: "blur"
    },
    {
      validator: (rule, value, callback) => {
        if (!value || props.formMode === "edit") return callback();

        // 用户名唯一性验证
        const excludeId = formData.id || undefined;
        checkUsername(value, excludeId)
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error("该用户名已存在"));
            } else {
              callback();
            }
          })
          .catch(() => {
            callback(new Error("用户名验证失败"));
          });
      },
      trigger: "blur"
    }
  ],
  realName: [
    { required: true, message: "请输入真实姓名", trigger: "blur" },
    { min: 2, max: 50, message: "姓名长度为2-50个字符", trigger: "blur" }
  ],
  email: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback(); // 邮箱可选

        // 邮箱格式验证
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          callback(new Error("请输入正确的邮箱地址"));
          return;
        }

        // 邮箱长度验证
        if (value.length > 100) {
          callback(new Error("邮箱地址不能超过100个字符"));
          return;
        }

        callback();
      },
      trigger: "blur"
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback(); // 手机号可选

        // 手机号格式验证（中国手机号：1开头，第二位3-9，总共11位）
        const phonePattern = /^1[3-9]\d{9}$/;
        if (!phonePattern.test(value)) {
          callback(new Error("请输入正确的手机号码"));
          return;
        }

        callback();
      },
      trigger: "blur"
    }
  ],
  employeeNo: [
    {
      validator: (rule, value, callback) => {
        if (!value) return callback(); // 工号可选

        // 工号长度验证
        if (value.length > 50) {
          callback(new Error("工号不能超过50个字符"));
          return;
        }

        callback();
      },
      trigger: "blur"
    }
  ],
  departmentId: [
    { required: true, message: "请选择所属部门", trigger: "change" }
  ],
  password: [
    ...(props.formMode === "create"
      ? [{ required: true, message: "请输入登录密码", trigger: "blur" }]
      : []),
    { min: 8, max: 18, message: "密码长度为8-18个字符", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback();

        // 检查是否包含中文字符
        if (/[\u4E00-\u9FA5]/.test(value)) {
          callback(new Error("密码不能包含中文字符"));
          return;
        }

        // 密码复杂度验证
        const hasLower = /[a-z]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasDigit = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(value);

        const typeCount = [hasLower, hasUpper, hasDigit, hasSpecial].filter(
          Boolean
        ).length;

        if (typeCount < 2) {
          callback(new Error("密码至少包含字母、数字、特殊字符中的两种"));
          return;
        }

        callback();
      },
      trigger: "blur"
    }
  ],
  confirmPassword: [
    ...(props.formMode === "create"
      ? [{ required: true, message: "请确认密码", trigger: "blur" }]
      : []),
    {
      validator: (rule, value, callback) => {
        if (props.formMode === "create" && value !== formData.password) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  roleIds: [
    {
      type: "array",
      required: true,
      message: "请至少选择一个角色",
      trigger: "change"
    }
  ]
};



const randomAvatar = () => {
  // 用当前时间戳+随机数做种子
  var seed = Date.now().toString() + Math.random().toString(36).slice(2);
  const svg = multiavatar(seed);
  formData.avatar = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  currentSeed.value = seed;
};

// 头像上传相关方法
const uploadRef = ref();

const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

const handleAvatarUpload = (options: any) => {
  const file = options.file;
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const result = e.target?.result as string;
    if (result) {
      formData.avatar = result;
      ElMessage.success('头像上传成功');
    }
  };
  
  reader.onerror = () => {
    ElMessage.error('头像上传失败');
  };
  
  reader.readAsDataURL(file);
  
  // 返回一个 Promise 以满足 UploadRequestHandler 类型要求
  return Promise.resolve();
};

// 恢复默认头像
const resetToDefault = () => {
  formData.avatar = '/src/assets/user.svg';
  currentSeed.value = "";
  ElMessage.success('已恢复默认头像');
};

// 导出当前头像种子
const exportSeed = () => {
  if (currentSeed.value) {
    // 复制种子到剪贴板
    navigator.clipboard.writeText(currentSeed.value).then(() => {
      ElMessage.success('种子已复制到剪贴板');
    }).catch(() => {
      ElMessage.error('复制失败，请手动复制');
    });
  } else {
    ElMessage.warning('当前头像没有种子值');
  }
};

// 从种子生成头像
const generateFromSeed = () => {
  if (!seedInput.value.trim()) {
    ElMessage.warning('请输入种子值');
    return;
  }
  
  const svg = multiavatar(seedInput.value.trim());
  formData.avatar = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  currentSeed.value = seedInput.value.trim();
  showSeedDialog.value = false;
  seedInput.value = "";
  ElMessage.success('头像生成成功');
};

// 提交表单方法
const submitForm = async () => {
  if (!formRef.value) {
    return Promise.reject(new Error("表单未初始化"));
  }
  try {
    // 进行表单验证
    await formRef.value.validate();
    // 验证通过后，设置提交状态
    submitting.value = true;

    // 准备提交数据
    const submitData = { ...formData };
    
    // 编辑模式下移除密码相关字段
    if (props.formMode === "edit") {
      delete submitData.password;
      delete submitData.confirmPassword;
    }
    
    // 确保必填字段存在
    if (!submitData.realName || !submitData.departmentId || !submitData.roleIds || submitData.roleIds.length === 0) {
      ElMessage.error("请完善必填信息");
      return Promise.reject(new Error("数据不完整"));
    }
    
    // 调用 API 保存数据
    if (props.formMode === "create") {
      await createUser(submitData);
      ElMessage.success("新增成功");
    } else {
      await updateUser(submitData.id!, submitData);
      ElMessage.success("编辑成功");
    }
    
    return Promise.resolve();
  } catch (error: any) {
    // 处理验证错误
    if (error && typeof error === 'object' && Object.keys(error).length > 0) {
      // 表单验证失败，Element Plus会自动显示错误信息
      console.log("表单验证失败:", error);
      console.log("表单数据详情:", {
        realName: formData.realName,
        roleIds: formData.roleIds,
        departmentId: formData.departmentId
      });
      return Promise.reject(error);
    }
    
    // 处理API错误
    console.error("提交失败:", error);
    const errorMessage = error.response?.data?.message || error.message || "操作失败";
    ElMessage.error(errorMessage);
    return Promise.reject(error);
  } finally {
    submitting.value = false;
  }
};

// 加载数据
const loadDepartmentOptions = async () => {
  try {
    departmentOptions.value = await getDepartmentTree();
    departmentOptionsLoaded.value = true;
  } catch (error) {
    ElMessage.error("加载部门列表失败");
    departmentOptionsLoaded.value = false;
  }
};

const loadRoleOptions = async () => {
  try {
    roleOptions.value = await getAllRoles();
    roleOptionsLoaded.value = true;
  } catch (error) {
    ElMessage.error("加载角色列表失败");
    roleOptionsLoaded.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  formData.confirmPassword = "";
};

// 监听props变化，更新表单数据
watch(
  () => props.formData,
  newData => {
    if (newData) {
      // 只在表单为空或初始加载时更新数据
      const isInitialLoad = !formData.id && newData.id;
      if (isInitialLoad) {
        Object.assign(formData, {
          id: newData.id,
          username: newData.username || "",
          password: "", // 编辑时不显示原密码
          confirmPassword: "", // 重置确认密码
          realName: newData.realName || "",
          avatar: newData.avatar || "/src/assets/user.svg",
          employeeNo: newData.employeeNo || "",
          email: newData.email || "",
          phone: newData.phone || "",
          departmentId: newData.departmentId || props.departmentId,
          roleIds: newData.roleIds || []
        });
      }
    }
  },
  { immediate: true}
);



// 监听部门ID变化
watch(
  () => props.departmentId,
  newDepartmentId => {
    if (newDepartmentId && !formData.departmentId) {
      formData.departmentId = newDepartmentId;
    } else if (!formData.departmentId) {
      formData.departmentId = 1; // 系统部门作为默认值
    }
  },
  { immediate: true }
);

// 生命周期
onMounted(() => {
  loadDepartmentOptions();
  loadRoleOptions();
});

// 暴露方法给父组件
defineExpose({
  submitForm,
  formRef,
  resetForm,
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate()
});

</script>

<style scoped lang="scss">
// 头像样式
.avatar-section {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  
  .avatar-display {
    position: relative;
    flex-shrink: 0;
    
    .avatar-preview {
      border: 2px solid var(--el-border-color);
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
    
    .avatar-upload {
      position: absolute;
      bottom: 4px;
      right: 4px;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      .upload-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--el-color-primary);
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          background: var(--el-color-primary-dark-2);
        }
        
        .el-icon {
          font-size: 14px;
          color: white;
        }
      }
    }
    
    &:hover .avatar-upload {
      opacity: 1;
    }
  }
  
  .avatar-actions {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .action-group {
      .group-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        
        .group-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0;
        }
        
        .help-icon {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          cursor: pointer;
          transition: color 0.3s ease;
          
          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
      
      .button-group {
        display: flex;
        gap: 8px;
        
        .action-btn {
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }
}
</style>
