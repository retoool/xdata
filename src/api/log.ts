import { http } from '@/utils/http'

// 日志相关接口类型定义
export interface DailyLog {
  id?: number
  userId?: number
  logDate: string
  content: string
  mood: number
  weather: string
  tags: string
  isPublic: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateLogRequest {
  logDate: string
  content: string
  mood: number
  weather: string
  tags: string
  isPublic: boolean
}

export interface UpdateLogRequest {
  logDate: string
  content: string
  mood: number
  weather: string
  tags: string
  isPublic: boolean
}

export interface LogListResponse {
  list: DailyLog[]
  total: number
  page: number
  size: number
}

export interface LogStats {
  totalLogs: number
  moodStats: MoodStatItem[]
  tagStats: TagStatItem[]
  weatherStats: WeatherStatItem[]
}

export interface MoodStatItem {
  mood: number
  count: number
}

export interface TagStatItem {
  tag: string
  count: number
}

export interface WeatherStatItem {
  weather: string
  count: number
}

// 日志管理API
export const logApi = {
  // 创建日志
  createLog: (data: CreateLogRequest) => {
    return http.post<DailyLog, CreateLogRequest>('/logs', { data })
  },

  // 更新日志
  updateLog: (id: number, data: UpdateLogRequest) => {
    return http.request<DailyLog>('put', `/logs/${id}`, { data })
  },

  // 删除日志
  deleteLog: (id: number) => {
    return http.request<void>('delete', `/logs/${id}`)
  },

  // 根据ID获取日志
  getLogById: (id: number) => {
    return http.get<DailyLog, any>(`/logs/${id}`)
  },

  // 根据日期获取日志
  getLogByDate: (date: string) => {
    return http.get<DailyLog, any>(`/logs/date/${date}`)
  },

  // 获取月度日志
  getLogsByMonth: (year: number, month: number) => {
    return http.get<DailyLog[], any>(`/logs/monthly/${year}/${month}`)
  },

  // 获取日志列表
  getLogs: (params: { page?: number; size?: number }) => {
    return http.get<LogListResponse, any>('/logs/list', { params })
  },

  // 搜索日志
  searchLogs: (params: { keyword?: string; page?: number; size?: number }) => {
    return http.get<LogListResponse, any>('/logs/search', { params })
  },

  // 获取统计信息
  getStats: (year: number, month: number) => {
    return http.get<LogStats, any>(`/logs/stats/${year}/${month}`)
  }
} 