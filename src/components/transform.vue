<template>
<div class="transform-x" @mousedown="moveMousedown" :style="containerStyle">
  <slot></slot>
</div>
</template>
<script setup lang="ts">
import {computed, inject, ref} from 'vue'
import {getNewDay} from "./utils";

const moveFlag = ref(false)
const moveX = ref(0)
const emits = defineEmits<{
  (e: 'change', date: Date): void
  (e: 'update:modelValue', date: Date): void
}>()
const props = withDefaults(
    defineProps<{
      modelValue?: Date //中间点位置时间
    }>(),
    {
      modelValue: () => {
        return new Date()
      }
    }
)
const propsComm = inject("propsComm") || {}
const containerStyle = computed(() => {
  const width = propsComm.width.value
  return {
    width: width * propsComm.dateRange.value.length + 'px',
    transform: `translateX(${moveX.value - width * propsComm.offsetUnit.value}px)`,
    userSelect: 'none',
    position: 'relative'
  }
})
const moveMousedown = (evt: MouseEvent) => {
  moveFlag.value = true
  const startX = evt.pageX - moveX.value
  document.onmousemove = (evt: MouseEvent) => {
    if (!moveFlag.value) {
      return
    }
    moveX.value = evt.pageX - startX
  }
  document.onmouseup = () => {
    moveFlag.value = false
    //根据拖动的位置算出当前基准点日期
    const width = propsComm.width.value
    const unitWith = Math.round(Math.abs(moveX.value) / width)
    let changeDate: Date
    const yu = Math.abs(moveX.value) % width
    let mx = 0
    if (moveX.value > 0) {
      //向右移动
      changeDate = getNewDay(props.modelValue, -unitWith)
      if (yu > width / 2) {
        //五入
        mx = -yu
      } else {
        mx = yu
      }
    } else {
      //向左移动
      changeDate = getNewDay(props.modelValue, unitWith)
      if (yu > width / 2) {
        //五入
        mx = yu
      } else {
        mx = -yu
      }
    }
    //有改变时才触发事件
    if (unitWith > 0) {
      emits('change', changeDate)
      emits('update:modelValue', changeDate)
    }
    moveX.value = mx
  }
}
</script>