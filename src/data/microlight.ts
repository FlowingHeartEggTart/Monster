/**
 * 微光墙 - 匿名祝福数据
 */

export interface MicrolightMessage {
  id: string;
  text: string;
  timestamp: number;
}

// 预设的微光消息（示例数据）
export const PRESET_MICROLIGHT_MESSAGES: string[] = [
  '今晚月亮很亮，你也是',
  '撑过去了，明天会更好',
  '抱抱你，也抱抱我自己',
  '你值得被温柔对待',
  '此刻的你，已经很棒了',
  '不完美也没关系',
  '我们都在努力活着',
  '你不是一个人',
  '慢慢来，比较快',
  '给自己一个拥抱',
  '你已经做得很好了',
  '温柔地对待自己',
  '这一刻会过去的',
  '你比你想象的更坚强',
  '允许自己不那么坚强',
  '每一小步都值得庆祝',
  '你的存在本身就有意义',
  '谢谢你还在坚持',
  '深呼吸，一切都会好的',
  '你值得所有美好的事物',
];

// 生成随机微光消息
export function generateMicrolightMessages(count: number = 10): MicrolightMessage[] {
  const messages: MicrolightMessage[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * PRESET_MICROLIGHT_MESSAGES.length);
    messages.push({
      id: `msg-${now}-${i}`,
      text: PRESET_MICROLIGHT_MESSAGES[randomIndex],
      timestamp: now - Math.random() * 3600000, // 过去1小时内随机时间
    });
  }
  
  return messages.sort((a, b) => b.timestamp - a.timestamp);
}
