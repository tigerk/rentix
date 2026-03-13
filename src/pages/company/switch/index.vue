<template>
  <view class="container">
    <view class="card">
      <view class="section-title">选择要切换的公司</view>
      <view v-if="companies.length" class="company-list">
        <view
          v-for="item in companies"
          :key="item.companyId"
          class="company-item"
          :class="{ active: item.companyId === user?.curCompanyId }"
          @click="handleCompanySwitch(item)"
        >
          <view class="company-avatar">{{ (item.companyName || '企').slice(0, 1) }}</view>
          <view class="company-info">
            <view class="company-name">{{ item.companyName || item.companyId }}</view>
            <view class="company-id">ID：{{ item.companyId }}</view>
          </view>
          <view v-if="item.companyId === user?.curCompanyId" class="company-tag">当前</view>
        </view>
      </view>
      <view v-else class="company-empty">暂无可切换公司</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro, { useDidShow } from '@tarojs/taro'
import { computed, ref } from 'vue'
import { switchCompany } from '@/api/auth'
import { ensureLoggedIn } from '@/services/auth'
import { getUser, setToken, setUser, UserInfo } from '@/services/storage'

const user = ref<UserInfo | null>(null)
const switchingId = ref<number | null>(null)

useDidShow(() => {
  ensureLoggedIn()
  user.value = getUser()
})

const companies = computed(() => {
  return user.value?.companyList || []
})

async function handleCompanySwitch(item: any) {
  if (!item?.companyId) return
  if (item.companyId === user.value?.curCompanyId) return
  if (switchingId.value) return
  switchingId.value = item.companyId
  try {
    const res = await switchCompany(item.companyId)
    if (res.code === 0) {
      setToken(res.data.accessToken)
      setUser(res.data)
      user.value = res.data
      Taro.showToast({ title: '正在切换公司', icon: 'none' })
      Taro.reLaunch({ url: '/pages/home/index' })
      return
    }
    Taro.showToast({ title: res.message || '切换失败', icon: 'none' })
  } catch {
    Taro.showToast({ title: '切换失败', icon: 'none' })
  } finally {
    switchingId.value = null
  }
}
</script>

<style scoped>
.company-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.company-item {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 16rpx;
  border-radius: 14rpx;
  background: #f9fafb;
}

.company-item.active {
  background: #e8edff;
}

.company-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 18rpx;
  background: #1f6feb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
}

.company-info {
  flex: 1;
  display: grid;
  gap: 6rpx;
}

.company-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.company-id {
  font-size: 22rpx;
  color: #94a3b8;
}

.company-tag {
  font-size: 22rpx;
  color: #1f6feb;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #dbe4ff;
}

.company-empty {
  font-size: 24rpx;
  color: #9ca3af;
}
</style>
