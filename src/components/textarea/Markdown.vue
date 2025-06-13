<template>
  <div class="markdown-container" v-html="renderedContent"></div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 可以选择其他样式

declare module 'marked' {
  interface MarkedOptions {
    highlight?: (code: string, lang: string) => string;
    langPrefix?: string;
  }
}

const escapeHtml = (unsafe: string) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export default defineComponent({
  props: {
    content: {
      type: String,
      required: true,
      default: ''
    },
    think: {
      type: String,
      required: false,
      default: ''
    }
  },
  setup(props) {
    const renderedContent = ref('');
    // 配置 marked
    marked.setOptions({
      highlight: (code: string, lang: string) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
      langPrefix: 'hljs language-',
      breaks: true,
      gfm: true
    });
    // 渲染 Markdown 内容
    const renderMarkdown = async (think: string, content: string) => {
      let finalHtml = '';

      if (think) {
        if(think == undefined){
          think = ""
        }
        // 使用escapeHtml转义特殊字符，防止XSS
        const escapedThink = escapeHtml(think);
        // 添加思考框的HTML结构
        finalHtml += `<div class="think">${escapedThink}</div>`;
      }
      const mdHtml = await marked(content);
      finalHtml += mdHtml;
      const parser = new DOMParser();
      const doc = parser.parseFromString(finalHtml, 'text/html');

      // 其余代码不变...
      const codeBlocks = doc.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        const text = block.textContent || '';
        block.innerHTML = text;
      });

      codeBlocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });

      return doc.body.innerHTML;
    };

    // 初始渲染
    onMounted(async () => {
      renderedContent.value = await renderMarkdown(props.think, props.content);
    });

    // 监听内容变化
    watch([() => props.think, () => props.content],
      async ([newThink, newContent]) => {
        renderedContent.value = await renderMarkdown(newThink, newContent);
      });

    return {
      renderedContent
    };
  }
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
/* 全局Markdown样式 */
.markdown-container h1,
.markdown-container h2,
.markdown-container h3,
.markdown-container h4,
.markdown-container h5,
.markdown-container h6 {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.markdown-container h1 {
  font-size: 1.8em;
}

.markdown-container h2 {
  font-size: 1.5em;
}

.markdown-container h3 {
  font-size: 1.3em;
}

.markdown-container h4 {
  font-size: 1.1em;
}

.markdown-container h5 {
  font-size: 1em;
}

.markdown-container h6 {
  font-size: 0.9em;
  color: #666;
}

.markdown-container p {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.markdown-container ul,
.markdown-container ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-container li {
  margin-bottom: 0.5em;
}

.markdown-container blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1em;
  color: #666;
  margin: 1em 0;
}

.markdown-container a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-container a:hover {
  text-decoration: underline;
}

.markdown-container img {
  max-width: 100%;
}

.markdown-container table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 1em;
}

.markdown-container th,
.markdown-container td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.markdown-container th {
  background-color: #f5f5f5;
  font-weight: bold;
}

/* 特殊样式 - 思考框 */
.markdown-container .think {
  display: inline-block;
  padding: 12px 24px;
  color: #999999;
  font-size: 13px;
  background: #ffffff66;
  margin: 5px;
  border-radius: 5px;
  /* 思考框内容使用等宽字体更合适 */
  font-family: monospace, monospace;
  /* 添加轻微边框 */
  border: 1px solid #eaeaea;
}
</style>