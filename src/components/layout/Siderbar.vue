<template>
    <div class="sidebar">
        <!-- 机器人列表区域 -->
        <div class="bot-list">
            <div v-for="(bot, index) in bots" :key="index" class="bot-item"
                :class="{ 'active': activeBotId === bot.id }" @click="selectBot(bot)">
                <div class="avatar-container">
                    <el-avatar shape="square" :size="48" :src="getAssetsFile(bot.avatar)">
                        {{ bot.name.charAt(0) }}
                    </el-avatar>
                </div>
            </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="sidebar-actions">
            <div class="action-item">
                <el-button class="action-item-button" :icon="Plus" circle size="large" @click="addBot"/>
            </div>
            <div class="action-item" @click="openSettings">
                <el-button class="action-item-button" :icon="Setting" circle size="large" @click="openSettings"/>
            </div>
            <div class="action-item" @click="openAbout">
                <el-button class="action-item-button" :icon="InfoFilled" circle size="large" @click="openAbout"/>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAssetsFile } from '../../utils/commonUtil.ts';
import {
    Plus,
    Setting,
    InfoFilled
} from '@element-plus/icons-vue'

// 定义机器人类型
interface Bot {
    id: string;
    name: string;
    avatar: string;
}

// 当前选中的机器人ID
const activeBotId = ref('1')

// 模拟机器人数据
const bots = ref<Bot[]>([
    { id: '1', name: '助手', avatar: '../assets/robot.png' },
    { id: '2', name: '文档', avatar: '' },
    { id: '3', name: '翻译', avatar: '' },
    { id: '4', name: '编程', avatar: '' },
])

// 选择机器人
const selectBot = (bot: Bot) => {
    activeBotId.value = bot.id
    emit('selectBot', bot)
}

// 添加机器人
const addBot = () => {
    emit('addBot')
}

// 打开设置
const openSettings = () => {
    emit('setting')
}

// 打开关于
const openAbout = () => {
    emit('about')
}

// 定义事件
const emit = defineEmits(['selectBot', 'addBot', 'setting', 'about'])

// 初始化选择第一个机器人
onMounted(() => {
    if (bots.value.length > 0) {
        selectBot(bots.value[0])
    }
})
</script>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #f5f7fa;
    border-right: 1px solid #e4e7ed;
    padding: 12px 0;
    width: 80px;
    box-sizing: border-box;
    overflow: hidden;
}

.bot-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.bot-item {
    flex-shrink: 0;
    cursor: pointer;
    width: 100%;
    height: 56px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
}

.bot-item.active {
    width: 100%;
    border-left: 4px solid #409eff;
}

.bot-item:hover {
    background-color: #e8f4ff;
}

.avatar-container {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    transition: all 0.3s ease;
}

.bot-item .avatar-container {
    border: 1px solid transparent;
}

.bot-item.active .avatar-container {
    left:-2px;
    border: 2px solid #409eff;
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.avatar-container .el-avatar {
    width: 100% !important;
    height: 100% !important;
}


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

/* 平滑过渡动画 */
@keyframes activeTransition {
    0% {
        transform: scale(0.95);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.bot-item.active .avatar-container {
    animation: activeTransition 0.3s ease-out;
}
</style>