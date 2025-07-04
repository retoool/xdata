import { defineFakeRoute } from 'vite-plugin-fake-server/client';

let taskTree = [
  {
    id: 'root',
    name: '任务类目',
    children: []
  }
];

function findNode(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function deleteNode(tree, id) {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      tree.splice(i, 1);
      return true;
    }
    if (tree[i].children) {
      if (deleteNode(tree[i].children, id)) return true;
    }
  }
  return false;
}

export default [
  defineFakeRoute({
    method: 'GET',
    url: '/mock/task-category-tree',
    response: () => ({ code: 0, data: taskTree })
  }),
  defineFakeRoute({
    method: 'POST',
    url: '/mock/task-category-tree',
    response: ({ body }) => {
      const { parentId, name, id } = body;
      const parent = findNode(taskTree, parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push({ id, name, children: [] });
        return { code: 0, msg: '添加成功' };
      }
      return { code: 1, msg: '父节点不存在' };
    }
  }),
  defineFakeRoute({
    method: 'DELETE',
    url: '/mock/task-category-tree',
    response: ({ body }) => {
      const { id } = body;
      if (id === 'root') return { code: 1, msg: '根节点不能删除' };
      const ok = deleteNode(taskTree, id);
      return ok ? { code: 0, msg: '删除成功' } : { code: 1, msg: '节点不存在' };
    }
  }),
  defineFakeRoute({
    method: 'POST',
    url: '/mock/task-category-tree/rename',
    response: ({ body }) => {
      const { id, name } = body;
      const node = findNode(taskTree, id);
      if (node) {
        node.name = name;
        return { code: 0, msg: '重命名成功' };
      }
      return { code: 1, msg: '节点不存在' };
    }
  }),
  defineFakeRoute({
    method: 'POST',
    url: '/mock/task-category-tree/move',
    response: ({ body }) => {
      const { id, newParentId } = body;
      if (id === 'root') return { code: 1, msg: '根节点不能移动' };
      let movedNode = null;
      function removeNode(tree) {
        for (let i = 0; i < tree.length; i++) {
          if (tree[i].id === id) {
            movedNode = tree[i];
            tree.splice(i, 1);
            return true;
          }
          if (tree[i].children) {
            if (removeNode(tree[i].children)) return true;
          }
        }
        return false;
      }
      removeNode(taskTree);
      const parent = findNode(taskTree, newParentId);
      if (parent && movedNode) {
        parent.children = parent.children || [];
        parent.children.push(movedNode);
        return { code: 0, msg: '移动成功' };
      }
      return { code: 1, msg: '移动失败' };
    }
  })
]; 