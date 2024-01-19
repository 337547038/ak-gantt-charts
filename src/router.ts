import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
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