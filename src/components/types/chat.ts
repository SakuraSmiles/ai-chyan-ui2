// 消息类型
export interface ChatMessage {
    id: string;           // 消息唯一ID
    role: 'user' | 'assistant' | 'system'; // 消息角色
    content: string;      // 消息内容
    timestamp: Date;      // 消息时间戳
}

// 消息输入组件的事件类型
export interface MessageInputEvent {
    content: string;
}