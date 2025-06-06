<template>
  <div :id="id" class="markdown-container" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { markedHighlight } from 'marked-highlight';

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  }
});

const renderedContent = ref('');

// 配置marked
marked.setOptions({
  breaks: true,
  gfm: true
});
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));
// 自定义渲染器处理div标签
const renderer = new marked.Renderer();

// 重写html渲染方法
renderer.html = (html) => {
  // 保留div标签及其内容
  if (html.startsWith('<div') || html.startsWith('</div')) {
    return html;
  }
  // 对其他HTML标签进行转义
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// 渲染Markdown内容
const renderMarkdown = (content: string): string => {
  // 使用marked解析Markdown
  const rawHtml = marked(content, { renderer }) as string;
  
  // 使用DOMPurify消毒
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                   'strong', 'em', 'blockquote', 'code', 'pre', 
                   'ul', 'ol', 'li', 'a', 'img', 'br', 'hr', 'span'],
    ALLOWED_ATTR: ['class', 'href', 'src', 'alt', 'style']
  });
  
  return cleanHtml;
};

// 高亮代码块
const highlightCode = () => {
  nextTick(() => {
    const container = document.getElementById(props.id);
    if (container) {
      container.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }
  });
};

// 监听内容变化
watch(() => props.content, (newContent) => {
  renderedContent.value = renderMarkdown(newContent);
  highlightCode();
}, { immediate: true });

onMounted(() => {
  highlightCode();
});
</script>

<style scoped>
.markdown-container {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  word-break: break-word;
}
</style>

<style>
/* 特殊样式 - 思考框 */
.markdown-container .think {
  display: inline-block;
  padding: 12px 24px;
  color: #999999;
  font-size: 13px;
  background: #ffffff66;
  margin: 5px;
  border-radius: 5px;
}
</style>