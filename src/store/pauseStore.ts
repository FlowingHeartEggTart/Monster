import { create } from 'zustand';
import { PAUSE_DURATION } from '@/utils/constants';

/**
 * Pause 状态机
 * IDLE → ACTIVE_90S → REFLECTION → IDLE
 */
export type PauseState = 'IDLE' | 'ACTIVE_90S' | 'REFLECTION';

interface PauseStore {
  state: PauseState;
  remainingSeconds: number;
  aiReflection: string | null;
  
  // Actions
  activatePause: () => void;
  updateCountdown: (seconds: number) => void;
  endCountdown: () => void;
  setReflection: (text: string) => void;
  reset: () => void;
}

export const usePauseStore = create<PauseStore>((set) => ({
  state: 'IDLE',
  remainingSeconds: PAUSE_DURATION,
  aiReflection: null,
  
  activatePause: () => {
    set({
      state: 'ACTIVE_90S',
      remainingSeconds: PAUSE_DURATION,
      aiReflection: null,
    });
  },
  
  updateCountdown: (seconds: number) => {
    set({ remainingSeconds: seconds });
  },
  
  endCountdown: () => {
    set({ state: 'REFLECTION' });
  },
  
  setReflection: (text: string) => {
    set({ aiReflection: text });
  },
  
  reset: () => {
    set({
      state: 'IDLE',
      remainingSeconds: PAUSE_DURATION,
      aiReflection: null,
    });
  },
}));

