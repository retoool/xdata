import { defineFakeRoute } from 'vite-plugin-fake-server/client';
import { operatorsData, updateOperatorsData } from './operators';

// 为不同算子类型定义独立的分类树
const treeDataMap = {
  basic: [
    {
      id: 1,
      label: '数据预处理',
      children: [
        {
          id: 4,
          label: '数据清洗',
          children: [
            { id: 9, label: '缺失值处理' },
            { id: 10, label: '异常值检测' },
            { id: 11, label: '数据标准化' }
          ]
        },
        {
          id: 5,
          label: '特征工程',
          children: [
            { id: 12, label: '特征选择' },
            { id: 13, label: '特征变换' }
          ]
        }
      ]
    },
    {
      id: 2,
      label: '机器学习',
      children: [
        { id: 6, label: '分类算法' },
        { id: 7, label: '回归算法' },
        { id: 8, label: '聚类算法' }
      ]
    }
  ],
  script: [
    {
      id: 101,
      label: 'Python脚本',
      children: [
        {
          id: 104,
          label: '数据处理脚本',
          children: [
            { id: 109, label: 'Pandas处理' },
            { id: 110, label: 'NumPy计算' }
          ]
        },
        {
          id: 105,
          label: '机器学习脚本',
          children: [
            { id: 111, label: 'Scikit-learn' },
            { id: 112, label: 'TensorFlow' }
          ]
        }
      ]
    },
    {
      id: 102,
      label: 'R脚本',
      children: [
        { id: 106, label: '统计分析' },
        { id: 107, label: '数据可视化' }
      ]
    },
    {
      id: 103,
      label: 'SQL脚本',
      children: [
        { id: 108, label: '数据查询' },
        { id: 113, label: '数据转换' }
      ]
    }
  ],
  external: [
    {
      id: 201,
      label: 'API服务',
      children: [
        {
          id: 204,
          label: '第三方API',
          children: [
            { id: 209, label: '天气API' },
            { id: 210, label: '地图API' },
            { id: 211, label: '支付API' }
          ]
        },
        {
          id: 205,
          label: '内部API',
          children: [
            { id: 212, label: '用户服务' },
            { id: 213, label: '订单服务' }
          ]
        }
      ]
    },
    {
      id: 202,
      label: '数据库连接',
      children: [
        { id: 206, label: 'MySQL' },
        { id: 207, label: 'PostgreSQL' },
        { id: 208, label: 'MongoDB' }
      ]
    }
  ]
};

let treeData = treeDataMap.basic; // 默认显示基础算子的分类树

function findNodeById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeNodeById(nodes, id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1);
      return true;
    }
    if (nodes[i].children && removeNodeById(nodes[i].children, id)) {
      return true;
    }
  }
  return false;
}

function moveNode(nodes, id, targetId, type) {
  let dragNode = null;
  function findAndRemove(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        dragNode = nodes.splice(i, 1)[0];
        return true;
      }
      if (nodes[i].children && findAndRemove(nodes[i].children)) return true;
    }
    return false;
  }
  findAndRemove(nodes);
  if (!dragNode) return;
  function insertNode(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === targetId) {
        if (type === 'inner') {
          nodes[i].children = nodes[i].children || [];
          nodes[i].children.unshift(dragNode);
        } else if (type === 'before') {
          nodes.splice(i, 0, dragNode);
        } else if (type === 'after') {
          nodes.splice(i + 1, 0, dragNode);
        }
        return true;
      }
      if (nodes[i].children && insertNode(nodes[i].children)) return true;
    }
    return false;
  }
  insertNode(nodes);
}

// 递归获取所有节点id
export function getAllCategoryIds(tree) {
  let ids = [];
  for (const node of tree) {
    ids.push(node.id);
    if (node.children) {
      ids = ids.concat(getAllCategoryIds(node.children));
    }
  }
  return ids;
}
// 递归获取所有叶子节点id
export function getAllCategoryLeafIds(tree) {
  let ids = [];
  for (const node of tree) {
    if (node.children && node.children.length > 0) {
      ids = ids.concat(getAllCategoryLeafIds(node.children));
    } else {
      ids.push(node.id);
    }
  }
  return ids;
}

// 删除指定分类下的所有算子
function deleteOperatorsByCategoryIds(categoryIds: number[]) {
  if (!operatorsData || operatorsData.length === 0) return;

  // 过滤掉要删除的分类下的算子
  const filteredOperators = operatorsData.filter(operator => !categoryIds.includes(operator.categoryId));
  updateOperatorsData(filteredOperators);
}

// 递归获取要删除的分类及其所有子分类的id
function getCategoryIdsToDelete(nodes: any[], targetId: number): number[] {
  let ids: number[] = [];

  for (const node of nodes) {
    if (node.id === targetId) {
      ids.push(node.id);
      // 递归获取所有子分类的id
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          ids = ids.concat(getCategoryIdsToDelete([child], child.id));
        }
      }
      break;
    }
    if (node.children && node.children.length > 0) {
      const childIds = getCategoryIdsToDelete(node.children, targetId);
      if (childIds.length > 0) {
        ids = ids.concat(childIds);
      }
    }
  }

  return ids;
}

export default defineFakeRoute([
  // 获取分类树
  {
    url: '/api/operatorCategoryTree',
    method: 'get',
    response: ({ query }) => {
      const type = query.type || 'basic';
      const data = treeDataMap[type as keyof typeof treeDataMap] || treeDataMap.basic;
      return { code: 0, data }
    }
  },
  // 新增节点
  {
    url: '/api/operatorCategoryTree',
    method: 'post',
    response: ({ body, query }) => {
      const { parentId, label } = body || {};
      const type = query.type || 'basic';
      const currentTreeData = treeDataMap[type as keyof typeof treeDataMap] || treeDataMap.basic;

      if (!label) return { code: 1, msg: '节点名称不能为空', data: null };
      const newNode = { id: Date.now(), label, children: [] };
      if (parentId) {
        const parent = findNodeById(currentTreeData, parentId);
        if (!parent) return { code: 1, msg: '父节点不存在', data: null };
        parent.children = parent.children || [];
        parent.children.push(newNode);
      } else {
        currentTreeData.push(newNode);
      }
      return { code: 0, data: newNode, msg: '新增成功' };
    }
  },
  // 编辑节点
  {
    url: '/api/operatorCategoryTree/:id',
    method: 'put',
    response: ({ body, params, query }) => {
      const id = Number(params.id);
      const { label } = body || {};
      const type = query.type || 'basic';
      const currentTreeData = treeDataMap[type as keyof typeof treeDataMap] || treeDataMap.basic;

      if (!label) return { code: 1, msg: '节点名称不能为空', data: null };
      const node = findNodeById(currentTreeData, id);
      if (!node) return { code: 1, msg: '节点不存在', data: null };
      node.label = label;
      return { code: 0, data: null, msg: '编辑成功' };
    }
  },
  // 删除节点
  {
    url: '/api/operatorCategoryTree/:id',
    method: 'delete',
    response: ({ params, query }) => {
      const id = Number(params.id);
      const type = query.type || 'basic';
      const currentTreeData = treeDataMap[type as keyof typeof treeDataMap] || treeDataMap.basic;

      // 获取要删除的分类及其所有子分类的id
      const categoryIdsToDelete = getCategoryIdsToDelete(currentTreeData, id);

      // 删除分类下的所有算子
      deleteOperatorsByCategoryIds(categoryIdsToDelete);

      const ok = removeNodeById(currentTreeData, id);
      if (!ok) return { code: 1, msg: '节点不存在', data: null };
      return { code: 0, data: null, msg: '删除成功' };
    }
  },
  // 批量删除
  {
    url: '/api/operatorCategoryTree/batch-delete',
    method: 'post',
    response: ({ body, query }) => {
      const ids = (body && Array.isArray(body.ids)) ? body.ids : [];
      const type = query.type || 'basic';
      const currentTreeData = treeDataMap[type as keyof typeof treeDataMap] || treeDataMap.basic;

      if (!ids.length) return { code: 1, msg: '请选择要删除的节点', data: null };

      // 收集所有要删除的分类id（包括子分类）
      const allCategoryIdsToDelete: number[] = [];
      ids.forEach(id => {
        const categoryIds = getCategoryIdsToDelete(currentTreeData, id);
        allCategoryIdsToDelete.push(...categoryIds);
      });

      // 删除分类下的所有算子
      deleteOperatorsByCategoryIds(allCategoryIdsToDelete);

      // 删除分类节点
      ids.forEach(id => removeNodeById(currentTreeData, id));
      return { code: 0, data: null, msg: '批量删除成功' };
    }
  },
  // 拖拽/移动
  {
    url: '/api/operatorCategoryTree/move',
    method: 'post',
    response: ({ body, query }) => {
      const { id, targetId, type } = body || {};
      const operatorType = query.type || 'basic';
      const currentTreeData = treeDataMap[operatorType as keyof typeof treeDataMap] || treeDataMap.basic;

      if (!id || !targetId || !type) return { code: 1, msg: '参数不完整', data: null };
      moveNode(currentTreeData, id, targetId, type);
      return { code: 0, data: null, msg: '移动成功' };
    }
  }
]); 