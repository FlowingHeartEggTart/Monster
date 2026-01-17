import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';
import { MicrolightMessage } from '@/data/microlight';

interface MicrolightBubbleProps {
  message: MicrolightMessage;
  index: number;
}

/**
 * 微光气泡组件
 * 采用梦幻填充式动画，在深色背景下呈现温暖的光晕效果
 */
export function MicrolightBubble({ message, index }: MicrolightBubbleProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const blur = useSharedValue(15);
  
  useEffect(() => {
    // 错开出现时间，形成优雅的级联效果
    const delayBase = index * 150;
    
    opacity.value = withDelay(
      delayBase,
      withTiming(1, {
        duration: 2000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
    
    scale.value = withDelay(
      delayBase + 100,
      withTiming(1, {
        duration: 2500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
    
    blur.value = withDelay(
      delayBase + 200,
      withTiming(0, {
        duration: 2300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );
  }, [index]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    return '1天前';
  };
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.innerContainer}>
        {/* 多层光晕效果 */}
        <View style={styles.outerGlow} />
        <View style={styles.middleGlow} />
        
        {/* 内容层 */}
        <View style={styles.contentLayer}>
          <Text style={styles.messageText}>{message.text}</Text>
          <Text style={styles.timeText}>{formatTime(message.timestamp)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  innerContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'visible',
  },
  outerGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: colors.lighthouse.light,
    opacity: 0.08,
    borderRadius: 24,
    shadowColor: colors.lighthouse.light,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  middleGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.lighthouse.light,
    opacity: 0.12,
    borderRadius: 22,
  },
  contentLayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 229, 160, 0.15)',
    shadowColor: colors.lighthouse.light,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  messageText: {
    fontSize: 15,
    color: colors.lighthouse.light,
    lineHeight: 24,
    marginBottom: 8,
    opacity: 0.85,
    letterSpacing: 0.3,
  },
  timeText: {
    fontSize: 11,
    color: colors.lighthouse.light,
    opacity: 0.4,
    letterSpacing: 0.5,
  },
});
