<template>
  <div v-if="selectedNode" class="properties-panel">
    <div class="panel-header">
      <div class="header-title">
        <el-icon><Setting /></el-icon>
        <span>节点属性</span>
      </div>
      <el-button type="text" @click="$emit('close')">
        <el-icon><Close /></el-icon>
      </el-button>
    </div>

    <div class="panel-content">
      <el-scrollbar>
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-position="top"
          @submit.prevent
        >
          <!-- 基本信息 -->
          <div class="form-section">
            <div class="section-title">基本信息</div>

            <el-form-item label="节点名称" prop="name">
              <el-input
                v-model="formData.name"
                placeholder="请输入节点名称"
                @change="handleFormChange"
              />
            </el-form-item>

            <el-form-item label="节点类型">
              <el-input v-model="formData.type" readonly disabled />
            </el-form-item>

            <el-form-item label="节点描述" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入节点描述"
                @change="handleFormChange"
              />
            </el-form-item>
          </div>

          <!-- 参数配置 -->
          <div
            v-if="formData.params && formData.params.length > 0"
            class="form-section"
          >
            <div class="section-title">参数配置</div>

            <el-form-item
              v-for="(param, index) in formData.params"
              :key="param.name"
              :label="param.label"
              :prop="`params.${index}.value`"
              :rules="getParamRules(param)"
            >
              <template #label>
                <div class="param-label">
                  <span>{{ param.label }}</span>
                  <el-tag v-if="param.required" size="small" type="danger"
                    >必填</el-tag
                  >
                </div>
                <div v-if="param.description" class="param-description">
                  {{ param.description }}
                </div>
              </template>

              <!-- 字符串类型 -->
              <el-input
                v-if="param.type === 'string'"
                v-model="param.value"
                :placeholder="param.placeholder || '请输入' + param.label"
                :disabled="param.readonly"
                @input="handleParamChange(param, index)"
              />

              <!-- 数字类型 -->
              <el-input-number
                v-else-if="param.type === 'number'"
                v-model="param.value"
                :min="param.min"
                :max="param.max"
                :step="param.step || 1"
                :precision="param.precision"
                :disabled="param.readonly"
                style="width: 100%"
                @change="handleParamChange(param, index)"
              />

              <!-- 布尔类型 -->
              <el-switch
                v-else-if="param.type === 'boolean'"
                v-model="param.value"
                :disabled="param.readonly"
                @change="handleParamChange(param, index)"
              />

              <!-- 枚举选择 -->
              <el-select
                v-else-if="param.type === 'enum'"
                v-model="param.value"
                :placeholder="param.placeholder || '请选择' + param.label"
                :disabled="param.readonly"
                style="width: 100%"
                @change="handleParamChange(param, index)"
              >
                <el-option
                  v-for="option in param.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>

              <!-- 多选枚举 -->
              <el-select
                v-else-if="param.type === 'multiEnum'"
                v-model="param.value"
                :placeholder="param.placeholder || '请选择' + param.label"
                :disabled="param.readonly"
                multiple
                style="width: 100%"
                @change="handleParamChange(param, index)"
              >
                <el-option
                  v-for="option in param.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>

              <!-- 文件上传 -->
              <el-upload
                v-else-if="param.type === 'file'"
                :disabled="param.readonly"
                :limit="1"
                :on-change="file => handleFileChange(param, index, file)"
                :auto-upload="false"
              >
                <el-button type="primary">选择文件</el-button>
                <template #tip>
                  <div v-if="param.accept" class="el-upload__tip">
                    只能上传{{ param.accept }}文件
                  </div>
                </template>
              </el-upload>

              <!-- JSON 配置 -->
              <el-input
                v-else-if="param.type === 'json'"
                v-model="param.value"
                type="textarea"
                :rows="4"
                :placeholder="param.placeholder || '请输入JSON格式配置'"
                :disabled="param.readonly"
                @input="handleJsonChange(param, index)"
              />

              <!-- 默认文本输入 -->
              <el-input
                v-else
                v-model="param.value"
                :placeholder="param.placeholder || '请输入' + param.label"
                :disabled="param.readonly"
                @input="handleParamChange(param, index)"
              />

              <!-- 参数帮助信息 -->
              <div v-if="param.help" class="param-help">
                <el-text type="info" size="small">
                  <el-icon><QuestionFilled /></el-icon>
                  {{ param.help }}
                </el-text>
              </div>

              <!-- 参数错误提示 -->
              <div v-if="param.error" class="param-error">
                <el-text type="danger" size="small">
                  <el-icon><WarningFilled /></el-icon>
                  {{ param.error }}
                </el-text>
              </div>
            </el-form-item>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-params">
            <el-icon><Box /></el-icon>
            <span>该节点暂无可配置参数</span>
          </div>
        </el-form>
      </el-scrollbar>
    </div>

    <div class="panel-footer">
      <el-button @click="handleReset">重置</el-button>
      <el-button type="primary" @click="handleSave">应用</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules, UploadFile } from "element-plus";
import {
  Setting,
  Close,
  QuestionFilled,
  WarningFilled,
  Box
} from "@element-plus/icons-vue";
import type { NodeData, NodeParam } from "../types";

interface Props {
  selectedNode: NodeData | null;
}

interface Emits {
  (e: "close"): void;
  (e: "update", node: NodeData): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const formData = reactive<NodeData>({
  id: "",
  name: "",
  type: "",
  description: "",
  position: { x: 0, y: 0 },
  params: []
});

// 监听选中节点变化
watch(
  () => props.selectedNode,
  newNode => {
    if (newNode) {
      Object.assign(formData, {
        ...newNode,
        params: newNode.params ? JSON.parse(JSON.stringify(newNode.params)) : []
      });
    }
  },
  { immediate: true, deep: true }
);

// 表单验证规则
const formRules = computed(() => {
  const rules: FormRules = {
    name: [
      { required: true, message: "请输入节点名称", trigger: "blur" },
      { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" }
    ]
  };
  return rules;
});

// 获取参数验证规则
const getParamRules = (param: NodeParam) => {
  const rules: any[] = [];

  if (param.required) {
    rules.push({
      required: true,
      message: `${param.label}为必填项`,
      trigger: ["blur", "change"]
    });
  }

  if (param.type === "string" && param.minLength) {
    rules.push({
      min: param.minLength,
      message: `最少输入${param.minLength}个字符`,
      trigger: "blur"
    });
  }

  if (param.type === "string" && param.maxLength) {
    rules.push({
      max: param.maxLength,
      message: `最多输入${param.maxLength}个字符`,
      trigger: "blur"
    });
  }

  if (param.type === "number") {
    rules.push({
      type: "number",
      message: "请输入有效的数字",
      trigger: ["blur", "change"]
    });
  }

  return rules;
};

// 表单数据变化处理
const handleFormChange = () => {
  validateForm();
};

// 参数变化处理
const handleParamChange = (param: NodeParam, index: number) => {
  // 清除之前的错误
  param.error = undefined;

  // 参数验证
  if (
    param.required &&
    (param.value === undefined || param.value === null || param.value === "")
  ) {
    param.error = "该字段为必填项";
  } else if (param.type === "number") {
    const num = Number(param.value);
    if (isNaN(num)) {
      param.error = "请输入有效的数字";
    } else if (param.min !== undefined && num < param.min) {
      param.error = `值不能小于 ${param.min}`;
    } else if (param.max !== undefined && num > param.max) {
      param.error = `值不能大于 ${param.max}`;
    }
  } else if (param.type === "string") {
    const str = String(param.value || "");
    if (param.minLength && str.length < param.minLength) {
      param.error = `最少输入${param.minLength}个字符`;
    } else if (param.maxLength && str.length > param.maxLength) {
      param.error = `最多输入${param.maxLength}个字符`;
    }
  }

  // 触发父组件更新
  emitUpdate();
};

// JSON参数变化处理
const handleJsonChange = (param: NodeParam, index: number) => {
  param.error = undefined;

  if (param.value) {
    try {
      JSON.parse(param.value);
    } catch (e) {
      param.error = "JSON格式不正确";
    }
  }

  handleParamChange(param, index);
};

// 文件变化处理
const handleFileChange = (
  param: NodeParam,
  index: number,
  file: UploadFile
) => {
  param.value = file.name;
  handleParamChange(param, index);
};

// 验证表单
const validateForm = async () => {
  if (!formRef.value) return false;

  try {
    await formRef.value.validate();
    return true;
  } catch {
    return false;
  }
};

// 发送更新事件
const emitUpdate = () => {
  if (props.selectedNode) {
    emit("update", {
      ...formData,
      hasErrors: formData.params?.some(p => p.error) || false
    });
  }
};

// 保存配置
const handleSave = async () => {
  if (await validateForm()) {
    emitUpdate();
    ElMessage.success("配置已应用");
  }
};

// 重置配置
const handleReset = async () => {
  if (!props.selectedNode) return;

  await ElMessageBox.confirm("确定要重置配置吗？", "确认重置", {
    type: "warning"
  });

  // 重置为初始值
  formData.params?.forEach(param => {
    param.value = param.default;
    param.error = undefined;
  });

  formRef.value?.clearValidate();
  emitUpdate();
  ElMessage.success("配置已重置");
};
</script>

<style lang="scss" scoped>
.properties-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);

  .panel-header {
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color-light);

    .header-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }

  .panel-content {
    flex: 1;
    overflow: hidden;

    .form-section {
      padding: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .section-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 12px;
        padding-bottom: 6px;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }
    }

    .param-label {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
    }

    .param-description {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .param-help {
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .param-error {
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .empty-params {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 16px;
      color: var(--el-text-color-secondary);

      svg {
        font-size: 40px;
        margin-bottom: 8px;
      }
    }
  }

  .panel-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--el-border-color-light);
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }
}

:deep(.el-form-item__label) {
  padding: 0;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-textarea__inner) {
  resize: vertical;
}
</style>
