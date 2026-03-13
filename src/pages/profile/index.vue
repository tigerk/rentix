<template>
  <view class="profile-page">

    <view class="profile-card">
      <view class="avatar-wrap">
        <image v-if="user?.avatar" class="avatar-img" :src="user?.avatar" mode="aspectFill" />
        <view v-else class="avatar-fallback">{{ initials }}</view>
      </view>
      <view class="profile-info">
        <view class="name">{{ user?.nickname || user?.username || '用户' }}</view>
        <view class="meta">{{ currentCompanyName }}</view>
      </view>
    </view>

    <view class="service-card" @click="goToCompanySwitch">
      <view class="service-left">
        <view class="service-badge">V</view>
        <view class="service-text">服务订购</view>
      </view>
      <view class="service-right">房源/短信/电子合同/实名认证</view>
    </view>

    <view class="list-card">
      <view class="list-item" @click="goToCompanySwitch">
        <view class="list-title">切换公司</view>
        <view class="arrow">›</view>
      </view>
      <view class="divider" />
      <view class="list-item" @click="goToAccountSecurity">
        <view class="list-title">账号安全</view>
        <view class="arrow">›</view>
      </view>
    </view>

    <view class="list-card">
      <view class="list-item" @click="handleLogout">
        <view class="logout-text">退出登录</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { ensureLoggedIn } from '@/services/auth'
import { clearToken, clearUser, getUser, UserInfo } from '@/services/storage'

const user = ref<UserInfo | null>(null)

useDidShow(() => {
  ensureLoggedIn()
  user.value = getUser()
})

const initials = computed(() => {
  const name = user.value?.nickname || user.value?.username || ''
  return name ? name.slice(0, 1).toUpperCase() : 'U'
})

const currentCompanyName = computed(() => {
  const currentId = user.value?.curCompanyId
  if (!currentId) return '-'
  const match = (user.value?.companyList || []).find(item => item.companyId === currentId)
  return match?.companyName || String(currentId)
})

function goToCompanySwitch() {
  Taro.navigateTo({ url: '/pages/company/switch/index' })
}

function goToAccountSecurity() {
  Taro.navigateTo({ url: '/pages/profile/security/index' })
}

function handleLogout() {
  clearToken()
  clearUser()
  Taro.reLaunch({ url: '/pages/login/index' })
}
</script>

<style scoped>
.profile-page {
  padding: 0 24rpx 40rpx;
}

.profile-hero {
  height: 220rpx;
  margin: 0 -24rpx 16rpx;
  padding: 70rpx 24rpx 0;
  background: radial-gradient(circle at 20% 20%, #e5f0ff 0, #d7e6ff 30%, #f6f7f9 75%);
}

.hero-title {
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #ffffff;
  border-radius: 18rpx;
  padding: 20rpx;
  box-shadow: 0 12rpx 24rpx rgba(15, 23, 42, 0.06);
}

.avatar-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
}

.avatar-fallback {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: #3478f6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 700;
}

.profile-info {
  flex: 1;
}

.name {
  font-size: 32rpx;
  font-weight: 700;
}

.meta {
  color: #6b7280;
  font-size: 24rpx;
  margin-top: 6rpx;
}

.arrow {
  color: #9ca3af;
  font-size: 40rpx;
  margin-left: auto;
}

.service-card {
  margin-top: 16rpx;
  background: #fff4df;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #7a4c00;
}

.service-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-weight: 600;
}

.service-badge {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  background: #7a4c00;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
}

.service-text {
  font-size: 28rpx;
}

.service-right {
  font-size: 24rpx;
  color: #8b6b2b;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 16rpx;
}

.grid-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 10rpx 20rpx rgba(15, 23, 42, 0.04);
}

.grid-title {
  font-size: 28rpx;
  font-weight: 700;
}

.grid-meta {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.grid-amount {
  margin-top: 12rpx;
  font-size: 32rpx;
  color: #f59e0b;
  font-weight: 700;
}

.list-card {
  background: #fff;
  border-radius: 16rpx;
  margin-top: 16rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 20rpx rgba(15, 23, 42, 0.04);
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  font-size: 28rpx;
}

.list-title {
  font-weight: 600;
  color: #111827;
}

.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 24rpx;
}

.logout-text {
  width: 100%;
  text-align: center;
  color: #ef4444;
  font-weight: 600;
}
</style>
