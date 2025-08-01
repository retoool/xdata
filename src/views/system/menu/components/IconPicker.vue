<template>
  <div class="icon-picker">
    <div class="icon-search">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索图标（鼠标悬停查看图标名称）"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
    <div class="icon-upload">
      <el-upload
        :show-file-list="false"
        accept=".svg"
        :before-upload="handleSvgUpload"
        :disabled="uploading"
      >
        <el-button type="primary" size="small" :loading="uploading"
          >上传SVG</el-button
        >
      </el-upload>
      <el-button
        type="success"
        size="small"
        :disabled="uploading"
        @click="showSvgCodeDialog"
        >粘贴SVG代码</el-button
      >
    </div>

    <!-- 导入图标区域 -->
    <div v-if="filteredCustomIcons.length > 0" class="icon-section">
      <div class="section-title">
        <el-icon><Upload /></el-icon>
        <span>导入图标 ({{ filteredCustomIcons.length }})</span>
      </div>
      <div class="icon-grid">
        <div
          v-for="icon in filteredCustomIcons"
          :key="icon"
          class="icon-item custom-icon-item"
          :class="{ active: currentIcon === icon }"
          :title="icon"
          @click="selectIcon(icon)"
        >
          <component :is="useRenderIcon(icon)" />
          <div class="delete-icon" @click.stop="deleteCustomIcon(icon)">
            <span>×</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统内置图标区域 -->
    <div class="icon-section">
      <div class="section-title">
        <el-icon><Grid /></el-icon>
        <span>系统内置图标 ({{ filteredBuiltinIcons.length }})</span>
      </div>
      <div class="icon-grid">
        <div
          v-for="icon in filteredBuiltinIcons"
          :key="icon"
          class="icon-item"
          :class="{ active: currentIcon === icon }"
          :title="icon"
          @click="selectIcon(icon)"
        >
          <component :is="useRenderIcon(icon)" />
        </div>
      </div>
    </div>

    <div class="icon-picker-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </div>

    <!-- SVG代码粘贴对话框 -->
    <el-dialog
      v-model="showSvgDialog"
      title="粘贴SVG代码"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="svg-code-dialog">
        <el-input
          v-model="svgCode"
          type="textarea"
          :rows="8"
          placeholder="请粘贴SVG代码，例如：&#60;svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'&#62;&#60;path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'&#62;&#60;/path&#62;&#60;/svg&#62;"
          clearable
        />
        <div v-if="svgCode" class="svg-preview">
          <h4>预览：</h4>
          <div class="preview-icon" v-html="svgCode" />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button :disabled="uploading" @click="showSvgDialog = false"
            >取消</el-button
          >
          <el-button
            type="primary"
            :disabled="!svgCode.trim() || uploading"
            :loading="uploading"
            @click="handleSvgCodeConfirm"
          >
            确认添加
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Search, Upload, Grid } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { addIcon } from "@iconify/vue/dist/offline";
import { getSvgInfo } from "@pureadmin/utils";
import { icons } from "@/components/ReIcon/src/offlineIcon";
import {
  uploadSvgIcon,
  getCustomIcons,
  deleteCustomIcon as deleteCustomIconApi
} from "@/api/system/menu";

// Props
const props = defineProps<{
  currentIcon?: string;
}>();

// Emits
const emit = defineEmits<{
  iconSelect: [icon: string];
  cancel: [];
}>();

// 响应式数据
const searchKeyword = ref("");
const selectedIcon = ref(props.currentIcon || "");
const showSvgDialog = ref(false);
const svgCode = ref("");
const uploading = ref(false);

// 分别存储系统内置图标和自定义图标
const builtinIcons = ref<string[]>([]);
const customIcons = ref<string[]>([]);

onMounted(async () => {
  // 加载预设图标
  builtinIcons.value = icons
    .map(i => i[0])
    .filter((k): k is string => typeof k === "string");

  // 加载自定义图标
  try {
    const customIconData = await getCustomIcons();
    customIconData.forEach(icon => {
      // 注册到iconify离线库
      addIcon(icon.iconName, getSvgInfo(icon.svgContent));
      // 添加到自定义图标列表
      customIcons.value.push(icon.iconName);
    });
  } catch (error) {
    console.warn("Failed to load custom icons:", error);
  }

  selectedIcon.value = props.currentIcon || "";
});

// 计算属性
const filteredBuiltinIcons = computed(() => {
  if (!searchKeyword.value) {
    return builtinIcons.value;
  }
  return builtinIcons.value.filter(icon =>
    icon.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

const filteredCustomIcons = computed(() => {
  if (!searchKeyword.value) {
    return customIcons.value;
  }
  return customIcons.value.filter(icon =>
    icon.toLowerCase().includes(searchKeyword.value.toLowerCase())
  );
});

const currentIcon = computed(() => selectedIcon.value);

// 方法
const handleSearch = () => {};

const selectIcon = (icon: string) => {
  selectedIcon.value = icon;
};

const handleConfirm = () => {
  emit("iconSelect", selectedIcon.value);
};

const handleCancel = () => {
  emit("cancel");
};

// 处理SVG上传
const handleSvgUpload = async (file: File) => {
  uploading.value = true;
  try {
    const reader = new FileReader();
    reader.onload = async e => {
      const svgContent = e.target?.result as string;
      if (svgContent) {
        try {
          // 上传到后端保存到数据库
          const result = await uploadSvgIcon(
            svgContent,
            `custom/svg-${Date.now()}`
          );
          // 注册到iconify离线库
          addIcon(result.iconName, getSvgInfo(result.svgContent));
          // 加入自定义图标列表
          customIcons.value.unshift(result.iconName);
          // 自动选中
          selectedIcon.value = result.iconName;
          ElMessage.success("SVG图标上传成功");
        } catch (error) {
          ElMessage.error("SVG图标上传失败");
          console.error("Upload SVG failed:", error);
        }
      }
    };
    reader.readAsText(file);
  } finally {
    uploading.value = false;
  }
  // 阻止el-upload自动上传
  return false;
};

// 显示SVG代码对话框
const showSvgCodeDialog = () => {
  showSvgDialog.value = true;
  svgCode.value = "";
};

// 处理SVG代码确认
const handleSvgCodeConfirm = async () => {
  if (svgCode.value.trim()) {
    uploading.value = true;
    try {
      // 上传到后端保存到数据库
      const result = await uploadSvgIcon(
        svgCode.value.trim(),
        `custom/svg-${Date.now()}`
      );
      // 注册到iconify离线库
      addIcon(result.iconName, getSvgInfo(result.svgContent));
      // 加入自定义图标列表
      customIcons.value.unshift(result.iconName);
      // 自动选中
      selectedIcon.value = result.iconName;
      // 关闭对话框
      showSvgDialog.value = false;
      svgCode.value = "";
      ElMessage.success("SVG图标添加成功");
    } catch (error) {
      ElMessage.error("SVG图标添加失败");
      console.error("Add SVG failed:", error);
    } finally {
      uploading.value = false;
    }
  }
};

// 删除自定义图标
const deleteCustomIcon = async (iconName: string) => {
  try {
    await deleteCustomIconApi(iconName);
    ElMessage.success("图标删除成功");
    // 从iconify离线库中移除
    removeIcon(iconName);
    // 从自定义图标列表中移除
    customIcons.value = customIcons.value.filter(icon => icon !== iconName);
    // 如果删除的是当前选中的图标，取消选中
    if (selectedIcon.value === iconName) {
      selectedIcon.value = "";
    }
  } catch (error) {
    ElMessage.error("图标删除失败");
    console.error("Delete custom icon failed:", error);
  }
};

// 从iconify离线库中移除图标
const removeIcon = (iconName: string) => {
  const iconify = (window as any).iconify;
  if (iconify && iconify.icons) {
    delete iconify.icons[iconName];
  }
};
</script>

<style scoped lang="scss">
.icon-picker {
  .icon-search {
    margin-bottom: 16px;
  }
  
  .icon-upload {
    margin-bottom: 12px;
    display: flex;
    gap: 8px;
  }

  .icon-section {
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);

      .el-icon {
        color: var(--el-color-primary);
      }
    }
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 8px;
    max-height: 300px;
    overflow-y: auto;
    padding: 8px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background-color: var(--el-fill-color-blank);
    transition: all 0.2s ease;

    .icon-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      
      &:hover {
        background-color: var(--el-fill-color-light);
        border-color: var(--el-color-primary-light-5);
        transform: scale(1.05);
      }
      
      &.active {
        background-color: var(--el-color-primary);
        color: white;
        border-color: var(--el-color-primary);
        transform: scale(1.1);
      }
      
      :deep(svg) {
        width: 20px;
        height: 20px;
      }
    }

    .custom-icon-item {
      position: relative;
      
      .delete-icon {
        position: absolute;
        top: -2px;
        right: -2px;
        background-color: var(--el-color-danger);
        border-radius: 50%;
        width: 18px;
        height: 18px;
        display: none;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        opacity: 0.8;
        border: 1px solid var(--el-color-danger-light-3);
        
        &:hover {
          background-color: var(--el-color-danger-dark-2);
          opacity: 1;
          transform: scale(1.1);
        }
        
        span {
          color: white;
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
        }
      }
      
      &:hover .delete-icon {
        display: flex;
      }
    }
  }

  .icon-picker-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.svg-code-dialog {
  .svg-preview {
    margin-top: 16px;
    padding: 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background-color: var(--el-fill-color-light);
    transition: all 0.2s ease;

    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .preview-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background-color: var(--el-bg-color);
      border-radius: 8px;
      border: 1px solid var(--el-border-color-lighter);

      :deep(svg) {
        width: 32px;
        height: 32px;
        color: var(--el-color-primary);
      }
    }
  }
}

// 输入框样式
:deep(.el-input) {
  .el-input__wrapper {
    border-radius: 4px;
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }
    
    &.is-focused {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }
}

// 文本域样式
:deep(.el-textarea) {
  .el-textarea__inner {
    border-radius: 4px;
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }
    
    &:focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }
}
</style>
