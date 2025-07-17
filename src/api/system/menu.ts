import { http } from '@/utils/http'
import type {
  Menu,
  MenuFormData,
  MenuSearchParams,
  PageResult
} from '@/types/system'

/**
 * 菜单管理相关API
 */
export class MenuApi {
  /**
   * 获取菜单树
   */
  static async getMenuTree(): Promise<Menu[]> {
    return http.request<Menu[]>('GET', '/system/menu/tree')
  }

  /**
   * 获取菜单列表（分页）
   */
  static async getMenuList(params?: MenuSearchParams): Promise<PageResult<Menu>> {
    return http.request<PageResult<Menu>>('GET', '/system/menu/list', { params })
  }

  /**
   * 根据ID获取菜单详情
   */
  static async getMenuById(id: number): Promise<Menu> {
    return http.request<Menu>('GET', `/system/menu/${id}`)
  }

  /**
   * 创建菜单
   */
  static async createMenu(data: MenuFormData): Promise<Menu> {
    return http.request<Menu>('POST', '/system/menu', { data })
  }

  /**
   * 更新菜单
   */
  static async updateMenu(id: number, data: Partial<MenuFormData>): Promise<Menu> {
    return http.request<Menu>('POST', `/system/menu/${id}`, { data })
  }

  /**
   * 删除菜单
   */
  static async deleteMenu(id: number): Promise<void> {
    return http.request<void>('POST', `/system/menu/${id}/delete`)
  }

  /**
   * 批量删除菜单
   */
  static async batchDeleteMenus(ids: number[]): Promise<void> {
    return http.request<void>('POST', '/system/menu/batch-delete', { data: { ids } })
  }

  /**
   * 更新菜单状态
   */
  static async updateMenuStatus(id: number, status: number): Promise<void> {
    return http.request<void>('POST', `/system/menu/${id}/status`, { data: { status } })
  }

  /**
   * 移动菜单（更改父级菜单）
   */
  static async moveMenu(id: number, parentId: number | null): Promise<void> {
    return http.request<void>('POST', `/system/menu/${id}/move`, { data: { parentId } })
  }

  /**
   * 更新菜单排序
   */
  static async updateMenuSort(items: { id: number; sort: number }[]): Promise<void> {
    return http.request<void>('POST', '/system/menu/sort', { data: { items } })
  }



  /**
   * 检查菜单名称是否可用
   */
  static async checkMenuName(name: string, parentId: number | null, excludeId?: number): Promise<boolean> {
    return http.request<boolean>('POST', '/system/menu/check-name', {
      data: { name, parentId, excludeId }
    })
  }

  /**
   * 更新菜单可见性
   */
  static async updateMenuVisibility(id: number, visible: boolean): Promise<void> {
    return http.request<void>('POST', `/system/menu/${id}/visibility`, { data: { visible } })
  }



  /**
   * 检查菜单路由是否可用
   */
  static async checkMenuPath(path: string, excludeId?: number): Promise<boolean> {
    return http.request<boolean>('POST', '/system/menu/check-path', {
      data: { path, excludeId }
    })
  }

  /**
   * 获取菜单图标列表
   */
  static async getMenuIcons(): Promise<string[]> {
    return http.request<string[]>('GET', '/system/menu/icons')
  }

  /**
   * 上传SVG图标
   */
  static async uploadSvgIcon(svgContent: string, iconName?: string): Promise<{ iconName: string; svgContent: string }> {
    return http.request<{ iconName: string; svgContent: string }>('POST', '/system/menu/upload-icon', {
      data: { svgContent, iconName }
    })
  }

  /**
   * 获取自定义图标列表
   */
  static async getCustomIcons(): Promise<{ iconName: string; svgContent: string }[]> {
    return http.request<{ iconName: string; svgContent: string }[]>('GET', '/system/menu/custom-icons')
  }

  /**
   * 删除自定义图标
   */
  static async deleteCustomIcon(iconName: string): Promise<void> {
    return http.request<void>('DELETE', `/system/menu/custom-icons/${encodeURIComponent(iconName)}`)
  }

  /**
   * 复制菜单
   */
  static async copyMenu(id: number, name: string, parentId?: number): Promise<Menu> {
    return http.request<Menu>('POST', `/system/menu/${id}/copy`, { data: { name, parentId } })
  }

  /**
   * 导出菜单数据
   */
  static async exportMenus(): Promise<Blob> {
    return http.request<Blob>('GET', '/system/menu/export')
  }

  /**
   * 导入菜单数据
   */
  static async importMenus(file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    return http.request<any>('POST', '/system/menu/import', { data: formData })
  }
}

// 导出常用方法
export const {
  getMenuTree,
  getMenuList,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  batchDeleteMenus,
  updateMenuStatus,
  moveMenu,
  updateMenuSort,
  checkMenuPath,
  checkMenuName,
  updateMenuVisibility,
  getMenuIcons,
  uploadSvgIcon,
  getCustomIcons,
  deleteCustomIcon,
  copyMenu,
  exportMenus,
  importMenus
} = MenuApi

// 导出别名
export const sortMenus = updateMenuSort 