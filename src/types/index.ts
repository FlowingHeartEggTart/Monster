/**
 * 全局类型定义
 */

export type PauseState = 'IDLE' | 'ACTIVE_90S' | 'REFLECTION';

export interface PauseStore {
  state: PauseState;
  remainingSeconds: number;
  aiReflection: string | null;
}

export interface CreatureStore {
  name: string | null;
  lastSeen: number | null;
}

export interface LighthouseStore {
  activeCount: number;
}

