import { defineStore } from "pinia";
import { store } from "../utils";

// 工作流列表状态接口
interface WorkflowListState {
  // 搜索关键字
  searchKeyword: string;
  // 选中的分类ID
  selectedCategoryId: number | number[] | null;
  // 选中的分类路径
  selectedCategoryPath: string[] | null;
  // 分页信息
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  // 排序参数
  sortParams: {
    prop: string;
    order: string;
  };
  // 分类树是否折叠
  isTreeCollapsed: boolean;
}

export const useWorkflowStore = defineStore("workflow", {
  state: (): WorkflowListState => ({
    searchKeyword: "",
    selectedCategoryId: null,
    selectedCategoryPath: null,
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    },
    sortParams: {
      prop: "",
      order: ""
    },
    isTreeCollapsed: false
  }),

  getters: {
    getSearchKeyword(state) {
      return state.searchKeyword;
    },
    getSelectedCategoryId(state) {
      return state.selectedCategoryId;
    },
    getSelectedCategoryPath(state) {
      return state.selectedCategoryPath;
    },
    getPagination(state) {
      return state.pagination;
    },
    getSortParams(state) {
      return state.sortParams;
    },
    getIsTreeCollapsed(state) {
      return state.isTreeCollapsed;
    }
  },

  actions: {
    // 设置搜索关键字
    setSearchKeyword(keyword: string) {
      this.searchKeyword = keyword;
    },

    // 设置选中的分类
    setSelectedCategory(categoryId: number | number[] | null, categoryPath: string[] | null) {
      this.selectedCategoryId = categoryId;
      this.selectedCategoryPath = categoryPath;
    },

    // 设置分页信息
    setPagination(page: number, pageSize: number, total?: number) {
      this.pagination.page = page;
      this.pagination.pageSize = pageSize;
      if (total !== undefined) {
        this.pagination.total = total;
      }
    },

    // 设置排序参数
    setSortParams(prop: string, order: string) {
      this.sortParams.prop = prop;
      this.sortParams.order = order;
    },

    // 设置分类树折叠状态
    setTreeCollapsed(collapsed: boolean) {
      this.isTreeCollapsed = collapsed;
    },

    // 重置所有状态
    resetState() {
      this.searchKeyword = "";
      this.selectedCategoryId = null;
      this.selectedCategoryPath = null;
      this.pagination = {
        page: 1,
        pageSize: 20,
        total: 0
      };
      this.sortParams = {
        prop: "",
        order: ""
      };
      this.isTreeCollapsed = false;
    }
  }
});

export function useWorkflowStoreHook() {
  return useWorkflowStore(store);
} 