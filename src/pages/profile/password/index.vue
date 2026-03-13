<template>
  <view class="container">
    <view class="card">
      <view class="section-title">修改密码</view>

      <view class="form-item">
        <view class="label">原密码</view>
        <input class="input" v-model="form.oldPassword" type="password" placeholder="请输入原密码" />
      </view>

      <view class="form-item">
        <view class="label">新密码</view>
        <input class="input" v-model="form.newPassword" type="password" placeholder="请输入新密码" />
      </view>

      <view class="form-item">
        <view class="label">确认新密码</view>
        <input class="input" v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" />
      </view>

      <nut-button type="primary" block class="submit-btn" :loading="saving" @click="handleSave">保存</nut-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { reactive, ref } from 'vue'
import { updateAccountPassword } from '@/api/auth'
import { ensureLoggedIn } from '@/services/auth'
import { clearToken, clearUser } from '@/services/storage'

const saving = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

useDidShow(() => {
  ensureLoggedIn()
})

async function handleSave() {
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    Taro.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    Taro.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  try {
    saving.value = true
    const res = await updateAccountPassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword
    })
    if (res.code === 0) {
      Taro.showToast({ title: '密码已更新，请重新登录', icon: 'none' })
      clearToken()
      clearUser()
      Taro.reLaunch({ url: '/pages/login/index' })
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

.input {
  width: 100%;
  padding: 16rpx 18rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  font-size: 26rpx;
}

.submit-btn {
  margin-top: 8rpx;
  font-weight: 600;
  border-radius: 12rpx;
}
</style>
