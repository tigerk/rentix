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
    <view class="btn-section">
      <view
        class="btn-primary"
        :class="{ 'btn-primary--loading': saving }"
        @click="handleSave"
      >
        <view class="btn-primary-text">{{ saving ? '更新中...' : '确认修改' }}</view>
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
/* ===== 密码强度（本页独有）===== */
.strength-wrap {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 4rpx;
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
</style>
