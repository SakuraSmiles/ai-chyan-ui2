import { createStore } from 'vuex'
import type { BotConfig, ChatMessage } from '../types/chat'
import { chatStore } from './storage';
import { toRaw } from 'vue';
import { generateShortUUID } from '../utils/uuid'
// 定义状态接口
export interface State {
  bots: BotConfig[]
  currentBotId: string | null
  chatHistory: ChatMessage[]
}

// 创建 Vuex store
const store = createStore<State>({
  state: {
    bots: [],
    currentBotId: null,
    chatHistory: []
  },
  mutations: {
    LOAD_STORED_DATA(state, payload) {
      state.bots = payload.bots || [];
      state.currentBotId = payload.currentBotId || null;
    },
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
    async loadPersistedData({ commit }) {
      // 从IndexedDB加载所有持久化数据
      const [bots, currentBotId] = await Promise.all([
        chatStore.getItem('bots'),
        chatStore.getItem('currentBotId')
      ]);

      commit('LOAD_STORED_DATA', {
        bots,
        currentBotId
      });
    },
    async changeSelectBot({ commit }, id: string | null) {
      commit('setCurrentBotId', id)
      await chatStore.setItem('currentBotId', id)
    },
    // 添加机器人并设置为当前选中
    async addBotAndSelect({ commit, state }, bot: BotConfig) {
      commit('addBot', bot)
      commit('setCurrentBotId', bot.id)
      await chatStore.setItem('bots', toRaw(state.bots));
      await chatStore.setItem('chatHistory_' + bot.id, [
        {
          id: generateShortUUID(),
          type: 'system',
          content: '',
          reply: '您好！我是' + (bot.name || '智障机器人') + '(' + bot.model + ')，有什么可以帮您的吗？',
          timestamp: new Date()
        }]);
      await chatStore.setItem('currentBotId', bot.id)
      return bot
    },
    async saveChatHistory({ state }) {
      // 保存聊天记录（带1秒防抖）
      await chatStore.setItem('chatHistory', toRaw(state.chatHistory));
    },
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
store.dispatch('loadPersistedData');
export default store;
