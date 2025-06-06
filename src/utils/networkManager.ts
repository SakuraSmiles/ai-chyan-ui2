import axios from 'axios';
import type {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError
} from 'axios';

// 网络请求配置
interface NetworkConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;
    withCredentials?: boolean;
}

// WebSocket 配置
interface WebSocketConfig {
    url: string;
    protocols?: string | string[];
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}

// WebSocket 事件监听器
type WebSocketEventListener = (data: any) => void;

// 网络通信类
class NetworkManager {
    private httpInstance: AxiosInstance | null = null;
    private wsInstance: WebSocket | null = null;
    private wsListeners: Record<string, WebSocketEventListener[]> = {};
    private reconnectAttempts = 0;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    // 初始化 HTTP 客户端
    initHttpClient(config: NetworkConfig = {}) {
        this.httpInstance = axios.create({
            baseURL: config.baseURL || import.meta.env.VITE_API_BASE_URL,
            timeout: config.timeout || 10000,
            headers: config.headers || {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            withCredentials: config.withCredentials || false
        });

        // 请求拦截器
        this.httpInstance.interceptors.request.use(
            (config) => {
                // 可以在这里添加全局请求逻辑，如添加 token
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        // 响应拦截器
        this.httpInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                // 可以在这里处理全局响应逻辑
                return response;
            },
            (error: AxiosError) => {
                // 全局错误处理
                if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            // 处理未授权
                            console.error('Unauthorized, redirecting to login...');
                            break;
                        case 403:
                            // 处理禁止访问
                            console.error('Forbidden');
                            break;
                        case 500:
                            // 处理服务器错误
                            console.error('Internal server error');
                            break;
                        default:
                            console.error(`HTTP Error: ${error.response.status}`);
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    // HTTP GET 请求
    async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        if (!this.httpInstance) {
            throw new Error('HTTP client not initialized. Call initHttpClient first.');
        }
        const response = await this.httpInstance.get<T>(url, config);
        return response.data;
    }

    // HTTP POST 请求
    async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!this.httpInstance) {
            throw new Error('HTTP client not initialized. Call initHttpClient first.');
        }
        const response = await this.httpInstance.post<T>(url, data, config);
        return response.data;
    }

    // HTTP PUT 请求
    async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        if (!this.httpInstance) {
            throw new Error('HTTP client not initialized. Call initHttpClient first.');
        }
        const response = await this.httpInstance.put<T>(url, data, config);
        return response.data;
    }

    // HTTP DELETE 请求
    async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        if (!this.httpInstance) {
            throw new Error('HTTP client not initialized. Call initHttpClient first.');
        }
        const response = await this.httpInstance.delete<T>(url, config);
        return response.data;
    }

    // 初始化 WebSocket
    initWebSocket(config: WebSocketConfig) {
        if (this.wsInstance) {
            this.closeWebSocket();
        }

        this.wsInstance = new WebSocket(config.url, config.protocols);
        this.reconnectAttempts = 0;

        this.wsInstance.onopen = () => {
            console.log('WebSocket connected');
            this.emit('open', null);
            this.reconnectAttempts = 0;
        };

        this.wsInstance.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.emit('message', data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
                this.emit('error', { type: 'parse_error', error });
            }
        };

        this.wsInstance.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
            this.reconnect(config);
        };

        this.wsInstance.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            this.emit('close', event);
            if (event.code !== 1000) { // 1000 is normal closure
                this.reconnect(config);
            }
        };
    }

    // 重连逻辑
    private reconnect(config: WebSocketConfig) {
        const maxAttempts = config.maxReconnectAttempts || 5;
        const interval = config.reconnectInterval || 3000;

        if (this.reconnectAttempts < maxAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${maxAttempts})...`);

            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
            }

            this.reconnectTimer = setTimeout(() => {
                this.initWebSocket(config);
            }, interval);
        } else {
            console.error('Max reconnect attempts reached. Giving up.');
            this.emit('reconnect_failed', null);
        }
    }

    // 发送 WebSocket 消息
    sendWebSocketMessage(data: any) {
        if (!this.wsInstance || this.wsInstance.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not connected.');
        }

        if (typeof data === 'string') {
            this.wsInstance.send(data);
        } else {
            this.wsInstance.send(JSON.stringify(data));
        }
    }

    // 关闭 WebSocket
    closeWebSocket(code?: number, reason?: string) {
        if (this.wsInstance) {
            this.wsInstance.close(code || 1000, reason);
            this.wsInstance = null;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    // 添加 WebSocket 事件监听
    on(event: string, listener: WebSocketEventListener) {
        if (!this.wsListeners[event]) {
            this.wsListeners[event] = [];
        }
        this.wsListeners[event].push(listener);
    }

    // 移除 WebSocket 事件监听
    off(event: string, listener: WebSocketEventListener) {
        if (this.wsListeners[event]) {
            const index = this.wsListeners[event].indexOf(listener);
            if (index !== -1) {
                this.wsListeners[event].splice(index, 1);
            }
        }
    }

    // 触发 WebSocket 事件
    private emit(event: string, data: any) {
        if (this.wsListeners[event]) {
            this.wsListeners[event].forEach(listener => listener(data));
        }
    }

    // 全局取消所有请求
    cancelAllRequests() {
        // 关闭 WebSocket
        this.closeWebSocket();
    }
}

// 创建全局网络管理器实例
const networkManager = new NetworkManager();

export default networkManager;