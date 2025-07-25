<template>
  <div class="menu-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      label-position="right"
      :disabled="readonly"
    >
      <!-- 基本信息 -->
      <el-card shadow="never" class="form-section">
        <template #header>
          <div class="section-title">
            <el-icon><InfoFilled /></el-icon>
            <span>基本信息</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group
                v-model="formData.type"
                @change="handleTypeChange"
              >
                <el-radio :value="1">
                  <el-tag type="warning" size="small">目录</el-tag>
                  <span style="margin-left: 8px">目录级别</span>
                </el-radio>
                <el-radio :value="2">
                  <el-tag type="success" size="small">页面</el-tag>
                  <span style="margin-left: 8px">页面级别</span>
                </el-radio>
                <el-radio :value="3">
                  <el-tag type="info" size="small">按钮</el-tag>
                  <span style="margin-left: 8px">权限级别</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select
                v-model="formData.parentId"
                :data="parentMenuOptions"
                :props="treeSelectProps"
                placeholder="选择上级菜单"
                clearable
                check-strictly
                :render-after-expand="false"
                style="width: 100%"
                node-key="id"
              >
                <template #default="{ data }">
                  <div
                    class="tree-node"
                    style="
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      width: 100%;
                    "
                  >
                    <el-icon
                      v-if="data.icon"
                      class="tree-node-icon"
                      style="
                        color: var(--el-text-color-primary);
                        font-size: 16px;
                        flex-shrink: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 16px;
                        height: 16px;
                      "
                    >
                      <component :is="useRenderIcon(data.icon)" />
                    </el-icon>
                    <el-icon
                      v-else
                      class="tree-node-icon"
                      style="
                        color: var(--el-text-color-primary);
                        font-size: 16px;
                        flex-shrink: 0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 16px;
                        height: 16px;
                      "
                    >
                      <MenuIcon />
                    </el-icon>
                    <span
                      class="tree-node-title"
                      style="
                        color: var(--el-text-color-primary);
                        font-size: 14px;
                        font-weight: 500;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        flex: 1;
                        opacity: 1;
                        visibility: visible;
                        line-height: 1.4;
                        display: flex;
                        align-items: center;
                      "
                      >{{ data.title || "无标题" }}</span
                    >
                    <el-tag
                      v-if="data.type"
                      :type="getMenuTypeTagType(data.type)"
                      size="small"
                      style="margin-left: 8px"
                    >
                      {{ getMenuTypeText(data.type) }}
                    </el-tag>
                  </div>
                </template>
              </el-tree-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="title">
              <el-input
                v-model="formData.title"
                placeholder="请输入菜单名称"
                maxlength="50"
                show-word-limit
                clearable
              >
                <template #prefix>
                  <el-icon><MenuIcon /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="formData.type !== 3"
              label="菜单图标"
              prop="icon"
            >
              <div class="icon-selector">
                <div class="icon-preview">
                  <div
                    class="icon-wrapper"
                    :title="formData.icon || '未选择图标'"
                  >
                    <component
                      :is="useRenderIcon(formData.icon)"
                      v-if="formData.icon"
                      class="preview-icon"
                    />
                    <el-icon v-else class="preview-icon placeholder">
                      <Picture />
                    </el-icon>
                  </div>
                </div>
                <el-button @click="showIconSelector">选择图标</el-button>
              </div>
            </el-form-item>
            <el-form-item
              v-if="formData.type === 3"
              label="权限标识"
              prop="permission"
            >
              <el-input
                v-model="formData.permission"
                placeholder="请输入权限标识"
                maxlength="100"
                clearable
              />
              <div class="form-tip">建议格式：模块:资源:操作，例如 system:user:add</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- 路由信息 -->
      <el-card v-if="formData.type !== 3" shadow="never" class="form-section">
        <template #header>
          <div class="section-title">
            <el-icon><Link /></el-icon>
            <span>路由信息</span>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="路由地址" prop="path">
              <el-input
                v-model="formData.path"
                placeholder="请输入路由地址"
                maxlength="200"
                clearable
                @input="handlePathChange"
              >
                <template #prefix>
                  <el-icon><Link /></el-icon>
                </template>
              </el-input>
              <div class="form-tip">
                访问的路由地址，如：/user或user
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item
          v-if="formData.type === 2"
          label="组件路径"
          prop="component"
        >
          <el-autocomplete
            v-model="formData.component"
            :fetch-suggestions="searchComponents"
            placeholder="请输入组件路径或外链地址（如 https://xxx.com）"
            maxlength="200"
            clearable
            style="width: 100%"
            @select="handleComponentSelect"
          >
            <template #prefix>
              <el-icon><Files /></el-icon>
            </template>
            <template #suffix>
              <div class="component-actions">
                <el-button
                  v-if="formData.path && !isExternalLink"
                  type="primary"
                  size="small"
                  text
                  @click="suggestComponent"
                >
                  智能建议
                </el-button>
              </div>
            </template>
            <template #default="{ item }">
              <div class="component-suggestion">
                <span class="path">{{ item.value }}</span>
                <el-tag v-if="item.exists" type="success" size="small"
                  >存在</el-tag
                >
                <el-tag v-else type="warning" size="small">建议</el-tag>
              </div>
            </template>
          </el-autocomplete>
          <div class="form-tip">
            组件路径请填写如 <b>user/index</b>、<b>welcome/index</b> 这种格式，或填写 <b>http(s)://</b> 开头的外链地址（如 <b>https://www.baidu.com</b>），自动识别为外链菜单。
          </div>
        </el-form-item>

        <el-form-item
          v-if="formData.type === 1"
          label="重定向地址"
          prop="redirect"
        >
          <el-input
            v-model="formData.redirect"
            placeholder="请输入重定向地址"
            maxlength="200"
            clearable
          >
            <template #prefix>
              <el-icon><Position /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">设置该路由在侧边栏和面包屑中点击的跳转地址</div>
        </el-form-item>

        <!-- 外链内嵌配置，仅菜单类型为2且为外链时显示 -->
        <el-form-item
          v-if="formData.type === 2 && isExternalLink"
          label="内嵌显示(iframe)"
          prop="isIframe"
        >
          <el-switch
            v-model="formData.isIframe"
            active-text="在主内容区内嵌"
            inactive-text="新窗口打开"
          />
          <div class="form-tip">
            勾选后，外链菜单将在主内容区以 iframe 方式内嵌显示，否则在新窗口打开
          </div>
        </el-form-item>

        <!-- 路由验证结果 -->
        <el-alert
          v-if="routeValidation && !routeValidation.valid"
          type="error"
          :closable="false"
          show-icon
        >
          <template #title> 路由配置验证失败 </template>
          <ul style="margin: 8px 0 0 0; padding-left: 20px">
            <li v-for="error in routeValidation.errors" :key="error">
              {{ error }}
            </li>
          </ul>
        </el-alert>
      </el-card>

      <!-- 显示设置 -->
      <el-card v-if="formData.type !== 3" shadow="never" class="form-section">
        <template #header>
          <div class="section-title">
            <el-icon><Setting /></el-icon>
            <span>显示设置</span>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col v-if="formData.type !== 3" :span="12">
            <el-form-item label="是否隐藏" prop="isHidden">
              <el-radio-group v-model="formData.isHidden">
                <el-radio :value="false">
                  <el-tag type="success" size="small">显示</el-tag>
                  <span style="margin-left: 8px">在菜单中显示</span>
                </el-radio>
                <el-radio :value="true">
                  <el-tag type="warning" size="small">隐藏</el-tag>
                  <span style="margin-left: 8px">在菜单中隐藏</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="formData.type === 2" :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否缓存" prop="cache">
              <el-radio-group v-model="formData.isKeepAlive">
                <el-radio :value="true">
                  <el-tag type="success" size="small">缓存</el-tag>
                  <span style="margin-left: 8px">缓存该页面</span>
                </el-radio>
                <el-radio :value="false">
                  <el-tag type="info" size="small">不缓存</el-tag>
                  <span style="margin-left: 8px">不缓存该页面</span>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
    </el-form>
    <div v-if="readonly" class="form-timestamps" style="margin-top: 16px; color: #888; font-size: 13px;">
      <div>创建时间：{{ formData.createTime || '-' }}</div>
      <div>更新时间：{{ formData.updateTime || '-' }}</div>
    </div>
    <!-- 表单底部操作 -->
    <div v-if="!readonly" class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ getSubmitButtonText() }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, inject } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import {
  InfoFilled,
  Menu as MenuIcon,
  Picture,
  Link,
  Files,
  Position,
  Setting,

} from "@element-plus/icons-vue";
import { getAllMenuTree, checkMenuName, checkMenuPath } from "@/api/system/menu";
import {
  validateComponentPath,
  suggestComponentPath,
  validateMenuRoute,
  getAvailableComponents
} from "@/router/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { loadCustomIcons, registerCustomIcon } from "@/utils/customIconManager";

// Props
const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  formMode: {
    type: String,
    default: 'create'
  },
  parentMenu: {
    type: Object,
    default: null
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits<{
  submit: [data: BackendRoute];
  cancel: [];
}>();

// 注入父组件方法
const menuManagement = inject<any>("menuManagement");

// 响应式数据
const formRef = ref<FormInstance>();
const submitting = ref(false);
const parentMenuOptions = ref<(BackendRoute & { disabled?: boolean })[]>([]);
const availableComponents = ref<string[]>([]);
const routeValidation = ref<{ valid: boolean; errors: string[] } | null>(null);

const formData = reactive({
  id: undefined,
  title: "",
  path: "",
  component: "",
  icon: "",
  type: 2,
  parentId: 0,
  sort: 0,
  level: 1,
  permission: "",
  isHidden: true,
  isKeepAlive: false,
  redirect: "",
  isIframe: false,
  createTime: "",
  updateTime: "",
  children: []
});

const treeSelectProps = {
  value: "id",
  label: "title",
  children: "children",
  emitPath: false,
  checkStrictly: true
};

// 计算属性
const getSubmitButtonText = () => {
  if (props.formMode === "create") return "创建菜单";
  if (props.formMode === "edit") return "更新菜单";
  if (props.formMode === "copy") return "复制菜单";
  return "提交";
};

// 新增外链识别计算属性
const isExternalLink = computed(() => {
  return /^https?:\/\//.test(formData.component || "");
});

// 表单验证规则
const formRules: FormRules = {
  title: [
    { required: true, message: "请输入菜单名称", trigger: "blur" },
    { min: 2, max: 50, message: "菜单名称长度为2-50个字符", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback();
        checkMenuName(
          value,
          formData.parentId,
          props.formMode === "edit" ? formData.id : undefined
        )
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error("同一级别下菜单名称不能重复"));
            } else {
              callback();
            }
          })
          .catch(() => {
            callback(new Error("菜单名称验证失败"));
          });
      },
      trigger: "blur"
    }
  ],
  type: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  path: [
    { required: true, message: "请输入路由地址", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!value || formData.type === 3) return callback();
        checkMenuPath(
          value,
          props.formMode === "edit" ? formData.id : undefined
        )
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error("路由地址已存在"));
            } else {
              callback();
            }
          })
          .catch(() => {
            callback(new Error("路由地址验证失败"));
          });
      },
      trigger: "blur"
    }
  ],
  component: [
    {
      validator: (rule, value, callback) => {
        if (isExternalLink.value) {
          // 外链不校验本地组件存在性
          callback();
        } else if (formData.type === 2 && !value) {
          callback(new Error("请输入组件路径"));
        } else if (value && !validateComponentPath(value)) {
          callback(new Error("组件路径不存在"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  sort: [{ required: true, message: "请输入排序号", trigger: "blur" }],
  isIframe: [
    { required: true, message: "请选择内嵌显示方式", trigger: "change" }
  ],
  permission: [
    {
      required: true,
      message: "请输入权限标识",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (formData.type === 3 && !value) {
          callback(new Error("权限级别菜单必须填写权限标识"));
        } else {
          callback();
        }
      }
    }
  ]
};

// 方法
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // 检查是否在系统菜单下新增
    if (props.formMode === 'create' && formData.parentId && formData.parentId !== 0) {
      const parentMenu = parentMenuOptions.value.find(menu => menu.id === formData.parentId);
      if (parentMenu && isSystemMenu(parentMenu)) {
        ElMessage.warning('不能在系统菜单下新增子菜单');
        return;
      }
    }

    // 外链菜单直接通过校验
    if (isExternalLink.value) {
      routeValidation.value = { valid: true, errors: [] };
    } else {
      routeValidation.value = validateMenuRoute(formData);
      if (!routeValidation.value.valid) {
        ElMessage.error("路由配置验证失败，请检查并修正");
        return;
      }
    }

    submitting.value = true;
    emit("submit", formData);
  } catch (error) {
    ElMessage.error("请检查表单数据");
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  emit("cancel");
};

const handleTypeChange = (type: number) => {
  // 根据类型调整表单字段
  if (type === 1) {
    // 目录
    formData.component = "";
    formData.isKeepAlive = false;
    formData.isHidden = true;
    formData.isIframe = false;
    formData.redirect = "";
    formData.permission = "";
  } else if (type === 2) {
    formData.isKeepAlive = false;
    formData.isHidden = true;
    formData.isIframe = false;
    formData.redirect = "";
    formData.permission = "";
  } else if (type === 3) {
    // 按钮
    formData.path = "";
    formData.component = "";
    formData.icon = "";
    formData.redirect = "";
    formData.isHidden = true;
    formData.isKeepAlive = false;
    formData.isIframe = false;
  }

  // 清除路由验证结果
  routeValidation.value = null;
};

const handlePathChange = () => {
  // 路径变化时清除路由验证结果
  routeValidation.value = null;

  // 自动建议组件路径
  if (formData.path && formData.type === 2 && !formData.component) {
    suggestComponent();
  }
};

const searchComponents = (queryString: string, cb: Function) => {
  let suggestions = availableComponents.value
    .filter(component =>
      component.toLowerCase().includes(queryString.toLowerCase())
    )
    .map(component => ({
      value: component.replace(/^@\/views\//, ""), // 只保留相对路径
      exists: true
    }));

  // 添加智能建议
  if (formData.path) {
    const smartSuggestions = suggestComponentPath(
      formData.path
    ).map(suggestion => ({
      value: suggestion.replace(/^@\/views\//, ""), // 只保留相对路径
      exists: false
    }));

    suggestions = suggestions.concat(smartSuggestions);
  }

  // 去重（只保留第一个出现的 value）
  const seen = new Set();
  const uniqueSuggestions = suggestions.filter(item => {
    if (seen.has(item.value)) return false;
    seen.add(item.value);
    return true;
  });

  cb(uniqueSuggestions.slice(0, 10)); // 限制显示数量
};

const handleComponentSelect = (item: { value: string }) => {
  formData.component = item.value;
};

const suggestComponent = () => {
  if (!formData.path) return;
  // 去掉开头的 /，并补全 index
  let path = formData.path.replace(/^\//, "");
  if (!path) return;
  formData.component = `${path}/index`;
};

const showIconSelector = () => {
  if (menuManagement) {
    menuManagement.showIconSelector(formData.icon);
  }
};

const setIcon = async (icon: string) => {
  formData.icon = icon;

  // 如果是自定义图标，确保它已经被注册
  if (icon && icon.startsWith("custom/")) {
    try {
      const customIconData = await loadCustomIcons();
      const customIcon = customIconData.find(ci => ci.iconName === icon);
      if (customIcon) {
        registerCustomIcon(customIcon.iconName, customIcon.svgContent);
      }
    } catch (error) {
      console.warn("Failed to register custom icon:", error);
    }
  }
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

// 系统菜单限制相关方法
const isSystemMenu = (menu: BackendRoute): boolean => {
  return menu.title == '系统管理';
};

const isSystemMenuOrChild = (menu: BackendRoute): boolean => {
  // 检查当前菜单是否为系统菜单
  if (isSystemMenu(menu)) {
    return true;
  }
  
  // 检查当前菜单的父级是否为系统菜单
  const checkParent = (menus: BackendRoute[], targetId: number): boolean => {
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
  
  return checkParent(parentMenuOptions.value, menu.parentId || 0);
};

const loadParentMenuOptions = async () => {
  try {
    const menuTree = await getAllMenuTree();

    // 构建父菜单选项，规则与菜单移动一致
    const buildOptions = (menus: BackendRoute[], level = 0): BackendRoute[] => {
      if (!menus || menus.length === 0) return [];

      menus = [...menus].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
      return menus
        .filter(menu => {
          // 规则限制
          if (formData.type === 1) {
            // 目录只能选根目录或目录（根目录在外层加，不在这里）
            return menu.type === 1;
          } else if (formData.type === 2) {
            // 页面只能选目录
            return menu.type === 1;
          } else if (formData.type === 3) {
            // 按钮只能选目录或页面
            return menu.type === 1 || menu.type === 2;
          }
          return true;
        })
        .map(menu => {
          const children =
            menu.children && menu.children.length > 0
              ? buildOptions(menu.children, level + 1)
              : [];
          return {
            ...menu,
            children,
            disabled: isSystemMenu(menu) // 系统菜单禁用选择
          } as BackendRoute & { disabled: boolean };
        });
    };

    // 添加根目录选项
    parentMenuOptions.value = [
      {
        id: 0,
        title: "根目录",
        icon: "",
        path: "",
        component: "",
        parentId: null,
        sort: 0,
        level: 1,
        type: 1,
        isHidden: true,
        isKeepAlive: false,
        isIframe: false,
        redirect: "",
        permission: "",
        children: buildOptions(menuTree),
        createTime: "",
        updateTime: "",
        disabled: false // 根目录可以选择
      } as BackendRoute & { disabled: boolean }
    ];
  } catch (error) {
    console.error("加载父菜单选项失败:", error);
    ElMessage.error("加载父菜单选项失败");
  }
};

const isDescendant = (menu: BackendRoute, targetId: number): boolean => {
  if (!menu.children) return false;

  return menu.children.some(
    child => child.id === targetId || isDescendant(child, targetId)
  );
};

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  routeValidation.value = null;
};

// 监听props变化，更新表单数据
watch(
  () => props.formData,
  newData => {
    if (newData) {
      Object.assign(formData, {
        id: newData.id,
        title: newData.title || "",
        path: newData.path || "",
        component: newData.component || "",
        icon: newData.icon || "",
        type: newData.type ?? 2,
        parentId: newData.parentId || props.parentMenu?.id || 0, // 默认为0（根目录）
        sort: newData.sort ?? 0,
        isKeepAlive: newData.isKeepAlive ?? false,
        isHidden: newData.isHidden ?? true,
        permission: newData.permission || "",
        redirect: newData.redirect || "",
        isIframe: newData.isIframe ?? false, // 监听新增字段
        createTime: newData.createTime || "",
        updateTime: newData.updateTime || "",
        children: newData.children || []
      });
    }
  },
  { immediate: true, deep: true }
);

// 监听父菜单变化
watch(
  () => props.parentMenu,
  newParentMenu => {
    if (newParentMenu && !formData.parentId) {
      formData.parentId = newParentMenu.id;
    }
  },
  { immediate: true }
);

// 监听表单数据变化，实时验证路由
watch(
  () => [formData.path, formData.component, formData.type],
  () => {
    if (formData.type !== 3 && formData.path) {
      if (isExternalLink.value) {
        routeValidation.value = { valid: true, errors: [] };
      } else {
        routeValidation.value = validateMenuRoute(formData);
      }
    }
  },
  { deep: true }
);

// 生命周期
onMounted(async () => {
  loadParentMenuOptions();
  availableComponents.value = getAvailableComponents();

  // 加载自定义图标
  await loadCustomIcons();
});

// 暴露方法
defineExpose({
  resetForm,
  setIcon,
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate()
});
</script>

<style scoped lang="scss">
.menu-form {
  .form-section {
    margin-bottom: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

  }

  .form-tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-top: 4px;
  }

  .icon-selector {
    display: flex;
    gap: 8px;
    align-items: center;

    .icon-preview {
      display: flex;
      align-items: center;
      gap: 8px;

      .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background-color: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color-light);
        border-radius: 4px;
        transition: all 0.2s ease;
        cursor: pointer;

        &:hover {
          border-color: var(--el-color-primary-light-6);
          background-color: var(--el-color-primary-light-9);
        }

        .preview-icon {
          color: var(--el-text-color-primary);
          font-size: 18px;

          &.placeholder {
            color: var(--el-text-color-placeholder);
          }
        }
      }
    }
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-light);
  }

  .component-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .component-suggestion {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .path {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
