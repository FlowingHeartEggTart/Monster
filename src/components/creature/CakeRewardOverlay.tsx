import React, { useEffect } from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { DreamyBubble } from '@/components/shared/DreamyBubble';
import { CAKE_ENCOURAGEMENT } from '@/data/dialogues';

interface CakeRewardOverlayProps {
  visible: boolean;
  onComplete: () => void;
}

/**
 * 蛋糕奖励覆盖层
 * 使用梦幻气泡显示柔和的陪伴语言
 */
export function CakeRewardOverlay({ visible, onComplete }: CakeRewardOverlayProps) {
  const cakeScale = useSharedValue(0);
  const cakeOpacity = useSharedValue(0);
  const [showText, setShowText] = React.useState(false);
  const [encouragement, setEncouragement] = React.useState('');
  
  useEffect(() => {
    if (visible) {
      // 随机选择陪伴语（50%概率显示文字，50%只显示蛋糕）
      const shouldShowText = Math.random() < 0.5;
      if (shouldShowText) {
        const randomEncouragement = CAKE_ENCOURAGEMENT[
          Math.floor(Math.random() * CAKE_ENCOURAGEMENT.length)
        ];
        setEncouragement(randomEncouragement);
      } else {
        setEncouragement('');
      }
      
      // 蛋糕填充式出现
      cakeOpacity.value = withTiming(1, {
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      
      cakeScale.value = withSequence(
        withTiming(1.2, {
          duration: 1200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming(1, {
          duration: 800,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );
      
      // 延迟显示文字
      if (shouldShowText) {
        setTimeout(() => {
          setShowText(true);
        }, 1000);
      }
      
      // 自动关闭（3-5秒）
      const duration = 3000 + Math.random() * 2000;
      setTimeout(() => {
        cakeOpacity.value = withTiming(0, {
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
        setTimeout(() => {
          setShowText(false);
          onComplete();
        }, 1500);
      }, duration);
    } else {
      cakeOpacity.value = 0;
      cakeScale.value = 0;
      setShowText(false);
    }
  }, [visible]);
  
  const cakeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cakeOpacity.value,
    transform: [{ scale: cakeScale.value }],
  }));
  
  if (!visible) return null;
  
  return (
    <Modal transparent visible={visible}>
      <View style={styles.overlay}>
        <Animated.Text style={[styles.cakeEmoji, cakeAnimatedStyle]}>
          🧁
        </Animated.Text>
        
        <View style={styles.textContainer}>
          <DreamyBubble text={encouragement} visible={showText} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cakeEmoji: {
    fontSize: 80,
  },
  textContainer: {
    marginTop: 32,
    paddingHorizontal: 40,
    width: '100%',
  },
});
