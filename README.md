<div align="center">

 <h1> 爱酱机器人聊天前端应用 </h1>

  <img src="https://img.shields.io/badge/Vue-3.5.13-brightgreen.svg"/>
  <img src="https://img.shields.io/badge/Vite-6.3.5-green.svg"/>
  <img src="https://img.shields.io/badge/Element Plus-2.9.11-blue.svg"/>
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"/>
</div>

## 项目简介

一个基于Vite+Vue3+TypeScript+elementPlus的聊天机器人前端应用，支持实时对话、Markdown格式渲染和代码高亮。

## 功能特点

- 用户与机器人的实时对话界面

- 助手回复消息的Markdown格式渲染（支持代码高亮、特殊样式等）

- 安全的HTML内容消毒处理（使用DOMPurify）

- 支持SSE（Server-Sent Events）实时接收消息


## 快速开始

### 环境要求

- Node.js (推荐版本: v14+)

- npm 或 yarn

### 安装依赖

```bash

npm install

# 或

yarn

```

### 开发环境

```bash

npm run dev

# 或

yarn dev

```

### 生产构建

```bash

npm run build

# 或

yarn build

```


## 项目配置

项目后端API地址配置在`App.vue`中：

```javascript

const url = ref('http://localhost:8080/rag/search?message=')

```
可根据实际后端服务地址进行修改。


## 使用说明

1. 启动项目后，进入聊天界面。

2. 在输入框中输入消息，点击发送按钮或按Enter键发送。

3. 用户消息会立即显示在聊天窗口中。

4. 助手回复会通过SSE接收并显示，同时支持Markdown渲染和代码高亮。

5. 在等待助手回复时，会显示加载动画。



## 注意事项

- 本项目需要配合后端服务使用（提供SSE接口）。

- 由于使用了SSE，请确保后端支持并正确配置CORS。

## 技术栈

- Vue 3 (Composition API)

- TypeScript

- Vite

- Element Plus (UI组件库)

- Marked (Markdown解析)

- Highlight.js (代码高亮)

- DOMPurify (HTML消毒)

## 项目结构

```

project/

├── src/

│   ├── components/

│   │   ├── chat/

│   │   │   ├── MessageHistory.vue   # 消息历史记录组件

│   │   │   ├── MessageInput.vue     # 消息输入组件

│   │   │   └── Markdown.vue         # Markdown渲染组件

│   ├── utils/

│   │   └── sseManager.ts            # SSE事件源管理工具

│   │   ├── networkManager.ts        # 网络请求（http/websocket）管理工具

│   ├── types/                       # 类型定义

│   │   └── chat.ts                  

│   ├── App.vue                      # 主应用组件

│   └── main.ts                      # 入口文件

├── package.json

├── vite.config.ts

└── README.md

```

## 许可证

Apache2.0 License

## 未来计划

- 公网模型api接口配置调用
- 前端聊天记录缓存
- 会话记录创建


## 贡献指南

欢迎提交Issue和Pull Request。
