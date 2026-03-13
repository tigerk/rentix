<template>
  <view class="page">

    <!-- 顶部提示 -->
    <view class="section-gap">
      <view class="tip-banner">
        <view class="tip-icon">🔒</view>
        <view class="tip-text">为保障账号安全，建议使用字母与数字的组合密码</view>
      </view>
    </view>

    <!-- 表单 -->
    <view class="section-gap">
      <view class="form-card">

        <view class="form-item">
          <view class="form-label">原密码</view>
          <view class="form-input-wrap">
            <input
              class="form-input"
              v-model="form.oldPassword"
              :password="!showOld"
              placeholder="请输入原密码"
              placeholder-class="form-placeholder"
            />
            <view class="eye-btn" @click="showOld = !showOld">
              <view class="eye-icon">{{ showOld ? '👁' : '🙈' }}</view>
            </view>
          </view>
        </view>

        <view class="form-divider"/>

        <view class="form-item">
          <view class="form-label">新密码</view>
          <view class="form-input-wrap">
            <input
              class="form-input"
              v-model="form.newPassword"
              :password="!showNew"
              placeholder="请输入新密码（6位以上）"
              placeholder-class="form-placeholder"
            />
            <view class="eye-btn" @click="showNew = !showNew">
              <view class="eye-icon">{{ showNew ? '👁' : '🙈' }}</view>
            </view>
          </view>
        </view>

        <view class="form-divider"/>

        <view class="form-item">
          <view class="form-label">确认密码</view>
          <view class="form-input-wrap">
            <input
              class="form-input"
              v-model="form.confirmPassword"
              :password="!showConfirm"
              placeholder="再次输入新密码"
              placeholder-class="form-placeholder"
            />
            <view class="eye-btn" @click="showConfirm = !showConfirm">
              <view class="eye-icon">{{ showConfirm ? '👁' : '🙈' }}</view>
            </view>
          </view>
        </view>

      </view>
    </view>

    <!-- 密码强度提示 -->
    <view class="section-gap" v-if="form.newPassword">
      <view class="strength-wrap">
        <view class="strength-label">密码强度：</view>
        <view class="strength-bars">
          <view
            v-for="i in 3"
            :key="i"
            class="strength-bar"
            :class="strengthClass(i)"
          />
        </view>
        <view class="strength-text" :class="`strength-text--${strengthLevel}`">
          {{ strengthText }}
        </view>
      </view>
    </view>

    <!-- 按钮 -->
    <view class="section-gap">
      <view
        class="save-btn"
        :class="{ 'save-btn--loading': saving }"
        @click="handleSave"
      >
        <view class="save-btn-text">{{ saving ? '更新中...' : '确认修改' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, {useDidShow, useDidHide} from '@tarojs/taro'
import {computed, reactive, ref, onUnmounted} from 'vue'
import {updateAccountPassword} from '@/api/auth'
import {ensureLoggedIn} from '@/services/auth'
import {clearToken, clearUser} from '@/services/storage'

const saving = ref(false)
const showOld = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)
let backTimer: ReturnType<typeof setTimeout> | null = null

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

useDidShow(() => {
  ensureLoggedIn()
})

const strengthLevel = computed(() => {
  const pwd = form.newPassword
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return 1
  if (score <= 2) return 2
  return 3
})

const strengthText = computed(() => {
  const texts = ['', '弱', '中', '强']
  return texts[strengthLevel.value]
})

function strengthClass(index: number) {
  if (strengthLevel.value < index) return ''
  if (strengthLevel.value === 1) return 'strength-bar--weak'
  if (strengthLevel.value === 2) return 'strength-bar--medium'
  return 'strength-bar--strong'
}

async function handleSave() {
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    Taro.showToast({title: '请填写完整信息', icon: 'none'})
    return
  }
  if (form.newPassword.length < 6) {
    Taro.showToast({title: '密码长度不能少于6位', icon: 'none'})
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    Taro.showToast({title: '两次输入的密码不一致', icon: 'none'})
    return
  }
  try {
    saving.value = true
    const res = await updateAccountPassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    if (res.code === 0) {
      Taro.showToast({title: '密码已更新，请重新登录', icon: 'success'})
      clearToken()
      clearUser()
      if (backTimer) clearTimeout(backTimer)
      backTimer = setTimeout(() => Taro.reLaunch({url: '/pages/login/index'}), 1500)
      return
    }
    Taro.showToast({title: res.message || '修改失败', icon: 'none'})
  } catch {
    Taro.showToast({title: '修改失败', icon: 'none'})
  } finally {
    saving.value = false
  }
}

function clearTimers() {
  if (backTimer) {
    clearTimeout(backTimer)
    backTimer = null
  }
}

useDidHide(() => {
  clearTimers()
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style>
.page {
  min-height: 100vh;
  background-color: #f2f4f7;
  padding-top: 24rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.section-gap {
  padding: 0 24rpx;
  margin-top: 20rpx;
}

/* ===== 顶部提示 ===== */
.tip-banner {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #f0f9ff;
  border-radius: 16rpx;
  padding: 20rpx;
  border: 1rpx solid #e0f2fe;
}

.tip-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}

.tip-text {
  font-size: 24rpx;
  color: #0369a1;
  line-height: 1.5;
}

/* ===== 表单 ===== */
.form-card {
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.06);
}

.form-item {
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  height: 104rpx;
  gap: 16rpx;
}

.form-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
  width: 120rpx;
  flex-shrink: 0;
}

.form-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
}

.form-input {
  flex: 1;
  font-size: 30rpx;
  color: #111827;
  height: 56rpx;
  line-height: 56rpx;
  background: transparent;
  border: none;
  outline: none;
  min-width: 0;
  -webkit-appearance: none;
  appearance: none;
  padding: 0;
  margin: 0;
}

.form-placeholder {
  color: #c0c9d6;
  font-size: 28rpx;
}

.eye-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.eye-icon {
  font-size: 28rpx;
  opacity: 0.5;
}

.form-divider {
  height: 1rpx;
  background: #f1f5f9;
  margin: 0 24rpx 0 160rpx;
}

/* ===== 密码强度 ===== */
.strength-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 4rpx 4rpx;
}

.strength-label {
  font-size: 24rpx;
  color: #8f96a3;
}

.strength-bars {
  display: flex;
  gap: 6rpx;
}

.strength-bar {
  width: 48rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: #e5e7eb;
}

.strength-bar--weak {
  background: #ef4444;
}

.strength-bar--medium {
  background: #f59e0b;
}

.strength-bar--strong {
  background: #22c55e;
}

.strength-text {
  font-size: 24rpx;
  font-weight: 600;
}

.strength-text--1 {
  color: #ef4444;
}

.strength-text--2 {
  color: #f59e0b;
}

.strength-text--3 {
  color: #22c55e;
}

/* ===== 按钮 ===== */
.save-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #3478f6, #5b9aff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(52, 120, 246, 0.35);
  margin-top: 16rpx;
}

.save-btn:active {
  opacity: 0.85;
}

.save-btn--loading {
  opacity: 0.7;
}

.save-btn-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 4rpx;
}
</style>
