<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'

const emits = defineEmits<{
  (e: 'click', val: string): void
}>()
/*const visible = ref(false)
const documentClick = () => {
  visible.value = false
}*/
const click = (type: string) => {
  //documentClick()
  emits('click', type)
}
/*onMounted(() => {
  document.addEventListener('click', documentClick)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', documentClick)
})*/
</script>

<template>
<div class="detail"><img src="../assets/dian.svg" alt="">
  <ul>
    <li @click="click('userDetail')">成员详情</li>
    <li @click="click('delUser')">移除</li>
  </ul>
</div>
</template>

<style scoped lang="scss">
.detail {
  position: relative;
  img{width: 16px}

  ul {
    z-index: 10;
    position: absolute;
    right: 0;
    top: 16px;
    width: 100px;
    background: #fff;
    border: 1px solid #f2f3f5;
    box-shadow: 2px 2px 8px #f2f3f5;
    border-radius: 5px;
    display: none;

    li {
      height: 28px;
      line-height: 28px;
      padding: 0 10px;
      cursor: pointer;

      &:hover {
        background: #f0f3f5
      }
    }
  }

  &:hover {
    ul {
      display: block
    }
  }
}
</style>