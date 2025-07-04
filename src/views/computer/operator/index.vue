<template>
  <div class="operator-page">
    <div class="category-tree">
      <CategoryTree 
        ref="categoryTreeRef"
        @type-change="handleTypeChange"
        @node-select="handleNodeSelect"
      />
    </div>
    <div class="content-area">
      <OperatorTable 
        ref="operatorTableRef"
        :selected-category-id="selectedCategoryIds"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CategoryTree from "./CategoryTree.vue";
import OperatorTable from "./OperatorTable.vue";
import { OperatorType } from '@/api/operator'

const operatorTableRef = ref()
const categoryTreeRef = ref()
const selectedCategoryIds = ref<number[]>([])

const handleTypeChange = (type: OperatorType) => {
  // 无论类型是否变化，都清空分类树高亮和选中
  categoryTreeRef.value?.clearCurrentKey();
  selectedCategoryIds.value = [];
  operatorTableRef.value?.setOperatorType(type);
  console.log('Type changed to:', type, 'clearing selectedCategoryIds');
}

const handleNodeSelect = (payload: { ids: number[], node: any }) => {
  selectedCategoryIds.value = payload.ids
  // 通过 props 更新，不需要手动调用 setCategoryId
  console.log('Node selected, updating selectedCategoryIds:', payload.ids);
}
</script>

<style scoped>
.operator-page {
  display: flex;
  height: 100%;
}
.category-tree {
  width: 320px;
  min-width: 320px;
  max-width: 420px;
  margin-right: 16px;
  transition: width 0.2s;
  display: flex;
  flex-direction: column;
}
.content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
</style> 