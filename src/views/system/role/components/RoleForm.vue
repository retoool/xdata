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

      <!-- 角色信息预览（编辑模式） 拆分为角色信息和时间信息 -->
      <el-form-item v-if="formMode === 'edit'" label="角色信息">
        <div class="role-info">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="权限数量">
              <el-tag type="info" size="small">
                {{ formData.permissionCount ?? 0 }} 个
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="用户数量">
              <el-tag type="info" size="small">
                {{ formData.userCount ?? 0 }} 人
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-form-item>
      <el-form-item v-if="formMode === 'edit'" label="时间信息">
        <div class="role-info">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="创建时间">
              {{ formData.createTime ? dayjs(formData.createTime).format('YYYY-MM-DD HH:mm:ss') : "未知" }}
            </el-descriptions-item>
            <el-descriptions-item label="最后更新">
              {{ formData.updateTime ? dayjs(formData.updateTime).format('YYYY-MM-DD HH:mm:ss') : "未知" }}
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
import { ref, reactive, watch, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import dayjs from "dayjs";
import type { FormInstance, FormRules } from "element-plus";
import type { Role, RoleFormData } from "@/views/system/role/types/role";
import { UserFilled, Key } from "@element-plus/icons-vue";
import {
  checkRoleName,
  checkRoleCode,
  createRole,
  updateRole,
  copyRole
} from "@/api/system/role";

// Props
const props = defineProps<{
  formData: Partial<RoleFormData>;
  formMode: FormMode;
}>();

// Emits
const emit = defineEmits<{
  submit: [];
  cancel: [];
}>();

// 响应式数据
const formRef = ref<FormInstance>();
const submitting = ref(false);

const formData = reactive<RoleFormData>({
  id: undefined,
  name: "",
  code: "",
  description: "",
  permissions: [],
  createTime: "",
  updateTime: "",
});

// 计算属性
const isCodeDisabled = computed(() => {
  return props.formMode === "edit" && formData.code !== "admin";
});

// 表单验证规则
const formRules: FormRules<RoleFormData> = {
  name: [
    { required: true, message: "请输入角色名称", trigger: "blur" },
    { min: 2, max: 50, message: "角色名称长度为2-50个字符", trigger: "blur" }
    // 移除异步唯一性校验
  ],
  code: [
    { required: true, message: "请输入角色编码", trigger: "blur" },
    { min: 2, max: 50, message: "角色编码长度为2-50个字符", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: "角色编码只能包含字母、数字和下划线",
      trigger: "blur"
    }
  ],
  description: [
    { max: 200, message: "描述长度不能超过200个字符", trigger: "blur" }
  ]
};

// 方法
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    // 新增：提交时唯一性校验
    const [nameAvailable, codeAvailable] = await Promise.all([
      checkRoleName(formData.name, props.formMode === "edit" ? formData.id : undefined),
      checkRoleCode(formData.code, props.formMode === "edit" ? formData.id : undefined)
    ]);
    if (!nameAvailable) {
      ElMessage.error("该角色名称已存在");
      return;
    }
    if (!codeAvailable) {
      ElMessage.error("该角色编码已存在");
      return;
    }
    submitting.value = true;

    let result: Role;
    if (props.formMode === "create") {
      await createRole(formData);
    } else if (props.formMode === "edit"){
      await updateRole(formData.id!, formData);
    } else if (props.formMode === "copy"){
      await copyRole(formData.id!, formData.name, formData.code);
    }

    emit("submit");
  } catch (error: any) {
    ElMessage.error(error?.message || "请检查表单数据");
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit("cancel");
};

const getSubmitButtonText = () => {
  if (props.formMode === "create") return "创建角色";
  if (props.formMode === "edit") return "更新角色";
  if (props.formMode === "copy") return "复制角色";
  return "提交";
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 监听props变化，更新表单数据
watch(
  () => props.formData,
  newData => {
    if (newData) {
      Object.assign(formData, {
        id: newData.id,
        name: newData.name || "",
        code:
          props.formMode === "copy"
            ? `${newData.code || ""}`
            : newData.code || "",
        description: newData.description || "",
        permissions: newData.permissions || [],
        userCount: newData.userCount ?? 0,
        permissionCount: newData.permissionCount ?? 0,
        createTime: newData.createTime,
        updateTime: newData.updateTime,
      });
    }
  },
  { immediate: true, deep: true }
);

// 暴露方法
defineExpose({
  resetForm,
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate()
});
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
      border-radius: 8px;
      border: 1px solid var(--el-border-color-lighter);
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--el-border-color);
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
  color: var(--el-text-color-regular);
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
  }
  
  &.is-focused {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 8px;
  }
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--el-color-primary-light-5);
  }
  
  &:focus {
    border-color: var(--el-color-primary);
  }
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

:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &.el-button--primary {
    background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, var(--el-color-primary-light-3) 0%, var(--el-color-primary) 100%);
    }
  }
  
  &.el-button--danger {
    background: linear-gradient(135deg, var(--el-color-danger) 0%, var(--el-color-danger-light-3) 100%);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, var(--el-color-danger-light-3) 0%, var(--el-color-danger) 100%);
    }
  }
}
</style>
