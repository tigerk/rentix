import { getAsyncRoutesCache, setAsyncRoutesCache } from './storage'
import { getAsyncRoutes, AsyncRoutesVo } from '@/api/route'

export function flattenRouteKeys(list: AsyncRoutesVo[] = []) {
  const keys: string[] = []
  list.forEach(item => {
    if (item.path) keys.push(item.path)
    if (item.name) keys.push(item.name)
    if (item.meta?.title) keys.push(item.meta.title)
  })
  return keys
}

export async function loadAsyncRoutes(force = false) {
  if (!force) {
    const cached = getAsyncRoutesCache()
    if (cached && cached.length > 0) return cached
  }
  const res = await getAsyncRoutes({})
  if (res.code === 0 && Array.isArray(res.data)) {
    setAsyncRoutesCache(res.data)
    return res.data
  }
  return []
}

export function hasPermission(keys: string[], patterns: RegExp[]) {
  if (!keys || keys.length === 0) return true
  return keys.some(k => patterns.some(p => p.test(k)))
}
