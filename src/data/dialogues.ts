/**
 * SOS对话脚本数据
 * 90秒陪伴式对话流程
 */

export interface DialogueMessage {
  text: string;
  delay: number; // 延迟显示时间（毫秒）
  phase: 'opening' | 'listening' | 'empathy' | 'waiting';
}

export const SOS_DIALOGUE: DialogueMessage[] = [
  // 阶段一：开场（0-10秒）
  {
    text: '你来了。',
    delay: 0,
    phase: 'opening',
  },
  {
    text: '现在不需要想清楚发生了什么。',
    delay: 3000,
    phase: 'opening',
  },
  
  // 阶段二：倾听（10-40秒）
  {
    text: '我在听。',
    delay: 10000,
    phase: 'listening',
  },
  {
    text: '这种时候，真的挺难的。',
    delay: 20000,
    phase: 'listening',
  },
  
  // 阶段三：共情（40-70秒）
  {
    text: '很多人都会在这种时刻想靠吃缓一下。',
    delay: 40000,
    phase: 'empathy',
  },
  {
    text: '这不是你的问题。',
    delay: 55000,
    phase: 'empathy',
  },
  
  // 阶段四：陪伴等待（70-90秒）
  {
    text: '我们就一起待一会儿，好吗？',
    delay: 70000,
    phase: 'waiting',
  },
];

/**
 * 怪兽日常台词池
 * 低频情绪陪伴机制 - 不引导、不评估、不调节，只是安静地在
 */
export const MONSTER_DAILY_PHRASES = {
  healing: [
    '...',
    '嗯',
    '在呢',
    '......',
    '一起',
    '慢慢来',
    '没关系的',
  ],
  quiet: [
    '...',
    '......',
    '在',
    '嗯',
    '......',
    '......',
  ],
  empathy: [
    '...',
    '懂的',
    '嗯',
    '......',
    '在这儿',
    '......',
  ],
};

/**
 * 怪兽SOS开场台词
 */
export const MONSTER_SOS_OPENING = {
  healing: '怎么了呀？我在呢~',
  quiet: '来了...',
  empathy: '又是这个时候了吗...',
};

/**
 * 蛋糕获得后的鼓励语
 * 调整为更柔和、不评判的陪伴语言
 */
export const CAKE_ENCOURAGEMENT = [
  '......',
  '嗯',
  '一起的',
  '在呢',
  '慢慢来',
  '......',
];

/**
 * 失败/放弃时的安慰语
 */
export const COMFORT_PHRASES = [
  '没关系，我们明天再试',
  '很多人都会这样，这很正常',
  '你已经很努力了',
  '下次我们一起再试试',
  '每一次尝试都是进步',
];
