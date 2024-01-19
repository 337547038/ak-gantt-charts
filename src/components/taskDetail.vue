<template>
<div class="gantt-task-detail" :style="{height:minHeight+'px'}">
  <div class="g-empty-data" v-if="!taskList.length" :style="getEmptyDataStyle">该成员暂无规则时间的事项</div>
  <template v-else>
    <div class="item"
         v-for="(item,index) in taskList"
         :key="index"
         :style="item.style"
         :class="{active:index===activeIndex,'status-complete':item.progress===100,'status-over':item.delayEndDate}"
         @click.stop="taskItemClick(index)"
         @mousedown.stop="moveMousedown('all',$event)">
      <span class="g-drag-left" @mousedown.stop="moveMousedown('left',$event)"></span>
      <div class="g-name" :title="item.title">{{ item.title }}</div>
      <span class="g-drag-right" @mousedown.stop="moveMousedown('right',$event)"></span>
      <div class="g-progress">
        <span :style="{width:item.progress+'%'}"><i>{{ item.progress }}%</i></span>
      </div>
      <span class="g-show-detail" @click.stop="emits('showDetailClick',item)">详情</span>
      <span class="g-over-bg" :style="getOverWidth(item)"></span>
    </div>
  </template>
</div>
</template>
<script setup lang="ts">
import {computed, inject, ref, onMounted, onBeforeUnmount} from 'vue'
import {formatStringDate, getNewDay} from "./utils";

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
const emits = defineEmits<{
  (e: 'change', val: any): void
  (e: 'showDetailClick', val: any): void
}>()

const propsComm = inject("propsComm") || {}
const detailHeight = 40 //任务条默认高度
const detailHeightPx = computed(() => {
  return detailHeight + 'px'
})
const moveFlag = ref(false)
const activeIndex = ref(-1) //当前选中激活的项，只有先选中激活才能拖动操作
const moveX = ref({}) //移动的距离
const moveW = ref({}) //移动的距离

const dateRange = computed(() => {
  return propsComm.dateRange.value || []
})
const taskList = computed(() => {
  const temp: any = []
  const itemList: any = []
  const propsWidth = propsComm.width.value
  props.list.forEach((item: any, index: number) => {
    const offsetUnit = currentDateIndex(item.startDate)
    const left = propsWidth * offsetUnit + (moveX.value[index] || 0)
    //结束时间到了但进度还没有到100，则自动延长结束时间
    const beforeToday = new Date(item.endDate) < new Date(formatStringDate(new Date()))
    if (item.progress < 100 && beforeToday) {
      item.delayEndDate = formatStringDate(new Date())
    } else {
      item.delayEndDate = ''
    }
    const betweenDay = daysBetweenDates(item.startDate, item.endDate)
    const width = betweenDay * propsWidth + (moveW.value[index] || 0)
    const top = isOverlap(itemList, {x: left, y: 0, width: width})
    temp.push({
      style: {
        transform: `translateX(${left}px)`,
        width: `${width}px`, // 这个有可能是开始和自动延长时间之间的宽
        top: `${top}px`
      },
      ...item
    })
    itemList.push({x: left, y: top, width: width})
  })
  return temp
})
const minHeight = computed(() => {
  let minHeight = 0 // 任务列表最小高度
  taskList.value.forEach((item: any) => {
    const top = parseInt(item.style.top)
    if (top > minHeight) {
      minHeight = top
    }
  })
  return minHeight + detailHeight + 10
})

const getEmptyDataStyle = computed(() => {
  return {
    transform: `translateX(${(propsComm.width.value + 1) * propsComm.offsetUnit.value}px)`,
  }
})

const taskItemClick = (index: number) => {
  activeIndex.value = index
}
//取消选中激活项
const documentClick = () => {
  activeIndex.value = -1
}
/**
 * 拖动改变开始和结束时间
 * @param direction 左右按钮
 * @param evt
 */
const moveMousedown = (direction: string, evt: MouseEvent) => {
  if (activeIndex.value === -1) {
    return
  }
  moveFlag.value = true
  const startX = evt.pageX
  let moveDirection = 0 // 大于0向右，小于0向左
  document.onmousemove = (evt: MouseEvent) => {
    if (!moveFlag.value) {
      return
    }
    //move大于0时往右移动
    const move = evt.pageX - startX
    moveDirection = move
    if (direction === 'left') {
      moveX.value[activeIndex.value] = move
      moveW.value[activeIndex.value] = -move // 同时要改变宽
    } else if (direction === 'right') {
      moveW.value[activeIndex.value] = move // 只需改变宽即可
    } else {
      moveX.value[activeIndex.value] = move
    }
  }
  document.onmouseup = () => {
    //移动的单位宽
    let unitWith = Math.ceil(Math.abs(moveX.value[activeIndex.value]) / propsComm.width.value)
    if (direction === 'right') {
      unitWith = Math.ceil(Math.abs(moveW.value[activeIndex.value]) / propsComm.width.value)
    }
    if (unitWith) {
      let changeStartDate: Date
      let changeEndDate: Date
      const {startDate, endDate} = taskList.value[activeIndex.value]// 当前移动项的开始结束时间
      if (moveDirection > 0) {
        //向右移动
        changeStartDate = getNewDay(startDate, unitWith)
        changeEndDate = getNewDay(endDate, unitWith)
      } else {
        //向左移动,时间往前了，需减
        changeStartDate = getNewDay(startDate, -unitWith)
        changeEndDate = getNewDay(endDate, -unitWith)
      }
      let params: any = {index: activeIndex.value}
      if (direction === 'all') {
        //整条移动时改变开始和结束时间
        params.startDate = formatStringDate(changeStartDate)
        params.endDate = formatStringDate(changeEndDate)
      } else if (direction === 'left') {
        //往左移动，改变开始时间
        params.startDate = formatStringDate(changeStartDate)
      } else if (direction === 'right') {
        params.endDate = formatStringDate(changeEndDate)
      }
      //console.log(params)
      emits('change', params)
    }
    moveFlag.value = false
    moveX.value = {}
    moveW.value = {}
  }
}

/**
 * 返回开始和超时自动延伸的宽
 * @param obj
 */
const getOverWidth = (obj: any) => {
  if (!obj.delayEndDate) { //没有延
    return null
  }
  const betweenDay = daysBetweenDates(obj.startDate, obj.delayEndDate)
  return {width: `${betweenDay * propsComm.width.value}px`}
}

/**
 * 判断当前矩形是否和已存在的矩形存在重叠,返回不重叠的y轴位置
 * @param rectList
 * @param rect2
 */
const isOverlap = (rectList: any, rect2: any) => {
  for (const rect of rectList) {
    if (doRectanglesOverlap(rect, rect2)) {
      //console.log(`矩形重叠!`);
      //改变rect2 y的值重新检查，直到不重叠
      rect2.y = rect2.y + detailHeight + 10 //每个矩形设定为高30，下边距10
      isOverlap(rectList, rect2)
      break;  // 如果找到一个重叠的矩形，就不需要再检查其他矩形了
    }
  }
  return rect2.y
}

/**
 * 判断两个矩形是否重叠
 * @param rect1
 * @param rect2
 */
const doRectanglesOverlap = (rect1: any, rect2: any) => {
  // 假设rect1的左上角是(rect1.x, rect1.y)，右下角是(rect1.x + rect1.width, rect1.y + rect1.height)
  // 假设rect2的左上角是(rect2.x, rect2.y)，右下角是(rect2.x + rect2.width, rect2.y + rect2.height)

  // 检查rect1的右边界是否在rect2的左边界左侧，以及rect1的下边界是否在rect2的上边界上侧
  if (rect1.x + rect1.width <= rect2.x || rect1.y + detailHeight <= rect2.y) {
    return false; // 不重叠
  }

  // 检查rect2的右边界是否在rect1的左边界左侧，以及rect2的下边界是否在rect1的上边界上侧
  return !(rect2.x + rect2.width <= rect1.x || rect2.y + detailHeight <= rect1.y);
}

/**
 * 返回当前任务开始时间所偏移的位置
 * @param current 当前开始时间
 */
const currentDateIndex = (current: string) => {
  let i = -1
  const currentDate = new Date(current)
  dateRange.value.forEach((date: Date, index: number) => {
    if (date.getMonth() === currentDate.getMonth() && date.getDate() === currentDate.getDate()) {
      i = index
    }
  })
  return i
}

/**
 * 计算两个日期相差多少天
 * @param date1
 * @param date2
 */
const daysBetweenDates = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
}

defineExpose({minHeight})

onMounted(() => {
  document.addEventListener('click', documentClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', documentClick)
})
</script>
<style lang="scss">
.gantt-task-detail {
  margin-top: 10px;
  position: relative;
  border-bottom: 1px solid #f7f8fa;
  padding-bottom: 10px;

  .item {
    height: v-bind(detailHeightPx);
    border-radius: 4px;
    background: #bbdefb;
    margin-bottom: 10px;
    position: absolute;
    z-index: 2;
    box-sizing: border-box;
    border: 1px solid #a5d3fa;

    &.status-complete {
      border-color: #dfe4e9;
      background: #dfe4e9;
    }

    &.status-over {
      background: #f6afbc;
      border-color: #e8889b;
      .g-over-bg{background: #f9c1ca;position: absolute;left: 0;border-radius: 4px;top:0;height: 100%}
    }

    &.active {
      border-color: #e6a23c;
      cursor: move;

      .g-drag-left, .g-drag-right {
        &:after {
          display: block
        }
      }

      .g-drag-right {
        cursor: e-resize;
        right: -20px
      }

      .g-drag-left {
        cursor: w-resize;
        left: -20px
      }
    }
  }

  .g-name {
    position: relative;
    z-index: 5;
    color: #333;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 100%;
    padding: 5px 20px 0 10px;
  }

  .g-drag-left, .g-drag-right {
    position: absolute;
    top: 0;
    width: 24px;
    height: 100%;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;

    &:after {
      content: '';
      border: 2px solid #999;
      border-radius: 50%;
      width: 12px;
      height: 12px;
      display: none;
    }
  }

  .g-progress {
    position: absolute;
    left: 2px;
    bottom: 2px;
    background: #f5f5f5;
    height: 6px;
    border-radius: 4px;
    z-index: 15;
    width: calc(100% - 4px);

    span {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      border-radius: 4px;
      background: #0071eb
    }

    i {
      font-size: 12px;
      font-style: normal;
      position: absolute;
      right: 0;
      top: -3px;
      display: none
    }
  }

  .g-show-detail {
    position: absolute;
    font-size: 12px;
    right: 5px;
    color: #fff;
    z-index: 10;
    top: 7px
  }

  .g-empty-data {
    position: relative;
    z-index: 30;
    background: #fff;
    display: inline-block
  }
}
</style>
