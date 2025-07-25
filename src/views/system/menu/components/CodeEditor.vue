<template>
  <div class="code-editor">
    <div class="code-header">
      <div class="language-tag">
        <span>{{ language }}</span>
      </div>
      <div class="actions">
        <el-button size="small" text @click="copyCode">
          <el-icon><DocumentCopy /></el-icon>
          复制
        </el-button>
      </div>
    </div>
    <div class="code-content">
      <pre><code :class="`language-${language}`">{{ formattedCode }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElMessage } from "element-plus";
import { DocumentCopy } from "@element-plus/icons-vue";

// Props
const props = defineProps<{
  code: string;
  language?: string;
  readonly?: boolean;
}>();

// 计算属性
const formattedCode = computed(() => {
  return props.code || "";
});

// 方法
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    ElMessage.success("代码已复制到剪贴板");
  } catch (error) {
    ElMessage.error("复制失败");
  }
};
</script>

<style scoped lang="scss">
.code-editor {
  background: var(--el-fill-color-darker);
  border-radius: 6px;
  overflow: hidden;

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--el-fill-color-dark);
    border-bottom: 1px solid var(--el-border-color);

    .language-tag {
      span {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        font-family: "JetBrains Mono", "Monaco", "Consolas", monospace;
      }
    }

    .actions {
      .el-button {
        font-size: 12px;
        padding: 4px 8px;
      }
    }
  }

  .code-content {
    padding: 16px;
    overflow-x: auto;

    pre {
      margin: 0;
      padding: 0;
      background: transparent;
      font-family: "JetBrains Mono", "Monaco", "Consolas", monospace;
      font-size: 13px;
      line-height: 1.5;
      color: var(--el-text-color-primary);

      code {
        background: transparent;
        padding: 0;
        border-radius: 0;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
        color: inherit;
        white-space: pre;
        word-wrap: normal;
        overflow-wrap: normal;
      }
    }
  }
}

// 代码高亮样式（简单版本）
.language-javascript,
.language-json {
  .keyword {
    color: #569cd6;
    font-weight: bold;
  }

  .string {
    color: #ce9178;
  }

  .number {
    color: #b5cea8;
  }

  .comment {
    color: #6a9955;
    font-style: italic;
  }

  .function {
    color: #dcdcaa;
  }
}
</style>
