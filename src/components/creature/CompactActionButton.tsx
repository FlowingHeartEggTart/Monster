import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@/theme/colors';

interface CompactActionButtonProps {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  completed?: boolean;
}

/**
 * 紧凑型功能按钮
 * 圆形图标 + 小圆角矩形标签的组合设计
 */
export function CompactActionButton({
  icon,
  label,
  color,
  onPress,
  completed = false,
}: CompactActionButtonProps) {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    glowOpacity.value = withTiming(0.7, { duration: 150 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
    glowOpacity.value = withTiming(0.4, { duration: 150 });
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: completed ? 0.2 : glowOpacity.value,
  }));
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={completed}
      activeOpacity={1}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* 圆形图标容器 */}
        <View style={styles.iconContainer}>
          {/* 光晕层 */}
          <Animated.View
            style={[
              styles.iconGlow,
              { backgroundColor: color },
              glowAnimatedStyle,
            ]}
          />
          
          {/* 图标主体 */}
          <View style={[styles.iconCircle, { backgroundColor: color }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
          
          {/* 完成标记 */}
          {completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedIcon}>✓</Text>
            </View>
          )}
        </View>
        
        {/* 小圆角矩形标签 */}
        <View style={styles.labelContainer}>
          <View style={[styles.labelBackground, { borderColor: color }]}>
            <Text style={[styles.labelText, completed && styles.labelTextCompleted]}>
              {label}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 100,
  },
  iconContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconText: {
    fontSize: 28,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundGradient[0],
  },
  completedIcon: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
  },
  labelContainer: {
    width: '100%',
    alignItems: 'center',
  },
  labelBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  labelText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  labelTextCompleted: {
    opacity: 0.5,
  },
});
