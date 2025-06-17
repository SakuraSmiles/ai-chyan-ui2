import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import networkManager from './utils/networkManager'
import App from './App.vue'
import router from './router'
import store from './store'
import { initStorage } from './store/storage'
import JsonEditor from 'json-editor-vue3'

// 初始化存储后启动应用
const launchApp = async () => {
  try {
    await initStorage()
    console.log('💾 数据持久化加载成功')
    const app = createApp(App)
    app.use(router)
    app.use(store)
    networkManager.initHttpClient({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 15000
    });
    app.config.globalProperties.$network = networkManager;
    app.component('JsonEditor', JsonEditor)
    app.use(ElementPlus)
    app.mount('#app')
  } catch (error) {
    console.error('❌ 数据持久化加载失败:', error)
    // 可添加用户提示
  }
}

launchApp()
