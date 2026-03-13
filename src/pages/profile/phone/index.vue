<template>
  <view class="page">

    <!-- 步骤指引 -->
    <view class="section-gap">
      <view class="steps-wrap">
        <view class="step" :class="{ 'step--active': currentStep >= 1, 'step--done': currentStep > 1 }">
          <view class="step-circle">{{ currentStep > 1 ? '✓' : '1' }}</view>
          <view class="step-label">验证原手机</view>
        </view>
        <view class="step-line" :class="{ 'step-line--done': currentStep > 1 }"/>
        <view class="step" :class="{ 'step--active': currentStep >= 2 }">
          <view class="step-circle">2</view>
          <view class="step-label">绑定新手机</view>
        </view>
      </view>
    </view>

    <!-- 第一步：验证原手机 -->
    <view class="section-gap" v-if="currentStep === 1">
      <view class="step-title-wrap">
        <view class="step-title-main">验证原手机号</view>
        <view class="step-title-sub">向您的原手机号发送验证码以确认身份</view>
      </view>
      <view class="form-card">
        <view class="form-item">
          <view class="form-label">验证码</view>
          <view class="form-input-wrap">
            <input
              class="form-input"
              v-model="form.oldVerifyCode"
              type="number"
              placeholder="请输入验证码"
              placeholder-class="form-placeholder"
              maxlength="6"
            />
            <view
              class="code-btn"
              :class="{ 'code-btn--disabled': oldCountdown > 0 }"
              @click="sendOldCode"
            >
              <view class="code-btn-text">
                {{ oldCountdown > 0 ? `${oldCountdown}s` : '发送验证码' }}
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="next-btn" @click="goToNextStep">
        <view class="next-btn-text">下一步</view>
      </view>
    </view>

    <!-- 第二步：绑定新手机 -->
    <view class="section-gap" v-if="currentStep === 2">
      <view class="step-title-wrap">
        <view class="step-title-main">绑定新手机号</view>
        <view class="step-title-sub">输入并验证您的新手机号</view>
      </view>
      <view class="form-card">
        <view class="form-item">
          <view class="form-label">新手机号</view>
          <view class="form-input-wrap">
            <input
              class="form-input"
              v-model="form.newPhone"
              type="number"
              placeholder="请输入新手机号"
              placeholder-class="form-placeholder"
              maxlength="11"
            />
          </view>
        </view>
        <view class="form-divider"/>
        <view class="form-item">
          <view class="form-label">验证码</view>
          <view class="form-input-wrap">
            <input
              class="form-input"
              v-model="form.newVerifyCode"
              type="number"
              placeholder="请输入验证码"
              placeholder-class="form-placeholder"
              maxlength="6"
            />
            <view
              class="code-btn"
              :class="{ 'code-btn--disabled': newCountdown > 0 }"
              @click="sendNewCode"
            >
              <view class="code-btn-text">
                {{ newCountdown > 0 ? `${newCountdown}s` : '发送验证码' }}
              </view>
            </view>
          </view>
        </view>
      </view>
      <view
        class="save-btn"
        :class="{ 'save-btn--loading': saving }"
        @click="handleSave"
      >
        <view class="save-btn-text">{{ saving ? '提交中...' : '确认更换' }}</view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import Taro, {useDidShow, useDidHide} from '@tarojs/taro'
import {reactive, ref, onUnmounted} from 'vue'
import {sendAccountNewPhoneSms, sendAccountOldPhoneSms, updateAccountPhone} from '@/api/auth'
import {ensureLoggedIn} from '@/services/auth'
import {getUser, setUser} from '@/services/storage'

const saving = ref(false)
const oldCountdown = ref(0)
const newCountdown = ref(0)
const currentStep = ref(1)
let oldTimer: number | null = null
let newTimer: number | null = null
let backTimer: ReturnType<typeof setTimeout> | null = null

const form = reactive({
  oldVerifyCode: '',
  newPhone: '',
  newVerifyCode: ''
})

useDidShow(() => {
  ensureLoggedIn()
  currentStep.value = 1
  form.oldVerifyCode = ''
  form.newPhone = ''
  form.newVerifyCode = ''
})

useDidHide(() => {
  if (oldTimer) clearInterval(oldTimer)
  if (newTimer) clearInterval(newTimer)
  if (backTimer) clearTimeout(backTimer)
})

onUnmounted(() => {
  if (oldTimer) clearInterval(oldTimer)
  if (newTimer) clearInterval(newTimer)
  if (backTimer) clearTimeout(backTimer)
})

async function sendOldCode() {
  if (oldCountdown.value > 0) return
  const res = await sendAccountOldPhoneSms()
  if (res.code === 0) {
    Taro.showToast({title: '验证码已发送', icon: 'success'})
    startCountdown('old')
    return
  }
  Taro.showToast({title: res.message || '发送失败', icon: 'none'})
}

async function sendNewCode() {
  if (newCountdown.value > 0) return
  if (!form.newPhone) {
    Taro.showToast({title: '请先输入新手机号', icon: 'none'})
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.newPhone)) {
    Taro.showToast({title: '请输入正确的手机号', icon: 'none'})
    return
  }
  const res = await sendAccountNewPhoneSms({phone: form.newPhone})
  if (res.code === 0) {
    Taro.showToast({title: '验证码已发送', icon: 'success'})
    startCountdown('new')
    return
  }
  Taro.showToast({title: res.message || '发送失败', icon: 'none'})
}

function startCountdown(type: 'old' | 'new') {
  if (type === 'old') {
    oldCountdown.value = 60
    if (oldTimer) clearInterval(oldTimer)
    oldTimer = setInterval(() => {
      oldCountdown.value -= 1
      if (oldCountdown.value <= 0 && oldTimer) clearInterval(oldTimer)
    }, 1000) as unknown as number
  } else {
    newCountdown.value = 60
    if (newTimer) clearInterval(newTimer)
    newTimer = setInterval(() => {
      newCountdown.value -= 1
      if (newCountdown.value <= 0 && newTimer) clearInterval(newTimer)
    }, 1000) as unknown as number
  }
}

function goToNextStep() {
  if (!form.oldVerifyCode) {
    Taro.showToast({title: '请输入原手机号验证码', icon: 'none'})
    return
  }
  currentStep.value = 2
}

async function handleSave() {
  if (!form.newPhone || !form.newVerifyCode) {
    Taro.showToast({title: '请填写完整信息', icon: 'none'})
    return
  }
  try {
    saving.value = true
    const res = await updateAccountPhone({
      oldVerifyCode: form.oldVerifyCode,
      newPhone: form.newPhone,
      newVerifyCode: form.newVerifyCode
    })
    if (res.code === 0) {
      const local = getUser() || {}
      setUser({...local, username: form.newPhone})
      Taro.showToast({title: '手机号已更换', icon: 'success'})
      if (backTimer) clearTimeout(backTimer)
      backTimer = setTimeout(() => Taro.navigateBack(), 1500)
      return
    }
    Taro.showToast({title: res.message || '更换失败', icon: 'none'})
  } catch {
    Taro.showToast({title: '更换失败', icon: 'none'})
  } finally {
    saving.value = false
  }
}
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

/* ===== 步骤条 ===== */
.steps-wrap {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.06);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.step-circle {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: #e5e7eb;
  color: #9ca3af;
  font-size: 26rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step--active .step-circle {
  background: #3478f6;
  color: #ffffff;
}

.step--done .step-circle {
  background: #22c55e;
  color: #ffffff;
}

.step-label {
  font-size: 24rpx;
  color: #9ca3af;
  font-weight: 500;
}

.step--active .step-label,
.step--done .step-label {
  color: #111827;
  font-weight: 600;
}

.step-line {
  flex: 1;
  height: 3rpx;
  background: #e5e7eb;
  margin: 0 8rpx;
  margin-bottom: 24rpx;
  border-radius: 2rpx;
}

.step-line--done {
  background: #22c55e;
}

/* ===== 步骤标题 ===== */
.step-title-wrap {
  margin-bottom: 16rpx;
  padding: 0 4rpx;
}

.step-title-main {
  font-size: 34rpx;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6rpx;
}

.step-title-sub {
  font-size: 24rpx;
  color: #8f96a3;
}

/* ===== 表单 ===== */
.form-card {
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.06);
  margin-bottom: 20rpx;
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

/* ===== 验证码按钮 ===== */
.code-btn {
  flex-shrink: 0;
  padding: 8rpx 16rpx;
  background: #eff6ff;
  border-radius: 12rpx;
}

.code-btn--disabled {
  background: #f1f5f9;
}

.code-btn-text {
  font-size: 24rpx;
  color: #3478f6;
  font-weight: 600;
  white-space: nowrap;
}

.code-btn--disabled .code-btn-text {
  color: #9ca3af;
}

.form-divider {
  height: 1rpx;
  background: #f1f5f9;
  margin: 0 24rpx 0 160rpx;
}

/* ===== 按钮 ===== */
.next-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #3478f6, #5b9aff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(52, 120, 246, 0.35);
}

.next-btn:active {
  opacity: 0.85;
}

.next-btn-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 4rpx;
}

.save-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #3478f6, #5b9aff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(52, 120, 246, 0.35);
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
