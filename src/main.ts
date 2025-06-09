import { createApp } from 'vue'
import './style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import networkManager from './utils/networkManager'
import App from './App.vue'
import router from './router'
import store from './store'


const app = createApp(App)
app.use(router)
app.use(store)
networkManager.initHttpClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000
});
app.config.globalProperties.$network = networkManager;

app.use(ElementPlus)
app.mount('#app')