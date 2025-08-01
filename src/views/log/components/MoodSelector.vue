<template>
  <div class="mood-selector">
    <div class="mood-stars">
      <div
        v-for="star in 5"
        :key="star"
        class="star-container"
        @click="handleStarClick(star)"
        @mouseenter="hoveredStar = star"
        @mouseleave="hoveredStar = 0"
      >
        <el-icon
          :class="[
            'mood-star',
            { 
              'active': star <= modelValue,
              'hover': star <= hoveredStar && hoveredStar > 0
            }
          ]"
        >
          <Star v-if="star <= (hoveredStar || modelValue)" />
          <StarFilled v-else />
        </el-icon>
        <div class="star-tooltip" v-if="star === hoveredStar">
          {{ getMoodLabel(star) }}
        </div>
      </div>
    </div>
    <div class="mood-info">
      <div class="mood-label">
        {{ getMoodLabel(modelValue) }}
      </div>
      <div class="mood-description">
        {{ getMoodDescription(modelValue) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Star, StarFilled } from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// 响应式数据
const hoveredStar = ref(0)

// 处理星星点击
const handleStarClick = (star: number) => {
  emit('update:modelValue', star)
}

// 获取心情标签
const getMoodLabel = (mood: number): string => {
  const labels = [
    '未设置',
    '很差',
    '不好',
    '一般',
    '不错',
    '很好'
  ]
  return labels[mood] || labels[0]
}

// 获取心情描述
const getMoodDescription = (mood: number): string => {
  const descriptions = [
    '点击星星设置心情',
    '今天过得很糟糕',
    '心情不太好',
    '平平淡淡的一天',
    '今天还不错',
    '今天心情很好！'
  ]
  return descriptions[mood] || descriptions[0]
}
</script>

<style scoped>
.mood-selector {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background: var(--el-fill-color-extra-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--el-border-color);
    background: var(--el-fill-color-light);
  }
}

.mood-stars {
  display: flex;
  gap: 8px;
  position: relative;
}

.star-container {
  position: relative;
  cursor: pointer;
}

.mood-star {
  font-size: 24px;
  color: var(--el-color-info-light-5);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--el-color-warning);
    transform: scale(1.1);
    background: var(--el-color-warning-light-9);
  }
  
  &.active {
    color: var(--el-color-warning);
    animation: starPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  &.hover {
    color: var(--el-color-warning-light-3);
    transform: scale(1.05);
  }
}

.star-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--el-border-color-lighter);
  z-index: 1000;
  margin-bottom: 8px;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--el-bg-color);
  }
}

.mood-info {
  flex: 1;
  min-width: 0;
}

.mood-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  line-height: 1.2;
}

.mood-description {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
}

@keyframes starPop {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .mood-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 12px;
  }
  
  .mood-stars {
    gap: 6px;
  }
  
  .mood-star {
    font-size: 20px;
    padding: 3px;
  }
  
  .mood-label {
    font-size: 14px;
  }
  
  .mood-description {
    font-size: 12px;
  }
  
  .star-tooltip {
    font-size: 11px;
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .mood-selector {
    padding: 10px;
    gap: 12px;
  }
  
  .mood-star {
    font-size: 18px;
    padding: 2px;
  }
  
  .mood-label {
    font-size: 13px;
  }
  
  .mood-description {
    font-size: 11px;
  }
}
</style> 