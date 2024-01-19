<template>
<div class="container">
  <div class="gantt-chart" ref="ganttChartsEl">
    <div class="g-btn-prev g-transform-btn" @click="prevNextClick('prev')"><img src="../assets/arrow.svg" alt=""></div>
    <user-list
        ref="userListEl"
        @toggleClick="toggleClick"
        :list="data"
        @click="userListClick"
        :taskDetailHeight="taskDetailEl" @scroll="userListScroll"/>
    <transform v-model="currentDate" @change="getData('drag')">
      <date-time-line @changeWidth="changeWidth"/>
      <div class="g-scroll" ref="gScrollEl">
        <template v-for="(item,index) in data" :key="index">
          <bar-progress :list="item.progress"/>
          <task-detail
              :list="item.list"
              v-show="getShow(index)"
              @change="taskChange(item.list,$event)"
              @showDetailClick="showDetailClick"
              ref="taskDetailEl"/>
        </template>
      </div>
      <bar-progress :list="totalLoad"/>
      <dialog-detail :data="detailObj" v-show="detailVisible"/>
    </transform>
    <div class="g-btn-next g-transform-btn" @click="prevNextClick('next')"><img src="../assets/arrow.svg" alt=""></div>
  </div>
</div>
</template>
<script setup lang="ts">
import DateTimeLine from './dateTimeLine.vue'
import BarProgress from "./barProgress.vue"
import Transform from "./transform.vue"
import {ref, computed, provide, onMounted, nextTick, onBeforeUnmount} from 'vue'
import {formatStringDate, getNewDay} from "./utils";
import TaskDetail from "./taskDetail.vue"
import UserList from "./userList.vue"
import DialogDetail from "./dialog.vue";
import useStore from '../store'

defineOptions({name: 'ganttCharts'})
const props = withDefaults(
    defineProps<{
      width?: number//每个单元格的宽
      offsetUnit?: number// 初始偏移15个单位即15天
      data: any
    }>(),
    {
      width: 50,
      offsetUnit: 15,
      data: () => {
        return []
      }
    }
)
const emits = defineEmits<{
  (e: 'getData', startDate: string, endDate: string, expand: number[],eventType:string): void
  (e: 'updateTaskDetail', obj: any): void
  (e: 'getTaskDetail', index: number): void
  (e: 'otherEvent', type: string, obj?: any): void
}>()

const currentDate = ref(new Date())
const taskDetailEl = ref()
const ganttChartsEl = ref()
const store = useStore()
const offsetUnit = ref(props.offsetUnit)
/**
 * 默认以当前时间为基准，显示前后一个月共60天，可视范围为前后15天，不可视部分作为拖动备用
 */
const getDateRange = computed(() => {
  const unit = offsetUnit.value * 2
  const endDate = getNewDay(currentDate.value, unit)
  const startDate = getNewDay(currentDate.value, -unit)
  const dates = []
  const date = startDate
  while (date <= endDate) {
    dates.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return dates
})

// 总负荷
const totalLoad = computed(() => {
  const newProgress: any = {};
  props.data.forEach((obj: any) => {
    Object.keys(obj.progress).forEach((date) => {
      if (newProgress[date]) {
        newProgress[date] += obj.progress[date];
      } else {
        newProgress[date] = obj.progress[date];
      }
    });
  })
  return newProgress
})
const gScrollEl = ref()
const userListEl = ref()
const scaleWidth = ref(props.width)

provide('propsComm', {
  width: scaleWidth,
  offsetUnit: offsetUnit,
  dateRange: getDateRange
})
const changeWidth = (width: number) => {
  scaleWidth.value = width
}
const toggleClick = (index: number) => {
  //展开时需加载任务详情
  emits('getTaskDetail', index)
}
/**
 * 拖动时更新当前项数据
 * @param obj 当前项数据
 * @param valObj 需要更新的信息
 */
const taskChange = (obj: any, valObj: any) => {
  if (valObj.startDate) {
    //更新开始时间
    obj[valObj.index].startDate = valObj.startDate
  }
  if (valObj.endDate) {
    //更新结束时间
    obj[valObj.index].endDate = valObj.endDate
  }
  // 更新任务详情
  emits('updateTaskDetail', obj[valObj.index])
}
/**
 * 获取初始数据，拖动改变了时间时也要加载数据
 */
const getData = (type:string) => {
  nextTick(() => {
    emits('getData', formatStringDate(getDateRange.value[0]), formatStringDate(getDateRange.value[getDateRange.value.length - 1]), store.expandList,type)
  })
}
/**
 * 用户左侧边点击事件
 */
const userListClick = (type: string, obj?: any) => {
  emits('otherEvent', type, obj)
}

const getShow = (index: number) => {
  return store.expandList.includes(index)
}

/**
 * 展开详情弹窗
 * @param obj
 */
const detailVisible = ref(false)
const detailObj = ref({})
const showDetailClick = (obj: any) => {
  detailVisible.value = true
  detailObj.value = obj
}
const documentClick = () => {
  detailVisible.value = false
}
/**
 * 任务区滚动时，同步滚动会员区域
 */
const elScroll = () => {
  userListEl.value.setScroll(gScrollEl.value.scrollTop)
}
/**
 * 用户列表滚动时，同步滚动任务区
 * @param top
 */
const userListScroll = (top: number) => {
  gScrollEl.value.scrollTo(0, top)
}
const prevNextClick = (type: string) => {
  let newCurrentDate
  if (type === 'prev') {
    //往左，即当前时间减一屏的天数
    newCurrentDate = getNewDay(currentDate.value, -offsetUnit.value * 2)
  } else {
    newCurrentDate = getNewDay(currentDate.value, offsetUnit.value * 2)
  }
  currentDate.value = newCurrentDate
  getData(type)
}
/**
 * 根据屏宽计算可展示的天数
 */
const showUnitNum = () => {
  nextTick(() => {
    const width = ganttChartsEl.value.offsetWidth
    const initNum = parseInt(((width - 200) / props.width).toString())
    offsetUnit.value = parseInt((initNum / 2).toString()) //默认依稀半屏位置，即默认今天日期永远在中间
    getData('onMounted')
  })
}

onMounted(() => {
  showUnitNum()
  document.addEventListener('click', documentClick)
  gScrollEl.value.addEventListener('scroll', elScroll)
  window.addEventListener("resize", showUnitNum)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', documentClick)
  gScrollEl.value.removeEventListener('scroll', elScroll)
  window.removeEventListener("resize", showUnitNum)
})
</script>
<style lang="scss">
.container {
  margin: 30px 50px;
  border: 1px solid #eee
}

.gantt-chart {
  overflow: hidden;
  position: relative;
  padding-left: 200px;
  .g-scroll {height: calc(100vh - 175px);overflow-y: auto;
    &::-webkit-scrollbar {
      width: 0; /* 控制滚动条宽度 */
    }
  }
  .g-transform-btn {position: absolute;background: #fff;z-index: 10;height: 60px;width: 42px;display: flex;align-items: center;justify-content: center;cursor: pointer;top: 0;
    img {width: 42px;display: block}
    &:hover {
      img {opacity: .6}
    }
    &.g-btn-prev {
      img {transform: rotate(90deg)}
    }
    &.g-btn-next {right: 0;
      img {transform: rotate(-90deg)}
    }
  }
}
</style>
