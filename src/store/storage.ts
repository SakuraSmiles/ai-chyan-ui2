import localforage from 'localforage';
import type { ChatMessage } from '../types/chat';

// 创建独立数据库实例
export const chatStore = localforage.createInstance({
    name: 'db_ai_chyan_ui2',     // 数据库名
    storeName: 'chat_data',  // 存储空间名
    version: 1.0             // 版本控制
});

// 初始化默认配置
export const initStorage = async () => {
    try {
        const botsExists = await chatStore.getItem('bots');
        if (!botsExists) {
            await chatStore.setItem('bots', [])
        }
        const historyExists = await chatStore.getItem('chatHistory');
        if (!historyExists) {
            // 初始化空历史
            await chatStore.setItem('chatHistory', []);
        }
        const currentExists = await chatStore.getItem('currentBotId');
        if (!currentExists) {
            await chatStore.setItem('currentBotId', null)
        }
        return true;
    } catch (error) {
        console.error('Storage initialization failed:', error);
        return false;
    }
};

export const addMessage = async (newMessage: ChatMessage) => {
    try {
        const itemKey = 'chatHistory_' + newMessage.botId
        const history: ChatMessage[] = await chatStore.getItem(itemKey) || [];
        const existingIndex = history.findIndex(msg => msg.id === newMessage.id);
        const updatedHistory = [...history];
        if (existingIndex !== -1) {
            updatedHistory[existingIndex] = newMessage; // 更新现有消息
        } else {
            updatedHistory.push(newMessage); // 添加新消息
        }
        await chatStore.setItem(itemKey, updatedHistory);
        return updatedHistory;
    } catch (error) {
        console.error('聊天记录存储失败:', error);
        return null;
    }
};

export const loadMessage = async (botId: string) => {
    try {
        const itemKey = 'chatHistory_' + botId
        const history: ChatMessage[] = await chatStore.getItem(itemKey) || [];
        return history;
    } catch (error) {
        console.error('聊天记录加载失败:', error);
        return [];
    }
};