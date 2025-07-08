import type { Node, Edge } from '@vue-flow/core'

// 节点参数类型
export interface NodeParam {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'multiEnum' | 'file' | 'json';
  value: any;
  required?: boolean;
  default?: any;
  options?: { label: string; value: any }[];
  description?: string;
  placeholder?: string;
  help?: string;
  readonly?: boolean;
  // 字符串类型特有属性
  minLength?: number;
  maxLength?: number;
  // 数字类型特有属性
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  // 文件类型特有属性
  accept?: string;
  // 验证错误信息
  error?: string;
}

// 节点数据类型
export interface NodeData {
  id: string;
  name: string;
  type: string;
  description?: string;
  position: {
    x: number;
    y: number;
  };
  params: NodeParam[];
  hasErrors?: boolean;
  onSelect?: (node: NodeData) => void;
  onUpdate?: (node: NodeData) => void;
  onDelete?: (nodeId: string) => void;
}

// 边数据类型
export interface EdgeData {
  id: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
  label?: string;
  style?: Record<string, any>;
}

// Vue Flow 自定义节点类型
export interface CustomNode extends Node {
  id: string;
  type: 'custom';
  position: { x: number; y: number };
  data: NodeData;
  params?: NodeParam[];
  style?: Record<string, any>;
}

// 工作流数据类型
export interface WorkflowData {
  id: number;
  name: string;
  description?: string;
  category?: string;
  categoryId?: number;
  status: 'draft' | 'published' | 'running' | 'stopped' | 'error';
  version?: string;
  author?: string;
  tags?: string[];
  creator?: string;
  createTime?: string;
  updateTime?: string;
  nodes: NodeData[];
  edges: EdgeData[];
}

// 算子分类定义
export interface OperatorCategory {
  id: number
  name: string
  operators: Array<{
    id: number
    name: string
    type: string
    description: string
    version?: string
    params: NodeParam[]
  }>
} 