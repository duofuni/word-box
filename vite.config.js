import {
  defineConfig
} from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ?
    '/word-box/' // GitHub Pages 子路径
    :
    '/',
  server: {
    host: '0.0.0.0', // 监听所有网络接口，允许通过 IP 地址访问
    port: 5173, // 指定端口号
  },
  build: {
    outDir: 'docs'
  }
})