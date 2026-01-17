/**
 * API 服务
 * 处理与后端的通信
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.pauselight.com';

/**
 * 获取 AI 情绪反问
 * TODO: 实现实际的 API 调用
 */
export async function getAIReflection(): Promise<string | null> {
  try {
    // 示例：实际应该调用后端 API
    // const response = await fetch(`${API_BASE_URL}/reflection`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    // });
    // const data = await response.json();
    // return data.reflection;
    
    // 临时返回示例文本
    return '此刻，你在想什么？';
  } catch (error) {
    console.error('Failed to get AI reflection:', error);
    return null;
  }
}

/**
 * 上报暂停事件（用于灯塔统计）
 * TODO: 实现实际的 API 调用
 */
export async function reportPauseEvent(): Promise<void> {
  try {
    // 示例：实际应该调用后端 API
    // await fetch(`${API_BASE_URL}/pause`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    // });
  } catch (error) {
    console.error('Failed to report pause event:', error);
  }
}

/**
 * 订阅灯塔在线人数
 * TODO: 实现 WebSocket / Supabase Realtime 连接
 */
export function subscribeLighthouseCount(
  callback: (count: number) => void
): () => void {
  // 示例：实际应该使用 WebSocket
  // const ws = new WebSocket(`${WS_BASE_URL}/lighthouse`);
  // ws.onmessage = (event) => {
  //   const data = JSON.parse(event.data);
  //   callback(data.count);
  // };
  // return () => ws.close();
  
  // 临时模拟
  const interval = setInterval(() => {
    callback(Math.floor(Math.random() * 10) + 1);
  }, 2000);
  
  return () => clearInterval(interval);
}

