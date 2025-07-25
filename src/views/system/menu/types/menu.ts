// 菜单搜索参数
export interface MenuSearchParams {
  parentId?: number | null;
  keyword?: string;
  page: number;
  size: number;
}

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 1, // 目录
  MENU = 2, // 菜单
  BUTTON = 3 // 按钮
}

export const DEFAULT_MENU: BackendRoute = {
  id: 0,
  title: "",
  icon: "",
  path: "",
  component: "",
  redirect: "",
  parentId: null,
  sort: 0,
  level: 0,
  type: 2,
  isHidden: false,
  isKeepAlive: false,
  permission: "",
  isIframe: false,
  createTime: "",
  updateTime: "",
  children: []
};
