<template>
  <view class="container">
    <nut-tabs v-model="activeTab">
      <nut-tab-pane title="通知" pane-key="notice">
        <view v-for="item in noticeList" :key="item.id" class="notice-card" @click="openDetail('notice', item)">
          <view class="notice-title">
            <view v-if="item.isRead === false" class="dot" />
            {{ item.title || '通知' }}
          </view>
          <view class="notice-content">{{ item.content || '-' }}</view>
          <view class="notice-time">{{ formatTime(item.publishTime) }}</view>
        </view>
        <view v-if="noticeList.length === 0" class="empty">暂无通知</view>
      </nut-tab-pane>

      <nut-tab-pane title="消息" pane-key="message">
        <view v-for="item in messageList" :key="item.id" class="notice-card" @click="openDetail('message', item)">
          <view class="notice-title">
            <view v-if="item.isRead === false" class="dot" />
            {{ item.title || '消息' }}
          </view>
          <view class="notice-content">{{ item.content || '-' }}</view>
          <view class="notice-time">{{ formatTime(item.createTime) }}</view>
        </view>
        <view v-if="messageList.length === 0" class="empty">暂无消息</view>
      </nut-tab-pane>

      <nut-tab-pane title="待办" pane-key="todo">
        <view v-for="item in todoList" :key="item.id" class="notice-card" @click="openDetail('todo', item)">
          <view class="notice-title">{{ item.title || '待办' }}</view>
          <view class="notice-content">{{ item.content || '-' }}</view>
          <view class="notice-time">{{ formatTime(item.createTime) }}</view>
        </view>
        <view v-if="todoList.length === 0" class="empty">暂无待办</view>
      </nut-tab-pane>
    </nut-tabs>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { ensureLoggedIn } from '@/services/auth'
import { getMyMessagePage, getMyNoticePage, getTodoMyPage, SysMessage, SysNotice, SysTodo } from '@/api/notice'
import { setNoticeDetail } from '@/services/notice'

const activeTab = ref('notice')
const noticeList = ref<SysNotice[]>([])
const messageList = ref<SysMessage[]>([])
const todoList = ref<SysTodo[]>([])

useDidShow(async () => {
  ensureLoggedIn()
  await Promise.all([loadNotices(), loadMessages(), loadTodos()])
})

async function loadNotices() {
  const res = await getMyNoticePage({ currentPage: 1, pageSize: 20 })
  if (res.code === 0) noticeList.value = res.data?.list || []
}

async function loadMessages() {
  const res = await getMyMessagePage({ currentPage: 1, pageSize: 20 })
  if (res.code === 0) messageList.value = res.data?.list || []
}

async function loadTodos() {
  const res = await getTodoMyPage({ currentPage: 1, pageSize: 20 })
  if (res.code === 0) todoList.value = res.data?.list || []
}

function formatTime(time?: string) {
  if (!time) return ''
  return time.replace('T', ' ').slice(0, 16)
}

function openDetail(type: 'notice' | 'message' | 'todo', item: any) {
  setNoticeDetail({
    type,
    id: item?.id,
    title: item?.title,
    content: item?.content,
    time: item?.publishTime || item?.createTime
  })
  Taro.navigateTo({ url: '/pages/message/detail/index' })
}
</script>

<style scoped>
.notice-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-top: 16rpx;
  box-shadow: 0 10rpx 20rpx rgba(15, 23, 42, 0.04);
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 999rpx;
  background: #ef4444;
}

.notice-content {
  font-size: 24rpx;
  color: #6b7280;
  margin-top: 8rpx;
}

.notice-time {
  font-size: 22rpx;
  color: #94a3b8;
  margin-top: 10rpx;
}
</style>
