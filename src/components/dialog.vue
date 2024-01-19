<template>
<div class="g-task-detail-dialog" :style="style">
  <p>PN-R895</p>
  <h3>客户反馈小票打印机连接不上网络</h3>
  <ul>
    <li><span>状态</span>未开始</li>
    <li><span>进度</span>50%</li>
    <li><span>周期</span>2021/03/24-2021/04/18</li>
    <li><span>所属项目</span>项目协同项目</li>
  </ul>
</div>
</template>
<script setup lang="ts">
import {ref, computed} from 'vue'

const props = withDefaults(
    defineProps<{
      data: any
    }>(),
    {
      data: () => {
        return []
      }
    }
)
const style = computed(() => {
  const {transform, top = 0} = props.data.style || {}
  return {
    transform: transform,
    top: parseInt(top) + 160 + 'px'
  }
})
</script>
<style lang="scss">
.g-task-detail-dialog {position: absolute;background: #fff;padding: 20px;box-shadow: 2px 2px 8px #f2f3f5;z-index: 20;line-height: 25px}
</style>
