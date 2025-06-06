class SseManager {
  private eventSource: EventSource | null = null;
  private messageCallback: ((data: string) => void) | null = null;
  private errorCallback: (() => void) | null = null;
  
  // 创建新的 EventSource 连接
  connect(url: string, onMessage: (data: string) => void, onError: () => void) {
    // 关闭现有连接
    this.close();
    
    // 创建新连接
    this.eventSource = new EventSource(url);
    this.messageCallback = onMessage;
    this.errorCallback = onError;
    
    // 设置事件监听器
    this.eventSource.onmessage = (event) => {
      if (this.messageCallback) {
        this.messageCallback(event.data);
      }
    };
    
    this.eventSource.onerror = () => {
      if (this.errorCallback) {
        this.errorCallback();
      }
      this.close();
    };
  }
  
  // 关闭连接
  close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.messageCallback = null;
    this.errorCallback = null;
  }
  
  // 检查是否已连接
  isConnected(): boolean {
    return this.eventSource !== null;
  }
}

// 创建全局实例
export const sseManager = new SseManager();