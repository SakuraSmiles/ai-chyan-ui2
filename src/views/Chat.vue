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
import { computed, nextTick, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import { sseManager } from '../utils/sseManager';
import MessageInput from '../components/chat/MessageInput.vue';
import MessageHistory from '../components/chat/MessageHistory.vue';
import type { ChatMessage } from '../types/chat';
import { useStore } from 'vuex';
import { extractContent } from '../utils/sseUtil';
import { loadMessage, addMessage } from '../store/storage';
import { useRoute } from 'vue-router';

const store = useStore();
// 初始消息数据
const messages = ref<ChatMessage[]>([]);
const route = useRoute();
// 获取当前机器人配置
const currentBot = computed(() => store.getters.currentBot);
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
    think:'',
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
    // 添加消息内容
    // if (processedBody.messages) {
    //   processedBody.messages = [
    //     ...messages.value.map(msg => ({
    //       role: msg.type === 'user' ? 'user' : 'assistant',
    //       content: msg.type === 'user' ? msg.content : msg.reply
    //     }))
    //   ];
    // }

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
  // return;
  // 使用NetworkManager发送请求
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
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      // 流结束，设置当前消息ID为null
      currentMessageId.value = null;
      break;
    }

    // 解码并添加到缓冲区
    buffer += decoder.decode(value, { stream: true });

    // 处理SSE格式的数据
    const events = buffer.split('\n\n');

    // 保留未完整的事件
    buffer = events.pop() || '';

    for (const event of events) {
      // 跳过空行和结束标记
      if (!event.trim() || event === 'data: [DONE]') continue;

      // 提取数据部分
      const dataPrefix = 'data: ';
      if (!event.startsWith(dataPrefix)) {
        console.warn('Unexpected event format:', event);
        continue;
      }

      const jsonStr = event.substring(dataPrefix.length);
      try {
        const jsonData = JSON.parse(jsonStr);
        const { content, type } = extractContent(jsonData);
        console.log(type,content)
        // 直接更新消息内容，不进行额外处理
        if (content) {
          if (type == 'normal') {
            messages.value[index].reply += content;
            messages.value = [...messages.value];
          }
          if (type == 'reasoning') {
            messages.value[index].think += content;
            messages.value = [...messages.value];
          }

          addMessage(toRaw(messages.value[index]));
          scrollToBottom();
        }
      } catch (error) {
        console.warn('JSON解析失败:', error, '原始数据:', jsonStr);
        // 如果解析失败，直接作为文本处理
        messages.value[index].reply += jsonStr;
        messages.value = [...messages.value];
        scrollToBottom();
      }
    }
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
      loadHistory();
    }
  }
);

onMounted(() => {
  loadHistory();
});
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