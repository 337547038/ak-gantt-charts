import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: 'docs',
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖2.05/3.02
      // external: ['vue', 'axios', 'vueRouter']
      // external: ['tinymce/tinymce']
      output: {
        chunkFileNames: info => {
          //[id].vue这种格式会被编译成_id开头的js，在github里获取不到，这里统一添加js
          if (info.name.indexOf('_') === 0) {
            return 'assets/js[name]-[hash].js'
          } else {
            return 'assets/[name]-[hash].js'
          }
        }
      }
    }
  }
})
