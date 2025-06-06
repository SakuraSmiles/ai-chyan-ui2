<template>
  <div class="message-history">
    <div v-for="message in messages" :key="message.id" class="message-item">
      <div v-if="message.role === 'user'" class="user-message">
        <div class="avatar">
          <el-avatar :size="36" icon="UserFilled" />
        </div>
        <div class="content">
          <div class="name">用户</div>
          <div class="bubble">{{ message.content }}</div>
        </div>
      </div>
      
      <div v-else class="assistant-message">
        <div class="avatar">
          <el-avatar :size="36" icon="Avatar" />
        </div>
        <div class="content">
          <div class="name">助手</div>
          <div class="bubble">{{ message.content }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/types/chat';

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

.user-message, .assistant-message {
  display: flex;
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
}

.user-message .bubble {
  background-color: #e1f3d8;
  border-top-right-radius: 0;
}

.assistant-message .bubble {
  background-color: #f0f4ff;
  border-top-left-radius: 0;
}
</style>