import { defineStore } from 'pinia'
import type { SystemState, Role, Menu } from '@/types/system'

/**
 * 系统管理状态管理
 */
export const useSystemStore = defineStore('system', {
  state: (): SystemState => ({
    // 用户管理状态
    selectedDepartmentId: null,
    selectedDepartmentPath: [],
    isDepartmentTreeCollapsed: false,

    // 角色管理状态
    currentEditingRole: null,

    // 菜单管理状态
    menuTreeData: [],
    expandedMenuKeys: [],

    // 通用状态
    loading: false,
    refreshFlag: 0
  }),

  getters: {
    /**
     * 获取当前选中的部门信息
     */
    selectedDepartmentInfo(state) {
      return {
        id: state.selectedDepartmentId,
        path: state.selectedDepartmentPath
      }
    },

    /**
     * 是否有选中的部门
     */
    hasSelectedDepartment(state) {
      return state.selectedDepartmentId !== null
    },

    /**
     * 获取部门树是否收起
     */
    getDepartmentTreeCollapsed(state) {
      return state.isDepartmentTreeCollapsed
    },

    /**
     * 获取当前编辑的角色
     */
    getCurrentEditingRole(state) {
      return state.currentEditingRole
    },

    /**
     * 获取菜单树数据
     */
    getMenuTreeData(state) {
      return state.menuTreeData
    },

    /**
     * 获取展开的菜单键值
     */
    getExpandedMenuKeys(state) {
      return state.expandedMenuKeys
    },

    /**
     * 获取加载状态
     */
    isLoading(state) {
      return state.loading
    }
  },

  actions: {
    /**
     * 设置选中的部门
     */
    setSelectedDepartment(id: number | null, path: string[] = []) {
      this.selectedDepartmentId = id
      this.selectedDepartmentPath = [...path]
    },

    /**
     * 清空选中的部门
     */
    clearSelectedDepartment() {
      this.selectedDepartmentId = null
      this.selectedDepartmentPath = []
    },

    /**
     * 更新选中的部门路径
     */
    updateSelectedDepartmentPath(path: string[]) {
      this.selectedDepartmentPath = [...path]
    },

    /**
     * 切换部门树折叠状态
     */
    toggleDepartmentTree() {
      this.isDepartmentTreeCollapsed = !this.isDepartmentTreeCollapsed
    },

    /**
     * 设置部门树折叠状态
     */
    setDepartmentTreeCollapsed(collapsed: boolean) {
      this.isDepartmentTreeCollapsed = collapsed
    },

    /**
     * 设置当前编辑的角色
     */
    setCurrentEditingRole(role: Role | null) {
      this.currentEditingRole = role ? { ...role } : null
    },

    /**
     * 清空当前编辑的角色
     */
    clearCurrentEditingRole() {
      this.currentEditingRole = null
    },

    /**
     * 设置菜单树数据
     */
    setMenuTreeData(data: Menu[]) {
      this.menuTreeData = [...data]
    },

    /**
     * 更新菜单树数据
     */
    updateMenuTreeData(menu: Menu) {
      const updateTreeNode = (nodes: Menu[], targetMenu: Menu): Menu[] => {
        return nodes.map(node => {
          if (node.id === targetMenu.id) {
            return { ...targetMenu }
          }
          if (node.children && node.children.length > 0) {
            return {
              ...node,
              children: updateTreeNode(node.children, targetMenu)
            }
          }
          return node
        })
      }

      this.menuTreeData = updateTreeNode(this.menuTreeData, menu)
    },

    /**
     * 添加菜单到树数据
     */
    addMenuToTree(menu: Menu) {
      if (menu.parentId === null) {
        // 添加到根级
        this.menuTreeData.push(menu)
      } else {
        // 添加到指定父级
        const addToParent = (nodes: Menu[], parentId: number, newMenu: Menu): boolean => {
          for (const node of nodes) {
            if (node.id === parentId) {
              if (!node.children) {
                node.children = []
              }
              node.children.push(newMenu)
              return true
            }
            if (node.children && addToParent(node.children, parentId, newMenu)) {
              return true
            }
          }
          return false
        }

        addToParent(this.menuTreeData, menu.parentId, menu)
      }
    },

    /**
     * 从树数据中移除菜单
     */
    removeMenuFromTree(menuId: number) {
      const removeFromTree = (nodes: Menu[], targetId: number): Menu[] => {
        return nodes.filter(node => {
          if (node.id === targetId) {
            return false
          }
          if (node.children && node.children.length > 0) {
            node.children = removeFromTree(node.children, targetId)
          }
          return true
        })
      }

      this.menuTreeData = removeFromTree(this.menuTreeData, menuId)
    },

    /**
     * 设置展开的菜单键值
     */
    setExpandedMenuKeys(keys: string[]) {
      this.expandedMenuKeys = [...keys]
    },

    /**
     * 添加展开的菜单键值
     */
    addExpandedMenuKey(key: string) {
      if (!this.expandedMenuKeys.includes(key)) {
        this.expandedMenuKeys.push(key)
      }
    },

    /**
     * 移除展开的菜单键值
     */
    removeExpandedMenuKey(key: string) {
      const index = this.expandedMenuKeys.indexOf(key)
      if (index > -1) {
        this.expandedMenuKeys.splice(index, 1)
      }
    },

    /**
     * 设置加载状态
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * 触发刷新
     */
    triggerRefresh() {
      this.refreshFlag++
    },

    /**
     * 重置所有状态
     */
    resetState() {
      this.selectedDepartmentId = null
      this.selectedDepartmentPath = []
      this.isDepartmentTreeCollapsed = false
      this.currentEditingRole = null
      this.menuTreeData = []
      this.expandedMenuKeys = []
      this.loading = false
      this.refreshFlag = 0
    },

    /**
     * 批量更新状态
     */
    updateState(partialState: Partial<SystemState>) {
      Object.assign(this, partialState)
    },

    /**
     * 设置选中的菜单
     */
    setSelectedMenu(menu: Menu | null) {
      // 这里可以添加选中菜单的逻辑
      console.log('选中菜单:', menu)
    }
  }
}) 