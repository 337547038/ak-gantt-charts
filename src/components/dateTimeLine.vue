<template>
<div class="gantt-header" ref="el">
  <div
      class="g-date"
      v-for="(item, index) in dateRange"
      :key="item.getTime()"
      :class="{'g-is-today':getIsToday(item)}"
  >
    <span class="g-month">{{ getMonth(item, index) }}</span>
    <div class="g-day-date">
        <span>{{ dict.day[item.getDay()] }}</span
        >{{ item.getDate().toString().padStart(2, '0') }}
    </div>
    <span class="g-bg-line" :style="getShowBg(item)"></span>
  </div>
</div>
<div class="g-today-line" v-if="showTodayLine.visible" :style="showTodayLine.style"></div>
</template>
<script setup lang="ts">
import {computed, inject, onBeforeUnmount, onMounted, ref} from 'vue'
import {formatStringDate} from "./utils";

const props = withDefaults(
    defineProps<{}>(),
    {}
)
const emits = defineEmits<{
  (e: 'changeWidth', width: number): void
}>()
const el = ref()
const propsComm = inject("propsComm") || {}
const dateRange = computed(() => {
  return propsComm.dateRange.value
})
const dict: any = {
  day: {0: '日', 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六'},
  month: {
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六',
    7: '七',
    8: '八',
    9: '九',
    10: '十',
    11: '十一',
    12: '十二'
  }
}

/**
 * 每月1号和显示区域的第一个显示月份，由拖动时存在显示不全的情况，这里offsetUint往右加一个单位，以保证不会被遮挡
 * @param date
 * @param index
 */
const getMonth = (date: Date, index: number) => {
  if (index === (propsComm.offsetUnit.value + 1) || date.getDate() === 1) {
    return dict.month[date.getMonth() + 1] + '月'
  }
}
const getIsToday = (date: Date) => {
  const current = new Date()
  return formatStringDate(date) === formatStringDate(current)
}
/**
 * 显示今天垂直线
 * @param date
 */
const showTodayLine = computed(() => {
  let has = false
  let i = -1
  dateRange.value.forEach((date: Date, index: number) => {
    if (getIsToday(date)) {
      has = true
      i = index
    }
  })
  const style = {left: (i * propsComm.width.value + propsComm.width.value/2) + 'px', position: 'absolute'}
  return {visible: has, style: style}
})

/**
 * 默认显示背景色，周六日休息日添加背景
 * @param date
 */
const getShowBg = (date: Date) => {
  const showList = [0,6]
  if (showList.includes(date.getDay())) {
    return {background: 'rgba(247,248,250,0.4)'}
  }
}
/**
 * 鼠标滚轮事件
 * @param event
 */
const wheelEvent = (event: any) => {
  let scaleWidth = propsComm.width.value
  if (event.deltaY < 0) {
    if (scaleWidth < 100) {
      scaleWidth += 1
    }
  } else {
    //设定一个最小值
    if (scaleWidth > 44) {
      scaleWidth -= 1
    }
  }
  emits('changeWidth', scaleWidth)
  event.preventDefault();
}
onMounted(() => {
  el.value.addEventListener('wheel', wheelEvent, {passive: false})
})
onBeforeUnmount(() => {
  if (el.value) {
    el.value.removeEventListener('wheel', wheelEvent)
  }
})
</script>
<style lang="scss">
.gantt-header {
  display: flex;
  height: 60px;
  box-shadow: 0 12px 10px -10px rgba(0, 0, 0, .1);
  padding: 8px 0;
  font-size: 14px;
  position: relative;

  .g-date {
    user-select: none;
    flex: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    position: relative;

    .g-month {
      white-space: nowrap;
      color: #0f74fa;
    }

    &:hover {
      color: red;

      .g-bg-line {
        background: #f7f8fa;
      }

      .g-day-date span {
        color: red !important;
      }
    }
  }

  .g-is-today {
    .g-day-date {
      background: #ff7f6e;
      color: #fff;

      span {
        color: rgba(255, 255, 255, .8)
      }
    }
  }

  .g-day-date {
    border-radius: 20px;
    padding: 2px 5px;
    display: flex;

    span {
      color: #999;
      padding-right: 2px;
    }
  }
}

.g-today-line {
  z-index: 3;
  height: 100%;
  top: 0;
  border-left: 2px solid #ff7f6e;
  transform: translateX(25px);
}

.g-bg-line {
  z-index: 1;
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  border-left: 1px solid #f7f8fa;
  width: 100%;
  height: 1000px;
  transition: all .3s;

  &:hover {
    background: #f7f8fa;
  }
}
</style>
