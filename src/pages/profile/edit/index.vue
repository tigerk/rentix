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
        class="btn-primary"
        :class="{ 'btn-primary--loading': saving }"
        @click="handleSave"
      >
        <view class="btn-primary-text">{{ saving ? '保存中...' : '保存修改' }}</view>
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

const form = reactive({avatar: '', nickname: '', remark: ''})

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
    Taro.showToast({title: '请输入昵称', icon: 'none'});
    return
  }
  try {
    saving.value = true
    const res = await updateUserProfile({avatar: form.avatar, nickname: form.nickname, remark: form.remark})
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
    clearTimeout(backTimer);
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
/* ===== 头像区域（本页独有）===== */
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

/* ===== 表单区容器（本页独有的外层）===== */
.form-section {
  padding: 0 24rpx;
}
</style>
