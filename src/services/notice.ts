import Taro from '@tarojs/taro'

const NOTICE_DETAIL_KEY = 'notice_detail'

export type NoticeDetailPayload = {
  type: 'notice' | 'message' | 'todo'
  id?: number
  title?: string
  content?: string
  time?: string
}

export function setNoticeDetail(payload: NoticeDetailPayload) {
  Taro.setStorageSync(NOTICE_DETAIL_KEY, payload)
}

export function getNoticeDetail(): NoticeDetailPayload | null {
  return Taro.getStorageSync(NOTICE_DETAIL_KEY) || null
}

export function clearNoticeDetail() {
  Taro.removeStorageSync(NOTICE_DETAIL_KEY)
}
