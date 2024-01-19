<template>
<gantt-charts
    :data="dataList"
    @getData="getData"
    @getTaskDetail="getTaskDetail"
    @updateTaskDetail="updateTaskDetail"
    @otherEvent="otherEvent"/>
</template>
<script setup lang="ts">
import {ref, onMounted} from 'vue'
import GanttCharts from '../components/index.vue'
//import GanttCharts from '../../packages/dist/index'
//import '../../packages/dist/style.css'

const dataList = ref([])

/**
 * 根据开始和结束时间获取数据
 * @param startDate 开始时间
 * @param endDate 结束时间
 * @param expand 已展开项的下标
 * @param eventType 触发事件类型
 */
const getData = (startDate: string, endDate: string, expand: number[], eventType: string) => {
  console.log('加载数据', startDate, endDate)
  if (eventType === 'onMounted') {
    // 演示时只加载一次数据
    //dataList.value = setDemoData(startDate, endDate)
  }
  dataList.value = [
    {
      name: '张三', face: '/face.webp', todo: 5, progress: {'2024-01-10': 5, '2024-01-12': 1, '2024-01-33': 12},
    },
    {
      name: '李四',
      face: '/face.webp',
      todo: 0,
      progress: {'2024-01-13': 5, '2024-01-12': 7, '2024-01-17': 12},
      id: 2
    },
    /*{
      name: 'LiLei',
      face: '/face.webp',
      todo: 1,
      progress: {'2024-01-02': 5, '2024-01-05': 1, '2024-01-03': 12},
      id: 3
    },
    {
      name: 'HanMeiMei',
      face: '/face.webp',
      todo: 2,
      progress: {'2024-01-11': 5, '2024-01-12': 8, '2024-01-03': 12},
      id: 4
    },
    {
      name: '王五',
      face: '/face.webp',
      todo: 3,
      progress: {'2024-01-04': 5, '2024-01-05': 4, '2024-01-06': 12},
      id: 5
    },
    {
      name: '赵六',
      face: '/face.webp',
      todo: 4,
      progress: {'2024-01-07': 5, '2024-01-08': 9, '2024-01-09': 12},
      id: 6
    }*/
  ]
  //任务详情分步加载时，如果有已展开的任务详情，则需同时加载任务详情
  if (expand?.length) {
    for (const key in expand) {
      getTaskDetail(expand[key])
    }
  }
}

/**
 * 展开用户详情时根据当前用户id获取任务详情
 * @param index data数据中的下标，即当前点击项下标位置。以list的形式追加到data中
 */
const getTaskDetail = (index: number) => {
  console.log('展开用户详情')
  //将请求结果以list的形式追加到data中
  dataList.value[index].list = [
    {
      startDate: '2024-01-15',
      endDate: '2024-01-19',
      title: '将生产环境和测试环境服务器迁移到腾讯云将生产环境和测试环境服务器迁移到腾讯云',
      progress: 10
    },
    {startDate: '2024-01-13', endDate: '2024-01-18', title: '将生产环境和', progress: 0},
    {startDate: '2024-01-10', endDate: '2024-01-17', title: '通过访问邀请', progress: 100},
    /*{startDate: '2024-01-10', endDate: '2024-01-15', title: '设计手机验证', progress: 60},*/
  ]
}
/**
 * 拖动任务详情时发送请求更新任务列表
 * @param obj
 */
const updateTaskDetail = (obj: any) => {

}

/**
 * 其他事件
 * @param type 事件类型
 * @param obj 处理该事件所需参数
 */
const otherEvent = (type: string, obj?: any) => {
  switch (type) {
    case 'addUser':
      //添加成员
      break
    case 'taskDetail':
      //事项未规则时间详情
      break
    case 'userDetail':
      // 成员详情
      break
    case 'delUser':
      //删除成员
      break
  }
}

//以下为生成模拟演示数据
const setDemoData = (startDate: string, endDate: string) => {
  const temp = []
  const dateRange = getDateRange(startDate, endDate)
  for (let i = 1; i <= 10; i++) {
    temp.push({
      name: '标题名称' + i,
      face: '/face.webp',
      todo: getRandomInt(0, 20),
      progress: getProgress(dateRange),
      id: i,
      list: getTaskDetailList(dateRange)
    })
  }
  return temp
}
const getDateRange = (startDate: string, endDate: string) => {
  const sd = new Date(startDate)
  const ed = new Date(endDate)
  const date = sd
  const temp = []
  while (sd <= ed) {
    const current = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    temp.push(current)
    date.setDate(date.getDate() + 1)
  }
  return temp
}
const getTaskDetailList = (dateRange: string[]) => {
  const temp = []
  for (let i = 1; i <= 3; i++) {
    const randomIndex = Math.floor(Math.random() * dateRange.length);
    const randomItem = dateRange[randomIndex];
    const endDate = getNewDay(randomItem, getRandomInt(5, 15))
    const current = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`
    temp.push({
      startDate: randomItem,
      endDate: current,
      title: '任务标题' + i,
      progress: getRandomInt(0, 100)
    })
  }
  return temp
}


const getProgress = (dateRange: string[]) => {
  const temp: any = {}
  dateRange.forEach((item: string) => {
    temp[item] = getRandomInt(0, 12)
  })
  return temp
}
const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const getNewDay = (date: Date | string, offsetDay: number) => {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()
  return new Date(y, m, d + offsetDay)
}
</script>
