<template>
  <div class="message-input-container">
    <el-input v-model="inputText" type="textarea" :rows="3" placeholder="请输入消息..." resize="none"
      @keydown.enter.exact.prevent="handleSend" />
    <div class="action-bar">
      <el-button :icon="Operation" @click="openConfig" :class="{ 'actived': isDrawerOpen }" />
      <el-button type="primary" @click="handleSend" :disabled="!inputText.trim()" style="width:90px">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Operation } from '@element-plus/icons-vue'
const isDrawerOpen = ref(false)
const emit = defineEmits<{
  (e: 'send', payload: string): void;
  (e: 'openConfig'): void;
}>();

const inputText = ref('');

const handleSend = () => {
  if (inputText.value.trim()) {
    emit('send', inputText.value.trim());
    inputText.value = '';
  }
};
const openConfig = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
  emit('openConfig');
}
</script>

<style scoped>
.message-input-container {
  padding: 16px;
  padding-top: 6px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.actived {
  background-color: var(--el-button-active-bg-color);
  border-color: var(--el-button-active-border-color);
  color: var(--el-button-active-text-color);
  outline: none;
}

button:focus,
button:focus-visible {
  outline: none;
}
</style>