<template>
  <view class="room-page">

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-search">
        <view class="filter-search-icon">🔍</view>
        <input
          class="filter-search-input"
          v-model="searchKeyword"
          placeholder="搜索房间、楼栋..."
          placeholder-class="filter-search-placeholder"
        />
      </view>
      <view class="filter-tags">
        <view
          v-for="s in statusFilters"
          :key="s.value"
          class="filter-tag"
          :class="{ 'filter-tag--active': activeStatus === s.value }"
          @click="activeStatus = s.value"
        >
          {{ s.label }}
        </view>
      </view>
    </view>

    <!-- 汇总条 -->
    <view class="summary-bar">
      <view class="summary-item" v-for="s in summaryStats" :key="s.label">
        <view class="summary-dot" :style="{ background: s.color }"/>
        <view class="summary-label">{{ s.label }}</view>
        <view class="summary-count">{{ s.count }}</view>
      </view>
    </view>

    <!-- 房间列表 -->
    <view class="room-list">
      <view v-if="filteredRooms.length === 0" class="empty-state">
        <view class="empty-icon">🏠</view>
        <view class="empty-text">暂无房源</view>
        <view class="empty-sub">当前筛选条件下没有房间</view>
      </view>

      <view
        v-for="item in filteredRooms"
        :key="item.roomId"
        class="room-card"
        @click="goRoomDetail(item)"
      >
        <!-- 卡片顶部：房号 + 状态 -->
        <view class="room-card-header">
          <view class="room-number-wrap">
            <view class="room-icon">🏠</view>
            <view class="room-number">{{ item.roomNumber || item.doorNumber || '-' }}</view>
          </view>
          <view
            class="room-status-tag"
            :style="{
              background: statusBgMap[item.occupancyStatus || 0],
              color: statusColorMap[item.occupancyStatus || 0]
            }"
          >
            {{ item.occupancyStatusName || formatStatus(item.occupancyStatus) }}
          </view>
        </view>

        <!-- 房源名称 -->
        <view class="room-house-name">{{ item.houseName || item.communityName || '-' }}</view>

        <!-- 详情信息网格 -->
        <view class="room-info-grid">
          <view class="room-info-item">
            <view class="room-info-label">楼栋</view>
            <view class="room-info-value">{{ item.building || '-' }}栋{{
                item.unit ? ' ' + item.unit + '单元' : ''
              }}
            </view>
          </view>
          <view class="room-info-item">
            <view class="room-info-label">楼层</view>
            <view class="room-info-value">{{ item.floor != null ? item.floor + 'F' : '-' }}</view>
          </view>
          <view class="room-info-item">
            <view class="room-info-label">面积</view>
            <view class="room-info-value">{{ item.area != null ? item.area + '㎡' : '-' }}</view>
          </view>
          <view class="room-info-item">
            <view class="room-info-label">朝向</view>
            <view class="room-info-value">{{ item.direction || '-' }}</view>
          </view>
        </view>

        <!-- 分割线 -->
        <view class="room-divider"/>

        <!-- 底部：租金 + 租客 -->
        <view class="room-card-footer">
          <view class="room-price-wrap">
            <view class="room-price">
              <view class="room-price-symbol">¥</view>
              <view class="room-price-value">{{ item.price != null ? item.price : '--' }}</view>
              <view class="room-price-unit">/月</view>
            </view>
          </view>
          <view class="room-tenant" v-if="item.leaseInfo?.tenantName">
            <view class="room-tenant-avatar">{{ item.leaseInfo.tenantName.slice(0, 1) }}</view>
            <view class="room-tenant-name">{{ item.leaseInfo.tenantName }}</view>
          </view>
          <view class="room-vacant-label" v-else-if="item.occupancyStatus !== 1">
            <view class="room-vacant-text">待出租</view>
          </view>
        </view>

        <!-- 锁定标记 -->
        <view v-if="item.locked" class="room-locked-badge">🔒 已锁定</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {ref, computed} from 'vue'
import Taro, {useDidShow} from '@tarojs/taro'
import {getRoomList, RoomListVo} from '@/api/room'
import {ensureLoggedIn} from '@/services/auth'

const rooms = ref<RoomListVo[]>([])
const leaseMode = ref<number | undefined>(undefined)
const activeStatus = ref<number | null>(null)
const searchKeyword = ref('')

const statusFilters = [
  {label: '全部', value: null},
  {label: '空置', value: 1},
  {label: '在租', value: 2},
  {label: '预定', value: 3},
  {label: '锁定', value: 4},
]

const statusBgMap: Record<number, string> = {
  0: '#f3f4f6',
  1: '#f0fdf4',
  2: '#eff6ff',
  3: '#fffbeb',
  4: '#fef2f2',
}

const statusColorMap: Record<number, string> = {
  0: '#9ca3af',
  1: '#22c55e',
  2: '#3478f6',
  3: '#f59e0b',
  4: '#ef4444',
}

const filteredRooms = computed(() => {
  let list = rooms.value
  if (activeStatus.value !== null) {
    list = list.filter(r => r.occupancyStatus === activeStatus.value)
  }
  const kw = searchKeyword.value.toLowerCase()
  if (kw) {
    list = list.filter(r =>
      (r.roomNumber || '').toLowerCase().includes(kw) ||
      (r.houseName || '').toLowerCase().includes(kw) ||
      (r.building || '').toLowerCase().includes(kw) ||
      (r.doorNumber || '').toLowerCase().includes(kw)
    )
  }
  return list
})

const summaryStats = computed(() => {
  const all = rooms.value
  return [
    {label: '全部', count: all.length, color: '#6b7280'},
    {label: '空置', count: all.filter(r => r.occupancyStatus === 1).length, color: '#22c55e'},
    {label: '在租', count: all.filter(r => r.occupancyStatus === 2).length, color: '#3478f6'},
    {label: '预定', count: all.filter(r => r.occupancyStatus === 3).length, color: '#f59e0b'},
  ]
})

useDidShow(async () => {
  ensureLoggedIn()
  const params = Taro.getCurrentInstance().router?.params || {}
  const modeParam = params.leaseMode ? Number(params.leaseMode) : undefined
  leaseMode.value = Number.isNaN(modeParam) ? undefined : modeParam
  const res = await getRoomList({currentPage: 1, pageSize: 100, leaseMode: leaseMode.value})
  if (res.code === 0) {
    rooms.value = res.data?.list || []
  }
})

function formatStatus(status?: number) {
  const map: Record<number, string> = {1: '空置', 2: '在租', 3: '预定', 4: '锁定'}
  return map[status || 0] || '未知'
}

function goRoomDetail(item: RoomListVo) {
  // 预留：跳转房间详情
}
</script>

<style>
.room-page {
  min-height: 100vh;
  background: #f0f2f5;
  padding-bottom: 160rpx;
}

/* ===== 筛选栏 ===== */
.filter-bar {
  background: #fff;
  padding: 20rpx 24rpx 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.filter-search {
  display: flex;
  align-items: center;
  background: #f3f4f6;
  border-radius: 20rpx;
  padding: 14rpx 20rpx;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.filter-search-icon {
  font-size: 26rpx;
  opacity: 0.5;
  flex-shrink: 0;
}

.filter-search-input {
  flex: 1;
  font-size: 26rpx;
  color: #111827;
  height: 38rpx;
  background: transparent;
}

.filter-search-placeholder {
  color: #c0c9d6;
  font-size: 26rpx;
}

.filter-tags {
  display: flex;
  gap: 12rpx;
  overflow-x: auto;
  padding-bottom: 4rpx;
}

.filter-tag {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 999rpx;
  padding: 10rpx 24rpx;
  font-weight: 500;
  border: 2rpx solid transparent;
}

.filter-tag--active {
  background: #eff6ff;
  color: #3478f6;
  border-color: #bfdbfe;
  font-weight: 700;
}

/* ===== 汇总条 ===== */
.summary-bar {
  display: flex;
  background: #fff;
  margin-bottom: 0;
  padding: 16rpx 24rpx;
  border-top: 1rpx solid #f1f5f9;
  gap: 0;
}

.summary-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.summary-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.summary-label {
  font-size: 22rpx;
  color: #6b7280;
}

.summary-count {
  font-size: 22rpx;
  font-weight: 700;
  color: #111827;
}

/* ===== 列表 ===== */
.room-list {
  padding: 20rpx 24rpx;
}

/* ===== 房间卡片 ===== */
.room-card {
  position: relative;
  background: #fff;
  border-radius: 22rpx;
  padding: 26rpx 24rpx 22rpx;
  margin-bottom: 18rpx;
  box-shadow: 0 3rpx 14rpx rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.room-card:active {
  opacity: 0.88;
}

.room-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.room-number-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.room-icon {
  font-size: 28rpx;
  line-height: 1;
}

.room-number {
  font-size: 34rpx;
  font-weight: 800;
  color: #111827;
}

.room-status-tag {
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
}

.room-house-name {
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 18rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.room-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8rpx 0;
  margin-bottom: 18rpx;
}

.room-info-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.room-info-label {
  font-size: 20rpx;
  color: #9ca3af;
}

.room-info-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #374151;
}

.room-divider {
  height: 1rpx;
  background: #f1f5f9;
  margin-bottom: 16rpx;
}

.room-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.room-price-wrap {
}

.room-price {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.room-price-symbol {
  font-size: 22rpx;
  color: #f97316;
  font-weight: 700;
}

.room-price-value {
  font-size: 40rpx;
  font-weight: 800;
  color: #f97316;
  line-height: 1;
}

.room-price-unit {
  font-size: 22rpx;
  color: #9ca3af;
}

.room-tenant {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.room-tenant-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #3478f6, #5b9aff);
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.room-tenant-name {
  font-size: 24rpx;
  color: #374151;
  font-weight: 500;
}

.room-vacant-label {
}

.room-vacant-text {
  font-size: 22rpx;
  color: #22c55e;
  font-weight: 600;
  background: #f0fdf4;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}

.room-locked-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  font-size: 20rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-bottom-left-radius: 16rpx;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0 60rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
  opacity: 0.4;
}

.empty-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #374151;
  margin-bottom: 10rpx;
}

.empty-sub {
  font-size: 24rpx;
  color: #9ca3af;
}
</style>
