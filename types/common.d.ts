export {}

/**
 * 通用类型定义
 */
declare global {
  interface PageParams {
    page: number
    size: number
  }

  interface FormRule {
    required?: boolean
    message?: string
    trigger?: string | string[]
    validator?: (rule: any, value: any, callback: any) => void
    [key: string]: any
  }

  type FormMode = 'create' | 'edit' | 'view' | 'copy'

  export interface PageResult<T> {
    records: T[]
    total: number
    current: number
    size: number
    pages: number
  }
  
  export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
    success: boolean
  }

  interface TreeNode {
    id: number | string
    label: string
    children?: TreeNode[]
    [key: string]: any
  }

  interface SelectOption {
    label: string
    value: any
    disabled?: boolean
    [key: string]: any
  }

  interface TableColumn {
    prop?: string
    label: string
    width?: number | string
    minWidth?: number | string
    fixed?: boolean | string
    sortable?: boolean
    showOverflowTooltip?: boolean
    align?: string
    [key: string]: any
  }
  
  interface ActionButton {
    label: string
    type?: string
    size?: string
    icon?: string
    permission?: string
    disabled?: boolean
    loading?: boolean
    onClick: (row?: any) => void
  }
}





