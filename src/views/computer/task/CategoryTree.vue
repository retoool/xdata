<template>
  <div>
    <el-tree
      :data="treeData"
      :props="defaultProps"
      node-key="id"
      highlight-current
      default-expand-all
      @node-click="handleNodeClick"
      ref="treeRef"
    >
      <template #default="{ node, data }">
        <span>{{ data.label }}</span>
        <el-button size="small" type="text" @click.stop="editNode(data)">重命名</el-button>
        <el-button size="small" type="text" @click.stop="addNode(data)">新增</el-button>
        <el-button size="small" type="text" @click.stop="removeNode(data)">删除</el-button>
      </template>
    </el-tree>
    <el-dialog v-model="dialogVisible" title="重命名/新增类目" width="300px">
      <el-input v-model="editLabel" placeholder="请输入类目名称" />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ElMessage, ElTree } from "element-plus";

interface TreeNode {
  id: number;
  label: string;
  children?: TreeNode[];
}

const treeData = ref<TreeNode[]>([
  { id: 1, label: "默认类目", children: [] }
]);
const defaultProps = { children: "children", label: "label" };
const treeRef = ref<InstanceType<typeof ElTree>>();

const dialogVisible = ref(false);
const editLabel = ref("");
const editNodeData = ref<TreeNode | null>(null);
const editType = ref<"rename" | "add">("rename");

function handleNodeClick(data: TreeNode) {
  // 可根据需要处理节点点击
}

function editNode(data: TreeNode) {
  editType.value = "rename";
  editNodeData.value = data;
  editLabel.value = data.label;
  dialogVisible.value = true;
}

function addNode(parent: TreeNode) {
  editType.value = "add";
  editNodeData.value = parent;
  editLabel.value = "";
  dialogVisible.value = true;
}

function removeNode(data: TreeNode) {
  function findAndRemove(nodes: TreeNode[], id: number): boolean {
    const idx = nodes.findIndex(n => n.id === id);
    if (idx !== -1) {
      nodes.splice(idx, 1);
      return true;
    }
    for (const n of nodes) {
      if (n.children && findAndRemove(n.children, id)) return true;
    }
    return false;
  }
  if (data.id === 1) {
    ElMessage.warning("默认类目不可删除");
    return;
  }
  findAndRemove(treeData.value, data.id);
}

function confirmEdit() {
  if (!editLabel.value.trim()) {
    ElMessage.warning("类目名称不能为空");
    return;
  }
  if (editType.value === "rename" && editNodeData.value) {
    editNodeData.value.label = editLabel.value;
  } else if (editType.value === "add" && editNodeData.value) {
    const newId = Date.now();
    if (!editNodeData.value.children) editNodeData.value.children = [];
    editNodeData.value.children.push({ id: newId, label: editLabel.value });
  }
  dialogVisible.value = false;
}
</script> 