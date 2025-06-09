<template>
  <div class="settings-page">
    <h2>系统设置</h2>
    <el-form label-width="120px">
      <el-form-item label="主题设置">
        <el-switch v-model="theme" active-text="深色" inactive-text="浅色" />
      </el-form-item>
      <el-form-item label="通知设置">
        <el-switch v-model="notifications" />
      </el-form-item>
      <el-form-item label="语言设置">
        <el-select v-model="language" placeholder="请选择语言">
          <el-option label="简体中文" value="zh-CN" />
          <el-option label="English" value="en" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveSettings">保存设置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const theme = ref(false)
const notifications = ref(true)
const language = ref('zh-CN')

const saveSettings = () => {
  console.log('保存设置', {
    theme: theme.value,
    notifications: notifications.value,
    language: language.value
  })
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  height:100vh;
}
</style>