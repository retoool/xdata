<h1>XDATA</h1>

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 介绍

XDATA是一个现代化的数据管理系统，提供完整的数据处理工作流功能，包含算子管理、工作流设计器等核心功能模块，适合企业级数据处理场景。

## 功能特性

- 🎯 算子管理：提供完整的算子分类和管理功能
- 🔄 工作流设计器：可视化的工作流设计和执行
- 📊 数据处理：强大的数据处理和分析能力
- 🎨 现代化界面：基于 Element Plus 的响应式设计

## 技术栈

- 🖥️ Vue 3 + TypeScript
- 🎨 Element Plus UI 组件库
- 📦 Vite 构建工具
- 🗂️ Pinia 状态管理
- 🎯 Vue Router 路由管理
- 📊 ECharts 图表库
- 🔄 Vue Flow 工作流图形化

## 开发文档

请参考项目内的文档和代码注释。

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 项目结构

```
src/
├── api/                    # API 接口
├── components/             # 公共组件
├── views/                  # 页面视图
│   ├── computer/          # 计算模块
│   │   ├── operator/      # 算子管理
│   │   └── workflow/      # 工作流管理
│   └── welcome/           # 欢迎页
├── router/                # 路由配置
├── store/                 # 状态管理
└── utils/                 # 工具函数
```

## 许可证

[MIT © 2020-present, pure-admin](./LICENSE)
