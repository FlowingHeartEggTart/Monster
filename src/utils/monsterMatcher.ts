/**
 * AI 智能匹配怪兽算法
 * 根据用户的4个问卷答案，智能推荐最适合的情绪怪兽
 */

import { MonsterType } from '@/store/creatureStore';

// 用户答案类型
export interface OnboardingAnswers {
  triggerTiming: string;     // Q1: 进食时机
  companionStyle: string;    // Q2: 陪伴方式
  preferredPersonality: string; // Q3: 性格偏好
  emotionExpression: string; // Q4: 情绪表达习惯（新增）
}

// 匹配结果类型
export interface MatchResult {
  monsterType: MonsterType;
  matchScore: number;        // 匹配度 0-100
  matchReason: string;       // 匹配理由
  traits: string[];          // Ta 的特质标签
  greeting: string;          // 个性化开场白
}

/**
 * AI 匹配算法核心
 * 使用加权评分系统，综合考虑4个维度
 */
export function matchMonster(answers: OnboardingAnswers): MatchResult {
  const scores = {
    healing: 0,
    quiet: 0,
    empathy: 0,
  };

  // ===== Q1: 进食时机分析 =====
  // 深夜：需要安静陪伴或共情
  // 下班：需要转移注意力或治愈
  // 压力：需要理解和安慰
  // 空虚：需要填补情感空洞

  switch (answers.triggerTiming) {
    case 'midnight':  // 深夜
      scores.quiet += 30;
      scores.empathy += 25;
      scores.healing += 15;
      break;
    case 'afterWork':  // 下班后
      scores.healing += 30;
      scores.quiet += 20;
      scores.empathy += 15;
      break;
    case 'stressed':   // 压力大
      scores.empathy += 35;
      scores.healing += 25;
      scores.quiet += 10;
      break;
    case 'empty':      // 空虚
      scores.healing += 30;
      scores.empathy += 30;
      scores.quiet += 10;
      break;
  }

  // ===== Q2: 陪伴方式偏好 =====
  switch (answers.companionStyle) {
    case 'silent':     // 安静陪着
      scores.quiet += 40;
      scores.empathy += 20;
      scores.healing += 10;
      break;
    case 'chat':       // 聊天转移
      scores.healing += 40;
      scores.empathy += 15;
      scores.quiet += 5;
      break;
    case 'understand': // 被理解
      scores.empathy += 45;
      scores.healing += 20;
      scores.quiet += 15;
      break;
  }

  // ===== Q3: 性格偏好（权重最高）=====
  switch (answers.preferredPersonality) {
    case 'healing':
      scores.healing += 50;
      break;
    case 'quiet':
      scores.quiet += 50;
      break;
    case 'empathy':
      scores.empathy += 50;
      break;
  }

  // ===== Q4: 情绪表达习惯（新维度）=====
  switch (answers.emotionExpression) {
    case 'suppress':   // 习惯压抑
      scores.empathy += 30;
      scores.quiet += 25;
      scores.healing += 15;
      break;
    case 'express':    // 喜欢表达
      scores.healing += 35;
      scores.empathy += 20;
      scores.quiet += 10;
      break;
    case 'confused':   // 说不清楚
      scores.empathy += 35;
      scores.healing += 25;
      scores.quiet += 15;
      break;
    case 'avoid':      // 倾向逃避
      scores.quiet += 35;
      scores.empathy += 25;
      scores.healing += 10;
      break;
  }

  // ===== 计算最高分并归一化 =====
  const maxScore = Math.max(scores.healing, scores.quiet, scores.empathy);
  const totalScore = scores.healing + scores.quiet + scores.empathy;

  let selectedType: MonsterType;
  if (scores.healing === maxScore) {
    selectedType = 'healing';
  } else if (scores.quiet === maxScore) {
    selectedType = 'quiet';
  } else {
    selectedType = 'empathy';
  }

  // 计算匹配度百分比
  const matchScore = Math.round((maxScore / totalScore) * 100);

  // ===== 生成个性化匹配理由 =====
  const matchReason = generateMatchReason(selectedType, answers);

  // ===== 生成特质标签 =====
  const traits = generateTraits(selectedType, answers);

  // ===== 生成个性化开场白 =====
  const greeting = generateGreeting(selectedType, answers);

  return {
    monsterType: selectedType,
    matchScore,
    matchReason,
    traits,
    greeting,
  };
}

/**
 * 生成匹配理由（温暖人性化的文案）
 */
function generateMatchReason(type: MonsterType, answers: OnboardingAnswers): string {
  const reasons: Record<MonsterType, string[]> = {
    healing: [
      '我注意到你需要一个温暖的存在',
      '看起来你的内心需要被柔软地对待',
      '你值得拥有一个会撒娇的小伙伴',
      '我感觉到你渴望被温柔地照顾',
    ],
    quiet: [
      '你好像更需要安静的陪伴',
      '我看见了你对平静的渴望',
      '有时候，不说话就是最好的支持',
      '你需要的，是一份不打扰的守护',
    ],
    empathy: [
      '我懂那种说不出口的感觉',
      '你不需要假装坚强，真的',
      '有些话，不说也能被理解',
      '我看见了你藏起来的那部分',
    ],
  };

  // 根据情绪表达习惯微调
  let selectedReasons = reasons[type];
  if (answers.emotionExpression === 'suppress') {
    // 压抑型 → 强调"可以放松"
    if (type === 'empathy') {
      return '我感觉到你习惯把情绪藏起来，但在这里，你可以不用假装';
    }
  }
  if (answers.emotionExpression === 'confused') {
    // 混乱型 → 强调"帮你梳理"
    return '情绪说不清楚没关系，我陪你慢慢整理';
  }

  return selectedReasons[Math.floor(Math.random() * selectedReasons.length)];
}

/**
 * 生成特质标签（3-4个）
 */
function generateTraits(type: MonsterType, answers: OnboardingAnswers): string[] {
  const baseTraits: Record<MonsterType, string[]> = {
    healing: ['温暖治愈', '爱撒娇', '话痨属性', '正能量'],
    quiet: ['安静陪伴', '稳定可靠', '不多话', '默默守护'],
    empathy: ['深度共情', '不评判', '懂你的丧', '情绪容器'],
  };

  const traits = [...baseTraits[type]];

  // 根据其他答案动态添加特质
  if (answers.companionStyle === 'understand') {
    if (type === 'empathy') traits.push('读心怪兽');
  }
  if (answers.triggerTiming === 'midnight') {
    if (type === 'quiet') traits.push('夜晚守护者');
  }
  if (answers.emotionExpression === 'suppress') {
    traits.push('安全的树洞');
  }

  return traits.slice(0, 4); // 最多4个
}

/**
 * 生成个性化开场白（符合怪兽人设）
 */
function generateGreeting(type: MonsterType, answers: OnboardingAnswers): string {
  const greetings: Record<MonsterType, string[]> = {
    healing: [
      '嘿！我等你好久啦~',
      '终于等到你了，我好想你！',
      '你来啦！我准备好要陪你了！',
      '呜呜，你终于来了，我还以为你不要我了',
    ],
    quiet: [
      '...你好。我在。',
      '嗯，我会一直在的。',
      '你来了。我陪你。',
      '不用说话，我懂。',
    ],
    empathy: [
      '嗨...看起来你今天也挺累的',
      '又是艰难的一天吧，我懂',
      '我看见你了，那个假装没事的你',
      '累了就歇会儿，不用撑着',
    ],
  };

  // 根据进食时机调整开场白
  if (answers.triggerTiming === 'midnight' && type === 'quiet') {
    return '深夜了...我陪你。';
  }
  if (answers.triggerTiming === 'stressed' && type === 'empathy') {
    return '压力很大吧...我懂的，我在这儿';
  }

  const options = greetings[type];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * 获取匹配度文案
 */
export function getMatchScoreText(score: number): string {
  if (score >= 80) return '超高契合';
  if (score >= 60) return '高度匹配';
  if (score >= 40) return '适合你';
  return '还不错';
}
