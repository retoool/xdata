<template>
  <div class="route-preview">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 路由配置预览 -->
      <el-tab-pane label="路由配置" name="config">
        <div class="preview-header">
          <div class="info">
            <h4>路由配置预览</h4>
            <p>根据菜单配置生成的Vue Router路由配置</p>
          </div>
          <div class="actions">
            <el-button @click="copyConfig">
              <el-icon><DocumentCopy /></el-icon>
              复制配置
            </el-button>
            <el-button 
              v-if="routeConfig && menu.path"
              type="primary"
              @click="testRoute"
            >
              <el-icon><VideoPlay /></el-icon>
              测试路由
            </el-button>
          </div>
        </div>
        
        <div class="code-container">
          <CodeEditor
            :code="formattedRouteConfig"
            language="javascript"
            :readonly="true"
          />
        </div>
      </el-tab-pane>
      
      <!-- 菜单结构预览 -->
      <el-tab-pane label="菜单结构" name="menu">
        <div class="preview-header">
          <div class="info">
            <h4>菜单结构预览</h4>
            <p>当前菜单在系统中的显示效果</p>
          </div>
        </div>
        
        <div class="menu-preview">
          <MenuTreeNode :menu="menuWithMeta" />
        </div>
      </el-tab-pane>
      
      <!-- 权限配置 -->
      <el-tab-pane label="权限配置" name="permission">
        <div class="preview-header">
          <div class="info">
            <h4>权限配置</h4>
            <p>该菜单的权限控制信息</p>
          </div>
        </div>
        
        <div class="permission-info">
          <el-descriptions :column="1" border>

            <el-descriptions-item label="访问控制">
              <el-tag :type="menu.visible ? 'success' : 'warning'">
                {{ menu.visible ? '在菜单中显示' : '隐藏菜单' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="menu.status === 1 ? 'success' : 'danger'">
                {{ menu.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="menu.type === 2" label="页面缓存">
              <el-tag :type="menu.cache ? 'success' : 'info'">
                {{ menu.cache ? '启用缓存' : '不缓存' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="menu.type === 2" label="标签固定">
              <el-tag :type="menu.affix ? 'warning' : 'info'">
                {{ menu.affix ? '固定标签' : '可关闭标签' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-tab-pane>
      
      <!-- 路由验证 -->
      <el-tab-pane label="验证结果" name="validation">
        <div class="preview-header">
          <div class="info">
            <h4>路由验证</h4>
            <p>检查路由配置的有效性和可能的问题</p>
          </div>
        </div>
        
        <div class="validation-results">
          <div v-if="validationResult.valid" class="validation-success">
            <el-alert type="success" :closable="false" show-icon>
              <template #title>路由配置验证通过</template>
              <p>所有配置项都符合要求，可以正常使用。</p>
            </el-alert>
          </div>
          
          <div v-else class="validation-errors">
            <el-alert type="error" :closable="false" show-icon>
              <template #title>发现 {{ validationResult.errors.length }} 个问题</template>
              <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                <li v-for="error in validationResult.errors" :key="error">
                  {{ error }}
                </li>
              </ul>
            </el-alert>
          </div>
          
          <div class="validation-checks">
            <h5>检查项目：</h5>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="路径格式">
                <ValidationItem :valid="pathValid" :message="pathMessage" />
              </el-descriptions-item>
              <el-descriptions-item label="路由名称">
                <ValidationItem :valid="nameValid" :message="nameMessage" />
              </el-descriptions-item>
              <el-descriptions-item v-if="menu.type === 2" label="组件路径">
                <ValidationItem :valid="componentValid" :message="componentMessage" />
              </el-descriptions-item>

            </el-descriptions>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, VideoPlay } from '@element-plus/icons-vue'
import type { MenuFormData } from '@/types/system'
import { RouteManager } from '@/utils/routeManager'
import CodeEditor from './CodeEditor.vue'
import MenuTreeNode from './MenuTreeNode.vue'
import ValidationItem from './ValidationItem.vue'

// Props
const props = defineProps<{
  menu: Partial<MenuFormData>
}>()

// Emits
const emit = defineEmits<{
  testRoute: [path: string]
}>()

// 响应式数据
const activeTab = ref('config')

// 计算属性
const routeConfig = computed(() => {
  try {
    // 将MenuFormData转换为Menu格式进行预览
    const menuData = {
      ...props.menu,
      id: 0,
      level: 1,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    } as any
    
    return RouteManager.previewRouteConfig(menuData)
  } catch (error) {
    console.error('生成路由配置失败:', error)
    return null
  }
})

const formattedRouteConfig = computed(() => {
  if (!routeConfig.value) {
    return '// 路由配置生成失败\n// 请检查菜单配置是否正确'
  }
  
  // 格式化路由配置为可读的JavaScript代码
  const config = JSON.stringify(routeConfig.value, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // 移除属性名的引号
    .replace(/"/g, "'") // 双引号改为单引号
    .replace(/'(function[^']*)'|'(\(\) => import[^']*)'|'([^']*\.vue[^']*)'|'([^']*Layout[^']*)'/g, '$1$2$3$4') // 移除函数字符串的引号
  
  return `// Vue Router 路由配置
{
  ${config.slice(1, -1).split('\n').slice(1, -1).join('\n')}
}`
})

const menuWithMeta = computed(() => {
  return {
    ...props.menu,
    icon: props.menu.icon || 'Menu',
    meta: {
      title: props.menu.title,
      icon: props.menu.icon,
      hidden: !props.menu.visible,
      keepAlive: props.menu.cache,
      affix: props.menu.affix
    }
  }
})

const validationResult = computed(() => {
  return RouteManager.validateMenuRoute(props.menu)
})

const pathValid = computed(() => {
  if (!props.menu.path) return false
  if (props.menu.type === 3) return true // 按钮类型不需要路径
  return props.menu.path.startsWith('/') || props.menu.path.startsWith('http')
})

const pathMessage = computed(() => {
  if (!props.menu.path) return '路径不能为空'
  if (pathValid.value) return '路径格式正确'
  return '路径必须以 / 开头或者是完整的URL地址'
})

const nameValid = computed(() => {
  if (props.menu.type !== 2) return true // 非菜单类型不需要路由名称
  if (!props.menu.name) return false
  const namePattern = /^[a-zA-Z][a-zA-Z0-9]*$/
  return namePattern.test(props.menu.name)
})

const nameMessage = computed(() => {
  if (props.menu.type !== 2) return '该类型不需要路由名称'
  if (!props.menu.name) return '菜单类型需要设置路由名称'
  if (nameValid.value) return '路由名称格式正确'
  return '路由名称只能包含字母和数字，且以字母开头'
})

const componentValid = computed(() => {
  if (props.menu.type !== 2) return true // 非菜单类型不需要组件
  if (!props.menu.component) return false
  return RouteManager.validateComponentPath(props.menu.component)
})

const componentMessage = computed(() => {
  if (props.menu.type !== 2) return '该类型不需要组件路径'
  if (!props.menu.component) return '菜单类型需要设置组件路径'
  if (componentValid.value) return '组件路径有效'
  return '组件路径不存在'
})



// 方法
const copyConfig = async () => {
  try {
    await navigator.clipboard.writeText(formattedRouteConfig.value)
    ElMessage.success('路由配置已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const testRoute = () => {
  if (props.menu.path) {
    emit('testRoute', props.menu.path)
  }
}
</script>

<style scoped lang="scss">
.route-preview {
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    
    .info {
      h4 {
        margin: 0 0 4px 0;
        color: var(--el-text-color-primary);
        font-size: 16px;
        font-weight: 500;
      }
      
      p {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .code-container {
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
    overflow: hidden;
  }
  
  .menu-preview {
    padding: 16px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
  }
  
  .permission-info {
    :deep(.el-descriptions) {
      .el-descriptions__label {
        width: 120px;
        font-weight: 500;
      }
    }
  }
  
  .validation-results {
    .validation-success,
    .validation-errors {
      margin-bottom: 20px;
    }
    
    .validation-checks {
      h5 {
        margin: 0 0 12px 0;
        color: var(--el-text-color-primary);
        font-size: 14px;
        font-weight: 500;
      }
      
      :deep(.el-descriptions) {
        .el-descriptions__label {
          width: 120px;
          font-weight: 500;
        }
      }
    }
  }
  
  .text-muted {
    color: var(--el-text-color-secondary);
  }
}

:deep(.el-tabs__content) {
  padding: 20px;
}

:deep(.el-tab-pane) {
  max-height: 500px;
  overflow-y: auto;
}
</style> 