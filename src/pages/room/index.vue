<template>
  <view class="container">
    <view class="list-card" v-for="item in rooms" :key="item.id">
      <view class="list-row">
        <view class="list-title">{{ item.roomNo || item.name || '房间' }}</view>
        <view class="list-status">{{ formatStatus(item.status) }}</view>
      </view>
      <view class="list-meta">项目：{{ item.houseName || '-' }}</view>
      <view class="list-meta">租金：{{ item.rentPrice ? item.rentPrice + ' 元' : '-' }}</view>
    </view>

    <view v-if="rooms.length === 0" class="empty">暂无房源</view>
  </view>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import Taro, {useDidShow} from '@tarojs/taro'
import {getRoomList, RoomListVo} from '@/api/room'
import {ensureLoggedIn} from '@/services/auth'

const rooms = ref<RoomListVo[]>([])
const leaseMode = ref<number | undefined>(undefined)

useDidShow(async () => {
  ensureLoggedIn()
  const params = Taro.getCurrentInstance().router?.params || {}
  const modeParam = params.leaseMode ? Number(params.leaseMode) : undefined
  leaseMode.value = Number.isNaN(modeParam) ? undefined : modeParam
  const res = await getRoomList({currentPage: 1, pageSize: 20, leaseMode: leaseMode.value})
  if (res.code === 0) {
    rooms.value = res.data?.list || []
  }
})

function formatStatus(status?: number) {
  if (status === 1) return '空置'
  if (status === 2) return '已租'
  if (status === 3) return '锁定'
  return '未知'
}
</script>
