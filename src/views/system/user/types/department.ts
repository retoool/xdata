export interface Department {
  id: number;
  name: string;
  parentId: number | null;
  sort: number;
  status: number;
  children?: Department[];
  userCount?: number;
}

export interface DepartmentFormData {
  id?: number;
  name: string;
  parentId?: number | null;
  sort: number;
  description?: string;
  status: number;
}

export interface DepartmentStats {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  totalUsers: number;
}

export interface DepartmentSearchParams {
  status?: number;
  parentId?: number | null;
  keyword?: string;
  page: number;
  size: number;
}

export const DEFAULT_DEPARTMENT: DepartmentFormData = {
  name: "",
  parentId: null,
  sort: 0,
  description: "",
  status: 1
};
