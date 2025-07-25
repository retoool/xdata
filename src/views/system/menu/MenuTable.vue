<template>
  <div class="menu-table">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="left-actions">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增菜单
        </el-button>
        <el-button @click="expandAll">
          <el-icon><ArrowDown /></el-icon>展开全部
        </el-button>
        <el-button @click="collapseAll">
          <el-icon><ArrowRight /></el-icon>折叠全部
        </el-button>
      </div>

      <div class="right-search">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索菜单名称、路径"
          clearable
          style="width: 300px"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="searchForm.type"
          placeholder="菜单类型"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="目录" :value="1" />
          <el-option label="页面" :value="2" />
          <el-option label="按钮" :value="3" />
        </el-select>
        <el-button
          :loading="loading"
          icon="Refresh"
          circle
          title="刷新"
          @click="handleRefresh"
        />
      </div>
    </div>

    <!-- 菜单表格 -->
    <div class="table-container">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="filteredTableData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="defaultExpandAll"
      >

        <!-- 菜单名称 -->
        <el-table-column label="菜单名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div
              class="menu-title"
              style="cursor: pointer"
              @click="handleMenuTitleClick(row)"
            >
              <div class="menu-icon-wrapper">
                <el-icon v-if="row.icon" class="menu-icon">
                  <component :is="useRenderIcon(row.icon)" />
                </el-icon>
                <el-icon v-else class="menu-icon default-icon">
                  <Menu />
                </el-icon>
              </div>
              <span class="title-text">{{ row.title }}</span>
              <el-tag
                :type="getMenuTypeTagType(row.type)"
                size="small"
                style="margin-left: 8px"
              >
                {{ getMenuTypeText(row.type) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- 路由信息 -->
        <el-table-column label="路由信息" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="route-info">
              <div v-if="row.path" class="route-path">
                <el-tag size="small" type="primary">{{ row.path }}</el-tag>
              </div>
              <div v-if="row.name" class="route-name">
                <span class="label">Name:</span>
                <span class="value">{{ row.name }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 组件路径 -->
        <el-table-column
          prop="component"
          label=""
          width="220"
          show-overflow-tooltip
        >
          <template #header>
            <span style="display: inline-flex; align-items: center;">
              组件路径/权限标识
              <el-tooltip effect="dark" placement="top" content="目录/页面级别显示组件路径，按钮级别显示权限标识">
                <el-icon style="margin-left: 4px; font-size: 15px; color: #909399; cursor: pointer;">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <template #default="{ row }">
            <span v-if="row.type === 1 || row.type === 2">
              <span v-if="row.component" class="component-path">{{ row.component }}</span>
              <span v-else class="text-muted">-</span>
            </span>
            <span v-else-if="row.type === 3">
              <span v-if="row.permission" class="component-path">{{ row.permission }}</span>
              <span v-else class="text-muted">-</span>
            </span>
          </template>
        </el-table-column>

        <!-- 排序 -->
        <!-- 删除排序列 -->

        <!-- 可见性 -->
        <el-table-column label="显示" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isHidden"
              :disabled="row.type === 3 || isSystemMenuOrChild(row)"
              :active-value="false"
              :inactive-value="true"
              @change="handleVisibilityChange(row)"
            />
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column prop="createTime" label="创建时间" width="160" />

        <!-- 操作 -->
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                :disabled="isSystemMenuOrChild(row)"
                :title="getSystemMenuRestrictionReason(row, '编辑')"
                @click.stop="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-dropdown trigger="click">
                <el-button 
                  size="small" 
                  type="default"
                  :disabled="isSystemMenuOrChild(row)"
                >
                  更多
                  <el-icon style="margin-left: 2px"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item 
                      :disabled="isSystemMenuOrChild(row)"
                      :title="getSystemMenuRestrictionReason(row, '新增')"
                      @click.stop="handleAddChild(row)"
                    >
                      <el-icon style="margin-right: 4px"><Plus /></el-icon> 新增
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :disabled="isSystemMenuOrChild(row)"
                      :title="getSystemMenuRestrictionReason(row, '复制')"
                      @click.stop="handleCopy(row)"
                    >
                      <el-icon style="margin-right: 4px"
                        ><CopyDocument
                      /></el-icon>
                      复制
                    </el-dropdown-item>
                    <el-dropdown-item 
                      :disabled="isSystemMenuOrChild(row)"
                      :title="getSystemMenuRestrictionReason(row, '移动')"
                      @click.stop="handleMove(row)"
                    >
                      <el-icon style="margin-right: 4px"><Position /></el-icon>
                      移动
                    </el-dropdown-item>
                    <el-dropdown-item
                      :disabled="
                        (row.children && row.children.length > 0) || 
                        isSystemMenuOrChild(row)
                      "
                      :title="
                        row.children && row.children.length > 0
                          ? '请先删除子菜单'
                          : isSystemMenuOrChild(row)
                            ? getSystemMenuRestrictionReason(row, '删除')
                            : ''
                      "
                      style="color: var(--el-color-danger)"
                      @click.stop="handleDelete(row)"
                    >
                      <el-icon style="margin-right: 4px"><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 移动菜单弹窗 -->
    <el-dialog
      v-model="showMoveDialog"
      title="移动菜单"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="move-dialog-content">
        <div class="move-info">
          <p>
            将 <strong>{{ moveMenu?.title }}</strong> ({{
              getMenuTypeText(moveMenu?.type)
            }}) 移动到：
          </p>
          <div class="move-rules">
            <p class="rules-title">移动规则：</p>
            <ul class="rules-list">
              <li v-if="moveMenu?.type === 1">• 目录只能移动到其他目录下</li>
              <li v-if="moveMenu?.type === 2">• 页面只能移动到目录下</li>
              <li v-if="moveMenu?.type === 3">• 按钮只能移动到目录或页面下</li>
              <li>• 不能移动到自己的子菜单下</li>
            </ul>
          </div>
        </div>
        <div class="move-layout">
          <div class="target-selection">
            <h4>选择目标菜单</h4>
            <el-tree
              :data="treeMenusWithRoot"
              node-key="id"
              :props="{ label: 'title', children: 'children' }"
              :expand-on-click-node="false"
              :default-expanded-keys="[0]"
              :highlight-current="true"
              :current-node-key="targetMenuId"
              class="move-menu-tree"
              @node-click="handleTreeNodeClick"
            >
              <template #default="{ node, data }">
                <span
                  :style="{ color: isMenuDisabled(data) ? '#ccc' : '' }"
                  :title="getMenuDisabledReason(data)"
                >
                  <div class="tree-menu-icon-wrapper">
                    <el-icon v-if="data.icon" class="tree-menu-icon">
                      <component :is="useRenderIcon(data.icon)" />
                    </el-icon>
                    <el-icon v-else class="tree-menu-icon default-icon">
                      <Menu />
                    </el-icon>
                  </div>
                  {{ data.title }}
                  <el-tag
                    size="small"
                    :type="getMenuTypeTagType(data.type)"
                    style="margin-left: 8px"
                  >
                    {{ getMenuTypeText(data.type) }}
                  </el-tag>
                </span>
              </template>
            </el-tree>
          </div>

          <div class="target-children">
            <h4>
              {{ targetMenuId === 0 ? "根目录菜单" : "目标菜单子项" }}
              <span
                v-if="targetMenuId !== null && targetMenuId !== undefined"
                class="menu-count"
              >
                ({{ targetChildrenList.length }}项)
              </span>
              <span
                v-if="targetMenuId === 0 && moveMenu"
                class="current-status"
              >
                - 当前显示根目录下的所有菜单
              </span>
            </h4>
            <div class="children-card">
              <div
                v-if="targetMenuId === null || targetMenuId === undefined"
                class="no-selection"
              >
                <el-icon><InfoFilled /></el-icon>
                <p>请先选择目标菜单</p>
              </div>
              <div v-else class="children-list">
                <div class="children-header">
                  <span>当前排序：</span>
                  <span v-if="hasChildrenChanged" class="order-changed-tip">
                    (排序已调整，确认移动时将同时保存排序)
                  </span>
                </div>
                <draggable
                  v-model="targetChildrenList"
                  item-key="id"
                  handle=".drag-handle"
                  class="draggable-list"
                  @start="dragStart"
                  @end="dragEnd"
                >
                  <template #item="{ element, index }">
                    <div
                      class="children-item"
                      :class="{ 'is-moving': element.id === moveMenu?.id }"
                    >
                      <div class="drag-handle">
                        <el-icon><Rank /></el-icon>
                      </div>
                      <div class="item-content">
                        <div class="item-icon-wrapper">
                          <el-icon v-if="element.icon" class="item-icon">
                            <component :is="useRenderIcon(element.icon)" />
                          </el-icon>
                          <el-icon v-else class="item-icon default-icon">
                            <Menu />
                          </el-icon>
                        </div>
                        <span class="item-title">{{ element.title }}</span>
                        <el-tag
                          size="small"
                          :type="getMenuTypeTagType(element.type)"
                          style="margin-left: 8px"
                        >
                          {{ getMenuTypeText(element.type) }}
                        </el-tag>
                        <el-tag
                          v-if="element.id === moveMenu?.id"
                          size="small"
                          type="warning"
                          style="margin-left: 8px"
                        >
                          待移动
                        </el-tag>
                      </div>
                      <div class="item-sort">
                        <span class="sort-number">{{ index + 1 }}</span>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showMoveDialog = false">取消</el-button>
          <el-button type="primary" :loading="moveLoading" @click="confirmMove">
            确认移动
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, inject, nextTick } from "vue";
import { ElMessage } from "element-plus";
import {
  Plus,
  Refresh,
  ArrowDown,
  ArrowRight,
  Search,
  Menu,
  CopyDocument,
  Delete,
  Position,
  InfoFilled,
  Rank,
  QuestionFilled
} from "@element-plus/icons-vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { loadCustomIcons } from "@/utils/customIconManager";
// @ts-ignore
import draggable from "vuedraggable";
// Define basic Menu interface locally to avoid import issues
interface MenuType {
  id: number;
  title: string;
  name?: string;
  icon?: string;
  path: string;
  component?: string;
  parentId: number | null;
  sort: number;
  level: number;
  type?: number;

  isHidden: boolean;
  isKeepAlive: boolean;
  cache?: boolean;
  affix?: boolean;
  redirect?: string;
  alwaysShow?: boolean;
  createTime: string;
  updateTime: string;
  children?: MenuType[];
  [key: string]: any;
}
import {
  getAllMenuTree,
  createMenu,
  updateMenu,
  deleteMenu,
  updateMenuVisibility,
  sortMenus,
  moveMenu as moveMenuApi
} from "@/api/system/menu";
import { initRouter } from "@/router/utils";
// 删除菜单详情面板
// 删除showMenuDetail、currentMenu相关声明和赋值
// 删除MenuDetail组件的引用和相关方法

// 注入父组件方法
const menuManagement = inject<any>("menuManagement");

// Emits
const emit = defineEmits<{
  menuSelect: [menu: MenuType | null];
}>();

// 响应式数据
const tableRef = ref();
const loading = ref(false);
const defaultExpandAll = ref(false);
const tableData = ref<MenuType[]>([]);

// 移动菜单相关
const showMoveDialog = ref(false);
const moveMenu = ref<MenuType | null>(null);
const moveTargetType = ref<"parent" | "sibling">("parent");
const targetMenuId = ref<number | null>(null);
const moveLoading = ref(false);

// 目标菜单子项相关
const targetChildrenList = ref<MenuType[]>([]);
const originalChildrenList = ref<MenuType[]>([]);
const hasChildrenChanged = ref(false);
const isDragging = ref(false);

const searchForm = reactive({
  keyword: "",
  type: undefined as number | undefined
});

// 计算属性
const filteredTableData = computed(() => {
  if (!searchForm.keyword && !searchForm.type) {
    return tableData.value;
  }

  // 深拷贝并过滤，避免污染原始数据
  const filterNode = (nodes: MenuType[]): MenuType[] => {
    return nodes
      .map(node => {
        // 关键词搜索
        const matchKeyword =
          !searchForm.keyword ||
          node.title.includes(searchForm.keyword) ||
          (node.path && node.path.includes(searchForm.keyword)) ||
          (node.name && node.name.includes(searchForm.keyword)) ||
          (node.component && node.component.includes(searchForm.keyword)) ||
          (node.permission && node.permission.includes(searchForm.keyword));

        // 类型过滤
        const matchType =
          searchForm.type === undefined || node.type === searchForm.type;

        // 递归过滤子节点
        let filteredChildren: MenuType[] = [];
        if (node.children && node.children.length > 0) {
          filteredChildren = filterNode(node.children);
        }

        const nodeMatched = matchKeyword && matchType;

        if (nodeMatched || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren
          };
        }
        return null;
      })
      .filter(Boolean) as MenuType[];
  };

  return filterNode(tableData.value);
});

// 可移动的目标菜单列表
const availableTargetMenus = computed(() => {
  if (!moveMenu.value) return [];

  const excludeIds = new Set<number>();

  // 排除当前菜单及其所有子菜单
  const addExcludeIds = (menu: MenuType) => {
    excludeIds.add(menu.id);
    if (menu.children) {
      menu.children.forEach(addExcludeIds);
    }
  };
  addExcludeIds(moveMenu.value);

  // 根据菜单类型和移动类型过滤
  const filterMenus = (menus: MenuType[]): MenuType[] => {
    return menus
      .filter(menu => {
        if (excludeIds.has(menu.id)) return false;

        // 根据当前菜单类型和移动类型确定可移动的目标
        const currentType = moveMenu.value?.type;
        const targetType = menu.type;

        if (moveTargetType.value === "parent") {
          // 移动到父级
          switch (currentType) {
            case 1: // 目录
              // 目录只能移动到其他目录下
              return targetType === 1;
            case 2: // 页面
              // 页面只能移动到目录下
              return targetType === 1;
            case 3: // 按钮
              // 按钮只能移动到目录或页面下
              return targetType === 1 || targetType === 2;
            default:
              return false;
          }
        } else {
          // 移动到同级：只能选择与当前菜单同级的父级
          return menu.id === moveMenu.value?.parentId;
        }
      })
      .map(menu => ({
        ...menu,
        children: menu.children ? filterMenus(menu.children) : []
      }));
  };

  return filterMenus(tableData.value);
});

const treeMenusWithRoot = computed(() => {
  return [
    {
      id: 0,
      title: "根目录",
      type: 1,
      children: availableTargetMenus.value
    }
  ];
});

// 方法
const handleSearch = () => {
  // 搜索时自动展开所有节点
  if (searchForm.keyword || searchForm.type !== undefined) {
    defaultExpandAll.value = true;
  } else {
    defaultExpandAll.value = false;
  }
};

const handleRefresh = () => {
  loadTableData();
};

const handleMenuTitleClick = (row: MenuType) => {
  emit("menuSelect", row);
};

const handleAdd = () => {
  if (menuManagement) {
    menuManagement.handleAddMenu();
  }
};

// 系统菜单限制相关方法
const isSystemMenu = (menu: MenuType): boolean => {
  // 系统管理菜单的ID范围：1-10（可根据实际情况调整）
  return menu.title == '系统管理';
};

const isSystemMenuOrChild = (menu: MenuType): boolean => {
  // 检查当前菜单是否为系统菜单
  if (isSystemMenu(menu)) {
    return true;
  }
  
  // 检查当前菜单的父级是否为系统菜单
  const checkParent = (menus: MenuType[], targetId: number): boolean => {
    for (const item of menus) {
      if (item.id === targetId) {
        return isSystemMenu(item);
      }
      if (item.children && item.children.length > 0) {
        if (checkParent(item.children, targetId)) {
          return true;
        }
      }
    }
    return false;
  };
  
  return checkParent(tableData.value, menu.parentId || 0);
};

const getSystemMenuRestrictionReason = (menu: MenuType, operation: string): string => {
  if (isSystemMenu(menu)) {
    return `系统菜单不支持${operation}`;
  }
  if (isSystemMenuOrChild(menu)) {
    return `系统菜单的子菜单不支持${operation}`;
  }
  return '';
};

const handleEdit = (row: MenuType) => {
  // 检查是否为系统菜单
  if (isSystemMenuOrChild(row)) {
    ElMessage.warning(getSystemMenuRestrictionReason(row, '编辑'));
    return;
  }

  if (menuManagement) {
    menuManagement.handleEditMenu(row);
  }
};

const handleAddChild = (row: MenuType) => {
  // 检查是否为系统菜单
  if (isSystemMenuOrChild(row)) {
    ElMessage.warning(getSystemMenuRestrictionReason(row, '新增'));
    return;
  }

  if (menuManagement) {
    menuManagement.handleAddMenu(row);
  }
};

const handleCopy = (row: MenuType) => {
  // 检查是否为系统菜单
  if (isSystemMenuOrChild(row)) {
    ElMessage.warning(getSystemMenuRestrictionReason(row, '复制'));
    return;
  }

  if (menuManagement) {
    menuManagement.handleCopyMenu(row);
  }
};

const handleMove = (row: MenuType) => {
  // 检查是否为系统菜单
  if (isSystemMenuOrChild(row)) {
    ElMessage.warning(getSystemMenuRestrictionReason(row, '移动'));
    return;
  }

  moveMenu.value = row;
  moveTargetType.value = "parent";
  targetMenuId.value = null;
  targetChildrenList.value = [];
  originalChildrenList.value = [];
  hasChildrenChanged.value = false;
  showMoveDialog.value = true;

  // 初始化显示当前菜单的上级目录
  nextTick(() => {
    initCurrentParentMenu();
  });
};

const handleDelete = (row: MenuType) => {
  // 检查是否为系统菜单
  if (isSystemMenuOrChild(row)) {
    ElMessage.warning(getSystemMenuRestrictionReason(row, '删除'));
    return;
  }

  console.log("删除菜单:", row);
  console.log("子菜单数量:", row.children?.length || 0);
  if (menuManagement) {
    menuManagement.handleDeleteMenu(row);
  }
};

const handleVisibilityChange = async (row: MenuType) => {
  // 检查是否为系统菜单
  if (isSystemMenuOrChild(row)) {
    ElMessage.warning(getSystemMenuRestrictionReason(row, '显示切换'));
    // 恢复原状态
    row.isHidden = !row.isHidden;
    return;
  }

  try {
    await updateMenuVisibility(row.id, !row.isHidden);
    ElMessage.success(!row.isHidden ? "菜单已显示" : "菜单已隐藏");
    await initRouter(); // 可见性变更后刷新菜单
  } catch (error) {
    // 恢复原状态
    row.isHidden = !row.isHidden;
    ElMessage.error("可见性更新失败");
  }
};

const expandAll = () => {
  defaultExpandAll.value = true;
  nextTick(() => {
    const expandKeys = getAllNodeKeys(tableData.value);
    expandKeys.forEach(key => {
      tableRef.value?.toggleRowExpansion({ id: key }, true);
    });
  });
};

const collapseAll = () => {
  defaultExpandAll.value = false;
  nextTick(() => {
    const expandKeys = getAllNodeKeys(tableData.value);
    expandKeys.forEach(key => {
      tableRef.value?.toggleRowExpansion({ id: key }, false);
    });
  });
};

const getAllNodeKeys = (nodes: MenuType[]): number[] => {
  const keys: number[] = [];

  const traverse = (nodeList: MenuType[]) => {
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

const getMenuTypeText = (type: number): string => {
  switch (type) {
    case 1:
      return "目录";
    case 2:
      return "页面";
    case 3:
      return "按钮";
    default:
      return "未知";
  }
};

const getMenuTypeTagType = (type: number) => {
  switch (type) {
    case 1:
      return "warning" as const;
    case 2:
      return "success" as const;
    case 3:
      return "info" as const;
    default:
      return "info" as const;
  }
};

const getMenuDisplayName = (menu: MenuType): string => {
  return `${menu.title} (${getMenuTypeText(menu.type)})`;
};

const isMenuDisabled = (menu: MenuType): boolean => {
  if (!moveMenu.value) return false;

  // 不能移动到自己的子菜单下
  const isChild = (parent: MenuType, childId: number): boolean => {
    if (parent.id === childId) return true;
    if (parent.children) {
      return parent.children.some(child => isChild(child, childId));
    }
    return false;
  };

  return isChild(menu, moveMenu.value.id);
};

const getMenuDisabledReason = (menu: MenuType): string => {
  if (!moveMenu.value) return "";

  const currentType = moveMenu.value.type;
  const targetType = menu.type;

  // 检查是否是自己的子菜单
  const isChild = (parent: MenuType, childId: number): boolean => {
    if (parent.id === childId) return true;
    if (parent.children) {
      return parent.children.some(child => isChild(child, childId));
    }
    return false;
  };

  if (isChild(menu, moveMenu.value.id)) {
    return "不能移动到自己的子菜单下";
  }

  // 检查类型限制
  if (moveTargetType.value === "parent") {
    switch (currentType) {
      case 1: // 目录
        if (targetType !== 1) {
          return "目录只能移动到其他目录下";
        }
        break;
      case 2: // 页面
        if (targetType !== 1) {
          return "页面只能移动到目录下";
        }
        break;
      case 3: // 按钮
        if (targetType === 1) {
          return "按钮不能移动到目录下";
        }
        if (targetType === 3) {
          return "按钮不能移动到其他按钮下";
        }
        break;
    }
  }

  return "";
};

const confirmMove = async () => {
  if (
    !moveMenu.value ||
    targetMenuId.value === null ||
    targetMenuId.value === undefined
  ) {
    ElMessage.warning("请选择目标菜单");
    return;
  }

  moveLoading.value = true;

  try {
    // 使用专门的moveMenu API
    await moveMenuApi(
      moveMenu.value.id,
      targetMenuId.value === 0 ? null : targetMenuId.value
    );

    // 如果排序有变化，同时保存排序
    if (hasChildrenChanged.value) {
      try {
        // 构建排序数据
        const sortData = targetChildrenList.value.map((menu, index) => ({
          id: menu.id,
          sort: index + 1
        }));

        // 调用排序API
        await sortMenus(sortData);
        ElMessage.success("菜单移动成功，排序已保存");
      } catch (sortError) {
        console.error("保存排序失败:", sortError);
        ElMessage.warning("菜单移动成功，但排序保存失败");
      }
    } else {
      ElMessage.success("菜单移动成功");
    }

    showMoveDialog.value = false;

    // 清理状态
    targetChildrenList.value = [];
    originalChildrenList.value = [];
    hasChildrenChanged.value = false;

    await loadTableData(); // 重新加载数据
    await initRouter(); // 刷新路由
  } catch (error) {
    console.error("移动菜单失败:", error);
    ElMessage.error("移动菜单失败");
  } finally {
    moveLoading.value = false;
  }
};

const loadTableData = async () => {
  loading.value = true;

  try {
    // 重新加载自定义图标
    await loadCustomIcons();

    const result = await getAllMenuTree();

    // 如果result是包装对象，需要取出data字段
    let menuList = result;
    if (result && typeof result === "object" && "data" in result) {
      menuList = (result as any).data;
    }

    tableData.value = Array.isArray(menuList) ? menuList : [];
  } catch (error) {
    console.error("加载菜单失败:", error);
    ElMessage.error("加载菜单列表失败");
    tableData.value = [];
  } finally {
    loading.value = false;
  }
};

const handleTreeNodeClick = (data: MenuType) => {
  if (!isMenuDisabled(data)) {
    targetMenuId.value = data.id;
    updateTargetChildrenList();
  }
};

const updateTargetChildrenList = () => {
  if (
    targetMenuId.value === null ||
    targetMenuId.value === undefined ||
    !moveMenu.value
  ) {
    targetChildrenList.value = [];
    originalChildrenList.value = [];
    hasChildrenChanged.value = false;
    return;
  }

  // 找到目标菜单
  const findMenu = (menus: MenuType[], id: number): MenuType | null => {
    for (const menu of menus) {
      if (menu.id === id) return menu;
      if (menu.children) {
        const found = findMenu(menu.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  let targetMenu: MenuType | null = null;
  let children: MenuType[] = [];

  if (targetMenuId.value === 0) {
    // 根目录情况：获取所有第一级菜单
    children = tableData.value.filter(
      menu => !menu.parentId || menu.parentId === 0
    );
  } else {
    // 普通父级菜单情况
    targetMenu = findMenu(tableData.value, targetMenuId.value);
    if (targetMenu) {
      children = targetMenu.children || [];
    }
  }

  if (!targetMenu && targetMenuId.value !== 0) {
    targetChildrenList.value = [];
    originalChildrenList.value = [];
    hasChildrenChanged.value = false;
    return;
  }

  // 检查要移动的菜单是否已经在当前列表中
  const existingIndex = children.findIndex(
    child => child.id === moveMenu.value.id
  );

  if (existingIndex >= 0) {
    // 如果菜单已经在列表中，保持原有顺序，但要高亮显示
    const newChildrenList = [...children];
    originalChildrenList.value = [...newChildrenList];
    targetChildrenList.value = [...newChildrenList];
  } else {
    // 如果菜单不在列表中，添加到第一行（模拟移动后的状态）
    const newChildrenList = [moveMenu.value, ...children];
    originalChildrenList.value = [...newChildrenList];
    targetChildrenList.value = [...newChildrenList];
  }

  hasChildrenChanged.value = false;
};

const dragStart = () => {
  isDragging.value = true;
};

const dragEnd = () => {
  isDragging.value = false;
  // 检查顺序是否改变
  hasChildrenChanged.value =
    JSON.stringify(targetChildrenList.value) !==
    JSON.stringify(originalChildrenList.value);
};

const initCurrentParentMenu = () => {
  if (!moveMenu.value) return;

  // 检查是否为第一级菜单（根目录下的菜单）
  const isFirstLevelMenu =
    !moveMenu.value.parentId || moveMenu.value.parentId === 0;

  if (isFirstLevelMenu) {
    // 第一级菜单：直接显示根目录的子菜单
    targetMenuId.value = 0;
    updateTargetChildrenList();
  } else {
    // 非第一级菜单：找到当前菜单的父级菜单
    const findParentMenu = (
      menus: MenuType[],
      childId: number
    ): MenuType | null => {
      for (const menu of menus) {
        if (menu.children) {
          const hasChild = menu.children.some(child => child.id === childId);
          if (hasChild) {
            return menu;
          }
          // 递归查找更深层的父级
          const found = findParentMenu(menu.children, childId);
          if (found) return found;
        }
      }
      return null;
    };

    const parentMenu = findParentMenu(tableData.value, moveMenu.value.id);

    if (parentMenu) {
      // 设置目标菜单为当前父级菜单
      targetMenuId.value = parentMenu.id;
      updateTargetChildrenList();
    } else {
      // 如果没有父级菜单，设置为根目录
      targetMenuId.value = 0;
      updateTargetChildrenList();
    }
  }
};

// 在 <script setup> 里添加
function fillMenu(menu: any): any {
  return {
    id: menu.id,
    title: menu.title,
    name: menu.name ?? '',
    icon: menu.icon ?? '',
    path: menu.path ?? '',
    component: menu.component ?? '',
    parentId: menu.parentId ?? 0,
    sort: menu.sort ?? 0,
    level: menu.level ?? 1,
    type: menu.type ?? 1,
    isHidden: menu.isHidden ?? false,
    isKeepAlive: menu.isKeepAlive ?? false,
    permission: menu.permission ?? '',
    isIframe: menu.isIframe ?? false,
    redirect: menu.redirect ?? '',
    createTime: menu.createTime ?? '',
    updateTime: menu.updateTime ?? '',
    children: (menu.children ?? []).map(fillMenu)
  }
}

// 生命周期
onMounted(async () => {
  // 加载自定义图标
  await loadCustomIcons();

  loadTableData();
});

// 暴露方法给父组件
defineExpose({
  refreshTable: loadTableData,
  createMenu,
  updateMenu,
  deleteMenu,
});
</script>

<style scoped lang="scss">
.menu-table {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .left-actions {
      display: flex;
      gap: 8px;
    }

    .right-search {
      display: flex;
      gap: 8px;
    }
  }

  .table-container {
    flex: 1;
    overflow: hidden;

    .el-table {
      height: 100%;
    }

    .menu-title {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;

      .menu-icon-wrapper {
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background-color: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color-light);
        border-radius: 4px;
        transition: all 0.2s ease;
      }

      .menu-icon {
        color: var(--el-text-color-primary);
        font-size: 14px;

        &.default-icon {
          color: var(--el-text-color-secondary);
        }
      }

      &:hover {
        background-color: var(--el-color-primary-light-8);

        .menu-icon-wrapper {
          background-color: var(--el-color-primary-light-8);
          border-color: var(--el-color-primary-light-6);
        }

        .menu-icon {
          color: var(--el-color-primary);
        }

        .title-text {
          color: var(--el-color-primary-dark-2);
        }
      }

      .title-text {
        font-weight: 500;
        color: var(--el-color-primary);
        transition: color 0.2s ease;
      }
    }

    .route-info {
      .route-path {
        margin-bottom: 4px;
      }

      .route-name {
        font-size: 12px;
        color: var(--el-text-color-secondary);

        .label {
          font-weight: 500;
        }

        .value {
          margin-left: 4px;
        }
      }
    }

    .component-path {
      font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
      font-size: 12px;
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      padding: 2px 6px;
      border-radius: 3px;
    }

    .text-muted {
      color: var(--el-text-color-placeholder);
    }
  }
}

:deep(.el-table) {
  .el-table__row {
    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.current-row {
      background-color: var(--el-color-primary-light-9);
    }
  }

  .el-table__cell {
    .cell {
      display: flex;
      align-items: center;
    }
  }
}

:deep(.el-tag) {
  border: none;
  font-weight: 500;
}

:deep(.el-switch) {
  &.is-disabled {
    .el-switch__core {
      background-color: var(--el-fill-color-darker);
    }
  }
}

// 操作按钮样式
.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;

  .el-button {
    margin: 0;
    padding: 4px 8px;
    font-size: 12px;
    min-width: auto;
  }
}

// 抽屉样式
:deep(.el-drawer) {
  .el-drawer__header {
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding: 16px 20px 12px;

    .el-drawer__title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .el-drawer__body {
    padding: 20px;
  }
}

// 移动菜单弹窗样式
:deep(.move-dialog-content) {
  .move-info {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
    border-left: 4px solid var(--el-color-primary);

    p {
      margin: 0 0 12px 0;
      color: var(--el-text-color-regular);
      font-size: 14px;

      strong {
        color: var(--el-color-primary);
        font-weight: 600;
      }
    }

    .move-rules {
      .rules-title {
        margin: 0 0 8px 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .rules-list {
        margin: 0;
        padding-left: 16px;

        li {
          margin-bottom: 4px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
          line-height: 1.4;
        }
      }
    }
  }

  .move-layout {
    display: flex;
    gap: 20px;
    height: 400px;

    .target-selection {
      flex: 1;
      min-width: 300px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .target-children {
      flex: 1;
      min-width: 300px;

      h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        display: flex;
        align-items: center;

        .menu-count {
          margin-left: 8px;
          font-size: 12px;
          font-weight: normal;
          color: var(--el-text-color-secondary);
        }

        .current-status {
          margin-left: 8px;
          font-size: 12px;
          font-weight: normal;
          color: var(--el-color-primary);
          font-style: italic;
        }
      }

      .children-card {
        height: 100%;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 6px;
        background: var(--el-fill-color-blank);

        .no-selection {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--el-text-color-placeholder);

          .el-icon {
            font-size: 48px;
            margin-bottom: 12px;
            opacity: 0.5;
          }

          p {
            margin: 0;
            font-size: 14px;
          }
        }

        .children-list {
          height: 100%;
          display: flex;
          flex-direction: column;

          .children-header {
            padding: 12px 16px;
            border-bottom: 1px solid var(--el-border-color-lighter);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--el-fill-color-light);

            span {
              font-size: 13px;
              color: var(--el-text-color-secondary);
            }
          }

          .draggable-list {
            flex: 1;
            overflow-y: auto;
            padding: 8px;

            .children-item {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              margin-bottom: 4px;
              background: var(--el-fill-color-blank);
              border: 1px solid var(--el-border-color-lighter);
              border-radius: 4px;
              transition: all 0.2s ease;

              &:hover {
                border-color: var(--el-color-primary-light-5);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }

              &.is-moving {
                background: var(--el-color-primary-light-9);
                border-color: var(--el-color-primary);

                .item-title {
                  color: var(--el-color-primary);
                  font-weight: 600;
                }
              }

              .drag-handle {
                margin-right: 8px;
                cursor: move;
                color: var(--el-text-color-secondary);
                padding: 2px;
                border-radius: 2px;
                transition: all 0.2s ease;

                &:hover {
                  color: var(--el-color-primary);
                  background: var(--el-color-primary-light-9);
                }

                .el-icon {
                  font-size: 14px;
                }
              }

              .item-content {
                flex: 1;
                display: flex;
                align-items: center;

                .item-icon-wrapper {
                  margin-right: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 24px;
                  height: 24px;
                  background-color: var(--el-fill-color-light);
                  border: 1px solid var(--el-border-color-light);
                  border-radius: 4px;
                  transition: all 0.2s ease;

                  .item-icon {
                    color: var(--el-text-color-primary);
                    font-size: 14px;

                    &.default-icon {
                      color: var(--el-text-color-secondary);
                    }
                  }
                }

                .item-title {
                  font-weight: 500;
                  color: var(--el-text-color-primary);
                }
              }

              .item-sort {
                margin-left: 8px;

                .sort-number {
                  display: inline-block;
                  width: 20px;
                  height: 20px;
                  line-height: 20px;
                  text-align: center;
                  background: var(--el-color-primary-light-8);
                  color: var(--el-color-primary);
                  border-radius: 50%;
                  font-size: 12px;
                  font-weight: 600;
                }
              }
            }
          }
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 排序变化提示样式
.order-changed-tip {
  color: var(--el-color-warning);
  font-size: 12px;
  font-style: italic;
}

.move-menu-tree {
  margin-top: 8px;
  max-height: 320px;
  overflow: auto;
  background: var(--el-fill-color-blank);
  border-radius: 4px;
  border: 1px solid var(--el-border-color-lighter);
  padding: 8px 0;

  .tree-menu-icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-light);
    border-radius: 3px;
    margin-right: 6px;
    transition: all 0.2s ease;
  }

  .tree-menu-icon {
    color: var(--el-text-color-primary);
    font-size: 12px;

    &.default-icon {
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
