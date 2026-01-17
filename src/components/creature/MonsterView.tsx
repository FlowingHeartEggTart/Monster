import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { MONSTER_TYPES, MonsterType } from '@/store/creatureStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface MonsterViewProps {
  monsterType: MonsterType;
  animatedStyle?: any;
}

/**
 * 怪兽视图组件
 * 包含呼吸动画和光晕效果
 */
export function MonsterView({ monsterType, animatedStyle }: MonsterViewProps) {
  const monsterConfig = MONSTER_TYPES[monsterType];
  const glowOpacity = useSharedValue(0.3);
  
  // 光晕动画
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);
  
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));
  
  return (
    <View style={styles.container}>
      {/* 光晕 */}
      <Animated.View 
        style={[
          styles.glow,
          { backgroundColor: monsterConfig.color },
          glowAnimatedStyle,
        ]} 
      />
      
      {/* 怪兽主体 */}
      <Animated.View style={[styles.monster, animatedStyle]}>
        <Text style={styles.monsterEmoji}>{monsterConfig.emoji}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  monster: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monsterEmoji: {
    fontSize: 100,
  },
});
