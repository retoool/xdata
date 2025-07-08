# 工作流设计器使用示例

## 快速开始

### 1. 访问工作流管理

在系统菜单中找到"工作流管理"，点击进入工作流列表页面。

### 2. 创建工作流

1. 点击"新建工作流"按钮
2. 填写工作流基本信息：
   - 名称：数据处理流程
   - 描述：用于处理用户数据的自动化流程
   - 状态：启用
3. 点击"确定"创建

### 3. 设计工作流

1. 点击工作流名称或"编辑"按钮进入设计器
2. 从左侧工具栏拖拽节点到画布：
   - 拖拽"开始节点"到画布左上角
   - 拖拽"任务节点"到画布中央
   - 拖拽"判断节点"到画布右侧
   - 拖拽"结束节点"到画布右下角

3. 连接节点：
   - 点击开始节点的输出端口（右侧小圆点）
   - 拖拽到任务节点的输入端口（左侧小圆点）
   - 重复操作连接其他节点

4. 配置节点属性：
   - 点击节点选中
   - 在右侧属性面板中配置：
     - 节点名称：数据清洗
     - 描述：清洗和验证输入数据
     - 配置：`{"timeout": 30000, "retry": 3}`

### 4. 保存工作流

点击"保存工作流"按钮，系统会将工作流保存到后端。

## 实际应用场景

### 场景1：数据处理流程

```
开始 → 数据清洗 → 数据验证 → 数据转换 → 结束
```

**节点配置示例：**

1. **开始节点**
   - 名称：数据输入
   - 描述：接收外部数据输入

2. **任务节点（数据清洗）**
   - 名称：数据清洗
   - 描述：去除重复和无效数据
   - 配置：
   ```json
   {
     "timeout": 30000,
     "retry": 3,
     "filters": ["duplicate", "null", "invalid"]
   }
   ```

3. **判断节点（数据验证）**
   - 名称：质量检查
   - 描述：验证数据质量是否达标
   - 配置：
   ```json
   {
     "threshold": 0.8,
     "metrics": ["completeness", "accuracy", "consistency"]
   }
   ```

4. **任务节点（数据转换）**
   - 名称：格式转换
   - 描述：将数据转换为目标格式
   - 配置：
   ```json
   {
     "inputFormat": "csv",
     "outputFormat": "json",
     "mapping": {
       "name": "userName",
       "email": "userEmail"
     }
   }
   ```

### 场景2：审批流程

```
申请提交 → 部门审批 → 是否通过？ → HR审批 → 审批完成
                ↓
             拒绝 → 结束
```

**节点配置示例：**

1. **开始节点**
   - 名称：提交申请
   - 描述：员工提交请假申请

2. **任务节点（部门审批）**
   - 名称：部门审批
   - 描述：部门经理审批申请
   - 配置：
   ```json
   {
     "approver": "manager",
     "timeout": 86400000,
     "notify": true
   }
   ```

3. **判断节点（是否通过）**
   - 名称：审批结果
   - 描述：判断部门审批是否通过
   - 配置：
   ```json
   {
     "condition": "approved",
     "truePath": "hr_approval",
     "falsePath": "reject"
   }
   ```

4. **任务节点（HR审批）**
   - 名称：HR审批
   - 描述：HR最终审批
   - 配置：
   ```json
   {
     "approver": "hr",
     "timeout": 86400000,
     "notify": true
   }
   ```

### 场景3：自动化测试流程

```
开始 → 环境准备 → 执行测试 → 测试通过？ → 生成报告 → 结束
                           ↓
                        失败 → 记录错误 → 结束
```

## 高级功能

### 1. 条件分支

使用判断节点创建条件分支：

```json
{
  "condition": "testResult === 'pass'",
  "truePath": "generateReport",
  "falsePath": "recordError"
}
```

### 2. 并行执行

使用并行节点同时执行多个任务：

```json
{
  "parallel": true,
  "tasks": ["task1", "task2", "task3"],
  "waitForAll": true
}
```

### 3. 错误处理

在节点配置中添加错误处理：

```json
{
  "timeout": 30000,
  "retry": {
    "maxAttempts": 3,
    "backoff": "exponential"
  },
  "errorHandler": {
    "onTimeout": "skip",
    "onError": "retry"
  }
}
```

### 4. 数据传递

节点间数据传递配置：

```json
{
  "input": {
    "data": "previousNode.output",
    "transform": "data => data.filter(item => item.valid)"
  },
  "output": {
    "format": "json",
    "schema": {
      "id": "string",
      "name": "string",
      "status": "string"
    }
  }
}
```

## 最佳实践

### 1. 节点命名

- 使用清晰、描述性的名称
- 避免使用缩写或技术术语
- 保持命名风格一致

### 2. 流程设计

- 保持流程简洁，避免过于复杂的嵌套
- 合理使用判断节点处理分支逻辑
- 确保每个分支都有明确的结束点

### 3. 配置管理

- 使用JSON格式存储配置
- 添加必要的注释说明
- 定期备份和版本控制

### 4. 性能优化

- 避免创建过多节点
- 合理设置超时时间
- 使用并行节点提高执行效率

### 5. 错误处理

- 为每个节点配置适当的错误处理
- 添加重试机制
- 记录详细的错误日志

## 故障排除

### 常见问题

1. **节点无法连接**
   - 检查端口是否正确
   - 确保节点类型兼容

2. **配置解析错误**
   - 验证JSON格式是否正确
   - 检查配置字段是否有效

3. **保存失败**
   - 检查网络连接
   - 验证权限设置

4. **导入失败**
   - 检查文件格式是否为JSON
   - 验证数据结构是否完整

### 调试技巧

1. 使用浏览器开发者工具查看网络请求
2. 检查控制台错误信息
3. 验证API接口返回数据
4. 使用断点调试JavaScript代码

## 扩展开发

### 自定义节点类型

1. 在 `nodeTypes` 数组中添加新类型
2. 在 `CustomNode.vue` 中添加样式
3. 更新属性配置面板

### 自定义验证规则

```typescript
const validateConnection = (source: Node, target: Node) => {
  // 自定义连接验证逻辑
  return source.data.type !== 'end' && target.data.type !== 'start';
};
```

### 自定义事件处理

```typescript
const onNodeDoubleClick = (node: Node) => {
  // 双击节点处理逻辑
  console.log('Node double clicked:', node);
};
``` 