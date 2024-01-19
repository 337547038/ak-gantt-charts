<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import DetailDown from './detail.vue'
import useStore from '../store'

const props = withDefaults(
    defineProps<{
      list: any,
      taskDetailHeight?: number[]
    }>(),
    {
      list: () => {
        return []
      },
      taskDetailHeight: () => {
        return []
      }
    }
)

const emits = defineEmits<{
  (e: 'toggleClick', index: number): void
  (e: 'click', type: string, obj?: any): void
  (e: 'scroll', scrollTop:number): void
}>()

const store = useStore()

const gScrollEl = ref()

const setScroll = (top: number) => {
  gScrollEl.value.scrollTo(0, top)
}
const elScroll=()=>{
  emits('scroll',gScrollEl.value.scrollTop)
}
/**
 * 展开或收起小图标点击
 */
const downIconClick = (obj: any, index: number) => {
  store.setExpandList(index)
  emits('toggleClick', index)
}

/**
 * 用户下拉点击事件
 * @param type
 * @param obj
 */
const detailClick = (type: string, obj: any) => {
  emits('click', type, obj)
}

onMounted(() => {
  gScrollEl.value.addEventListener('scroll',elScroll)
})
onBeforeUnmount(() => {
  document.removeEventListener('scroll', elScroll)
})

defineExpose({setScroll})
</script>

<template>
<div class="gantt-user-list">
  <div class="g-add-btn">
    <button @click="emits('click','addUser')"><img src="../assets/plus.svg" alt="">添加成员</button>
  </div>
  <div class="g-scroll" ref="gScrollEl">
    <div class="item" v-for="(item,index) in list" :key="index">
      <div class="g-name-title">
      <span class="g-icon" @click="downIconClick(item,index)" :class="{expand:store?.expandList?.includes(index)}">
        <img src="../assets/arrow.svg" alt=""></span>
        <img :src="item.face" alt="" class="g-face">
        <span class="g-name">{{ item.name }}</span>
        <detail-down @click="detailClick($event,item)"/>
      </div>
      <div class="g-todo" v-show="store?.expandList?.includes(index)"
           :style="{height:taskDetailHeight[index]?.minHeight+'px'}">
        {{ item.todo }} 事项未规则时间
        <span
            @click="emits('click','taskDetail',item)">详情</span></div>
    </div>
  </div>
  <div class="item">
    <div class="g-name-title">
      <span class="g-name">工作负荷</span>
    </div>
  </div>
</div>
</template>

<style lang="scss">
.gantt-user-list {
  position: absolute;
  left: 0;
  width: 200px;
  height: 100%;
  background: #fff;
  z-index: 20;
  border-right: 1px solid #efefef;

  .item {
    border-bottom: 1px solid #f7f8fa;
  }

  .g-name-title {
    height: 49px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 3px;

    .g-name {
      flex: 2
    }

    .g-icon {
      img {
        display: block;
        width: 12px;
        transform: rotate(-90deg);
        cursor: pointer;
        transition: all .3s;
      }

      &.expand {
        img {
          transform: rotate(0deg)
        }
      }
    }

    .g-detail {
      img {
        width: 20px;

        &:hover {
          background: #eee;
          cursor: pointer
        }
      }
    }

    .g-face {
      display: block;
      width: 20px;
      border-radius: 50%;
      height: 20px;
      overflow: hidden;
      margin: 0 5px
    }
  }

  .g-todo {
    color: #666;
    font-size: 12px;
    padding: 0 5px 10px;
    margin-top: 10px;

    span {
      color: #4988dc;
      cursor: pointer;
    }
  }

  .g-add-btn {
    display: flex;
    height: 60px;
    box-shadow: 0 12px 10px -10px rgba(0, 0, 0, .1);
    align-items: center;
    padding: 0 25px;
    button {border: 0;background: none;display: flex;align-items: center;font-size: 15px;cursor: pointer}
    img {
      width: 28px;margin-right: 10px;
    }
  }
}
</style>