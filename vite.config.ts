import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
// https://vite.dev/config/
export default defineConfig({
  base: './',  // 静态资源使用相对路径
  build: {
    assetsDir: '.',
    outDir: 'dist'
  },
  plugins: [vue(), viteCommonjs()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
})