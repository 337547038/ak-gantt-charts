import {defineStore} from 'pinia'

const useStore = defineStore('ganttChart', {
  state: () => {
    return {
      expandList: [] //所有展开的项
    }
  },
  actions: {
    setExpandList(key: number) {
      console.log(this.expandList)
      if (this.expandList.includes(key)) {
        //删除
        const index = this.expandList.indexOf(key)
        this.expandList.splice(index, 1)
      } else {
        this.expandList.push(key)
      }
    }
  }
})
export default useStore