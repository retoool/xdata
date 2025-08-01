<template>
  <div class="menu-permission">
    <!-- 操作工具栏 -->
    <div class="permission-toolbar">
      <div class="toolbar-left">
        <el-button size="small" :disabled="loading" @click="expandAll">
          <el-icon><ArrowDown /></el-icon>展开全部
        </el-button>
        <el-button size="small" :disabled="loading" @click="collapseAll">
          <el-icon><ArrowRight /></el-icon>折叠全部
        </el-button>
        <el-button
          type="primary"
          size="small"
          :disabled="loading"
          @click="isAllChecked ? uncheckAll() : checkAll()"
        >
          <el-icon>
            <Check v-if="!isAllChecked" />
            <Close v-else />
          </el-icon>
          {{ isAllChecked ? '取消全选' : '全选' }}
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-tag type="info" size="small">
          已选择权限：{{ checkedMenus.length }}
        </el-tag>
      </div>
    </div>

    <!-- 搜索框 -->
    <div class="search-box">
      <el-input
        v-model="filterText"
        placeholder="搜索菜单名称或权限标识"
        clearable
        size="small"
        @input="handleFilter"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 菜单权限树 -->
    <div class="tree-container">
      <el-tree
        ref="menuTreeRef"
        v-loading="loading"
        :data="menuTreeData"
        :props="treeProps"
        :filter-node-method="filterNode"
        node-key="id"
        show-checkbox
        :check-strictly="checkStrictly"
        :default-checked-keys="defaultCheckedKeys"
        :default-expanded-keys="defaultExpandedKeys"
        @check="handleMenuCheck"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse"
      >
        <template #default="{ node, data }">
          <div class="menu-node">
            <div class="node-content">
              <div class="node-main node-main-flex">
                <el-tooltip v-if="!node.checked && !node.indeterminate&& data.children && data.children.length > 0" content="只选当前" placement="top">
                  <el-button
                    size="small"
                    type="primary"
                    circle
                    @click.stop="checkCurrentNode(data)"
                    class="select-current-btn mini-btn"
                  >
                    <el-icon><Pointer /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-icon v-if="data.icon" class="node-icon">
                  <component :is="useRenderIcon(data.icon)" />
                </el-icon>
                <el-icon v-else class="node-icon default-icon">
                  <Menu />
                </el-icon>
                <span class="node-title">{{ data.title }}</span>
                <el-tag
                  v-if="data.type"
                  :type="getMenuTypeTag(data.type)"
                  size="small"
                >
                  {{ getMenuTypeText(data.type) }}
                </el-tag>
              </div>
            </div>

            <!-- 权限详情 -->
            <div
              v-if="data.children && data.children.length === 0"
              class="permission-details"
            >
              <el-tag
                v-for="perm in getNodeMenus(data)"
                :key="perm"
                size="small"
                type="info"
                class="permission-tag"
              >
                {{ perm }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import type { ElTree } from "element-plus";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Close,
  Search,
  Menu,
  Pointer
} from "@element-plus/icons-vue";
import { getAllMenuTree } from "@/api/system/menu";
import { getRoleMenus } from "@/api/system/role";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

// Props
const props = defineProps<{
  roleId: number | null;
}>();

// 响应式数据
const menuTreeRef = ref<InstanceType<typeof ElTree>>();
const loading = ref(false);
const filterText = ref("");
const checkStrictly = ref(false);
const menuTreeData = ref<BackendRoute[]>([]);
const checkedMenus = ref<number[]>([]);
const defaultCheckedKeys = ref<number[]>([]);
const defaultExpandedKeys = ref<number[]>([]);

const treeProps = {
  children: "children",
  label: "title",
  disabled: "disabled"
};

// 方法
const handleFilter = () => {
  menuTreeRef.value?.filter(filterText.value);
};

const filterNode = (value: string, data: BackendRoute) => {
  if (!value) return true;
  return (
    data.title.includes(value) ||
    (data.permission && data.permission.includes(value)) ||
    (data.path && data.path.includes(value))
  );
};

const expandAll = () => {
  if (!menuTreeRef.value) return;
  const nodesMap = menuTreeRef.value.store.nodesMap;
  Object.values(nodesMap).forEach((node: any) => {
    node.expand && node.expand();
  });
};

const collapseAll = () => {
  if (!menuTreeRef.value) return;
  const nodesMap = menuTreeRef.value.store.nodesMap;
  Object.values(nodesMap).forEach((node: any) => {
    node.collapse && node.collapse();
  });
};

const checkAll = () => {
  const allKeys = getAllNodeKeys(menuTreeData.value);
  allKeys.forEach(key => {
    menuTreeRef.value?.setChecked(key, true, false);
  });
  updateCheckedMenus();
};

const uncheckAll = () => {
  menuTreeRef.value?.setCheckedKeys([]);
  updateCheckedMenus();
};

const handleMenuCheck = () => {
  console.log(111);
  updateCheckedMenus();
};

const handleNodeExpand = (data: BackendRoute) => {
  if (!defaultExpandedKeys.value.includes(data.id)) {
    defaultExpandedKeys.value.push(data.id);
  }
};

const handleNodeCollapse = (data: BackendRoute) => {
  const index = defaultExpandedKeys.value.indexOf(data.id);
  if (index > -1) {
    defaultExpandedKeys.value.splice(index, 1);
  }
};

// 用菜单ID设置勾选
const setCheckedByMenuIds = (menuIds: number[]) => {
  menuTreeRef.value?.setCheckedKeys(menuIds);
};

const updateCheckedMenus = () => {
  if (!menuTreeRef.value) return;
  // 获取已勾选节点 id
  const checkedIds = (menuTreeRef.value.getCheckedKeys() as (string|number)[]).map(id => Number(id));
  // 获取半选节点 id
  const halfCheckedIds = (menuTreeRef.value.getHalfCheckedKeys() as (string|number)[]).map(id => Number(id));
  // 合并并去重
  const menuIds = Array.from(new Set([...checkedIds, ...halfCheckedIds]));
  checkedMenus.value = menuIds;
};

// 只勾选当前节点
const checkCurrentNode = (data: BackendRoute) => {
  if (!menuTreeRef.value) return;
  // 判断当前节点是否已勾选
  const checkedKeys = menuTreeRef.value.getCheckedKeys(false) as number[];
  const isChecked = checkedKeys.includes(data.id);
  // 只操作当前节点，不递归
  menuTreeRef.value.setChecked(data.id, !isChecked, false);
  updateCheckedMenus();
};

const getNodeMenus = (node: BackendRoute): string[] => {
  const menus: string[] = [];

  if (node.permission) {
    menus.push(node.permission);
  }

  // 根据菜单类型添加默认权限
  if (node.type === 2) {
    // 菜单类型
    const baseMenu =
      node.permission || `menu:${node.path?.replace(/\//g, ":")}`;
    menus.push(`${baseMenu}:view`);
  }

  return menus;
};

const getAllNodeKeys = (nodes: BackendRoute[]): number[] => {
  const keys: number[] = [];

  const traverse = (nodeList: BackendRoute[]) => {
    nodeList.forEach(node => {
      keys.push(node.id);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };

  traverse(nodes);
  return keys;
};

const getMenuTypeTag = (type: number) => {
  switch (type) {
    case 1:
      return "warning" as const; // 目录
    case 2:
      return "success" as const; // 菜单
    case 3:
      return "info" as const; // 按钮
    default:
      return "info" as const;
  }
};

const getMenuTypeText = (type: number): string => {
  switch (type) {
    case 1:
      return "目录";
    case 2:
      return "菜单";
    case 3:
      return "按钮";
    default:
      return "未知";
  }
};

const loadMenuTree = async () => {
  loading.value = true;
  try {
    menuTreeData.value = await getAllMenuTree();
    console.log(menuTreeData.value);
    // 设置默认展开节点
    const expandKeys: number[] = [];
    menuTreeData.value.forEach(menu => {
      expandKeys.push(menu.id);
      if (menu.children) {
        menu.children.forEach(child => {
          expandKeys.push(child.id);
        });
      }
    });
    defaultExpandedKeys.value = expandKeys;
  } catch (error) {
    ElMessage.error("加载菜单权限失败");
  } finally {
    loading.value = false;
  }
};

const loadRoleMenus = async () => {
  if (!props.roleId) return;
  try {
    const menus = await getRoleMenus(props.roleId);
    const menuIds = Array.isArray(menus) ? menus.map(item => Number(item.id)).filter(id => !isNaN(id)) : [];
    checkedMenus.value = menuIds;
    nextTick(() => {
      setCheckedByMenuIds(menuIds);
    });
  } catch (error) {
    ElMessage.error("加载角色权限失败");
  }
};

// 监听角色ID变化
watch(
  () => props.roleId,
  newRoleId => {
    if (newRoleId) {
      loadRoleMenus();
    } else {
      uncheckAll();
    }
  },
  { immediate: true }
);

// 生命周期
onMounted(async () => {
  await loadMenuTree();
  await loadRoleMenus();
});

// 暴露方法
defineExpose({
  getSelectedMenus: () => checkedMenus.value,
  setSelectedMenus: (menus: number[]) => {
    checkedMenus.value = menus;
    nextTick(() => {
      setCheckedByMenuIds(menus);
    });
  },
  refreshTree: loadMenuTree,
  getSelectedMenuIds: () => (menuTreeRef.value?.getCheckedKeys() as number[]) || [],
});

const isAllChecked = computed(() => {
  return checkedMenus.value.length === getAllNodeKeys(menuTreeData.value).length && checkedMenus.value.length > 0;
});
</script>

<style scoped lang="scss">
.menu-permission {
  height: 100%;
  display: flex;
  flex-direction: column;

  .permission-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .search-box {
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);
  }

  .tree-container {
    flex: 1;
    overflow: auto;
    padding: 8px 16px;
    background: var(--el-bg-color);

    .menu-node {
      .node-content {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .node-main {
          display: flex;
          align-items: center;
          gap: 8px;

          .node-icon {
            color: var(--el-color-primary);
            font-size: 16px;
            transition: all 0.2s ease;
            
            &:hover {
              transform: scale(1.1);
            }

            &.default-icon {
              color: var(--el-text-color-secondary);
            }
          }

          .node-title {
            font-weight: 500;
            color: var(--el-text-color-primary);
          }
        }

        .node-info {
          display: flex;
          gap: 12px;
          margin-left: 24px;

          .node-path {
            font-size: 12px;
            color: var(--el-color-primary);
            background: var(--el-color-primary-light-9);
            padding: 2px 6px;
            border-radius: 4px;
            transition: all 0.2s ease;
            
            &:hover {
              background: var(--el-color-primary-light-8);
            }
          }

          .node-permission {
            font-size: 12px;
            color: var(--el-color-success);
            background: var(--el-color-success-light-9);
            padding: 2px 6px;
            border-radius: 4px;
            transition: all 0.2s ease;
            
            &:hover {
              background: var(--el-color-success-light-8);
            }
          }
        }
      }

      .permission-details {
        margin-top: 8px;
        margin-left: 24px;

        .permission-tag {
          margin-right: 4px;
          margin-bottom: 4px;
          transition: all 0.2s ease;
          
          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }
  }
}

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

:deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 0;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

:deep(.el-tree-node__expand-icon) {
  padding: 4px;
}

:deep(.el-card__body) {
  padding: 16px;
}

// 只在节点 hover 时显示"只选当前"按钮
.select-current-btn {
  display: none;
  margin-left: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

.menu-node:hover .select-current-btn {
  display: inline-flex;
}

// 让 node-main-flex 保证所有内容一行显示
.node-main-flex {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

// 缩小"只选当前"按钮尺寸，使其与复选框大小接近
.mini-btn {
  width: 18px;
  height: 18px;
  min-width: 18px;
  min-height: 18px;
  padding: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &.el-button--primary {
    background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, var(--el-color-primary-light-3) 0%, var(--el-color-primary) 100%);
    }
  }
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--el-border-color) inset;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
  }
  
  &.is-focused {
    box-shadow: 0 0 0 1px var(--el-color-primary) inset;
  }
}

:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}
</style>
