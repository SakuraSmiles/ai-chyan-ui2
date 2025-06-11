export const extractContent = (jsonData: any): string => {
  // 尝试多种可能的响应格式
  const contentSources = [
    jsonData.choices?.[0]?.delta?.content,       // OpenAI格式
    jsonData.choices?.[0]?.message?.content,    // 另一种OpenAI格式
    jsonData.choices?.[0]?.text,                // 旧版OpenAI
    jsonData.completion,                         // Anthropic
    jsonData.content,                            // 通用格式
    jsonData.result,                             // 其他API
    jsonData.message,                            // 错误消息
    jsonData                                     // 最后手段
  ];

  // 找到第一个非空值
  for (const source of contentSources) {
    if (source !== undefined && source !== null) {
      // 如果是对象，尝试提取纯文本
      if (typeof source === 'object') {
        return extractTextFromObject(source);
      }
      return typeof source === 'string' ? source : String(source);
    }
  }
  
  return ''; // 默认返回空字符串
};

// 从对象中提取纯文本
const extractTextFromObject = (obj: any): string => {
  // 如果对象有 text 属性
  if (obj.text) {
    return obj.text;
  }
  
  // 如果对象有 content 属性
  if (obj.content) {
    return obj.content;
  }
  
  // 尝试从高亮对象中提取纯文本
  if (obj.children && Array.isArray(obj.children)) {
    return obj.children.map((child: any) => {
      if (child.text) return child.text;
      if (child.value) return child.value;
      return '';
    }).join('');
  }
  
  // 最后手段，返回JSON字符串
  return JSON.stringify(obj);
};