// 消息类型
export interface ChatMessage {
  id: string;                             // 消息唯一ID
  type: 'system' | 'user' | 'assistant';  // 消息类型
  content: string;                        // 用户消息内容
  reply: string;                          // 助手回复内容
  think?: string;                           // 助手思考内容
  timestamp: Date;                        // 消息时间戳
  botId?: string;
  isContextual?: boolean;
}

// 消息输入组件的事件类型
export interface MessageInputEvent {
  content: string;
}

export interface StreamRequestConfig {
  method: 'POST' | 'GET';
  headers?: Record<string, string>;
  body?: any;
  stream: boolean;
}

//机器人配置
export interface BotConfig {
  id: string;
  name: string;
  avatar?: string;
  baseURL: string;
  header?: string | object;
  body?: string | object;
  apiKey?: string;
  model?: string;
  description?: string;
  streamConfig?: StreamRequestConfig;
  contextConfig?: ContextConfig;
}

export interface ModelConfig {
  id: string;
  name: string;
  avatar: string;
  baseURL: string;
  apiKey: string;
  description: string;
  header?: string | object;
  body: string | object;
}

export interface ContextSummary {
  id: string;               // 摘要唯一ID
  botId: string;            // 所属会话ID
  content: string;          // 摘要内容
  lastUpdated: Date;        // 最后更新时间
  tokenCount: number;       // 摘要的token数量（用于后续优化）
}

export interface ContextConfig {
  strategy: 'full' | 'summary' | 'recent' | 'hybrid'; // 上下文策略
  maxRecent: number;                      // 最大保留最近消息数
  maxTokens: number;                      // 最大上下文token数
  summaryInterval: number;                // 摘要生成间隔（消息数）
}