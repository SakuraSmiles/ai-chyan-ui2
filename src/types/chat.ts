// 消息类型
export interface ChatMessage {
    id: string;                             // 消息唯一ID
    type: 'system' | 'user' | 'assistant';  // 消息类型
    content: string;                        // 用户消息内容
    reply: string;                          // 助手回复内容
    timestamp: Date;                        // 消息时间戳
}

// 消息输入组件的事件类型
export interface MessageInputEvent {
    content: string;
}
//机器人配置
export interface BotConfig {
  id: string;
  name: string;
  avatar?: string;
  baseURL: string;
  apiKey?: string;
  model?: string;
  description?: string;
  header?: string  | object;
  body?: string | object;
}

export interface ModelConfig {
  id: string;
  name: string;
  avatar: string;
  baseURL: string;
  apiKey: string;
  description: string;
  header?: string  | object;
  body: string | object;
}