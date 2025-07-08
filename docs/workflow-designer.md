# 工作流设计器使用说明

## 概述

工作流设计器是一个基于 Vue Flow 的可视化工作流设计工具，支持拖拽式节点创建、连线、属性配置等功能。

## 功能特性

### 1. 节点类型
- **开始节点**: 工作流的起始点，绿色标识
- **任务节点**: 执行具体任务的节点，蓝色标识
- **判断节点**: 条件分支节点，橙色标识
- **并行节点**: 并行执行节点，灰色标识
- **结束节点**: 工作流的终止点，红色标识

### 2. 核心功能
- **拖拽创建**: 从左侧工具栏拖拽节点到画布
- **节点连接**: 通过连线连接不同节点
- **属性配置**: 右侧面板配置节点属性
- **画布操作**: 缩放、平移、适应视图
- **导入导出**: 支持 JSON 格式的工作流导入导出
- **保存加载**: 支持工作流的保存和加载

## 使用指南

### 创建新工作流

1. 进入工作流列表页面
2. 点击"新建工作流"按钮
3. 填写工作流基本信息（名称、描述、状态）
4. 点击"确定"创建

### 设计工作流

1. 从左侧工具栏拖拽节点到画布
2. 点击节点进行属性配置
3. 通过连线连接节点
4. 使用右侧属性面板配置节点详情

### 节点属性配置

每个节点支持以下属性配置：
- **节点名称**: 节点的显示名称
- **节点类型**: 节点的类型（只读）
- **描述**: 节点的详细描述
- **配置**: JSON 格式的节点配置

### 画布操作

- **缩放**: 使用鼠标滚轮或控制按钮
- **平移**: 按住鼠标左键拖拽
- **适应视图**: 点击"适应视图"按钮
- **选择节点**: 点击节点进行选择

### 保存和导出

- **保存**: 点击"保存工作流"按钮保存到后端
- **导出**: 点击"导出"按钮下载 JSON 文件
- **导入**: 点击"导入"按钮上传 JSON 文件

## 技术架构

### 前端技术栈
- **Vue 3**: 前端框架
- **Vue Flow**: 流程图组件库
- **Element Plus**: UI 组件库
- **TypeScript**: 类型安全
- **Pinia**: 状态管理

### 核心组件
- `WorkflowDesigner`: 主设计器组件
- `CustomNode`: 自定义节点组件
- `WorkflowList`: 工作流列表组件

### API 接口
- `getWorkflowList`: 获取工作流列表
- `getWorkflowDetail`: 获取工作流详情
- `createWorkflow`: 创建工作流
- `updateWorkflow`: 更新工作流
- `deleteWorkflow`: 删除工作流
- `exportWorkflow`: 导出工作流
- `importWorkflow`: 导入工作流

## 数据结构

### 工作流数据结构
```typescript
interface WorkflowData {
  id?: string;
  name: string;
  description?: string;
  elements: any[];
  config?: any;
  createdAt?: string;
  updatedAt?: string;
}
```

### 节点数据结构
```typescript
interface NodeData {
  id: string;
  type: "custom";
  position: { x: number; y: number };
  data: {
    type: "start" | "task" | "decision" | "parallel" | "end";
    label: string;
    description: string;
    config: string;
  };
}
```

### 连线数据结构
```typescript
interface EdgeData {
  id: string;
  source: string;
  target: string;
  type: "smoothstep";
  animated: boolean;
  style: { stroke: string };
}
```

## 扩展开发

### 添加新节点类型

1. 在 `nodeTypes` 数组中添加新类型定义
2. 在 `CustomNode.vue` 中添加对应的图标和样式
3. 更新节点属性配置面板

### 自定义节点样式

修改 `CustomNode.vue` 中的 CSS 样式：
```css
.node-custom {
  border-color: #your-color;
}

.node-custom .node-icon {
  color: #your-color;
}
```

### 添加节点验证

在节点连接时添加验证逻辑：
```typescript
const onConnect = (params: any) => {
  // 添加连接验证逻辑
  if (isValidConnection(params)) {
    // 创建连接
  }
};
```

## 注意事项

1. **节点连接**: 确保节点连接符合业务逻辑
2. **数据保存**: 定期保存工作流避免数据丢失
3. **性能优化**: 大量节点时注意性能优化
4. **浏览器兼容**: 建议使用现代浏览器

## 常见问题

### Q: 如何删除节点？
A: 选中节点后按 Delete 键或右键菜单删除

### Q: 如何撤销操作？
A: 使用 Ctrl+Z 快捷键撤销

### Q: 如何复制节点？
A: 选中节点后使用 Ctrl+C 复制，Ctrl+V 粘贴

### Q: 如何对齐节点？
A: 选中多个节点后使用对齐工具

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持基础节点类型
- 支持拖拽创建和连线
- 支持导入导出功能 