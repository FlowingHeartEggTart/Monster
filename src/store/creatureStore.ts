import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 怪兽类型
 */
export type MonsterType = 'healing' | 'quiet' | 'empathy';

/**
 * 怪兽视觉编号（对应素材 1.JPG, 2.JPG 等）
 */
export type MonsterIndex = 1 | 2;

export interface MonsterConfig {
  type: MonsterType;
  name: string;
  defaultName: string;
  personality: string;
  color: string;
  emoji: string;
  index: MonsterIndex;  // 对应的素材编号
}

export const MONSTER_TYPES: Record<MonsterType, MonsterConfig> = {
  healing: {
    type: 'healing',
    name: '',
    defaultName: '糯糯',
    personality: '软萌、爱撒娇、话多一点',
    color: '#FFCAD4',
    emoji: '🌸',
    index: 1,
  },
  quiet: {
    type: 'quiet',
    name: '',
    defaultName: '默默',
    personality: '话少、安静陪着、偶尔说一句',
    color: '#A5C9E8',
    emoji: '☁️',
    index: 2,
  },
  empathy: {
    type: 'empathy',
    name: '',
    defaultName: '丧丧',
    personality: '有点丧、但很懂你、不评判',
    color: '#C5A8E8',
    emoji: '💜',
    index: 1,  // 共用怪兽1的素材
  },
};

/**
 * 怪兽状态Store
 */
interface CreatureStore {
  // 基础信息
  monsterType: MonsterType | null;
  monsterName: string | null;
  hasCompletedOnboarding: boolean;

  // AI 匹配数据（新增）
  matchScore: number | null;         // 匹配度
  matchReason: string | null;        // 匹配理由
  matchTraits: string[];             // 怪兽特质

  // 蛋糕经济
  cakeCount: number;

  // 日常任务状态
  dailyMindfulnessCompleted: boolean;
  dailyLighthouseCompleted: boolean;
  lastResetDate: string;

  // 统计
  sosSuccessCount: number;
  totalDays: number;

  // Actions
  setMonster: (type: MonsterType, name: string, matchData?: { score: number; reason: string; traits: string[] }) => void;
  completeOnboarding: () => void;
  addCake: (count: number) => void;
  useCake: (count: number) => boolean;
  completeDailyMindfulness: () => void;
  completeDailyLighthouse: () => void;
  incrementSOSSuccess: () => void;
  resetDaily: () => void;
  clear: () => void;
}

const STORAGE_KEY = '@pauselight:creature';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const useCreatureStore = create<CreatureStore>((set, get) => ({
  // 初始状态
  monsterType: null,
  monsterName: null,
  hasCompletedOnboarding: false,
  matchScore: null,
  matchReason: null,
  matchTraits: [],
  cakeCount: 0,
  dailyMindfulnessCompleted: false,
  dailyLighthouseCompleted: false,
  lastResetDate: getTodayDate(),
  sosSuccessCount: 0,
  totalDays: 0,

  setMonster: (type: MonsterType, name: string, matchData?: { score: number; reason: string; traits: string[] }) => {
    set({
      monsterType: type,
      monsterName: name,
      matchScore: matchData?.score || null,
      matchReason: matchData?.reason || null,
      matchTraits: matchData?.traits || [],
    });
    get().saveToStorage();
  },
  
  completeOnboarding: () => {
    set({ hasCompletedOnboarding: true });
    get().saveToStorage();
  },
  
  addCake: (count: number) => {
    set((state) => ({ cakeCount: state.cakeCount + count }));
    get().saveToStorage();
  },
  
  useCake: (count: number) => {
    const { cakeCount } = get();
    if (cakeCount >= count) {
      set({ cakeCount: cakeCount - count });
      get().saveToStorage();
      return true;
    }
    return false;
  },
  
  completeDailyMindfulness: () => {
    set({ dailyMindfulnessCompleted: true });
    get().addCake(1);
  },
  
  completeDailyLighthouse: () => {
    set({ dailyLighthouseCompleted: true });
    get().addCake(1);
  },
  
  incrementSOSSuccess: () => {
    set((state) => ({ sosSuccessCount: state.sosSuccessCount + 1 }));
    get().addCake(1);
    get().saveToStorage();
  },
  
  resetDaily: () => {
    const today = getTodayDate();
    const { lastResetDate } = get();
    
    if (today !== lastResetDate) {
      set({
        dailyMindfulnessCompleted: false,
        dailyLighthouseCompleted: false,
        lastResetDate: today,
        totalDays: get().totalDays + 1,
      });
      get().saveToStorage();
    }
  },
  
  clear: async () => {
    set({
      monsterType: null,
      monsterName: null,
      hasCompletedOnboarding: false,
      matchScore: null,
      matchReason: null,
      matchTraits: [],
      cakeCount: 0,
      dailyMindfulnessCompleted: false,
      dailyLighthouseCompleted: false,
      lastResetDate: getTodayDate(),
      sosSuccessCount: 0,
      totalDays: 0,
    });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear creature data:', error);
    }
  },

  saveToStorage: async () => {
    const state = get();
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        monsterType: state.monsterType,
        monsterName: state.monsterName,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        matchScore: state.matchScore,
        matchReason: state.matchReason,
        matchTraits: state.matchTraits,
        cakeCount: state.cakeCount,
        dailyMindfulnessCompleted: state.dailyMindfulnessCompleted,
        dailyLighthouseCompleted: state.dailyLighthouseCompleted,
        lastResetDate: state.lastResetDate,
        sosSuccessCount: state.sosSuccessCount,
        totalDays: state.totalDays,
      }));
    } catch (error) {
      console.error('Failed to save creature data:', error);
    }
  },
}));

// 初始化函数
export async function initializeCreatureStore() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      useCreatureStore.setState(parsed);
      // 检查是否需要重置每日任务
      useCreatureStore.getState().resetDaily();
    }
  } catch (error) {
    console.error('Failed to load creature data:', error);
  }
}
