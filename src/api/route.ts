import { request } from '../services/http'

export type AsyncRoutesMetaVo = {
  title?: string
  icon?: string
  showLink?: boolean
  showParent?: boolean
  roles?: string[]
  auths?: string[]
  keepAlive?: boolean
  frameSrc?: string
  frameLoading?: boolean
}

export type AsyncRoutesVo = {
  path?: string
  name?: string
  redirect?: string
  component?: string
  type?: number
  meta?: AsyncRoutesMetaVo
}

export function getAsyncRoutes(data?: Record<string, any>) {
  return request<AsyncRoutesVo[]>({ url: 'get-async-routes', data: data || {} })
}
