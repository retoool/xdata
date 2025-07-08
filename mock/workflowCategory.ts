import { MockMethod } from "vite-plugin-mock";
import type { CategoryNode } from "@/api/workflowCategory";

// 初始分类树数据
let categoryTree: CategoryNode[] = [
  {
    id: 1,
    label: "数据处理",
    children: [
      {
        id: 11,
        label: "数据清洗",
        children: [
          {
            id: 111,
            label: "缺失值处理"
          },
          {
            id: 112,
            label: "异常值处理"
          }
        ]
      },
      {
        id: 12,
        label: "数据转换",
        children: [
          {
            id: 121,
            label: "数据格式化"
          },
          {
            id: 122,
            label: "数据标准化"
          }
        ]
      }
    ]
  },
  {
    id: 2,
    label: "机器学习",
    children: [
      {
        id: 21,
        label: "分类算法",
        children: [
          {
            id: 211,
            label: "决策树"
          },
          {
            id: 212,
            label: "随机森林"
          }
        ]
      },
      {
        id: 22,
        label: "回归算法",
        children: [
          {
            id: 221,
            label: "线性回归"
          },
          {
            id: 222,
            label: "逻辑回归"
          }
        ]
      }
    ]
  }
];

// 生成新的节点 ID
const generateId = () => {
  const maxId = Math.max(
    ...categoryTree.flatMap(node => {
      const ids: number[] = [node.id];
      const traverse = (node: CategoryNode) => {
        if (node.children) {
          node.children.forEach(child => {
            ids.push(child.id);
            traverse(child);
          });
        }
      };
      traverse(node);
      return ids;
    })
  );
  return maxId + 1;
};

// 查找节点
const findNode = (id: number, nodes: CategoryNode[]): CategoryNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(id, node.children);
      if (found) return found;
    }
  }
  return null;
};

// 查找父节点
const findParentNode = (id: number, nodes: CategoryNode[]): { parent: CategoryNode | null; index: number } => {
  for (const node of nodes) {
    if (node.children) {
      const index = node.children.findIndex(child => child.id === id);
      if (index !== -1) return { parent: node, index };
      const found = findParentNode(id, node.children);
      if (found.parent) return found;
    }
  }
  return { parent: null, index: -1 };
};

export default [
  // 获取分类树
  {
    url: "/workflow/category/tree",
    method: "get",
    response: () => {
      return {
        code: 0,
        msg: "success",
        data: categoryTree
      };
    }
  },

  // 添加分类节点
  {
    url: "/workflow/category",
    method: "post",
    response: ({ body }) => {
      const { label, parentId } = body;
      const newNode: CategoryNode = {
        id: generateId(),
        label
      };

      if (parentId) {
        const parent = findNode(parentId, categoryTree);
        if (!parent) {
          return {
            code: 404,
            msg: "父节点不存在",
            data: null
          };
        }
        if (!parent.children) parent.children = [];
        parent.children.push(newNode);
      } else {
        categoryTree.push(newNode);
      }

      return {
        code: 0,
        msg: "success",
        data: newNode
      };
    }
  },

  // 更新分类节点
  {
    url: "/workflow/category/:id",
    method: "put",
    response: ({ params, body }) => {
      const node = findNode(Number(params.id), categoryTree);
      if (!node) {
        return {
          code: 404,
          msg: "节点不存在",
          data: null
        };
      }

      Object.assign(node, body);
      return {
        code: 0,
        msg: "success",
        data: node
      };
    }
  },

  // 删除分类节点
  {
    url: "/workflow/category/:id",
    method: "delete",
    response: ({ params }) => {
      const { parent, index } = findParentNode(Number(params.id), categoryTree);
      if (parent && index !== -1) {
        parent.children?.splice(index, 1);
      } else {
        const index = categoryTree.findIndex(node => node.id === Number(params.id));
        if (index !== -1) {
          categoryTree.splice(index, 1);
        }
      }
      return {
        code: 0,
        msg: "success"
      };
    }
  },

  // 批量删除分类节点
  {
    url: "/workflow/category/batch",
    method: "delete",
    response: ({ body }) => {
      const { ids } = body;
      ids.forEach((id: number) => {
        const { parent, index } = findParentNode(id, categoryTree);
        if (parent && index !== -1) {
          parent.children?.splice(index, 1);
        } else {
          const index = categoryTree.findIndex(node => node.id === id);
          if (index !== -1) {
            categoryTree.splice(index, 1);
          }
        }
      });
      return {
        code: 0,
        msg: "success"
      };
    }
  },

  // 移动分类节点
  {
    url: "/workflow/category/:id/move",
    method: "put",
    response: ({ params, body }) => {
      const { targetId, position } = body;
      const sourceNode = findNode(Number(params.id), categoryTree);
      const targetNode = findNode(targetId, categoryTree);

      if (!sourceNode || !targetNode) {
        return {
          code: 404,
          msg: "节点不存在",
          data: null
        };
      }

      // 删除源节点
      const { parent: sourceParent, index: sourceIndex } = findParentNode(Number(params.id), categoryTree);
      if (sourceParent && sourceIndex !== -1) {
        sourceParent.children?.splice(sourceIndex, 1);
      } else {
        const index = categoryTree.findIndex(node => node.id === Number(params.id));
        if (index !== -1) {
          categoryTree.splice(index, 1);
        }
      }

      // 插入到目标位置
      if (position === "inner") {
        if (!targetNode.children) targetNode.children = [];
        targetNode.children.push(sourceNode);
      } else {
        const { parent: targetParent, index: targetIndex } = findParentNode(targetId, categoryTree);
        if (targetParent) {
          const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
          targetParent.children?.splice(insertIndex, 0, sourceNode);
        } else {
          const index = categoryTree.findIndex(node => node.id === targetId);
          const insertIndex = position === "before" ? index : index + 1;
          categoryTree.splice(insertIndex, 0, sourceNode);
        }
      }

      return {
        code: 0,
        msg: "success"
      };
    }
  }
] as MockMethod[]; 