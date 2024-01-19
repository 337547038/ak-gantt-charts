// https://vitejs.cn/guide/build.html#library-mode
// @ts-ignore
import path from 'path'
// @ts-ignore
import fs from 'fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

fs.createReadStream('../README.md').pipe(fs.createWriteStream('./README.md'))


export default defineConfig({
  publicDir: false,
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, '../src/components/index.vue'),
      name: 'ak-gantt-charts',
      //fileName: format => `ak-vue3.${format}.js`
      fileName: 'index'
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'axios', 'vueRouter','pinia'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
