<template>
  <div class="about-page">
    <h2>AI-CHYAN-UI2</h2>
    <el-card class="about-card">
      <div class="logo">
        <el-avatar :size="100" :src="getAssetsFile('../assets/robot.png')" />
      </div>
      <div class="version">版本: 1.0.0</div>
      <div class="description">
        <p>还没想好要写什么，就先这样把</p>
      </div>
      <div class="copyright">© 2025 SakuraSmiles</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { getAssetsFile } from '../utils/commonUtil';
</script>

<style scoped>
.about-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  height:100vh;
}

.about-card {
  margin-top: 20px;
  padding: 20px;
}

.logo {
  margin-bottom: 20px;
}

.version {
  font-size: 16px;
  color: #606266;
  margin-bottom: 20px;
}

.description {
  text-align: left;
  margin-bottom: 20px;
  line-height: 1.6;
}

.copyright {
  margin-top: 20px;
  font-size: 14px;
  color: #909399;
}
</style>