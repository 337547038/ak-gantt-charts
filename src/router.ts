import {createRouter, createWebHashHistory} from 'vue-router'

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'gantt',
            component: () => import('./views/index.vue')
        },
        {
            path: '/test',
            name: 'test',
            component: () => import('./views/test.vue')
        }
    ]
})
export default router
