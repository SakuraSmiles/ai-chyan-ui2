<template>
    <div v-html="htmlContent" :class="talkId"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import 'highlight.js/styles/monokai-sublime.css'
import { marked } from 'marked';
import { markedHighlight } from "marked-highlight"
import hljs from 'highlight.js'

const props = defineProps(['value', 'boxId'])
const talkId = 'markdown-body-' + props.boxId
const htmlContent = ref('');
const render = new marked.Renderer()
marked.setOptions({
    renderer: render
})
marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code: string, lang: string) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
}));

// 解析 Markdown 内容
const parseMarkdown = async () => {
    const result = await marked.parse(htmlContent.value);
    htmlContent.value = typeof result === 'string' ? result : await result;
};

// 监听 value 变化
watch(
    () => props.value,
    (val) => {
        if (val) {
            parseMarkdown();
        }
    },
    { immediate: true }
);

onMounted(() => {
    if (props.value) {
        parseMarkdown();
    }
});
</script>
<style>
[class|=markdown-body] {
    padding: 20px;
    box-sizing: border-box;
}

pre {
    position: relative;
}

pre .enhance {
    display: flex;
    color: #247aaa;
    padding: 10px;
    box-sizing: border-box;
    font-size: 12px;
    border-radius: 9px;
    justify-content: flex-end;
    position: absolute;
    top: 0;
    right: 0;
}

pre .enhance .copyCode {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

pre .enhance .copyCode:hover {
    color: rgba(2, 120, 255, 0.84);
}

pre .enhance .copyCode i {
    font-size: 16px;
    margin-left: 5px;
}

.markdown-body code,
.markdown-body tt {
    background-color: #ffe6e6;
    color: #df3b3b;
}
</style>