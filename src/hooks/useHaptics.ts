import { useEffect, useRef } from 'react';
import { usePauseStore } from '@/store/pauseStore';
import { HAPTIC_INTERVAL } from '@/utils/constants';
import { safeHapticImpact } from '@/utils/haptics';
import * as Haptics from 'expo-haptics';

/**
 * 触觉反馈 Hook
 * 在 Pause 激活期间，每 4-6 秒一次弱震动
 */
export function useHaptics() {
  const { state } = usePauseStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (state !== 'ACTIVE_90S') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    // 每 5 秒一次弱震动（4-6秒之间）
    intervalRef.current = setInterval(() => {
      safeHapticImpact(Haptics.ImpactFeedbackStyle.Light);
    }, HAPTIC_INTERVAL);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state]);
}

