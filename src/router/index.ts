import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
// import Settings from '../views/Settings.vue'
import About from '../views/About.vue'
import Chat from '../views/Chat.vue'
import New from '../views/New.vue'
import store from '../store'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    redirect: store.state.currentBotId == null ? 'about' : '/chat/' + store.state.currentBotId, // 默认重定向到聊天页面
    children: [
      {
        path: '/chat/:botId?',
        name: 'Chat',
        component: Chat,
        props: true
      },
      // {
      //   path: '/settings',
      //   name: 'Settings',
      //   component: Settings
      // },
      {
        path: '/about',
        name: 'About',
        component: About
      },
      {
        path: '/new',
        name: 'New',
        component: New
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router