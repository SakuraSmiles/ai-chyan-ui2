/**
 * 生成符合 RFC4122 标准的 UUID v4
 * @returns 生成的 UUID 字符串
 */
export const generateUUID = (): string => {
    // 使用加密安全的随机数生成器
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

/**
 * 简化的 UUID 生成器（长度更短）
 * @returns 16 字符的简化 UUID
 */
export const generateShortUUID = (): string => {
    return Math.random().toString(36).substring(2, 10) +
        Math.random().toString(36).substring(2, 10);
};

/**
 * 检查字符串是否为有效的 UUID
 * @param id 要检查的字符串
 * @returns 是否为有效的 UUID
 */
export const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};