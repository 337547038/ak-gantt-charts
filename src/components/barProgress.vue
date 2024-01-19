<template>
<div class="g-bar-progress">
  <div class="item" v-for="(item,index) in dateRange" :key="index" :class="{'g-is-full':getProgress(item)>=10}">
    <span class="g-text" v-if="getProgress(item)"> {{ getProgress(item) }}</span>
    <span class="g-bar" :style="getBarStyle(item)"></span>
  </div>
</div>
</template>
<script setup lang="ts">
import {computed, inject} from "vue";
import {formatStringDate} from "./utils";

const props = withDefaults(
    defineProps<{
      list: any
    }>(),
    {
      list: () => {
        return []
      }
    }
)

const propsComm = inject("propsComm") || {}
const dateRange = computed(() => {
  return propsComm.dateRange.value
})
const getProgress = (date: Date) => {
  return props.list[formatStringDate(date)]
}
const getBarStyle = (date: Date) => {
  //最高为10，
  const val = getProgress(date)
  if (val) {
    return {
      height: `${val / 10 * 100}%`
    }
  }
  return null
}
</script>
<style lang="scss">
.g-bar-progress {
  height: 50px;
  display: flex;
  z-index: 2;
  position: relative;
  border-bottom: 1px solid #f7f8fa;

  .item {
    flex: 2;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-left: 1px solid #f7f8fa;
    .g-text {position: relative;z-index: 2}

    .g-bar {
      display: block;
      width: 100%;
      position: absolute;
      left: 0;
      bottom: 0;
      //background: #e4e8eb
      background: linear-gradient(to top, #e4e8eb, #ffdee5);
    }
  }
  .g-is-full {
    color: #a43f4f;
    font-weight: 700;
    .g-bar {background: #ffdee5;}
  }
}
</style>