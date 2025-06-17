<template>
    <div class="sidebar">
        <!-- 机器人列表区域 -->
        <div class="bot-list">
            <div v-for="(bot, index) in bots" :key="index" class="bot-item"
                :class="{ 'active': activeBotId === bot.id }" @click="selectBot(bot)">
                <el-tooltip effect="dark" placement="right">
                    <template #content> {{bot.name}} <br/> {{bot.model}} <br/> {{bot.id}} </template>
                    <div class="avatar-container">
                        <el-avatar shape="square" :size="48" :src="getImg(bot.avatar)" fit="scale-down">
                            {{ bot.name.charAt(0) }}
                        </el-avatar>
                    </div>
                </el-tooltip>
            </div>
        </div>
        <actions @addBot="addBot" @about="about"></actions>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getImg } from '../../utils/commonUtil'
import Actions from './sidebar/Actions.vue'
import type { BotConfig } from '../../types/chat'

const store = useStore()
const route = useRoute()
const router = useRouter()

// 从 Vuex 获取机器人列表
const bots = computed(() => store.getters.allBots)

// 当前选中的机器人ID
const activeBotId = computed(() => store.state.currentBotId)

watch(
    () => route.params.botId,
    (newBotId) => {
        if (newBotId) {
            store.dispatch('changeSelectBot', newBotId)
        }
    }
)

// 选择机器人
const selectBot = (bot: BotConfig) => {
    store.dispatch('changeSelectBot', bot.id)
    router.push({ name: 'Chat', params: { botId: bot.id } })
}

// 添加机器人
const addBot = () => {
    store.dispatch('changeSelectBot', null)
    router.push({ name: 'New' })
}

// 打开关于
const about = () => {
    store.dispatch('changeSelectBot', null)
    router.push({ name: 'About' })
}

// 初始化选择第一个机器人
onMounted(() => {
    if (bots.value.length > 0 && !route.params.botId) {
        selectBot(bots.value[0])
    } else {
        addBot()
    }
})
</script>

<style scoped>
/* 保持原有样式不变 */
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
    left: -2px;
    border: 2px solid #409eff;
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.3);
}

.avatar-container .el-avatar {
    width: 100% !important;
    height: 100% !important;
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