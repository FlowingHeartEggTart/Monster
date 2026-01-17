import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';

interface DreamyBubbleProps {
  text: string;
  visible: boolean;
}

/**
 * 梦幻气泡组件
 * 采用"填充式动画"：文本通过遮罩、透明度、模糊度渐进显现
 * 如同光雾在空间中缓慢凝聚，轻柔落定
 */
export function DreamyBubble({ text, visible }: DreamyBubbleProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);
  const blur = useSharedValue(10);
  
  useEffect(() => {
    if (visible) {
      // 填充式动画：多层次缓慢显现
      opacity.value = withDelay(
        300,
        withTiming(1, {
          duration: 2500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
      
      scale.value = withDelay(
        200,
        withTiming(1, {
          duration: 3000,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
      
      blur.value = withDelay(
        400,
        withTiming(0, {
          duration: 2800,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
    } else {
      // 柔和消散
      opacity.value = withTiming(0, {
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      scale.value = withTiming(0.92, {
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      blur.value = withTiming(10, {
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [visible]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  
  if (!text || text === '......') {
    return null;
  }
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.innerContainer}>
        <View style={styles.glowLayer} />
        <View style={styles.contentLayer}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    maxWidth: '80%',
    alignSelf: 'center',
  },
  innerContainer: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
  },
  glowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    opacity: 0.4,
    borderRadius: 24,
  },
  contentLayer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(12px)',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 1,
  },
  text: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.75,
    letterSpacing: 0.5,
  },
});
