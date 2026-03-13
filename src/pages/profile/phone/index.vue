<template>
  <view class="container">
    <view class="card">
      <view class="section-title">更换手机号</view>

      <view class="form-item">
        <view class="label">原手机号验证码</view>
        <view class="row">
          <input class="input" v-model="form.oldVerifyCode" placeholder="请输入原手机号验证码" />
          <nut-button class="code-btn" size="small" type="primary" :disabled="oldCountdown > 0" @click="sendOldCode">
            {{ oldCountdown > 0 ? `${oldCountdown}s` : '发送验证码' }}
          </nut-button>
        </view>
      </view>

      <view class="form-item">
        <view class="label">新手机号</view>
        <input class="input" v-model="form.newPhone" placeholder="请输入新手机号" />
      </view>

      <view class="form-item">
        <view class="label">新手机号验证码</view>
        <view class="row">
          <input class="input" v-model="form.newVerifyCode" placeholder="请输入新手机号验证码" />
          <nut-button class="code-btn" size="small" type="primary" :disabled="newCountdown > 0" @click="sendNewCode">
            {{ newCountdown > 0 ? `${newCountdown}s` : '发送验证码' }}
          </nut-button>
        </view>
      </view>

      <nut-button type="primary" block class="submit-btn" :loading="saving" @click="handleSave">保存</nut-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow, useDidHide } from '@tarojs/taro'
import { reactive, ref } from 'vue'
import { sendAccountNewPhoneSms, sendAccountOldPhoneSms, updateAccountPhone } from '@/api/auth'
import { ensureLoggedIn } from '@/services/auth'
import { getUser, setUser } from '@/services/storage'

const saving = ref(false)
const oldCountdown = ref(0)
const newCountdown = ref(0)
let oldTimer: number | null = null
let newTimer: number | null = null

const form = reactive({
  oldVerifyCode: '',
  newPhone: '',
  newVerifyCode: ''
})

useDidShow(() => {
  ensureLoggedIn()
})

useDidHide(() => {
  if (oldTimer) clearInterval(oldTimer)
  if (newTimer) clearInterval(newTimer)
})

async function sendOldCode() {
  const res = await sendAccountOldPhoneSms()
  if (res.code === 0) {
    Taro.showToast({ title: '验证码已发送', icon: 'success' })
    startCountdown('old')
    return
  }
  Taro.showToast({ title: res.message || '发送失败', icon: 'none' })
}

async function sendNewCode() {
  if (!form.newPhone) {
    Taro.showToast({ title: '请输入新手机号', icon: 'none' })
    return
  }
  const res = await sendAccountNewPhoneSms({ phone: form.newPhone })
  if (res.code === 0) {
    Taro.showToast({ title: '验证码已发送', icon: 'success' })
    startCountdown('new')
    return
  }
  Taro.showToast({ title: res.message || '发送失败', icon: 'none' })
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

async function handleSave() {
  if (!form.oldVerifyCode || !form.newPhone || !form.newVerifyCode) {
    Taro.showToast({ title: '请填写完整信息', icon: 'none' })
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
      setUser({ ...local, username: form.newPhone })
      Taro.showToast({ title: '手机号已更新', icon: 'success' })
      Taro.navigateBack()
      return
    }
    Taro.showToast({ title: res.message || '保存失败', icon: 'none' })
  } catch {
    Taro.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form-item {
  margin-bottom: 18rpx;
}

.label {
  font-size: 26rpx;
  color: #111827;
  margin-bottom: 10rpx;
}

.row {
  display: flex;
  gap: 12rpx;
  align-items: center;
}

.input {
  flex: 1;
  padding: 16rpx 18rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  font-size: 26rpx;
}

.code-btn {
  height: 64rpx;
}

.submit-btn {
  margin-top: 8rpx;
  font-weight: 600;
  border-radius: 12rpx;
}
</style>
