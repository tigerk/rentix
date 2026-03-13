<template>
  <view class="index">
    呵呵呵呵
  </view>
</template>

<script setup>
import Taro from '@tarojs/taro'
const onClick = () => {
  Taro.showToast({
    title: '你成功了',
    icon: 'none',
    duration: 2000
  })
}
</script>
