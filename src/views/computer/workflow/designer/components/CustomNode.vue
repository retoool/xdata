<template>
  <div
    class="custom-node"
    :class="{
      'is-selected': selected,
      'has-errors': data.hasErrors
    }"
    @click="handleSelect"
  >
    <div class="node-header">
      <el-icon><Component /></el-icon>
      <span class="node-title">{{ data.name }}</span>
      <div class="node-actions">
        <el-button type="text" size="small" @click.stop="handleDelete">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="node-content">
      <div class="node-type">
        {{ data.type }}
      </div>
      <div v-if="data.description" class="node-description">
        {{ data.description }}
      </div>
      <div v-if="data.params && data.params.length > 0" class="node-params">
        <div
          v-for="(param, index) in data.params"
          :key="index"
          class="param-item"
          :class="{ 'has-error': param.error }"
        >
          <span class="param-label">{{ param.label }}:</span>
          <span class="param-value">{{ param.value }}</span>
          <el-tooltip
            v-if="param.error"
            :content="param.error"
            placement="top"
            effect="dark"
          >
            <el-icon class="error-icon"><Warning /></el-icon>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div class="node-ports">
      <div v-if="data.type !== 'start'" class="port port-in">
        <div class="port-point" />
      </div>
      <div v-if="data.type !== 'end'" class="port port-out">
        <div class="port-point" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Connection as Component,
  Delete,
  Warning
} from "@element-plus/icons-vue";
import type { NodeProps } from "@vue-flow/core";
import type { NodeData, NodeParam } from "../types";

const props = defineProps<{
  id: string;
  type: string;
  data: NodeData;
  selected: boolean;
  connectable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  position: {
    x: number;
    y: number;
  };
}>();

const handleSelect = () => {
  if (props.data.onSelect) {
    props.data.onSelect(props.data);
  }
};

const handleDelete = () => {
  if (props.data.onDelete) {
    props.data.onDelete(props.data.id);
  }
};

const handleUpdate = (newData: Partial<NodeData>) => {
  if (props.data.onUpdate) {
    props.data.onUpdate({
      ...props.data,
      ...newData
    });
  }
};
</script>

<style lang="scss" scoped>
.custom-node {
  width: 200px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  position: relative;
  cursor: move;
  user-select: none;

  &.is-selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-5);
  }

  &.has-errors {
    border-color: var(--el-color-danger);
  }

  .node-header {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--el-border-color-light);

    .node-title {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .node-actions {
      display: flex;
      gap: 4px;
    }
  }

  .node-content {
    padding: 12px;

    .node-type {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .node-description {
      font-size: 12px;
      color: var(--el-text-color-regular);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      margin-bottom: 8px;
    }

    .node-params {
      margin-top: 8px;
      border-top: 1px dashed var(--el-border-color-light);
      padding-top: 8px;

      .param-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        font-size: 12px;

        .param-label {
          color: var(--el-text-color-secondary);
          min-width: 60px;
        }

        .param-value {
          color: var(--el-text-color-regular);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        &.has-error {
          color: var(--el-color-danger);

          .param-label,
          .param-value {
            color: var(--el-color-danger);
          }
        }

        .error-icon {
          color: var(--el-color-danger);
          margin-left: 4px;
        }
      }
    }
  }

  .node-ports {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;

    .port {
      position: absolute;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;

      &-in {
        top: 50%;
        left: -8px;
        transform: translateY(-50%);
      }

      &-out {
        top: 50%;
        right: -8px;
        transform: translateY(-50%);
      }

      .port-point {
        width: 8px;
        height: 8px;
        background-color: var(--el-color-primary);
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.5);
        }
      }
    }
  }
}
</style>
