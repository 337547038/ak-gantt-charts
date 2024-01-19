import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
const pinia = createPinia()

//import ganttCharts from '../packages/dist'
//import '../packages/dist/style.css'

createApp(App).use(router).use(pinia).mount('#app')
