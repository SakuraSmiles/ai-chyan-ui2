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
import { computed, nextTick, onUnmounted, ref } from 'vue';
import { sseManager } from '../utils/sseManager';
import MessageInput from '../components/chat/MessageInput.vue';
import MessageHistory from '../components/chat/MessageHistory.vue';
import type { ChatMessage } from '../types/chat';
import { useStore } from 'vuex';
import { extractContent } from '../utils/sseUtil';

// 初始消息数据
const messages = ref<ChatMessage[]>([
  {
    id: '1',
    type: 'system',
    content: '',
    reply: '您好！我是智能助手，有什么可以帮您的吗？',
    timestamp: new Date()
  },{
    id:'2',
    type:'user',
    content:'你好',
    reply:"当然可以！以下是一个简单的 Python 代码示例，它实现了一个计算两个数字之和的函数，并打印结果：\n\n```python\ndef add_numbers(a, b):\n    \"\"\"计算两个数字的和\"\"\"\n    return a + b\n\n# 输入两个数字\nnum1 = float(input(\"请输入第一个数字: \"))\nnum2 = float(input(\"请输入第二个数字: \"))\n\n# 调用函数并打印结果\nresult = add_numbers(num1, num2)\nprint(f\"{num1} + {num2} = {result}\")\n```\n\n### 代码说明：\n1. **`add_numbers(a, b)`**：自定义函数，接收两个参数并返回它们的和。\n2. **`input()`**：获取用户输入的数字（转换为浮点数 `float` 以支持小数）。\n3. **`print(f\"...\")`**：使用 f-string 格式化输出结果。\n\n### 运行效果：\n```\n请输入第一个数字: 3.5\n请输入第二个数字: 2.5\n3.5 + 2.5 = 6.0\n```\n\n如果需要其他语言（如 JavaScript、Java、C++）或特定功能的代码示例，可以告诉我!",
    timestamp: new Date()
  }
]);
const store = useStore();

// 获取当前机器人配置
const currentBot = computed(() => store.getters.currentBot);
const currentMessageId = ref<string | null>(null);
const abortController = ref<AbortController | null>(null);
const handleSendMessage = async (content: string) => {
  // 添加用户消息
  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    type: 'user',
    content,
    reply: '',
    timestamp: new Date()
  };

  messages.value.push(newMessage);
  currentMessageId.value = newMessage.id;
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

    // 添加消息内容
    if (processedBody.messages) {
      processedBody.messages = [
        ...messages.value.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.type === 'user' ? msg.content : msg.reply
        }))
      ];
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
  console.log(config)
  const index = messages.value.findIndex(msg => msg.id === currentMessageId.value);
  if (index === -1) return;

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
        const content = extractContent(jsonData);

        // 直接更新消息内容，不进行额外处理
        if (content) {
          messages.value[index].reply += content;
          messages.value = [...messages.value];
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