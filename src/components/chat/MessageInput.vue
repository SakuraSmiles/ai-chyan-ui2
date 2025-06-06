<template>
  <div class="message-input-container">
    <el-input
      v-model="inputText"
      type="textarea"
      :rows="3"
      placeholder="请输入消息..."
      resize="none"
      @keydown.enter.exact.prevent="handleSend"
    />
    <div class="action-bar">
      <el-button type="primary" @click="handleSend" :disabled="!inputText.trim()">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  (e: 'send', payload: string): void;
}>();

const inputText = ref('');

const handleSend = () => {
  if (inputText.value.trim()) {
    emit('send', inputText.value.trim());
    inputText.value = '';
  }
};
</script>

<style scoped>
.message-input-container {
  padding: 16px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>