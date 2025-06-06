import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import networkManager from './utils/networkManager'
import App from './App.vue'

const app = createApp(App)

networkManager.initHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000
});
app.config.globalProperties.$network = networkManager;

app.use(ElementPlus)
app.mount('#app')