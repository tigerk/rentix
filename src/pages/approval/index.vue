<template>
  <view class="container">
    <nut-tabs v-model="activeTab">
      <nut-tab-pane title="待办" pane-key="todo">
        <view class="list-card" v-for="item in todoList" :key="item.id">
          <view class="list-row">
            <view class="list-title">{{ item.title || item.bizType || '审批单' }}</view>
            <view class="list-status">待处理</view>
          </view>
          <view class="list-meta">创建时间：{{ item.createTime || '-' }}</view>
        </view>
        <view v-if="todoList.length === 0" class="empty">暂无待办</view>
      </nut-tab-pane>

      <nut-tab-pane title="已办" pane-key="done">
        <view class="list-card" v-for="item in doneList" :key="item.id">
          <view class="list-row">
            <view class="list-title">{{ item.title || item.bizType || '审批单' }}</view>
            <view class="list-status">已处理</view>
          </view>
          <view class="list-meta">创建时间：{{ item.createTime || '-' }}</view>
        </view>
        <view v-if="doneList.length === 0" class="empty">暂无已办</view>
      </nut-tab-pane>

      <nut-tab-pane title="我发起" pane-key="apply">
        <view class="list-card" v-for="item in applyList" :key="item.id">
          <view class="list-row">
            <view class="list-title">{{ item.title || item.bizType || '审批单' }}</view>
            <view class="list-status">已发起</view>
          </view>
          <view class="list-meta">创建时间：{{ item.createTime || '-' }}</view>
        </view>
        <view v-if="applyList.length === 0" class="empty">暂无记录</view>
      </nut-tab-pane>
    </nut-tabs>
  </view>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useDidShow} from '@tarojs/taro'
import {getTodoList, getDoneList, getApplyList, ApprovalItem} from '@/api/approval'
import {ensureLoggedIn} from '@/services/auth'

const activeTab = ref('todo')
const todoList = ref<ApprovalItem[]>([])
const doneList = ref<ApprovalItem[]>([])
const applyList = ref<ApprovalItem[]>([])

useDidShow(async () => {
  ensureLoggedIn()
  const [todoRes, doneRes, applyRes] = await Promise.all([
    getTodoList({currentPage: 1, pageSize: 20}),
    getDoneList({currentPage: 1, pageSize: 20}),
    getApplyList({currentPage: 1, pageSize: 20})
  ])
  if (todoRes.code === 0) todoList.value = todoRes.data?.list || []
  if (doneRes.code === 0) doneList.value = doneRes.data?.list || []
  if (applyRes.code === 0) applyList.value = applyRes.data?.list || []
})
</script>
