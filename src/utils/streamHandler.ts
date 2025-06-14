// 定义内容类型
export type ContentType = 'normal' | 'reasoning';

// 流式处理结果
export interface StreamProcessingResult {
  content: string;
  type: ContentType;
}

// 流式处理器接口
export interface StreamHandler {
  processChunk(chunk: string): StreamProcessingResult[];
  isEndOfStream(): boolean;
}

// 处理器工厂函数
export const createStreamHandler = (modelType: string): StreamHandler => {
  switch (modelType) {
    case 'ollama':
      return new OllamaStreamHandler();
    case 'deepseek-chat':
      return new DeepSeekStreamHandler();
    case 'deepseek-reasner':
      return new DeepSeekStreamHandler();
    default:
      return new DeepSeekStreamHandler();
  }
};

// 基础处理器
abstract class BaseStreamHandler implements StreamHandler {
  protected buffer: string = '';
  protected isInThinkingBlock: boolean = false;

  abstract processChunk(chunk: string): StreamProcessingResult[];

  isEndOfStream(): boolean {
    return false;
  }

  protected processContent(content: string, isThink?: boolean): StreamProcessingResult {
    // 处理思考块逻辑
    if (content.includes('<think>')) {
      this.isInThinkingBlock = true;
      content = content.replace('<think>', '').trim();
    }

    if (content.includes('</think>')) {
      this.isInThinkingBlock = false;
      content = content.replace('</think>', '').trim();
    }

    return {
      content,
      type: (isThink || this.isInThinkingBlock) ? 'reasoning' : 'normal'
    };
  }
}

// DeepSeek 流式处理器
class DeepSeekStreamHandler extends BaseStreamHandler {
  processChunk(chunk: string): StreamProcessingResult[] {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    const results: StreamProcessingResult[] = [];

    for (const line of lines) {
      if (!line.trim() || line === 'data: [DONE]') continue;
      // 提取数据部分
      const dataPrefix = 'data: ';
      if (!line.startsWith(dataPrefix)) {
        console.warn('Unexpected event format:', line);
        continue;
      }

      const jsonStr = line.substring(dataPrefix.length);
      try {
        const jsonData = JSON.parse(jsonStr);
        if (jsonData.choices?.[0]?.delta?.content) {
          const content = jsonData.choices[0].delta.content;
          results.push(this.processContent(content, false));
        }
        if (jsonData.choices?.[0]?.delta?.reasoning_content) {
          const content = jsonData.choices[0].delta.reasoning_content;
          results.push(this.processContent(content, true));
        }
      } catch (error) {
        console.warn('DeepSeek JSON解析失败:', error, '原始数据:', line);
        results.push({
          content: line,
          type: 'normal'
        });
      }
    }
    return results;
  }
}

// Ollama 流式处理器
class OllamaStreamHandler extends BaseStreamHandler {
  processChunk(chunk: string): StreamProcessingResult[] {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';
    const results: StreamProcessingResult[] = [];
    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const jsonData = JSON.parse(line);
        if (jsonData.message?.content) {
          const content = jsonData.message.content;
          results.push(this.processContent(content));
        }
      } catch (error) {
        console.warn('Ollama JSON解析失败:', error, '原始数据:', line);
        results.push({
          content: line,
          type: 'normal'
        });
      }
    }
    return results;
  }
}