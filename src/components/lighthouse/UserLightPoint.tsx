import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';

interface UserLightPointProps {
  justLit?: boolean; // 是否刚刚点亮
}

/**
 * 用户专属光点
 * 在灯塔地图上显示用户点亮的微光
 */
export function UserLightPoint({ justLit = false }: UserLightPointProps) {
  const innerOpacity = useSharedValue(0.8);
  const middleOpacity = useSharedValue(0.5);
  const outerOpacity = useSharedValue(0.3);
  const scale = useSharedValue(1);
  
  // 刚点亮时的爆发动画
  useEffect(() => {
    if (justLit) {
      // 爆发效果
      scale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1.8, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
      );
      
      innerOpacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: 400 }),
        withDelay(200, withTiming(0.8, { duration: 300 }))
      );
      
      outerOpacity.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(0.8, { duration: 400 }),
        withDelay(200, withTiming(0.3, { duration: 300 }))
      );
    }
  }, [justLit]);
  
  // 持续的呼吸动画
  useEffect(() => {
    // 内层：快速闪烁
    innerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    // 中层：中速脉动
    middleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    // 外层：慢速扩散
    outerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    // 缩放脉动
    if (!justLit) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [justLit]);
  
  const innerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: innerOpacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  const middleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: middleOpacity.value,
    transform: [{ scale: scale.value * 1.2 }],
  }));
  
  const outerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: outerOpacity.value,
    transform: [{ scale: scale.value * 1.5 }],
  }));
  
  return (
    <View style={styles.container}>
      {/* 外层光晕 - 最大范围 */}
      <Animated.View style={[styles.outerGlow, outerAnimatedStyle]} />
      
      {/* 中层光晕 - 过渡层 */}
      <Animated.View style={[styles.middleGlow, middleAnimatedStyle]} />
      
      {/* 内层核心 - 最亮 */}
      <Animated.View style={[styles.innerCore, innerAnimatedStyle]} />
      
      {/* 中心点 - 固定 */}
      <View style={styles.centerDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    // 用户光点位置（地图中心偏上）
    top: '35%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
  },
  outerGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.lighthouse.light,
    shadowColor: colors.lighthouse.light,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  middleGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.lighthouse.light,
    shadowColor: colors.lighthouse.light,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  innerCore: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.lighthouse.light,
    shadowColor: colors.lighthouse.light,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
});
