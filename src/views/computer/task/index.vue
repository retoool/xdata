<template>
  <div class="task-page">
    <div class="category-tree">
      <CategoryTree />
    </div>
    <div class="content-area">
      <!-- 任务管理内容区 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryTree from "./CategoryTree.vue";
// 预留后续逻辑
</script>

<style scoped>
.task-page {
  display: flex;
  height: 100%;
}
.category-tree {
  width: 240px;
  border-right: 1px solid #eee;
  padding: 16px 8px;
  background: #fafbfc;
}
.content-area {
  flex: 1;
  padding: 16px;
}
</style> 