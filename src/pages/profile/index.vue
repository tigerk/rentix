<template>
  <view class="profile-page">
    <!-- 顶部用户信息 -->
    <view class="hero-section">
      <view class="hero-bg"/>
      <view class="hero-content">
        <view class="avatar-area">
          <view class="avatar-wrap" @click="goToProfileEdit">
            <image v-if="user?.avatar" class="avatar-img" :src="user?.avatar" mode="aspectFill"/>
            <view v-else class="avatar-fallback">{{ initials }}</view>
            <view class="avatar-edit-badge">
              <view class="avatar-edit-icon">✎</view>
            </view>
          </view>
        </view>
        <view class="user-name">{{ user?.nickname || user?.username || '用户' }}</view>
        <view class="user-company">
          <view class="company-dot"/>
          <view class="company-name-text">{{ currentCompanyName }}</view>
        </view>
      </view>
    </view>

    <!-- 服务订购卡片 -->
    <view class="section-gap">
      <view class="service-banner" @click="goToCompanyPay">
        <view class="service-banner-left">
          <view class="service-icon-wrap">
            <view class="service-icon">✦</view>
          </view>
          <view class="service-info">
            <view class="service-title">服务订购</view>
            <view class="service-desc">房源 · 短信 · 电子合同 · 实名认证</view>
          </view>
        </view>
        <view class="service-arrow">›</view>
      </view>
    </view>

    <!-- 账号管理 -->
    <view class="section-gap">
      <view class="section-label">账号管理</view>
      <view class="menu-card">
        <view class="menu-item" @click="goToCompanySwitch">
          <view class="menu-item-left">
            <view class="menu-icon-wrap menu-icon--blue">
              <view class="menu-icon-text">⇄</view>
            </view>
            <view class="menu-item-title">切换公司</view>
          </view>
          <view class="menu-item-right">
            <view class="menu-item-value">{{ currentCompanyName }}</view>
            <view class="menu-arrow">›</view>
          </view>
        </view>
        <view class="menu-divider"/>
        <view class="menu-item" @click="goToAccountSecurity">
          <view class="menu-item-left">
            <view class="menu-icon-wrap menu-icon--green">
              <view class="menu-icon-text">⚙</view>
            </view>
            <view class="menu-item-title">账号安全</view>
          </view>
          <view class="menu-item-right">
            <view class="menu-arrow">›</view>
          </view>
        </view>
        <view class="menu-divider"/>
        <view class="menu-item" @click="goToProfileEdit">
          <view class="menu-item-left">
            <view class="menu-icon-wrap menu-icon--purple">
              <view class="menu-icon-text">✎</view>
            </view>
            <view class="menu-item-title">个人信息</view>
          </view>
          <view class="menu-item-right">
            <view class="menu-arrow">›</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="section-gap">
      <view class="logout-card" @click="handleLogout">
        <view class="logout-text">退出登录</view>
      </view>
    </view>

    <!-- 版本号 -->
    <view class="version-info">© 2025 TestSystem. All rights reserved.</view>
  </view>
</template>

<script setup lang="ts">
import Taro, {useDidShow} from '@tarojs/taro'
import {computed, ref} from 'vue'
import {ensureLoggedIn} from '@/services/auth'
import {clearToken, clearUser, getUser, UserInfo} from '@/services/storage'

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
  if (!currentId) return '暂无公司'
  const match = (user.value?.companyList || []).find(item => item.companyId === currentId)
  return match?.companyName || String(currentId)
})

function goToProfileEdit() {
  Taro.navigateTo({url: '/pages/profile/edit/index'})
}

function goToCompanySwitch() {
  Taro.navigateTo({url: '/pages/company/switch/index'})
}

function goToAccountSecurity() {
  Taro.navigateTo({url: '/pages/profile/security/index'})
}

function goToCompanyPay() {
  Taro.navigateTo({url: '/pages/company/pay/index'})
}

function handleLogout() {
  Taro.showModal({
    title: '退出登录',
    content: '确认退出当前账号？',
    confirmColor: '#ef4444',
    confirmText: '退出',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        clearToken()
        clearUser()
        Taro.reLaunch({url: '/pages/login/index'})
      }
    }
  })
}
</script>

<style>
/* ===== 页面容器 ===== */
.profile-page {
  min-height: 100vh;
  background-color: #f2f4f7;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

/* ===== Hero 区域 ===== */
.hero-section {
  position: relative;
  padding-bottom: 40rpx;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(160deg, #1a56db 0%, #3478f6 50%, #5b9aff 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx 48rpx;
}

.avatar-area {
  margin-bottom: 20rpx;
}

.avatar-wrap {
  position: relative;
  width: 128rpx;
  height: 128rpx;
}

.avatar-img {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  display: block;
}

.avatar-fallback {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  background: rgba(255, 255, 255, 0.25);
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
}

.avatar-edit-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background: #ffffff;
  border: 3rpx solid rgba(52, 120, 246, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.avatar-edit-icon {
  font-size: 22rpx;
  color: #3478f6;
  line-height: 1;
}

.user-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1rpx;
  text-align: center;
  margin-bottom: 10rpx;
}

.user-company {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.company-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 6rpx;
  background: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.company-name-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* ===== 间距 ===== */
.section-gap {
  padding: 0 24rpx;
  margin-top: 20rpx;
}

.section-label {
  font-size: 24rpx;
  color: #8f96a3;
  font-weight: 600;
  letter-spacing: 1rpx;
  padding: 0 4rpx;
  margin-bottom: 10rpx;
}

/* ===== 服务横幅 ===== */
.service-banner {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.15);
  border: 1rpx solid rgba(245, 158, 11, 0.2);
  margin-top: 20rpx;
}

.service-banner:active {
  opacity: 0.85;
}

.service-banner-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.service-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 18rpx;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-icon {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.service-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #92400e;
}

.service-desc {
  font-size: 22rpx;
  color: #b45309;
}

.service-arrow {
  font-size: 40rpx;
  color: #b45309;
  line-height: 1;
}

/* ===== 菜单卡片 ===== */
.menu-card {
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 24rpx;
  min-height: 96rpx;
}

.menu-item:active {
  background: #f8fafc;
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.menu-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon--blue {
  background: #eff6ff;
}

.menu-icon--green {
  background: #f0fdf4;
}

.menu-icon--purple {
  background: #faf5ff;
}

.menu-icon-text {
  font-size: 28rpx;
  line-height: 1;
}

.menu-icon--blue .menu-icon-text {
  color: #3478f6;
}

.menu-icon--green .menu-icon-text {
  color: #22c55e;
}

.menu-icon--purple .menu-icon-text {
  color: #a855f7;
}

.menu-item-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
}

.menu-item-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.menu-item-value {
  font-size: 26rpx;
  color: #8f96a3;
  max-width: 260rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.menu-arrow {
  font-size: 40rpx;
  color: #c5ccd6;
  line-height: 1;
}

.menu-divider {
  height: 1rpx;
  background: #f1f5f9;
  margin: 0 24rpx 0 106rpx;
}

/* ===== 退出登录 ===== */
.logout-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.06);
}

.logout-card:active {
  opacity: 0.85;
}

.logout-text {
  text-align: center;
  padding: 30rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #ef4444;
}

/* ===== 版本号 ===== */
.version-info {
  text-align: center;
  font-size: 22rpx;
  color: #c5ccd6;
  margin-top: 48rpx;
}
</style>
