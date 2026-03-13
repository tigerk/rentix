<template>
  <view class="detail-page">
    <view v-if="detail" class="detail-wrap">
      <!-- 顶部类型标签 -->
      <view class="detail-type-row">
        <view class="detail-type-badge" :class="`detail-type-badge--${detail.type}`">
          {{ typeLabel }}
        </view>
        <view class="detail-time">{{ formatTime(detail.time) }}</view>
      </view>

      <!-- 标题 -->
      <view class="detail-title">{{ detail.title || '详情' }}</view>

      <!-- 分割线 -->
      <view class="detail-divider"/>

      <!-- 内容 -->
      <view class="detail-content">{{ detail.content || '暂无内容' }}</view>
    </view>

    <view v-else class="empty-state">
      <view class="empty-icon">📭</view>
      <view class="empty-text">内容不存在</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import {useDidShow} from '@tarojs/taro'
import {getNoticeDetail, NoticeDetailPayload} from '@/services/notice'

const detail = ref<NoticeDetailPayload | null>(null)

useDidShow(() => {
  detail.value = getNoticeDetail()
})

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    notice: '📢 公告',
    message: '💬 消息',
    todo: '✅ 待办',
  }
  return map[detail.value?.type || ''] || '通知'
})

function formatTime(time?: string) {
  if (!time) return ''
  return time.replace('T', ' ').slice(0, 16)
}
</script>

<style>
.detail-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding: 24rpx;
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

.detail-wrap {
  background: #fff;
  border-radius: 24rpx;
  padding: 36rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(15, 23, 42, 0.07);
}

.detail-type-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.detail-type-badge {
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
}

.detail-type-badge--notice {
  background: #fffbeb;
  color: #d97706;
}

.detail-type-badge--message {
  background: #eff6ff;
  color: #2563eb;
}

.detail-type-badge--todo {
  background: #fff7ed;
  color: #f97316;
}

.detail-time {
  font-size: 22rpx;
  color: #9ca3af;
}

.detail-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #111827;
  line-height: 1.4;
  margin-bottom: 24rpx;
}

.detail-divider {
  height: 1rpx;
  background: #f1f5f9;
  margin-bottom: 28rpx;
}

.detail-content {
  font-size: 28rpx;
  color: #374151;
  line-height: 1.8;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 100rpx;
  opacity: 0.4;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9ca3af;
}
</style>
