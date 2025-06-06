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
import type { ChatMessage } from '@/types/chat';

// 初始消息数据
const messages = ref<ChatMessage[]>([
  {
    id: '1',
    role: 'assistant',
    content: '您好！我是智能助手，有什么可以帮您的吗？',
    timestamp: new Date()
  }
]);

// 处理发送消息
const handleSendMessage = (content: string) => {
  // 添加用户消息
  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content,
    timestamp: new Date()
  });
  
  // 模拟助手回复
  setTimeout(() => {
    messages.value.push({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `已收到您的消息："${content}"，我正在处理中...`,
      timestamp: new Date()
    });
    
    // 滚动到底部
    scrollToBottom();
  }, 500);
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