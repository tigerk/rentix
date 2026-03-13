import { request } from '../services/http'

export type Pagination<T> = {
  list: T[]
  total: number
  pageSize: number
  currentPage: number
}

export type SysMessage = {
  id: number
  title?: string
  content?: string
  createTime?: string
  isRead?: boolean
}

export type SysNotice = {
  id: number
  title?: string
  content?: string
  publishTime?: string
  isRead?: boolean
}

export type SysTodo = {
  id: number
  title?: string
  content?: string
  createTime?: string
  status?: number
  priority?: number
}

export type RecentNoticeResponse = {
  messages: SysMessage[]
  notices: SysNotice[]
  todos: SysTodo[]
  unreadMessageCount?: number
  unreadNoticeCount?: number
  pendingTodoCount?: number
}

export function getRecentNotice(data?: Record<string, any>) {
  return request<RecentNoticeResponse>({ url: 'sys/notice/recent', data: data || {} })
}

export function getMyNoticePage(data: { currentPage: number; pageSize: number; keyword?: string }) {
  return request<Pagination<SysNotice>>({ url: 'sys/notice/notice/my/page', data })
}

export function getMyMessagePage(data: { currentPage: number; pageSize: number; keyword?: string }) {
  return request<Pagination<SysMessage>>({ url: 'sys/notice/message/my/page', data })
}

export function getTodoMyPage(data: { currentPage: number; pageSize: number; keyword?: string }) {
  return request<Pagination<SysTodo>>({ url: 'sys/notice/todo/my/page', data })
}
