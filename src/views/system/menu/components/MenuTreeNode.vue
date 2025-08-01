<template>
  <div class="menu-tree-node">
    <div class="menu-item" :class="{ 'is-hidden': menu.isHidden }">
      <div class="menu-icon">
        <el-icon v-if="menu.icon">
          <component :is="menu.icon" />
        </el-icon>
        <el-icon v-else>
          <Menu />
        </el-icon>
      </div>

      <div class="menu-info">
        <div class="menu-title">
          {{ menu.title }}
          <el-tag
            v-if="getMenuTypeTag()"
            :type="getMenuTypeTagType()"
            size="small"
          >
            {{ getMenuTypeTag() }}
          </el-tag>
        </div>
        <div v-if="menu.path" class="menu-path">
          <el-icon><Link /></el-icon>
          <span>{{ menu.path }}</span>
        </div>
      </div>

      <div class="menu-status">
        <el-tag v-if="menu.isHidden" type="warning" size="small">隐藏</el-tag>
        <el-tag v-if="menu.cache" type="success" size="small">缓存</el-tag>
        <el-tag v-if="menu.affix" type="info" size="small">固定</el-tag>
      </div>
    </div>

    <div v-if="menu.children && menu.children.length > 0" class="menu-children">
      <MenuTreeNode
        v-for="child in menu.children"
        :key="child.id || child.path"
        :menu="child"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Menu, Link } from "@element-plus/icons-vue";

// Props
const props = defineProps<{
  menu: any;
}>();

// 计算属性
const getMenuTypeTag = () => {
  switch (props.menu.type) {
    case 1:
      return "目录";
    case 2:
      return "菜单";
    case 3:
      return "按钮";
    default:
      return "";
  }
};

const getMenuTypeTagType = () => {
  switch (props.menu.type) {
    case 1:
      return "warning" as const;
    case 2:
      return "success" as const;
    case 3:
      return "info" as const;
    default:
      return "info" as const;
  }
};
</script>

<style scoped lang="scss">
.menu-tree-node {
  .menu-item {
    display: flex;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &.is-hidden {
      opacity: 0.6;
      background: var(--el-fill-color-light);
    }
  }

  .menu-icon {
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    transition: all 0.2s ease;

    .el-icon {
      font-size: 16px;
      color: var(--el-text-color-primary);
    }
    
    &:hover {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-6);
      
      .el-icon {
        color: var(--el-color-primary);
      }
    }
  }

  .menu-info {
    flex: 1;
    min-width: 0;

    .menu-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    .menu-path {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--el-text-color-secondary);

      .el-icon {
        font-size: 12px;
      }

      span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .menu-status {
    display: flex;
    gap: 4px;
    margin-left: 12px;
    
    .el-tag {
      border: none;
      font-weight: 500;
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .menu-children {
    margin-left: 30px;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: -15px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--el-border-color-lighter);
    }

    .menu-tree-node {
      position: relative;

      &::before {
        content: "";
        position: absolute;
        left: -15px;
        top: 20px;
        width: 15px;
        height: 1px;
        background: var(--el-border-color-lighter);
      }
    }
  }
}
</style>
