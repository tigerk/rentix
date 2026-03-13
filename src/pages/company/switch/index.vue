<template>
  <view class="page">

    <!-- 顶部说明 -->
    <view class="header-tip">
      <view class="tip-icon-wrap">
        <view class="tip-icon">⇄</view>
      </view>
      <view class="tip-body">
        <view class="tip-title">切换公司</view>
        <view class="tip-sub">选择要进入的企业工作台</view>
      </view>
    </view>

    <!-- 公司列表 -->
    <view class="list-wrap" v-if="companies.length">
      <view
        v-for="item in companies"
        :key="item.companyId"
        class="company-card"
        :class="{ 'company-card--active': item.companyId === user?.curCompanyId }"
        @click="handleCompanySwitch(item)"
      >
        <!-- 左侧 Avatar -->
        <view class="company-avatar" :class="{ 'company-avatar--active': item.companyId === user?.curCompanyId }">
          <view class="company-avatar-text">{{ (item.companyName || '企').slice(0, 1) }}</view>
        </view>

        <!-- 中间信息 -->
        <view class="company-body">
          <view class="company-name">{{ item.companyName || item.companyId }}</view>
          <view class="company-id-text">ID · {{ item.companyId }}</view>
        </view>

        <!-- 右侧状态 -->
        <view class="company-right">
          <view v-if="item.companyId === user?.curCompanyId" class="current-badge">
            <view class="current-dot"/>
            <view class="current-text">当前</view>
          </view>
          <view v-else class="switch-arrow">›</view>
        </view>

        <!-- 当前公司高亮边框装饰 -->
        <view v-if="item.companyId === user?.curCompanyId" class="active-bar"/>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-wrap">
      <view class="empty-icon">🏢</view>
      <view class="empty-text">暂无可切换的公司</view>
      <view class="empty-sub">请联系管理员为您分配企业权限</view>
    </view>

  </view>
</template>

<script setup lang="ts">
import Taro, {useDidShow} from '@tarojs/taro'
import {computed, ref} from 'vue'
import {switchCompany} from '@/api/auth'
import {ensureLoggedIn} from '@/services/auth'
import {getUser, setToken, setUser, UserInfo} from '@/services/storage'

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
      Taro.showToast({title: '切换成功', icon: 'success'})
      setTimeout(() => Taro.reLaunch({url: '/pages/home/index'}), 1200)
      return
    }
    Taro.showToast({title: res.message || '切换失败', icon: 'none'})
  } catch {
    Taro.showToast({title: '切换失败', icon: 'none'})
  } finally {
    switchingId.value = null
  }
}
</script>

<style>
.page {
  min-height: 100vh;
  background-color: #f2f4f7;
  padding: 24rpx;
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
}

/* ===== 顶部说明 ===== */
.header-tip {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: linear-gradient(135deg, #1a56db 0%, #3478f6 60%, #5b9aff 100%);
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 28rpx rgba(52, 120, 246, 0.3);
}

.tip-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-icon {
  font-size: 36rpx;
  color: #ffffff;
  line-height: 1;
}

.tip-body {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.tip-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1rpx;
}

.tip-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.75);
}

/* ===== 公司列表 ===== */
.list-wrap {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.company-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(15, 23, 42, 0.06);
  border: 2rpx solid transparent;
  overflow: hidden;
}

.company-card:active {
  opacity: 0.88;
}

.company-card--active {
  border-color: #3478f6;
  background: linear-gradient(135deg, #f0f5ff 0%, #f8fbff 100%);
  box-shadow: 0 4rpx 24rpx rgba(52, 120, 246, 0.14);
}

/* 当前公司左侧高亮竖条 */
.active-bar {
  position: absolute;
  left: 0;
  top: 16rpx;
  bottom: 16rpx;
  width: 6rpx;
  border-radius: 0 4rpx 4rpx 0;
  background: linear-gradient(180deg, #3478f6, #5b9aff);
}

/* Avatar */
.company-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #e8edff, #dbe4ff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.company-avatar--active {
  background: linear-gradient(135deg, #3478f6, #5b9aff);
  box-shadow: 0 6rpx 18rpx rgba(52, 120, 246, 0.35);
}

.company-avatar-text {
  font-size: 34rpx;
  font-weight: 700;
  color: #3478f6;
  line-height: 1;
}

.company-avatar--active .company-avatar-text {
  color: #ffffff;
}

/* 公司信息 */
.company-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.company-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #111827;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.company-card--active .company-name {
  color: #1a56db;
}

.company-id-text {
  font-size: 22rpx;
  color: #94a3b8;
  letter-spacing: 0.5rpx;
}

/* 右侧状态 */
.company-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.current-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #eff6ff;
  border: 1rpx solid #bfdbfe;
  border-radius: 999rpx;
  padding: 8rpx 18rpx;
}

.current-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #3478f6;
}

.current-text {
  font-size: 22rpx;
  color: #3478f6;
  font-weight: 600;
}

.switch-arrow {
  font-size: 44rpx;
  color: #c5ccd6;
  line-height: 1;
}

/* ===== 空状态 ===== */
.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10rpx;
}

.empty-sub {
  font-size: 24rpx;
  color: #9ca3af;
}
</style>
