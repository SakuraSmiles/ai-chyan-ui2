<template>
    <!-- 底部操作按钮 -->
    <div class="sidebar-actions">
        <div class="action-item">
            <el-button class="action-item-button" :icon="Plus" circle size="large" @click="addBot"/>
        </div>
        <!-- <div class="action-item">
            <el-button class="action-item-button" :icon="Setting" circle size="large" @click="setting"/>
        </div> -->
        <div class="action-item">
            <el-button class="action-item-button" :icon="InfoFilled" circle size="large" @click="about"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import {
    Plus,
    // Setting,
    InfoFilled
} from '@element-plus/icons-vue'

// 添加机器人
const addBot = () => {
    emit('addBot')
}

// 打开设置
// const setting = () => {
//     emit('setting')
// }

// 打开关于
const about = () => {
    emit('about')
}

// 定义事件
const emit = defineEmits(['addBot', 'setting', 'about'])
</script>

<style scoped>
.sidebar-actions {
    padding: 12px 0 0;
    border-top: 1px solid #e4e7ed;
}

.action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    transition: all 0.3s ease;
    margin: 0 4px;
}

.action-item-button {
    font-size: 18px;
}

button:focus, button:focus-visible {
    outline: none;
}
</style>