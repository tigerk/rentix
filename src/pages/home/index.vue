<template>
  <view class="home-page">

    <!-- ===== 顶部 Header ===== -->
    <view class="home-header">
      <view class="header-bg"/>
      <view class="header-content">
        <view class="header-top">
          <view class="greeting-block">
            <view class="greeting-text">{{ greetingLabel }}，{{ shortName }}</view>
            <view class="greeting-sub">欢迎回来，今天也要加油哦</view>
          </view>
          <view class="header-actions">
            <view class="header-btn" @click="goSearch">
              <view class="header-btn-icon">🔍</view>
              <view class="header-btn-label">搜索</view>
            </view>
          </view>
        </view>
        <view class="stat-row">
          <view class="stat-card" v-for="s in stats" :key="s.label">
            <view class="stat-value">{{ s.value }}</view>
            <view class="stat-label">{{ s.label }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- ===== 常用功能 ===== -->
    <view class="section-card tools-section">
      <view class="section-header">
        <view class="section-title">常用功能</view>
      </view>

      <!-- 加载中骨架 -->
      <view v-if="routeLoading" class="tools-skeleton">
        <view v-for="i in 3" :key="i" class="skeleton-item">
          <view class="skeleton-icon"/>
          <view class="skeleton-label"/>
        </view>
      </view>

      <!-- 无权限空状态 -->
      <view v-else-if="visibleTools.length === 0" class="tools-empty">
        <view class="tools-empty-icon">🔒</view>
        <view class="tools-empty-text">暂无可用功能</view>
      </view>

      <!-- 功能格子（平铺） -->
      <view v-else class="tool-grid">
        <view
          v-for="item in visibleTools"
          :key="item.name"
          class="tool-item"
          @click="navigateTo(item)"
        >
          <view class="tool-icon-wrap" :style="{ background: item.bg }">
            <image class="tool-icon-img" :src="item.icon" mode="aspectFill" />
          </view>
          <view class="tool-label">{{ item.label }}</view>
        </view>
      </view>
    </view>

    <!-- ===== 最新消息 ===== -->
    <view class="section-card notice-section">
      <view class="section-header">
        <view class="section-title">最新消息</view>
        <view class="section-action" @click="goMessage">查看全部</view>
      </view>
      <view class="notice-list">
        <view
          v-for="item in noticeItems"
          :key="item.type"
          class="notice-row"
          @click="openNoticeDetail(item.type)"
        >
          <view class="notice-icon-wrap" :style="{ background: item.iconBg }">
            <view class="notice-icon-emoji">{{ item.icon }}</view>
          </view>
          <view class="notice-body">
            <view class="notice-row-title">
              <view v-if="item.unread" class="unread-dot"/>
              {{ item.title }}
            </view>
            <view class="notice-row-type">{{ item.typeLabel }}</view>
          </view>
          <view class="notice-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- ===== 数据概览 ===== -->
    <view class="section-card data-section">
      <view class="section-header">
        <view class="section-title">数据概览</view>
      </view>
      <view class="data-grid">
        <view class="data-card" v-for="d in dataCards" :key="d.label">
          <view class="data-card-icon" :style="{ background: d.iconBg }">{{ d.icon }}</view>
          <view class="data-card-value">{{ d.value }}</view>
          <view class="data-card-label">{{ d.label }}</view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import Taro, {useDidShow} from '@tarojs/taro'
import {getTodoCount} from '@/api/approval'
import {ensureLoggedIn} from '@/services/auth'
import {getUser} from '@/services/storage'
import {getRecentNotice} from '@/api/notice'
import {setNoticeDetail} from '@/services/notice'
import {loadAsyncRoutes} from '@/services/permission'
import type {AsyncRoutesVo} from '@/api/route'

// ─────────────────────────────────────────────
// 类型
// ─────────────────────────────────────────────
type MenuItem = {
  name: string
  label: string
  icon: string
  bg: string
  url: string
}

// ─────────────────────────────────────────────
// 白名单：只有列在这里的 name 才显示在"常用功能"
// 新功能页面开发完成后，在此加一行即可自动出现
// ─────────────────────────────────────────────
const ROUTE_URL_MAP: Record<string, string> = {
  HouseFocusRoom: '/pages/room/index?leaseMode=1',
  HouseScatter: '/pages/room/index?leaseMode=2',
  ApprovalTodo: '/pages/approval/index',
}

// ─────────────────────────────────────────────
// 各入口的 icon 与背景色
// ─────────────────────────────────────────────
const ROUTE_META: Record<string, { icon: string; bg: string }> = {
  HouseFocusRoom: {icon: '/assets/tabbar/room.png', bg: 'linear-gradient(135deg,#3b82f6,#2563eb)'},
  HouseScatter: {icon: '/assets/tabbar/room.png', bg: 'linear-gradient(135deg,#f97316,#ea580c)'},
  ApprovalTodo: {icon: '/assets/tabbar/approval.png', bg: 'linear-gradient(135deg,#7FFCA2,#059669)'},
}

// ─────────────────────────────────────────────
// 递归遍历路由树，提取白名单内且有权限的叶子节点
// ─────────────────────────────────────────────
function extractVisibleTools(list: AsyncRoutesVo[]): MenuItem[] {
  const result: MenuItem[] = []
  for (const item of list) {
    const children = (item as any).children as AsyncRoutesVo[] | undefined
    if (children && children.length > 0) {
      result.push(...extractVisibleTools(children))
    } else {
      const name = item.name
      if (name && ROUTE_URL_MAP[name]) {
        const meta = ROUTE_META[name] ?? {icon: '/assets/tabbar/home.png', bg: 'linear-gradient(135deg,#6b7280,#4b5563)'}
        result.push({
          name,
          label: item.meta?.title || name,
          icon: meta.icon,
          bg: meta.bg,
          url: ROUTE_URL_MAP[name],
        })
      }
    }
  }
  return result
}

// ─────────────────────────────────────────────
// 响应式状态
// ─────────────────────────────────────────────
const routeLoading = ref(true)
const visibleTools = ref<MenuItem[]>([])
const todoCount = ref(0)
const nickname = ref('')
const latestNotice = ref<any>(null)
const latestMessage = ref<any>(null)
const latestTodo = ref<any>(null)
const latestNoticeUnread = ref(false)
const latestMessageUnread = ref(false)
const latestTodoUnread = ref(false)

// ─────────────────────────────────────────────
// 问候语
// ─────────────────────────────────────────────
const now = new Date()
const hour = now.getHours()
const greetingLabel = computed(() => {
  if (hour < 6) return '夜深了'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
const shortName = computed(() => {
  const n = nickname.value
  if (!n) return '朋友'
  return n.length > 4 ? n.slice(0, 4) : n
})

// ─────────────────────────────────────────────
// 统计栏
// ─────────────────────────────────────────────
const stats = ref([
  {label: '待处理', value: '0'},
  {label: '空置房', value: '--'},
  {label: '本月收款', value: '--'},
])

// ─────────────────────────────────────────────
// 消息区
// ─────────────────────────────────────────────
const noticeItems = computed(() => [
  {
    type: 'notice' as const,
    typeLabel: '公告',
    icon: '📢',
    iconBg: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
    title: latestNotice.value?.title || '暂无公告',
    unread: latestNoticeUnread.value,
  },
  {
    type: 'message' as const,
    typeLabel: '消息',
    icon: '💬',
    iconBg: 'linear-gradient(135deg,#3b82f6,#2563eb)',
    title: latestMessage.value?.title || '暂无消息',
    unread: latestMessageUnread.value,
  },
  {
    type: 'todo' as const,
    typeLabel: '待办',
    icon: '✅',
    iconBg: 'linear-gradient(135deg,#f97316,#ea580c)',
    title: latestTodo.value?.title || '暂无待办',
    unread: latestTodoUnread.value,
  },
])

// ─────────────────────────────────────────────
// 数据概览
// ─────────────────────────────────────────────
const dataCards = ref([
  {label: '在租房间', value: '--', icon: '🏠', iconBg: '#eff6ff'},
  {label: '空置房间', value: '--', icon: '🔑', iconBg: '#f0fdf4'},
  {label: '待收租金', value: '--', icon: '💰', iconBg: '#fffbeb'},
  {label: '本月新签', value: '--', icon: '📝', iconBg: '#faf5ff'},
])

// ─────────────────────────────────────────────
// 生命周期
// ─────────────────────────────────────────────
useDidShow(async () => {
  ensureLoggedIn()
  const user = getUser()
  nickname.value = user?.nickname || user?.username || ''

  routeLoading.value = true
  const routes = await loadAsyncRoutes(false)
  visibleTools.value = extractVisibleTools(routes)
  routeLoading.value = false

  const res = await getTodoCount()
  if (res.code === 0) {
    todoCount.value = res.data || 0
    stats.value[0].value = String(res.data || 0)
  }
  await loadRecentNotice()
})

async function loadRecentNotice() {
  const res = await getRecentNotice({})
  if (res.code !== 0) return
  latestNotice.value = res.data?.notices?.[0] || null
  latestMessage.value = res.data?.messages?.[0] || null
  latestTodo.value = res.data?.todos?.[0] || null
  latestNoticeUnread.value = latestNotice.value?.isRead === false
  latestMessageUnread.value = latestMessage.value?.isRead === false
  latestTodoUnread.value = (latestTodo.value?.status ?? 0) !== 2
  const unreadCount =
    Number(res.data?.unreadNoticeCount || 0) +
    Number(res.data?.unreadMessageCount || 0) +
    Number(res.data?.pendingTodoCount || 0)
  if (unreadCount > 0) {
    Taro.setTabBarBadge({index: 1, text: unreadCount > 99 ? '99+' : String(unreadCount)})
  } else {
    Taro.removeTabBarBadge({index: 1})
  }
}

// ─────────────────────────────────────────────
// 导航
// ─────────────────────────────────────────────
function navigateTo(item: MenuItem) {
  Taro.navigateTo({url: item.url})
}

function goSearch() {
}

function goMessage() {
  Taro.switchTab({url: '/pages/message/index'})
}

function openNoticeDetail(type: 'notice' | 'message' | 'todo') {
  if (type === 'todo') {
    Taro.navigateTo({url: '/pages/approval/index'})
    return
  }
  const data = type === 'notice' ? latestNotice.value : latestMessage.value
  if (!data) return
  setNoticeDetail({
    type,
    id: data?.id,
    title: data?.title,
    content: data?.content,
    time: data?.publishTime || data?.createTime,
  })
  Taro.navigateTo({url: '/pages/message/detail/index'})
}
</script>

<style>
.home-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding-bottom: 160rpx;
}

/* ===== Header ===== */
.home-header {
  position: relative;
  overflow: hidden;
  padding-bottom: 40rpx;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, #1a56db 0%, #3478f6 55%, #5b9aff 100%);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 80rpx 32rpx 0;
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 36rpx;
}

.greeting-text {
  font-size: 42rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.greeting-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.72);
  margin-top: 8rpx;
}

.header-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 16rpx;
  padding: 14rpx 20rpx;
}

.header-btn-icon {
  font-size: 28rpx;
  color: #fff;
}

.header-btn-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.stat-row {
  display: flex;
  gap: 12rpx;
}

.stat-card {
  flex: 1;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 16rpx;
  padding: 18rpx 16rpx;
  text-align: center;
}

.stat-value {
  font-size: 34rpx;
  font-weight: 800;
  color: #fff;
}

.stat-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 4rpx;
}

/* ===== 卡片通用 ===== */
.section-card {
  background: #fff;
  border-radius: 24rpx;
  margin: 20rpx 24rpx 0;
  padding: 28rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
}

.section-action {
  font-size: 24rpx;
  color: #3478f6;
  font-weight: 500;
}

/* ===== 骨架屏 ===== */
.tools-skeleton {
  display: flex;
  gap: 20rpx;
}

.skeleton-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.skeleton-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: #f3f4f6;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

.skeleton-label {
  width: 60rpx;
  height: 20rpx;
  border-radius: 6rpx;
  background: #f3f4f6;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

/* ===== 空状态 ===== */
.tools-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0 20rpx;
  gap: 12rpx;
}

.tools-empty-icon {
  font-size: 64rpx;
  opacity: 0.4;
}

.tools-empty-text {
  font-size: 26rpx;
  color: #9ca3af;
}

/* ===== 功能格子（平铺）===== */
.tool-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx 12rpx;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}

.tool-item:active {
  opacity: 0.72;
}

.tool-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.13);
}

.tool-icon-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
}

.tool-emoji {
  font-size: 38rpx;
  line-height: 1;
}

.tool-label {
  font-size: 22rpx;
  color: #374151;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
}

/* ===== 消息区 ===== */
.notice-list {
  display: flex;
  flex-direction: column;
}

.notice-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 16rpx 4rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.notice-row:last-child {
  border-bottom: none;
}

.notice-row:active {
  opacity: 0.75;
}

.notice-icon-wrap {
  width: 68rpx;
  height: 68rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.12);
}

.notice-icon-emoji {
  font-size: 30rpx;
  line-height: 1;
}

.notice-body {
  flex: 1;
  min-width: 0;
}

.notice-row-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 27rpx;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.notice-row-type {
  font-size: 22rpx;
  color: #9ca3af;
  margin-top: 4rpx;
}

.unread-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}

.notice-arrow {
  font-size: 40rpx;
  color: #c5ccd6;
  flex-shrink: 0;
}

/* ===== 数据概览 ===== */
.data-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.data-card {
  background: #f8fafc;
  border-radius: 18rpx;
  padding: 22rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.data-card-icon {
  font-size: 32rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}

.data-card-value {
  font-size: 36rpx;
  font-weight: 800;
  color: #111827;
}

.data-card-label {
  font-size: 22rpx;
  color: #9ca3af;
  font-weight: 500;
}
</style>
