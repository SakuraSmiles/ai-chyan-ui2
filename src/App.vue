<template>
  <div class="chat-app">
    <el-main class="chat-container">
      <MessageHistory :messages="messages" />
    </el-main>
    
    <el-footer height="auto" class="input-container">
      <MessageInput @send="handleSendMessage" />
    </el-footer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import MessageInput from '@/components/chat/MessageInput.vue';
import MessageHistory from '@/components/chat/MessageHistory.vue';
import type { ChatMessage } from './types/chat';

// 初始消息数据
const messages = ref<ChatMessage[]>([
  {
    id: '1',
    type: 'system',
    content: '',
    reply: '您好！我是智能助手，有什么可以帮您的吗？',
    timestamp: new Date()
  }
]);

// 处理发送消息
const handleSendMessage = (content: string) => {
  // 添加用户消息（初始回复为空）
  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'user',
    content,
    reply: '',
    timestamp: new Date()
  };
  
  messages.value.push(newMessage);
  
  // 模拟助手回复
  setTimeout(() => {
    // 找到最新添加的消息并更新回复
    const index = messages.value.findIndex((msg: ChatMessage) => msg.id === newMessage.id);
    if (index !== -1) {
      messages.value[index].reply = `已收到您的消息："${content}"，我正在处理中...`;
      
      // 创建新数组触发响应式更新
      messages.value = [...messages.value];
      
      // 滚动到底部
      scrollToBottom();
    }
  }, 1000);
};

// 滚动到底部方法
const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.chat-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.input-container {
  padding: 0;
  border-top: 1px solid #dcdfe6;
}
</style>