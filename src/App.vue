<template>
  <div>
    <el-container>
      <el-aside width="80px">
        <Sidebar/>
      </el-aside>
      <el-container>
        <router-view />
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue';
import { sseManager } from './utils/sseManager';
import Sidebar from './components/layout/Sidebar.vue';


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

#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>