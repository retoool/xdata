# XData 系统样式布局标准化文档

## 📋 概述

本文档定义了XData系统的统一样式布局规范，确保整个系统具有一致的用户界面和用户体验。

## 🎯 核心原则

1. **高度设置**: 使用 `height: 100%` 或根据内容需要设置合适的高度
2. **统一间距**: 使用预定义的间距变量
3. **主题适配**: 支持浅色/深色主题
4. **现代化布局**: 使用Flexbox和Grid布局
5. **统一样式**: 弹窗、卡片、按钮等组件风格一致
6. **样式组织**: 组件样式统一在 `@/style` 目录下管理

## 📏 间距规范

### 基础间距变量

```scss
// 间距变量定义
$spacing-xs: 4px;    // 超小间距
$spacing-sm: 8px;    // 小间距
$spacing-md: 16px;   // 中等间距
$spacing-lg: 24px;   // 大间距
$spacing-xl: 32px;   // 超大间距
```

### 使用场景

```scss
// 页面容器内边距
.page-container {
  padding: $spacing-md;  // 16px
}

// 组件间距
.component-gap {
  gap: $spacing-md;      // 16px
}

// 小间距
.small-gap {
  gap: $spacing-sm;      // 8px
}

// 卡片内边距
.card-padding {
  padding: $spacing-lg;  // 24px
}

// 对话框内边距
.dialog-padding {
  padding: $spacing-xl;  // 32px
}
```

## 🎨 主题变量

### CSS变量定义

```scss
:root {
  // 背景色
  --page-bg: var(--el-bg-color-page);
  --card-bg: var(--el-bg-color);
  --sidebar-bg: var(--el-bg-color);
  
  // 边框色
  --border-color: var(--el-border-color-lighter);
  --border-color-light: var(--el-border-color-light);
  
  // 文字色
  --text-primary: var(--el-text-color-primary);
  --text-regular: var(--el-text-color-regular);
  --text-secondary: var(--el-text-color-secondary);
  
  // 圆角
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  // 过渡
  --transition-fast: all 0.2s ease;
  --transition-normal: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 📐 页面布局

### 基础页面容器

```scss
.page-container {
  height: 100%;
  padding: 16px;
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 长页面容器（内容超出视口高度时）
.page-container-long {
  min-height: 100%;
  padding: 16px;
  background: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}
```

### 内容区域布局

```scss
.content-area {
  position: relative;
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 当侧边栏收起时，去掉gap
  &.content-no-gap {
    gap: 0;
  }
}
```

### 常用布局模式

#### 1. 侧边栏 + 主内容布局

```vue
<template>
  <div class="page-container">
    <div class="content-area">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <div class="toolbar">
          <!-- 工具栏内容 -->
        </div>
        <div class="tree-container">
          <!-- 树形组件 -->
        </div>
      </div>
      
      <!-- 主内容区 -->
      <div class="content-main">
        <div class="table-container">
          <!-- 表格内容 -->
        </div>
      </div>
    </div>
  </div>
</template>
```

#### 2. 顶部导航 + 内容区布局

```vue
<template>
  <div class="page-container">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-left">
        <!-- 左侧导航内容 -->
      </div>
      <div class="nav-right">
        <!-- 右侧操作按钮 -->
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-area">
      <div class="content-main">
        <!-- 主要内容 -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  margin-bottom: 16px;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
```

#### 3. 卡片网格布局

```vue
<template>
  <div class="page-container">
    <div class="content-area">
      <div class="card-grid">
        <div class="card-item" v-for="item in items" :key="item.id">
          <!-- 卡片内容 -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
}

.card-item {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--el-border-color);
  }
}
</style>
```

#### 4. 表单页面布局

```vue
<template>
  <div class="page-container">
    <div class="content-area">
      <div class="form-container">
        <div class="form-header">
          <h2>表单标题</h2>
        </div>
        <div class="form-content">
          <el-form :model="form" label-width="120px">
            <!-- 表单内容 -->
          </el-form>
        </div>
        <div class="form-footer">
          <!-- 操作按钮 -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
}

.form-header {
  padding: 24px 24px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.form-content {
  padding: 24px;
  flex: 1;
}

.form-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
```

#### 5. 仪表板布局

```vue
<template>
  <div class="page-container">
    <div class="content-area">
      <div class="dashboard-grid">
        <!-- 统计卡片 -->
        <div class="stat-card" v-for="stat in stats" :key="stat.id">
          <div class="stat-icon">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
        
        <!-- 图表区域 -->
        <div class="chart-container">
          <!-- 图表内容 -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  padding: 16px;
}

.stat-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--el-border-color);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.chart-container {
  grid-column: 1 / -1;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
}
</style>
```

### 侧边栏样式

```scss
.sidebar {
  position: relative;
  width: 280px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  overflow: visible;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  
  &:hover {
    border-color: var(--el-border-color);
  }
  
  // 收起状态
  &.collapsed {
    transform: translateX(-100%);

    .toolbar,
    .tree-container {
      pointer-events: none;
    }
    
    .sidebar-collapse {
      right: -12px;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
  }
}
```

### 主内容区样式

```scss
.content-main {
  flex: 1;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: var(--el-border-color);
  }
  
  // 当侧边栏收起时，主内容区域占据全宽
  &.expanded {
    margin-left: -280px;
  }
}
```

## 🧩 组件样式

### 工具栏组件

```scss
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  .left-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .right-search {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
```

### 表格组件

```scss
.table-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .el-table {
    flex: 1;
    
    :deep(.el-table__header) {
      background: var(--el-fill-color-light);
      
      .el-table__cell {
        background: var(--el-fill-color-light);
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
    
    :deep(.el-table__row) {
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--el-fill-color-light);
      }
    }
    
    // 头像列样式
    .el-avatar {
      border: 2px solid var(--el-border-color-lighter);
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--el-color-primary);
        transform: scale(1.05);
      }
    }
    
    // 标签样式
    .el-tag {
      border-radius: 4px;
      font-weight: 500;
      transition: all 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    // 开关样式
    .el-switch {
      .el-switch__core {
        border-radius: 12px;
        transition: all 0.2s ease;
      }
    }
  }
}
```

### 表单组件

```scss
.user-form {
  .el-form {
    .el-form-item__label {
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
    
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
    
    .el-select {
      .el-input__wrapper {
        border-radius: 4px;
      }
    }
  }
}
```

### 侧边栏折叠按钮

```scss
.sidebar-collapse {
  position: absolute;
  top: 50%;
  right: -12px;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 34px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  transform: translateY(-50%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  
  &:hover {
    background: var(--el-fill-color-light);
    border-color: var(--el-border-color);
    transform: translateY(-50%) scale(1.05);
    
    .el-icon {
      color: var(--el-text-color-primary);
      transform: scale(1.1);
    }
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  .el-icon {
    color: var(--el-text-color-regular);
    font-size: 14px;
    transition: all 0.2s ease;
    
    &.rotated {
      transform: rotate(180deg);
    }
  }
}

// 鼠标悬停时显示按钮
.sidebar:hover .sidebar-collapse {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
```

### 工具栏组件

```scss
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  
  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
```

### 表格容器

```scss
.table-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  .el-table {
    flex: 1;
    
    :deep(.el-table__header) {
      background: var(--el-fill-color-light);
      
      .el-table__cell {
        background: var(--el-fill-color-light);
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
    
    :deep(.el-table__row) {
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--el-fill-color-light);
      }
    }
  }
}
```

### 分页器

```scss
.pagination {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}
```

## 🪟 弹窗样式

### 使用 Element Plus Dialog 组件

XData 系统统一使用 Element Plus 的 `el-dialog` 组件来创建弹窗，确保界面的一致性和用户体验。

#### 统一弹窗样式

Element Plus Dialog 组件的统一样式定义位于 `@/style/element-plus.scss` 文件中，基于个人详情页面的弹窗设计，包含以下特性：

- **基础样式**: 圆角、边框、过渡动画
- **响应式设计**: 移动端适配
- **主题适配**: 支持浅色/深色主题
- **尺寸变体**: 小、中、大尺寸弹窗
- **全屏模式**: 全屏弹窗样式
- **表单优化**: 弹窗内表单组件样式
- **按钮样式**: 统一的按钮样式和交互效果

```scss
// 样式文件位置: @/style/element-plus.scss
// 主要样式类: .el-dialog
// 支持的主题适配: .dark 深色主题
// 支持的尺寸: 通过 width 属性控制
// 支持的模式: fullscreen 全屏模式
```

#### 标准弹窗样式特性

**容器样式**:
- 圆角: `border-radius: 12px`
- 边框: `border: 1px solid var(--el-border-color-lighter)`

**头部样式**:
- 背景: `background: var(--el-fill-color-extra-light)`
- 标题: 字体粗细 600，字号 16px
- 边框: 底部 1px 分割线

**内容区域**:
- 内边距: `padding: 24px`
- 背景: `background: var(--el-bg-color)`

**底部样式**:
- 背景: `background: var(--el-fill-color-extra-light)`
- 边框: 顶部 1px 分割线
- 内边距: `padding: 16px 24px`

**表单组件样式**:
- 输入框圆角: `border-radius: 8px`
- 标签字体: 粗细 500，颜色 `var(--el-text-color-regular)`
- 聚焦状态: 主色调边框

**按钮样式**:
- 圆角: `border-radius: 8px`
- 悬停效果: 上移 1px
- 渐变背景: 主色调和危险色调的渐变效果

#### 最佳实践

1. **统一使用 Element Plus Dialog**: 所有弹窗都使用 `el-dialog` 组件
2. **合理设置宽度**: 根据内容复杂度设置合适的宽度
3. **提供用户反馈**: 使用 `loading` 状态在异步操作时提供加载反馈
4. **标准样式**: 使用定义在 `element-plus.scss` 中的标准弹窗样式
5. **表单布局**: 使用 `el-row` 和 `el-col` 进行响应式布局
6. **按钮样式**: 使用渐变背景和悬停效果的标准按钮样式
7. **响应式设计**: 在移动端适配弹窗内容布局
4. **表单验证**: 在 `beforeSure` 回调中进行表单验证
5. **错误处理**: 在异步操作失败时调用 `closeLoading` 关闭加载状态
6. **确认操作**: 对于危险操作使用 `popconfirm` 提供二次确认
7. **全屏模式**: 对于复杂操作界面使用全屏模式
8. **自定义渲染**: 根据需要自定义头部和底部渲染器
9. **表格自适应**: 所有表格应自适应撑满父容器，避免右侧空白。

## 🌳 树形组件

### 树形组件统一样式

```scss
:deep(.el-tree) {
  .el-tree-node {
    .el-tree-node__content {
      height: 32px;
      padding: 0 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--el-fill-color-light);
      }
      
      &.is-current {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }
    }
  }
}

// 自定义树节点
.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 32px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  cursor: pointer;
  
  &:hover {
    background-color: var(--el-fill-color-light);
  }
  
  .node-icon {
    margin-right: 8px;
    color: var(--el-text-color-regular);
    font-size: 16px;
  }
  
  .node-label {
    flex: 1;
    color: var(--el-text-color-primary);
    font-size: 14px;
  }
  
  .node-count {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-left: 4px;
  }
}
```

## 🔄 侧边栏收起展开功能

### 功能概述

侧边栏收起展开功能提供了更好的空间利用和用户体验，允许用户根据需要在侧边栏和主内容区域之间切换焦点。

### 实现要点

#### 1. 状态管理
```vue
<script setup lang="ts">
import { ref } from 'vue'

// 侧边栏收起状态
const isSidebarCollapsed = ref(false)

// 切换侧边栏状态
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>
```

#### 2. 模板结构
```vue
<template>
  <!-- 内容区域 -->
  <div class="content-area" :class="{ 'content-no-gap': isSidebarCollapsed, 'content-collapsed': isSidebarCollapsed }">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <!-- 侧边栏内容 -->
      
      <!-- 折叠按钮 -->
      <div class="sidebar-collapse" @click="toggleSidebar">
        <el-icon :class="{ rotated: isSidebarCollapsed }">
          <ArrowLeft />
        </el-icon>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="content-main" :class="{ expanded: isSidebarCollapsed }">
      <!-- 主内容 -->
    </div>
  </div>
</template>
```

#### 3. 样式实现

**内容区域样式**
```scss
.content-area {
  position: relative;
  flex: 1;
  display: flex;
  gap: 16px;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 当侧边栏收起时，去掉gap
  &.content-no-gap {
    gap: 0;
  }
  
  // 当侧边栏收起时，主内容区域占据全宽
  &.content-collapsed {
    .content-main {
      margin-left: -280px;
    }
  }
}
```

**侧边栏样式**
```scss
.sidebar {
  position: relative;
  width: 280px;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  // 收起状态
  &.collapsed {
    transform: translateX(-100%);
    
    .toolbar,
    .tree-container {
      pointer-events: none;
    }
    
    .sidebar-collapse {
      right: -12px;
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
  }
}
```

#### 4. 折叠按钮

折叠按钮位于侧边栏右侧边缘，提供直观的收起/展开操作：

```scss
.sidebar-collapse {
  position: absolute;
  top: 50%;
  right: -12px;
  z-index: 1002;
  width: 24px;
  height: 34px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  transform: translateY(-50%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  
  &:hover {
    background: var(--el-fill-color-light);
    transform: translateY(-50%) scale(1.05);
  }
  
  .el-icon {
    transition: all 0.2s ease;
    
    &.rotated {
      transform: rotate(180deg);
    }
  }
}

// 鼠标悬停时显示按钮
.sidebar:hover .sidebar-collapse {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
```

### 动画效果

- **收起动画**: 侧边栏使用 `transform: translateX(-100%)` 平滑向左移出
- **展开动画**: 侧边栏使用 `transform: translateX(0)` 平滑向右移入
- **内容响应**: 主内容区域通过 `margin-left` 调整占据侧边栏空间
- **按钮旋转**: 折叠按钮图标根据状态旋转180度
- **悬停效果**: 使用边框颜色变化和缩放效果增强视觉反馈

### 最佳实践

1. **状态管理**: 使用 `ref` 管理侧边栏收起状态
2. **CSS类绑定**: 通过动态类名控制样式变化
3. **过渡动画**: 使用 `cubic-bezier` 缓动函数提供自然动画
4. **交互反馈**: 折叠按钮提供悬停和点击反馈
5. **无障碍访问**: 确保键盘导航和屏幕阅读器支持

## 📋 检查清单

在开发新页面时，请确保：

- [ ] 页面高度使用 `height: 100%` 或根据内容需要设置合适的高度
- [ ] 长页面使用 `min-height: 100%` 允许内容扩展
- [ ] 支持浅色/深色主题
- [ ] 响应式布局正确
- [ ] 组件样式统一
- [ ] 过渡动画流畅
- [ ] 交互反馈及时
- [ ] 侧边栏收起展开功能正常
- [ ] 折叠按钮样式和交互正确
- [ ] 主内容区域响应侧边栏状态变化
- [ ] 弹窗使用 `el-dialog` 组件
- [ ] 弹窗配置合理（宽度、按钮、回调等）
- [ ] 异步操作提供加载状态反馈
- [ ] 使用标准弹窗样式（圆角、边框、渐变按钮等）
- [ ] 表单布局响应式（使用 el-row 和 el-col）
- [ ] 危险操作使用确认框
- [ ] 表单弹窗进行验证处理
- [ ] 保持扁平化设计风格
- [ ] 工具栏布局合理（左侧操作按钮，右侧搜索筛选）
- [ ] 表格操作列固定在右侧
- [ ] 表单验证规则完善
- [ ] 角色选择支持多选和折叠标签
- [ ] 批量操作功能完善

## 🔗 相关资源

- [Element Plus 官方文档](https://element-plus.org/)
- [Vue 3 官方文档](https://vuejs.org/)
- [SCSS 官方文档](https://sass-lang.com/)

---

*最后更新: 2025年7月30日*
*版本: 1.0.0* 