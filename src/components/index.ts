import indexVue from './index.vue'

export default {
    install(app: any) {
        app.component('ganttCharts', indexVue)
    }
}
