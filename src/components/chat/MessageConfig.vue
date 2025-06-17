<template>
  <div class="config-container">
    <div class="message-config">
      <el-form ref="formRef" class="config-form" label-width='120px' label-position='top' :model="form">
        <el-form-item label='模型'>
          <el-input v-model='form.model' disabled />
        </el-form-item>
        <el-form-item label='对话标题' prop="name">
          <el-input v-model='form.name' placeholder='请输入机器人名称' />
        </el-form-item>
        <el-form-item label='接口地址' prop="baseURL">
          <el-input v-model='form.baseURL' placeholder='请输入API接口地址' />
        </el-form-item>
        <el-form-item label='API Key' prop="apiKey">
          <el-input v-model='form.apiKey' placeholder='请输入API密钥' show-password />
        </el-form-item>
        <el-form-item label='请求参数配置'>
          <div class="json-editor-container">
              <json-editor v-model="templateJson" :options="editorOptions" class="json-editor"
                @error="handleJsonError()" />
            <div v-if="jsonErrors" class="json-error">
              {{ jsonErrors }}
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import JsonEditor from 'json-editor-vue3'
import type { BotConfig } from '../../types/chat'
const store = useStore();
const route = useRoute();
const formRef = ref<FormInstance>()
const form = ref<BotConfig>({
  id: '',
  avatar: '',
  name: '',
  baseURL: '',
  apiKey: '',
  model: '',
  streamConfig: {
    headers: {},
    body: {},
    method: 'POST',
    stream: true
  }
})
const templateJson = ref({})
const jsonErrors = ref('')
const currentBot = computed(() => store.getters.currentBot)
const handleJsonError = () => (error: any) => {
  jsonErrors.value = error.message || '无效的 JSON 格式'
  setTimeout(() => {
    jsonErrors.value = ''
  }, 3000)
}
const updateFormJson = () => {
  try {
    form.value.streamConfig = JSON.parse(JSON.stringify(templateJson.value))
    jsonErrors.value = ''
  } catch (error) {
    jsonErrors.value = '请求头 JSON 格式错误'
  }
}
const editorOptions = ref({
  mode: 'code',
  mainMenuBar: false,
  navigationBar: false,
  statusBar: false,
  onEditable: () => true
})
watch(currentBot, (newBot) => {
  if (newBot) {
    form.value = JSON.parse(JSON.stringify(newBot))
    templateJson.value = form.value.streamConfig || {}
  }
}, { immediate: true, deep: true })

// 监听 JSON 数据变化
watch(templateJson, () => {
  updateFormJson()
}, { deep: true })

// 监听路由变化
watch(() => route.params.botId, (newBotId) => {
  if (newBotId) {
    // 确保 store 已更新
    setTimeout(() => {
      if (currentBot.value) {
        form.value = JSON.parse(JSON.stringify(currentBot.value))
        templateJson.value = form.value.streamConfig || {}
      }
    }, 100)
  }
})
</script>

<style scoped>
.config-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-config {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #efefef;
  border-left: 2px solid #e4e7ed;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  margin-right: 12px;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

.config-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 22px;
}

.json-editor-container {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.json-editor {
  flex: 1;
}

.json-error {
  color: #f56c6c;
  font-size: 12px;
  margin-top: 5px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  z-index: 10;
}
</style>