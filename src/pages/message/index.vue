<template>
  <view class="msg-page">
    <!-- 顶部搜索栏 -->
    <view class="msg-header">
      <view class="search-bar">
        <view class="search-icon">🔍</view>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索通知、消息、待办..."
          placeholder-class="search-placeholder"
          @input="onSearch"
        />
        <view v-if="keyword" class="search-clear" @click="keyword = ''">✕</view>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <view class="tab-label">{{ tab.label }}</view>
        <view v-if="tab.count > 0" class="tab-badge">{{ tab.count > 99 ? '99+' : tab.count }}</view>
        <view v-if="activeTab === tab.key" class="tab-underline"/>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="tab-content">
      <!-- 通知 -->
      <view v-show="activeTab === 'notice'">
        <view v-if="filteredNotices.length === 0" class="empty-state">
          <view class="empty-icon">📭</view>
          <view class="empty-text">暂无通知</view>
          <view class="empty-sub">有新通知时会显示在这里</view>
        </view>
        <view
          v-for="item in filteredNotices"
          :key="item.id"
          class="msg-card"
          :class="{ 'msg-card--unread': item.isRead === false }"
          @click="openDetail('notice', item)"
        >
          <view class="msg-card-left">
            <view class="msg-avatar msg-avatar--yellow">📢</view>
            <view v-if="item.isRead === false" class="msg-dot"/>
          </view>
          <view class="msg-card-body">
            <view class="msg-card-title">{{ item.title || '通知' }}</view>
            <view class="msg-card-content">{{ item.content || '-' }}</view>
            <view class="msg-card-time">{{ formatTime(item.publishTime) }}</view>
          </view>
          <view class="msg-card-arrow">›</view>
        </view>
      </view>

      <!-- 消息 -->
      <view v-show="activeTab === 'message'">
        <view v-if="filteredMessages.length === 0" class="empty-state">
          <view class="empty-icon">💬</view>
          <view class="empty-text">暂无消息</view>
          <view class="empty-sub">有新消息时会显示在这里</view>
        </view>
        <view
          v-for="item in filteredMessages"
          :key="item.id"
          class="msg-card"
          :class="{ 'msg-card--unread': item.isRead === false }"
          @click="openDetail('message', item)"
        >
          <view class="msg-card-left">
            <view class="msg-avatar msg-avatar--blue">💬</view>
            <view v-if="item.isRead === false" class="msg-dot"/>
          </view>
          <view class="msg-card-body">
            <view class="msg-card-title">{{ item.title || '消息' }}</view>
            <view class="msg-card-content">{{ item.content || '-' }}</view>
            <view class="msg-card-time">{{ formatTime(item.createTime) }}</view>
          </view>
          <view class="msg-card-arrow">›</view>
        </view>
      </view>

      <!-- 待办 -->
      <view v-show="activeTab === 'todo'">
        <view v-if="filteredTodos.length === 0" class="empty-state">
          <view class="empty-icon">✅</view>
          <view class="empty-text">暂无待办</view>
          <view class="empty-sub">所有事项已处理完毕</view>
        </view>
        <view
          v-for="item in filteredTodos"
          :key="item.id"
          class="msg-card"
          :class="{ 'msg-card--todo-pending': item.status !== 2 }"
          @click="openDetail('todo', item)"
        >
          <view class="msg-card-left">
            <view class="msg-avatar" :class="item.status === 2 ? 'msg-avatar--green' : 'msg-avatar--orange'">
              {{ item.status === 2 ? '✅' : '⏳' }}
            </view>
          </view>
          <view class="msg-card-body">
            <view class="msg-card-title">
              {{ item.title || '待办' }}
              <view class="todo-status-tag"
                    :class="item.status === 2 ? 'todo-status-tag--done' : 'todo-status-tag--pending'">
                {{ item.status === 2 ? '已完成' : '待处理' }}
              </view>
            </view>
            <view class="msg-card-content">{{ item.content || '-' }}</view>
            <view class="msg-card-time">{{ formatTime(item.createTime) }}</view>
          </view>
          <view class="msg-card-arrow">›</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import Taro, {useDidShow} from '@tarojs/taro'
import {ensureLoggedIn} from '@/services/auth'
import {getMyMessagePage, getMyNoticePage, getTodoMyPage, SysMessage, SysNotice, SysTodo} from '@/api/notice'
import {setNoticeDetail} from '@/services/notice'

const activeTab = ref('notice')
const keyword = ref('')
const noticeList = ref<SysNotice[]>([])
const messageList = ref<SysMessage[]>([])
const todoList = ref<SysTodo[]>([])

const tabs = computed(() => [
  {
    key: 'notice',
    label: '通知',
    count: noticeList.value.filter(i => i.isRead === false).length,
  },
  {
    key: 'message',
    label: '消息',
    count: messageList.value.filter(i => i.isRead === false).length,
  },
  {
    key: 'todo',
    label: '待办',
    count: todoList.value.filter(i => i.status !== 2).length,
  },
])

const filteredNotices = computed(() => {
  const kw = keyword.value.toLowerCase()
  if (!kw) return noticeList.value
  return noticeList.value.filter(i =>
    (i.title || '').toLowerCase().includes(kw) || (i.content || '').toLowerCase().includes(kw)
  )
})

const filteredMessages = computed(() => {
  const kw = keyword.value.toLowerCase()
  if (!kw) return messageList.value
  return messageList.value.filter(i =>
    (i.title || '').toLowerCase().includes(kw) || (i.content || '').toLowerCase().includes(kw)
  )
})

const filteredTodos = computed(() => {
  const kw = keyword.value.toLowerCase()
  if (!kw) return todoList.value
  return todoList.value.filter(i =>
    (i.title || '').toLowerCase().includes(kw) || (i.content || '').toLowerCase().includes(kw)
  )
})

useDidShow(async () => {
  ensureLoggedIn()
  const params = Taro.getCurrentInstance().router?.params || {}
  if (params.tab) activeTab.value = params.tab as string
  await Promise.all([loadNotices(), loadMessages(), loadTodos()])
})

async function loadNotices() {
  const res = await getMyNoticePage({currentPage: 1, pageSize: 50})
  if (res.code === 0) noticeList.value = res.data?.list || []
}

async function loadMessages() {
  const res = await getMyMessagePage({currentPage: 1, pageSize: 50})
  if (res.code === 0) messageList.value = res.data?.list || []
}

async function loadTodos() {
  const res = await getTodoMyPage({currentPage: 1, pageSize: 50})
  if (res.code === 0) todoList.value = res.data?.list || []
}

function switchTab(key: string) {
  activeTab.value = key
}

function onSearch() {
}

function formatTime(time?: string) {
  if (!time) return ''
  const str = time.replace('T', ' ')
  const today = new Date().toISOString().slice(0, 10)
  if (str.startsWith(today)) return '今天 ' + str.slice(11, 16)
  return str.slice(0, 16)
}

function openDetail(type: 'notice' | 'message' | 'todo', item: any) {
  setNoticeDetail({
    type,
    id: item?.id,
    title: item?.title,
    content: item?.content,
    time: item?.publishTime || item?.createTime,
  })
  Taro.navigateTo({url: '/pages/message/detail/index'})
}
</script>

<style>
.msg-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding-bottom: 160rpx;
}

/* ===== 头部搜索 ===== */
.msg-header {
  background: #fff;
  padding: 20rpx 24rpx 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 20rpx;
  padding: 16rpx 20rpx;
  gap: 12rpx;
}

.search-icon {
  font-size: 28rpx;
  flex-shrink: 0;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #111827;
  height: 40rpx;
  background: transparent;
}

.search-placeholder {
  color: #c0c9d6;
  font-size: 26rpx;
}

.search-clear {
  font-size: 24rpx;
  color: #9ca3af;
  padding: 4rpx 8rpx;
}

/* ===== Tab 栏 ===== */
.tab-bar {
  display: flex;
  background: #fff;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx 0 20rpx;
  position: relative;
}

.tab-item:active {
  opacity: 0.7;
}

.tab-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #9ca3af;
}

.tab-item--active .tab-label {
  color: #3478f6;
  font-weight: 700;
}

.tab-badge {
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  border-radius: 16rpx;
  background: #ef4444;
  color: #fff;
  font-size: 18rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 20%;
  right: 20%;
  height: 4rpx;
  border-radius: 2rpx;
  background: #3478f6;
}

/* ===== 内容区 ===== */
.tab-content {
  padding: 16rpx 24rpx;
}

/* ===== 消息卡片 ===== */
.msg-card {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(15, 23, 42, 0.05);
  border-left: 4rpx solid transparent;
}

.msg-card--unread {
  border-left-color: #3478f6;
  background: linear-gradient(135deg, #f8fbff, #fff);
}

.msg-card--todo-pending {
  border-left-color: #f97316;
}

.msg-card:active {
  opacity: 0.85;
}

.msg-card-left {
  position: relative;
  flex-shrink: 0;
}

.msg-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  line-height: 1;
}

.msg-avatar--yellow {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.msg-avatar--blue {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.msg-avatar--orange {
  background: linear-gradient(135deg, #fed7aa, #fdba74);
}

.msg-avatar--green {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
}

.msg-dot {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #ef4444;
  border: 2rpx solid #fff;
}

.msg-card-body {
  flex: 1;
  min-width: 0;
}

.msg-card-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.msg-card-content {
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 8rpx;
}

.msg-card-time {
  font-size: 22rpx;
  color: #c0c9d6;
}

.msg-card-arrow {
  font-size: 40rpx;
  color: #c5ccd6;
  flex-shrink: 0;
  align-self: center;
}

/* ===== 待办状态标签 ===== */
.todo-status-tag {
  font-size: 18rpx;
  font-weight: 600;
  padding: 3rpx 10rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}

.todo-status-tag--pending {
  background: #fff7ed;
  color: #f97316;
}

.todo-status-tag--done {
  background: #f0fdf4;
  color: #22c55e;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0 60rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.45;
}

.empty-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #374151;
  margin-bottom: 10rpx;
}

.empty-sub {
  font-size: 24rpx;
  color: #9ca3af;
}
</style>
