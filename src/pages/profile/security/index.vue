<template>
  <view class="page">

    <!-- 账号信息卡片 -->
    <view class="section-gap">
      <view class="account-card">
        <view class="account-avatar">
          <view class="account-avatar-text">{{ usernameInitial }}</view>
        </view>
        <view class="account-info">
          <view class="account-label">当前账号</view>
          <view class="account-username">{{ user?.username || '-' }}</view>
        </view>
        <view class="account-badge">已认证</view>
      </view>
    </view>

    <!-- 安全设置列表 -->
    <view class="section-gap">
      <view class="section-label">安全设置</view>
      <view class="menu-card">
        <view class="menu-item" @click="goToPhoneUpdate">
          <view class="menu-item-left">
            <view class="menu-icon-wrap menu-icon--blue">
              <view class="menu-icon-text">📱</view>
            </view>
            <view class="menu-item-body">
              <view class="menu-item-title">登录手机号</view>
              <view class="menu-item-sub">{{ maskedPhone }}</view>
            </view>
          </view>
          <view class="menu-item-right">
            <view class="menu-action-text">更换</view>
            <view class="menu-arrow">›</view>
          </view>
        </view>

        <view class="menu-divider"/>

        <view class="menu-item" @click="goToPasswordUpdate">
          <view class="menu-item-left">
            <view class="menu-icon-wrap menu-icon--orange">
              <view class="menu-icon-text">🔐</view>
            </view>
            <view class="menu-item-body">
              <view class="menu-item-title">登录密码</view>
              <view class="menu-item-sub">定期修改密码可提升安全性</view>
            </view>
          </view>
          <view class="menu-item-right">
            <view class="menu-action-text">修改</view>
            <view class="menu-arrow">›</view>
          </view>
        </view>

        <view class="menu-divider"/>

        <view class="menu-item" @click="goToProfileEdit">
          <view class="menu-item-left">
            <view class="menu-icon-wrap menu-icon--purple">
              <view class="menu-icon-text">✎</view>
            </view>
            <view class="menu-item-body">
              <view class="menu-item-title">个人信息</view>
              <view class="menu-item-sub">修改昵称、头像、简介</view>
            </view>
          </view>
          <view class="menu-item-right">
            <view class="menu-action-text">编辑</view>
            <view class="menu-arrow">›</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 安全提示 -->
    <view class="section-gap">
      <view class="security-tips">
        <view class="tips-icon">🛡</view>
        <view class="tips-text">请妥善保管您的账号信息，不要将密码透露给他人</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, {useDidShow} from '@tarojs/taro'
import {computed, ref} from 'vue'
import {ensureLoggedIn} from '@/services/auth'
import {getUser, UserInfo} from '@/services/storage'

const user = ref<UserInfo | null>(null)

useDidShow(() => {
  ensureLoggedIn()
  user.value = getUser()
})

const usernameInitial = computed(() => {
  const name = user.value?.nickname || user.value?.username || ''
  return name ? name.slice(0, 1).toUpperCase() : 'U'
})

const maskedPhone = computed(() => {
  const phone = user.value?.username || ''
  if (phone.length === 11) {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return phone || '未绑定'
})

function goToProfileEdit() {
  Taro.navigateTo({url: '/pages/profile/edit/index'})
}

function goToPhoneUpdate() {
  Taro.navigateTo({url: '/pages/profile/phone/index'})
}

function goToPasswordUpdate() {
  Taro.navigateTo({url: '/pages/profile/password/index'})
}
</script>

<style>
.page {
  min-height: 100vh;
  background-color: #f2f4f7;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.section-gap {
  padding: 0 24rpx;
  margin-top: 24rpx;
}

.section-label {
  font-size: 24rpx;
  color: #8f96a3;
  font-weight: 600;
  letter-spacing: 1rpx;
  padding: 0 4rpx;
  margin-bottom: 10rpx;
}

/* ===== 账号卡片 ===== */
.account-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.06);
}

.account-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #3478f6, #5b9aff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.account-avatar-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-label {
  font-size: 22rpx;
  color: #8f96a3;
  margin-bottom: 6rpx;
}

.account-username {
  font-size: 32rpx;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.account-badge {
  background: #ecfdf5;
  color: #059669;
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  flex-shrink: 0;
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
  padding: 24rpx;
  min-height: 112rpx;
}

.menu-item:active {
  background: #f8fafc;
}

.menu-item-left {
  display: flex;
  align-items: center;
  gap: 18rpx;
  flex: 1;
  min-width: 0;
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

.menu-icon--orange {
  background: #fff7ed;
}

.menu-icon--purple {
  background: #faf5ff;
}

.menu-icon-text {
  font-size: 28rpx;
  line-height: 1;
}

.menu-item-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.menu-item-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
}

.menu-item-sub {
  font-size: 22rpx;
  color: #8f96a3;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.menu-item-right {
  display: flex;
  align-items: center;
  gap: 4rpx;
  flex-shrink: 0;
}

.menu-action-text {
  font-size: 26rpx;
  color: #3478f6;
  font-weight: 500;
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

/* ===== 安全提示 ===== */
.security-tips {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  background: #f0f9ff;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid #e0f2fe;
}

.tips-icon {
  font-size: 28rpx;
  line-height: 1.4;
  flex-shrink: 0;
}

.tips-text {
  font-size: 24rpx;
  color: #0369a1;
  line-height: 1.6;
}
</style>
