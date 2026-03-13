<template>
  <view class="container">
    <view class="hero-card">
      <view class="hero-title">{{ nickname ? `${nickname}，下午好` : '下午好' }}</view>
      <view class="hero-subtitle">欢迎回来</view>
    </view>

    <view class="card tools-card">
      <view class="section-title">常用功能</view>
      <view class="tool-grid">
        <view class="tool-item" @click="goScatter">
          <view class="tool-icon tool-icon--green">租</view>
          <view class="tool-text">整/合租</view>
        </view>
        <view class="tool-item" @click="goFocus">
          <view class="tool-icon tool-icon--blue">集</view>
          <view class="tool-text">集中式</view>
        </view>
        <view class="tool-item" @click="goTenantContract">
          <view class="tool-icon tool-icon--orange">合</view>
          <view class="tool-text">租客合同</view>
        </view>
      </view>
    </view>

    <view class="card notice-card">
      <view class="section-title">最新消息</view>
      <view class="notice-row" @click="openNoticeDetail('notice')">
        <view class="notice-tag">公告</view>
        <view class="notice-title">
          <view v-if="latestNoticeUnread" class="dot" />
          {{ latestNoticeTitle }}
        </view>
      </view>
      <view class="notice-row" @click="openNoticeDetail('message')">
        <view class="notice-tag notice-tag--blue">消息</view>
        <view class="notice-title">
          <view v-if="latestMessageUnread" class="dot" />
          {{ latestMessageTitle }}
        </view>
      </view>
      <view class="notice-row" @click="openNoticeDetail('todo')">
        <view class="notice-tag notice-tag--orange">待办</view>
        <view class="notice-title">
          <view v-if="latestTodoUnread" class="dot" />
          {{ latestTodoTitle }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { getTodoCount } from '@/api/approval'
import { ensureLoggedIn } from '@/services/auth'
import { getUser } from '@/services/storage'
import { getRecentNotice } from '@/api/notice'
import { setNoticeDetail } from '@/services/notice'

const todoCount = ref(0)
const nickname = ref('')
const latestNoticeTitle = ref('暂无公告')
const latestMessageTitle = ref('暂无消息')
const latestTodoTitle = ref('暂无待办')
const latestNoticeUnread = ref(false)
const latestMessageUnread = ref(false)
const latestTodoUnread = ref(false)
const latestNotice = ref<any>(null)
const latestMessage = ref<any>(null)
const latestTodo = ref<any>(null)

useDidShow(async () => {
  ensureLoggedIn()
  const user = getUser()
  nickname.value = user?.nickname || user?.username || ''
  const res = await getTodoCount()
  if (res.code === 0) {
    todoCount.value = res.data || 0
  }
  await loadRecentNotice()
})

async function loadRecentNotice() {
  const res = await getRecentNotice({})
  if (res.code !== 0) {
    latestNoticeTitle.value = '暂无公告'
    latestMessageTitle.value = '暂无消息'
    latestTodoTitle.value = '暂无待办'
    return
  }
  latestNotice.value = res.data?.notices?.[0] || null
  latestMessage.value = res.data?.messages?.[0] || null
  latestTodo.value = res.data?.todos?.[0] || null
  latestNoticeTitle.value = latestNotice.value?.title || '暂无公告'
  latestMessageTitle.value = latestMessage.value?.title || '暂无消息'
  latestTodoTitle.value = latestTodo.value?.title || '暂无待办'
  latestNoticeUnread.value = latestNotice.value?.isRead === false
  latestMessageUnread.value = latestMessage.value?.isRead === false
  latestTodoUnread.value = (latestTodo.value?.status ?? 0) !== 2

  const unreadCount =
    Number(res.data?.unreadNoticeCount || 0) +
    Number(res.data?.unreadMessageCount || 0) +
    Number(res.data?.pendingTodoCount || 0)
  if (unreadCount > 0) {
    Taro.setTabBarBadge({ index: 1, text: unreadCount > 99 ? '99+' : String(unreadCount) })
  } else {
    Taro.removeTabBarBadge({ index: 1 })
  }
}

function goScatter() {
  Taro.navigateTo({ url: '/pages/room/index?leaseMode=2' })
}

function goFocus() {
  Taro.navigateTo({ url: '/pages/room/index?leaseMode=1' })
}

function goTenantContract() {
  Taro.navigateTo({ url: '/pages/contract/index?tab=tenant' })
}

function goMessage() {
  Taro.switchTab({ url: '/pages/message/index' })
}

function openNoticeDetail(type: 'notice' | 'message' | 'todo') {
  const data = type === 'notice' ? latestNotice.value : type === 'message' ? latestMessage.value : latestTodo.value
  if (!data) return
  setNoticeDetail({
    type,
    id: data?.id,
    title: data?.title,
    content: data?.content,
    time: data?.publishTime || data?.createTime
  })
  Taro.navigateTo({ url: '/pages/message/detail/index' })
}
</script>

<style scoped>
.hero-card {
  background: linear-gradient(135deg, #e7efff, #f7f9ff);
  border-radius: 18rpx;
  padding: 28rpx;
  margin-bottom: 16rpx;
}

.hero-title {
  font-size: 34rpx;
  font-weight: 700;
}

.hero-subtitle {
  margin-top: 8rpx;
  color: #6b7280;
}

.tools-card {
  margin-bottom: 16rpx;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.tool-icon {
  width: 86rpx;
  height: 86rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 28rpx;
}

.tool-icon--green {
  background: #22c55e;
}

.tool-icon--blue {
  background: #3b82f6;
}

.tool-icon--orange {
  background: #f59e0b;
}

.tool-icon--purple {
  background: #8b5cf6;
}

.tool-text {
  font-size: 24rpx;
  color: #111827;
}

.notice-card {
  margin-bottom: 16rpx;
}

.notice-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 12rpx;
}

.notice-tag {
  background: #fbbf24;
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 10rpx;
  border-radius: 999rpx;
}

.notice-tag--blue {
  background: #3b82f6;
}

.notice-tag--orange {
  background: #f97316;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #ef4444;
}
</style>
