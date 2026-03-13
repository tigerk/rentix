<template>
  <view class="page">

    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrap">
        <image v-if="form.avatar" class="avatar-img" :src="form.avatar" mode="aspectFill"/>
        <view v-else class="avatar-fallback">{{ initials }}</view>
      </view>
      <view class="avatar-hint">头像来自登录信息</view>
    </view>

    <!-- 表单 -->
    <view class="form-section">
      <view class="form-card">
        <view class="form-item">
          <view class="form-label">昵称</view>
          <view class="form-input-wrap">
            <input
              class="form-input"
              v-model="form.nickname"
              placeholder="请输入昵称"
              placeholder-class="form-placeholder"
              maxlength="20"
            />
            <view v-if="form.nickname" class="input-clear" @click="form.nickname = ''">
              <view class="input-clear-icon">✕</view>
            </view>
          </view>
        </view>

        <view class="form-divider"/>

        <view class="form-item form-item--textarea">
          <view class="form-label">简介</view>
          <view class="form-textarea-wrap">
            <textarea
              class="form-textarea"
              v-model="form.remark"
              placeholder="介绍一下自己吧..."
              placeholder-class="form-placeholder"
              maxlength="100"
              :show-confirm-bar="false"
            />
            <view class="textarea-count">{{ (form.remark || '').length }}/100</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="btn-section">
      <view
        class="save-btn"
        :class="{ 'save-btn--loading': saving }"
        @click="handleSave"
      >
        <view class="save-btn-text">{{ saving ? '保存中...' : '保存修改' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, {useDidShow, useDidHide} from '@tarojs/taro'
import {computed, reactive, ref, onUnmounted} from 'vue'
import {getUserProfile, updateUserProfile} from '@/api/auth'
import {ensureLoggedIn} from '@/services/auth'
import {getUser, setUser} from '@/services/storage'

const saving = ref(false)
let backTimer: ReturnType<typeof setTimeout> | null = null

const form = reactive({
  avatar: '',
  nickname: '',
  remark: ''
})

useDidShow(async () => {
  ensureLoggedIn()
  const local = getUser()
  form.avatar = local?.avatar || ''
  form.nickname = local?.nickname || local?.username || ''
  form.remark = ''
  const res = await getUserProfile()
  if (res.code === 0 && res.data) {
    form.avatar = res.data.avatar || form.avatar
    form.nickname = res.data.nickname || form.nickname
    form.remark = res.data.remark || ''
  }
})

const initials = computed(() => {
  const name = form.nickname || ''
  return name ? name.slice(0, 1).toUpperCase() : 'U'
})

async function handleSave() {
  if (!form.nickname.trim()) {
    Taro.showToast({title: '请输入昵称', icon: 'none'})
    return
  }
  try {
    saving.value = true
    const res = await updateUserProfile({
      avatar: form.avatar,
      nickname: form.nickname,
      remark: form.remark
    })
    if (res.code === 0) {
      const local = getUser() || {}
      setUser({...local, avatar: form.avatar, nickname: form.nickname})
      Taro.showToast({title: '保存成功', icon: 'success'})
      if (backTimer) clearTimeout(backTimer)
      backTimer = setTimeout(() => Taro.navigateBack(), 1500)
      return
    }
    Taro.showToast({title: res.message || '保存失败', icon: 'none'})
  } catch {
    Taro.showToast({title: '保存失败', icon: 'none'})
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
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

/* ===== 头像区域 ===== */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx 40rpx;
  background: #ffffff;
  margin-bottom: 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.avatar-wrap {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(52, 120, 246, 0.2);
}

.avatar-img {
  width: 128rpx;
  height: 128rpx;
  display: block;
}

.avatar-fallback {
  width: 128rpx;
  height: 128rpx;
  background: linear-gradient(135deg, #3478f6, #5b9aff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
}

.avatar-hint {
  font-size: 24rpx;
  color: #8f96a3;
}

/* ===== 表单区域 ===== */
.form-section {
  padding: 0 24rpx;
}

.form-card {
  background: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.06);
}

.form-item {
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-height: 104rpx;
}

.form-item--textarea {
  align-items: flex-start;
  min-height: 200rpx;
}

.form-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
  width: 80rpx;
  flex-shrink: 0;
}

.form-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8rpx;
  min-width: 0;
}

/* H5 & 小程序通用输入框 */
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
  /* H5 兼容 */
  -webkit-appearance: none;
  appearance: none;
  padding: 0;
  margin: 0;
}

.form-placeholder {
  color: #c0c9d6;
  font-size: 30rpx;
}

.input-clear {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.input-clear-icon {
  font-size: 18rpx;
  color: #6b7280;
  line-height: 1;
}

.form-textarea-wrap {
  flex: 1;
  position: relative;
  padding-top: 4rpx;
}

/* H5 & 小程序通用 textarea */
.form-textarea {
  width: 100%;
  min-height: 180rpx;
  font-size: 30rpx;
  color: #111827;
  line-height: 1.6;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  /* H5 兼容 */
  -webkit-appearance: none;
  appearance: none;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.textarea-count {
  text-align: right;
  font-size: 22rpx;
  color: #c0c9d6;
  margin-top: 8rpx;
}

.form-divider {
  height: 1rpx;
  background: #f1f5f9;
  margin: 0 24rpx 0 120rpx;
}

/* ===== 保存按钮 ===== */
.btn-section {
  padding: 32rpx 24rpx 0;
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
