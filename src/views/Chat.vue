<template>
  <div class="chat-app">
    <el-main class="chat-container">
      <el-row :gutter="8">
        <el-col :span="isDrawerOpen ? 18 : 24" class="history-col">
          <div class="scroll-container">
            <MessageHistory :messages="messages" />
          </div>
        </el-col>
        <transition name="slide-fade">
          <el-col :span="6" v-if="isDrawerOpen" class="config-col">
            <div class="scroll-container">
              <MessageConfig />
            </div>
          </el-col>
        </transition>
      </el-row>
    </el-main>

    <el-footer height="auto" class="input-container">
      <MessageInput @send="handleSendMessage" @openConfig="openConfig" />
    </el-footer>

  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import MessageInput from '../components/chat/MessageInput.vue';
import MessageHistory from '../components/chat/MessageHistory.vue';
import type { ChatMessage } from '../types/chat';
import { useStore } from 'vuex';
import { createStreamHandler, type StreamHandler } from '../utils/streamHandler'
import { loadMessage, addMessage } from '../store/storage';
import { useRoute } from 'vue-router';
import MessageConfig from '../components/chat/MessageConfig.vue';

const store = useStore();
const isDrawerOpen = ref(false)
// 初始消息数据
const messages = ref<ChatMessage[]>([]);
const route = useRoute();
const currentBot = computed(() => store.getters.currentBot);
// 创建流式处理器（根据当前模型类型）
const streamHandler = ref<StreamHandler>(createStreamHandler(currentBot.value.model));
const currentMessageId = ref<string | null>(null);
const abortController = ref<AbortController | null>(null);
const loadHistory = async () => {
  messages.value = await loadMessage(currentBot.value.id)
}
const handleSendMessage = async (content: string) => {
  // 添加用户消息
  const newMessage: ChatMessage = {
    botId: currentBot.value.id,
    id: Date.now().toString(),
    type: 'user',
    content,
    reply: '',
    think: '',
    timestamp: new Date()
  };

  messages.value.push(newMessage);
  currentMessageId.value = newMessage.id;
  addMessage(toRaw(newMessage));
  scrollToBottom();

  try {
    // 构建请求配置
    const requestConfig = buildRequestConfig(content);

    // 创建中止控制器
    abortController.value = new AbortController();

    // 处理流式响应
    await handleStreamResponse(requestConfig);
  } catch (error) {
    console.error('请求失败:', error);
    handleError();
  }
};

// 构建请求配置
const buildRequestConfig = (content: string) => {
  const config = currentBot.value.streamConfig || {};

  // 处理动态变量
  const replaceVariables = (str: string) => {
    return str
      .replace('${apiKey}', currentBot.value.apiKey)
      .replace('${model}', currentBot.value.model)
      .replace('${content}', content);
  };

  // 处理headers
  const headers: Record<string, string> = {};
  if (config.headers) {
    for (const [key, value] of Object.entries(config.headers)) {
      if (typeof value === 'string') {
        headers[key] = replaceVariables(value);
      }
    }
  }

  // 处理body
  let body: any = null;
  if (config.body) {
    const processedBody: Record<string, any> = {};
    for (const [key, value] of Object.entries(config.body)) {
      if (typeof value === 'string') {
        processedBody[key] = replaceVariables(value);
      } else {
        processedBody[key] = value;
      }
    }
    if (processedBody.messages) {
      processedBody.messages[processedBody.messages.length - 1].content = content
    }
    body = JSON.stringify(processedBody);
  }

  return {
    url: currentBot.value.baseURL,
    method: config.method || 'POST',
    headers,
    body,
    signal: abortController.value?.signal
  };
};
// 处理流式响应
const handleStreamResponse = async (config: any) => {
  if (!currentMessageId.value) return;

  const index = messages.value.findIndex(msg => msg.id === currentMessageId.value);
  if (index === -1) return;

  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body,
      signal: config.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    // 流处理循环
    const processStream = async () => {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          currentMessageId.value = null;
          return;
        }

        // 解码数据块
        const chunk = decoder.decode(value, { stream: true });

        // 使用处理器处理数据块
        const results = streamHandler.value.processChunk(chunk);

        // 处理处理器返回的结果
        for (const result of results) {
          if (result.content) {
            if (result.type === 'normal') {
              messages.value[index].reply += result.content;
            } else if (result.type === 'reasoning') {
              messages.value[index].think += result.content;
            }

            // 触发响应式更新
            messages.value = [...messages.value];
            addMessage(toRaw(messages.value[index]));
            scrollToBottom();
          }
        }
      }
    };

    // 开始处理流
    await processStream();
  } catch (error) {
    console.error('流处理错误:', error);
    currentMessageId.value = null;
  }
};

// 处理错误
const handleError = () => {
  if (!currentMessageId.value) return;

  const index = messages.value.findIndex(msg => msg.id === currentMessageId.value);
  if (index !== -1) {
    messages.value[index].reply += "\n\n[连接中断]";
    currentMessageId.value = null;
    scrollToBottom();
  }
};
const openConfig = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}
// 滚动到底部方法
const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.message-history');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};

watch(
  () => route.params.botId,
  (newBotId) => {
    if (newBotId) {
      streamHandler.value = createStreamHandler(currentBot.value.model);
      loadHistory();
    }
  }
);

onMounted(() => {
  loadHistory();
});
onUnmounted(() => {
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.el-row {
  height: 100%;
}

.chat-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.chat-container {
  flex: 1;
  overflow-x: hidden;
  padding: 6px;
  overflow: hidden;
}

.input-container {
  padding: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.chat-row {
  position: relative;
  display: flex;
  height: 100%;
}

/* 修改3: 设置历史消息区域为滚动容器 */
.history-col {
  transition: width 0.3s ease-out;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 修改4: 创建滚动容器 */
/* .message-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
} */

.history-col, 
.config-col {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 修改5: 确保消息历史区域填满容器 */
.message-container>.message-history {
  flex: 1;
  /* 占据全部可用空间 */
} */

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* 调整配置列的内边距 */
.config-col {
  padding: 6px;
}

.config-col {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  z-index: 1;
}
.scroll-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}
</style>