<template>
  <div class='new-page'>
    <el-card class='new-card'>
      <el-form ref="formRef" label-width='120px' label-position='top' :model="form" :rules="rules">
        <el-form-item label='模型选择'>
          <el-select v-model='selectedModelId' placeholder='请选择模型' @change='handleModelChange' class='model-selector'>
            <el-option v-for='model in modelOptions' :key='model.id' :label='model.name' :value='model.id'>
              <div class='model-option'>
                <el-avatar :size='24' :src='getImg(model.avatar)' />
                <span class='model-name'>{{ model.name }}</span>
                <el-tag size='small' type='info'>{{ model.description }}</el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label='对话标题' prop="name">
          <el-input v-model='form.name' placeholder='请输入对话标题' />
        </el-form-item>

        <el-form-item label='接口地址' prop="baseURL" required>
          <el-input v-model='form.baseURL' placeholder='请输入API接口地址' :disabled="!isCustomModel" />
        </el-form-item>
        <el-form-item label='API Key' prop="apiKey" required>
          <el-input v-model='form.apiKey' placeholder='请输入API密钥' show-password />
        </el-form-item>
        <el-form-item label='请求头参数'>
          <el-input v-model='form.header' placeholder='请求接口时,请求头默认参数配置(JSON格式)' type="textarea"
            :disabled="!isCustomModel" />
        </el-form-item>
        <el-form-item label='请求体参数'>
          <el-input v-model='form.body' placeholder='请求接口时,请求体默认参数配置(JSON格式)' type="textarea"
            :disabled="!isCustomModel" />
        </el-form-item>

        <el-form-item>
          <el-button type='primary' @click='confirmForm(formRef)'>保存设置</el-button>
          <el-button @click='cancel'>取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang='ts'>
import { reactive, ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { getImg } from '../utils/commonUtil'
import modelConfigs from '@/config/models.json'
import type { ModelConfig, BotConfig } from '../types/chat'
import type { FormInstance, FormRules } from 'element-plus'

const store = useStore()
const router = useRouter()

// 模型配置
const modelOptions = ref<ModelConfig[]>(modelConfigs.models)
const selectedModelId = ref<string>('')
const formRef = ref<FormInstance>()
// 表单数据
const form = reactive<BotConfig>({
  name: '',
  baseURL: '',
  apiKey: '',
  model: '',
  header: '',
  body: '',
  id: ''
})
const rules = reactive<FormRules<BotConfig>>({
  baseURL: [
    { required: true, message: '接口地址不能为空', trigger: 'blur' }
  ],
  apiKey: [
    { required: true, message: 'API KEY不能为空', trigger: 'blur' }
  ]
})
// 是否自定义模型
const isCustomModel = computed(() => selectedModelId.value === 'custom')

// 处理模型选择变化
const handleModelChange = (modelId: string) => {
  const selectedModel = modelOptions.value.find(m => m.id === modelId)
  if (selectedModel) {
    form.model = selectedModel.id
    if (!isCustomModel.value) {
      form.baseURL = selectedModel.baseURL
      form.apiKey = selectedModel.apiKey
      form.body = JSON.stringify(selectedModel.body)
      form.header = JSON.stringify(selectedModel.header)
    } else {
      form.baseURL = ''
      form.apiKey = ''
      form.body = ''
      form.header = ''
    }
  }
}
// 保存机器人配置
const confirmForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      saveBot()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const saveBot = () => {
  const newId = String(store.state.bots.length + 1)
  const selectedModel = modelOptions.value.find(m => m.id === selectedModelId.value)
  const newBot: BotConfig = {
    id: newId,
    avatar: selectedModel?.avatar || 'robot.png',
    name: form.name || `${selectedModel?.name || '新助手'} ${newId}`,
    baseURL: form.baseURL,
    apiKey: form.apiKey,
    model: form.model
  }
  store.dispatch('addBotAndSelect', newBot)
  router.push({ name: 'Chat', params: { botId: newId } })
}

const cancel = () => {
  router.go(-1)
}

// 初始化默认选择第一个模型
onMounted(() => {
  if (modelOptions.value.length > 0) {
    selectedModelId.value = modelOptions.value[0].id
    handleModelChange(selectedModelId.value)
  }
})
</script>

<style scoped>
.new-page {
  padding: 20px;
  width: 100%;
  margin: 0 auto;
  text-align: center;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.new-card {
  width: 100%;
  max-width: 600px;
  padding: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}

.model-selector {
  width: 100%;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-name {
  flex: 1;
}
</style>