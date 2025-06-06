<template>
  <div class="message-history">
    <div v-for="message in messages" :key="message.id" class="message-item">
      <!-- 系统消息 -->
      <div v-if="message.type === 'system'" class="system-message">
        <div class="bubble">{{ message.reply }}</div>
      </div>
      
      <!-- 用户消息 -->
      <template v-else>
        <div class="user-message">
          <div class="content">
            <div class="name" style="text-align: right">用户</div>
            <div class="bubble">{{ message.content }}</div>
          </div>
          <div class="avatar">
            <el-avatar :size="36" icon="UserFilled" />
          </div>
        </div>
        
        <!-- 助手回复 -->
        <div class="assistant-message" v-if="message.reply">
          <div class="avatar">
            <el-avatar :size="36" icon="Avatar" />
          </div>
          <div class="content">
            <div class="name">助手</div>
            <!-- <div class="bubble">{{ message.reply }}</div> -->
             <Markdown 
              class="bubble" 
              :content="message.reply" 
              :id="'md-' + message.id" 
            />
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div class="assistant-message" v-else>
          <div class="avatar">
            <el-avatar :size="36" icon="Avatar" />
          </div>
          <div class="content">
            <div class="name">助手</div>
            <div class="bubble loading">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '../../types/chat';
import Markdown from '../textarea/Markdown.vue';
defineProps<{
  messages: ChatMessage[];
}>();
</script>

<style scoped>
.message-history {
  padding: 16px;
  overflow-y: auto;
  height: calc(100vh - 200px);
}

.message-item {
  margin-bottom: 20px;
}

.system-message {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.system-message .bubble {
  background-color: #f2f6fc;
  padding: 8px 16px;
  border-radius: 18px;
  font-size: 12px;
  color: #909399;
}

.user-message, .assistant-message {
  display: flex;
  margin: 8px 0;
}

.user-message {
  justify-content: flex-end;
}


.assistant-message {
  justify-content: flex-start;
}

.avatar {
  margin: 0 12px;
}

.content {
  max-width: 70%;
}

.name {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.bubble {
  padding: 12px;
  border-radius: 4px;
  line-height: 1.5;
  word-break: break-word;
}

.user-message .bubble {
  background-color: #e1f3d8;
  border-top-right-radius: 0;
}

.assistant-message .bubble {
  background-color: #f0f4ff;
  border-top-left-radius: 0;
}

.loading {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #909399;
  margin: 0 3px;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>