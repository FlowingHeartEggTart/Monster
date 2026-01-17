/**
 * API 服务
 * 处理与后端的通信
 */

// 测试用户 ID
export const TEST_USER_ID = "e9af79c4-af87-49e1-bcc3-f2fe40715120";

// ================= 类型定义 =================
export type VisualEffect = 
  | 'fat_growth'    // 脂肪堆积
  | 'brain_fog'     // 脑雾/变笨
  | 'social_hide'   // 社交退缩
  | 'heavy_body'    // 身体沉重
  | 'insomnia'      // 失眠焦虑
  | null;

export type AnimationStyle = 'soft' | 'snappy';

export interface DialogueItem {
  content: string;
  displayDuration: number;    // 打字动画耗时 (毫秒)
  waitDuration: number;       // 读完后的停顿时间 (毫秒)
  animation?: AnimationStyle; // 动画风格
  visual_effect?: VisualEffect; // 视觉特效指令
}

export interface BingeApiResponse {
  success: boolean;
  data?: DialogueItem[];
  error?: string;
}

// ================= 本地模拟数据（后端 CORS 未修复前使用）=================

const MOCK_INIT_DIALOGUES: DialogueItem[] = [
  { 
    content: "嘿...又是你。", 
    displayDuration: 800, 
    waitDuration: 1500,
    animation: "soft"
  },
  { 
    content: "我知道你现在很难受。", 
    displayDuration: 1200, 
    waitDuration: 2000,
    animation: "soft"
  },
  { 
    content: "但是...你真的想吃吗？还是只是想逃避什么？", 
    displayDuration: 2000, 
    waitDuration: 3000,
    animation: "soft",
    visual_effect: "brain_fog"
  },
  { 
    content: "深呼吸...告诉我，发生了什么？", 
    displayDuration: 1500, 
    waitDuration: 2000,
    animation: "soft"
  }
];

const MOCK_CHAT_RESPONSES: string[] = [
  "我听到你了...",
  "这种感觉会过去的，相信我。",
  "你比你想象的更强大。",
  "不如我们一起数到10？",
  "想想上次你成功抵抗冲动的时候...",
  "你现在在哪里？能换个环境吗？",
  "喝杯水吧，慢慢来。",
];

// ================= 暴食阻断 API（本地模拟）=================

/**
 * 初始化干预 - 用户点击 SOS 按钮时调用
 * TODO: 后端修复 CORS 后恢复真实 API 调用
 */
export async function initIntervention(userId: string = TEST_USER_ID): Promise<DialogueItem[] | null> {
  console.log(`[BingeApi] 初始化干预 (本地模拟): userId=${userId}`);
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return MOCK_INIT_DIALOGUES;
}

/**
 * AI 自由对话 - 剧本播放完毕后用户输入时调用
 * TODO: 后端修复 CORS 后恢复真实 API 调用
 */
export async function chatWithMonster(
  message: string, 
  userId: string = TEST_USER_ID
): Promise<DialogueItem[] | null> {
  console.log(`[BingeApi] 发送对话 (本地模拟): msg=${message}`);
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 随机选择一个回复
  const randomResponse = MOCK_CHAT_RESPONSES[Math.floor(Math.random() * MOCK_CHAT_RESPONSES.length)];
  
  return [{ 
    content: randomResponse, 
    displayDuration: 1000, 
    waitDuration: 2000,
    animation: "soft"
  }];
}

/**
 * 通用接口 - 兼容旧代码
 */
export async function talkToMonster(
  userId: string, 
  message: string = "", 
  type: "init" | "chat" = "chat"
): Promise<DialogueItem[] | null> {
  if (type === "init") {
    return initIntervention(userId);
  } else {
    return chatWithMonster(message, userId);
  }
}

// ================= 其他 API =================

/**
 * 获取 AI 情绪反问
 */
export async function getAIReflection(): Promise<string | null> {
  try {
    return '此刻，你在想什么？';
  } catch (error) {
    console.error('Failed to get AI reflection:', error);
    return null;
  }
}

/**
 * 上报暂停事件（用于灯塔统计）
 */
export async function reportPauseEvent(): Promise<void> {
  // TODO: 实现实际的 API 调用
}

/**
 * 订阅灯塔在线人数
 */
export function subscribeLighthouseCount(
  callback: (count: number) => void
): () => void {
  // 临时模拟
  const interval = setInterval(() => {
    callback(Math.floor(Math.random() * 10) + 1);
  }, 2000);
  
  return () => clearInterval(interval);
}
