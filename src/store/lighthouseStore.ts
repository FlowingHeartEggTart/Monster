import { create } from 'zustand';

/**
 * 灯塔状态Store
 */
interface LighthouseStore {
  activeCount: number;
  userHasLit: boolean; // 用户是否点亮过
  justLit: boolean; // 是否刚刚点亮（用于触发动画）
  setActiveCount: (count: number) => void;
  lightUp: () => void; // 点亮灯塔
  resetJustLit: () => void; // 重置"刚刚点亮"状态
  reset: () => void; // 重置所有状态
}

export const useLighthouseStore = create<LighthouseStore>((set) => ({
  activeCount: 47,
  userHasLit: false,
  justLit: false,
  
  setActiveCount: (count) => set({ activeCount: count }),
  
  lightUp: () => set({ 
    userHasLit: true, 
    justLit: true,
  }),
  
  resetJustLit: () => set({ justLit: false }),
  
  reset: () => set({
    activeCount: 47,
    userHasLit: false,
    justLit: false,
  }),
}));
