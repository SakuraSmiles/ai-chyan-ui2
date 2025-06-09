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
import { nextTick, onUnmounted, ref } from 'vue';
import { sseManager } from '../utils/sseManager';
import MessageInput from '../components/chat/MessageInput.vue';
import MessageHistory from '../components/chat/MessageHistory.vue';
import type { ChatMessage } from '../types/chat';

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
const url = ref('http://localhost:8080/rag/search?message=')
const currentMessageId = ref<string | null>(null);

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
  currentMessageId.value = newMessage.id;
  sseManager.connect(url.value + content, handleMessage, handleError)
  scrollToBottom();
};
const handleMessage = (data: string) => {
  if (!currentMessageId.value) return;
  const index = messages.value.findIndex(msg => msg.id === currentMessageId.value);
  let json_data = transformThink(JSON.parse(data).content)
  if (index !== -1) {
    messages.value[index].reply += json_data;
    messages.value = [...messages.value];
    scrollToBottom();
  }
}
const handleError = () => {
  if (!currentMessageId.value) return;

  const index = messages.value.findIndex(msg => msg.id === currentMessageId.value);
  if (index !== -1) {
    currentMessageId.value = null;
    scrollToBottom();
  }
}
// 滚动到底部方法
const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.chat-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};
const transformThink = (text: string) => {
  return text.replace("<think>", "<div class='think'>").replace("</think>", "</div>")
    .replace("`", "\`");
}
onUnmounted(() => {
  sseManager.close();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.chat-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.input-container {
  padding: 0;
  /* border-top: 1px solid #dcdfe6; */
}
</style>