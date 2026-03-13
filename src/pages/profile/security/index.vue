<template>
  <view class="page">
    <view class="card">
      <view class="row">
        <view class="label">账号</view>
        <view class="value">{{ user?.username || '-' }}</view>
      </view>
    </view>

    <view class="card list">
      <view class="item" @click="goToPhoneUpdate">
        <view class="item-title">登录账号(手机号)</view>
        <view class="item-action">更换账号</view>
      </view>
      <view class="divider" />
      <view class="item" @click="goToPasswordUpdate">
        <view class="item-title">登录密码</view>
        <view class="item-action">修改密码</view>
      </view>
      <view class="divider" />
      <view class="item" @click="goToProfileEdit">
        <view class="item-title">个人信息</view>
        <view class="item-action">修改信息</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { ref } from 'vue'
import { ensureLoggedIn } from '@/services/auth'
import { getUser, UserInfo } from '@/services/storage'

const user = ref<UserInfo | null>(null)

useDidShow(() => {
  ensureLoggedIn()
  user.value = getUser()
})

function goToProfileEdit() {
  Taro.navigateTo({ url: '/pages/profile/edit/index' })
}

function goToPhoneUpdate() {
  Taro.navigateTo({ url: '/pages/profile/phone/index' })
}

function goToPasswordUpdate() {
  Taro.navigateTo({ url: '/pages/profile/password/index' })
}
</script>

<style scoped>
.page {
  padding: 0 24rpx 40rpx;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 20rpx;
  box-shadow: 0 12rpx 24rpx rgba(15, 23, 42, 0.06);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
}

.label {
  color: #111827;
  font-weight: 600;
}

.value {
  color: #6b7280;
}

.list {
  padding: 0;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  font-size: 28rpx;
}

.item-title {
  color: #111827;
  font-weight: 600;
}

.item-action {
  color: #6b7280;
}

.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 24rpx;
}
</style>
