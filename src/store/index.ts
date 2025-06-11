import { createStore } from 'vuex'
import type { BotConfig,StreamRequestConfig } from '../types/chat'

// 定义状态接口
export interface State {
  bots: BotConfig[]
  currentBotId: string | null
}

// 创建 Vuex store
export default createStore<State>({
  state: {
    bots: [
      {
        id: '1',
        avatar: 'robot.png',
        name: '自定义机器人对话',
        baseURL: 'http://localhost:8080/rag/search',
        apiKey: '',
        model: 'custom',
        streamConfig: {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ${apiKey}',
            'Content-Type': 'application/json'
          },
          body: {
            model: '${model}',
            messages: [{
              role: 'user',
              content: '${content}'
            }],
            stream: true
          },
          stream: true
        }
      },
      {
        id: '2',
        avatar: 'deepseek.png',
        name: '自定义机器人对话',
        baseURL: 'https://api.deepseek.com/chat/completions',
        apiKey: 'sk-b73cb7b8f5464f2690eff37eab1b4046',
        model: 'deepseek-chat',
        streamConfig: {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ${apiKey}',
            'Content-Type': 'application/json'
          },
          body: {
            model: '${model}',
            messages: [{
              role: 'user',
              content: '${content}'
            }],
            stream: true
          },
          stream: true
        }
      }
    ],
    currentBotId: '1'
  },
  mutations: {
    // 添加新的机器人配置
    addBot(state: { bots: BotConfig[] }, bot: BotConfig) {
      state.bots.push(bot)
    },
    // 更新当前机器人ID
    setCurrentBotId(state: { currentBotId: string | null }, id: string | null) {
      state.currentBotId = id
    }
  },
  actions: {
    // 添加机器人并设置为当前选中
    addBotAndSelect({ commit }, bot: BotConfig) {
      commit('addBot', bot)
      commit('setCurrentBotId', bot.id)
      return bot
    }
  },
  getters: {
    // 获取所有机器人
    allBots: (state: { bots: any }) => state.bots,
    // 获取当前选中的机器人
    currentBot: (state: { bots: any[]; currentBotId: any }) => {
      return state.bots.find((bot: { id: any }) => bot.id === state.currentBotId) || state.bots[0]
    }
  }
})