<template>
  <view class="container">
    <view class="card">
      <view class="section-title">个人信息</view>
      <view class="avatar-line">
        <view class="avatar-wrap">
          <image v-if="form.avatar" class="avatar-img" :src="form.avatar" mode="aspectFill" />
          <view v-else class="avatar-fallback">{{ initials }}</view>
        </view>
        <view class="avatar-text">头像来自登录信息</view>
      </view>

      <view class="form-item">
        <view class="label">昵称</view>
        <input class="input" v-model="form.nickname" placeholder="请输入昵称" />
      </view>

      <view class="form-item">
        <view class="label">简介</view>
        <textarea class="textarea" v-model="form.remark" placeholder="请输入简介" maxlength="250" />
      </view>

      <nut-button type="primary" block class="submit-btn" :loading="saving" @click="handleSave">保存</nut-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, reactive, ref } from 'vue'
import { getUserProfile, updateUserProfile } from '@/api/auth'
import { ensureLoggedIn } from '@/services/auth'
import { getUser, setUser } from '@/services/storage'

const saving = ref(false)

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
  if (!form.nickname) {
    Taro.showToast({ title: '请输入昵称', icon: 'none' })
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
      setUser({ ...local, avatar: form.avatar, nickname: form.nickname })
      Taro.showToast({ title: '保存成功', icon: 'success' })
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
.avatar-line {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.avatar-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
}

.avatar-fallback {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: #1f6feb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34rpx;
  font-weight: 700;
}

.avatar-text {
  font-size: 24rpx;
  color: #94a3b8;
}

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

.textarea {
  width: 100%;
  min-height: 160rpx;
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
