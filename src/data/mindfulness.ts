/**
 * 正念学堂知识卡片数据
 * 分三类：认知重塑、自我关怀、实用技巧
 */

export type CardCategory = 'cognition' | 'care' | 'tips';

export interface MindfulnessCard {
  id: string;
  day: number;
  emoji: string;
  category: CardCategory;
  content: string;
  source: string;
}

// 分类配置
export const CATEGORY_CONFIG: Record<CardCategory, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  cognition: {
    label: '认知重塑',
    color: '#A5C9E8',
    bgColor: '#D4E5F7',
    textColor: '#4A6A8A',
    borderColor: '#A5C9E8',
  },
  care: {
    label: '自我关怀',
    color: '#FFCAD4',
    bgColor: '#FFE5E8',
    textColor: '#8A4A5A',
    borderColor: '#FFCAD4',
  },
  tips: {
    label: '实用技巧',
    color: '#FFE5A0',
    bgColor: '#FFF5E0',
    textColor: '#8A6A4A',
    borderColor: '#FFE5A0',
  },
};

export const MINDFULNESS_CARDS: MindfulnessCard[] = [
  {
    id: 'card-1',
    day: 1,
    emoji: '💡',
    category: 'cognition',
    content: '情绪性进食不是意志力的问题，而是大脑在寻找快速的安慰剂。\n\n这是本能，不是你的错。',
    source: '《直觉饮食》',
  },
  {
    id: 'card-2',
    day: 2,
    emoji: '🌊',
    category: 'tips',
    content: '情绪像海浪，高峰只持续90秒。\n\n等一等，它会过去的。',
    source: '神经科学研究',
  },
  {
    id: 'card-3',
    day: 3,
    emoji: '🐻',
    category: 'cognition',
    content: '越是禁止自己吃某样东西，大脑就越会执着于它。\n\n这叫"白熊效应"。允许自己，反而更自由。',
    source: '心理学研究',
  },
  {
    id: 'card-4',
    day: 4,
    emoji: '🤗',
    category: 'care',
    content: '你不需要"战胜"自己的身体。\n\n你们是同一边的。',
    source: '身体积极运动',
  },
  {
    id: 'card-5',
    day: 5,
    emoji: '🌱',
    category: 'care',
    content: '一次"失控"不会毁掉一切。\n\n明天又是新的一天。',
    source: '自我关怀',
  },
  {
    id: 'card-6',
    day: 6,
    emoji: '🤔',
    category: 'tips',
    content: '下次冲动来了，试着问自己：\n\n我现在是饿了，还是累了、无聊了、难过了？',
    source: '正念饮食',
  },
  {
    id: 'card-7',
    day: 7,
    emoji: '💜',
    category: 'care',
    content: '你值得被好好对待。\n\n包括被食物好好对待。',
    source: '直觉饮食',
  },
];
