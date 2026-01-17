import { useEffect, useRef } from 'react';
import { usePauseStore } from '@/store/pauseStore';
import { PAUSE_DURATION } from '@/utils/constants';

/**
 * 90秒倒计时 Hook
 * 使用 requestAnimationFrame 确保流畅
 */
export function useCountdown() {
  const { remainingSeconds, updateCountdown, endCountdown, state } = usePauseStore();
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (state !== 'ACTIVE_90S') {
      // 清理动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      startTimeRef.current = null;
      return;
    }
    
    // 初始化开始时间
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
    
    const PAUSE_DURATION_MS = PAUSE_DURATION * 1000; // 毫秒
    
    const update = () => {
      if (startTimeRef.current === null) return;
      
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, PAUSE_DURATION_MS - elapsed);
      const seconds = Math.ceil(remaining / 1000);
      
      updateCountdown(seconds);
      
      if (remaining <= 0) {
        endCountdown();
        return;
      }
      
      animationFrameRef.current = requestAnimationFrame(update);
    };
    
    animationFrameRef.current = requestAnimationFrame(update);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state, updateCountdown, endCountdown]);
  
  return remainingSeconds;
}

