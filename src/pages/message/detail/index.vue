<template>
  <view class="container">
    <view class="card">
      <view class="detail-title">{{ detail?.title || '详情' }}</view>
      <view class="detail-time" v-if="detail?.time">{{ detail?.time }}</view>
      <view class="detail-content">{{ detail?.content || '-' }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDidShow } from '@tarojs/taro'
import { getNoticeDetail, NoticeDetailPayload } from '@/services/notice'

const detail = ref<NoticeDetailPayload | null>(null)

useDidShow(() => {
  detail.value = getNoticeDetail()
})
</script>

<style scoped>
.detail-title {
  font-size: 30rpx;
  font-weight: 700;
}

.detail-time {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #94a3b8;
}

.detail-content {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #374151;
  line-height: 1.6;
}
</style>
