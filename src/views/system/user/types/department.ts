export interface Department {
  id: number;
  name: string;
  parentId: number | null;
  sort: number;
  children?: Department[];
  userCount?: number;
}

export interface DepartmentFormData {
  id?: number;
  name: string;
  parentId?: number | null;
}

export interface DepartmentStats {
  totalDepartments: number;
  totalUsers: number;
}

export interface DepartmentSearchParams {
  parentId?: number | null;
  keyword?: string;
  page: number;
  size: number;
}

export const DEFAULT_DEPARTMENT: DepartmentFormData = {
  name: "",
  parentId: null
};
