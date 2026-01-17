import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';
import { useCreatureStore } from '@/store/creatureStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';

interface MindfulnessCardProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 正念卡片弹窗 - 毛玻璃效果
 * 显示 Day1 内容，点击「收下了」蛋糕+1 并关闭
 */
export function MindfulnessCard({ visible, onClose }: MindfulnessCardProps) {
  const { dailyMindfulnessCompleted, completeDailyMindfulness } = useCreatureStore();
  
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  
  // 弹出动画
  useEffect(() => {
    if (visible) {
      cardOpacity.value = withTiming(1, { duration: 200 });
      cardScale.value = withSpring(1, { damping: 15 });
    } else {
      cardOpacity.value = withTiming(0, { duration: 150 });
      cardScale.value = withTiming(0.9, { duration: 150 });
    }
  }, [visible]);
  
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));
  
  // 点击「收下了」
  const handleAccept = () => {
    if (!dailyMindfulnessCompleted) {
      completeDailyMindfulness(); // 这会自动 +1 蛋糕
    }
    onClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 卡片阴影层（叠层效果） */}
        <View style={styles.cardShadow} />
        
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          {/* 顶部高光线 */}
          <View style={styles.cardHighlight} />
          
          {/* 卡片头部 */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>💡</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardDay}>DAY 1</Text>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>认知重塑</Text>
              </View>
            </View>
          </View>
          
          {/* 卡片内容 - 带左侧边框 */}
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>
              情绪性进食不是意志力的问题，{'\n'}
              而是大脑在寻找快速的安慰剂。{'\n\n'}
              这是本能，不是你的错。
            </Text>
          </View>
          
          {/* 来源 */}
          <Text style={styles.cardSource}>—— 《直觉饮食》</Text>
          
          {/* 按钮 - 渐变 */}
          <TouchableOpacity
            style={[
              styles.acceptButton,
              dailyMindfulnessCompleted && styles.acceptButtonDisabled
            ]}
            onPress={handleAccept}
            activeOpacity={0.8}
          >
            {!dailyMindfulnessCompleted ? (
              <LinearGradient
                colors={colors.gradients.button as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.acceptButtonText}>收下了 🍰 +1</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.acceptButtonTextDisabled}>今日已领取</Text>
            )}
          </TouchableOpacity>
          
          {/* 关闭按钮 */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // 遮罩层 - 毛玻璃效果
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 74, 106, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  
  // 卡片阴影层（叠层效果）
  cardShadow: {
    position: 'absolute',
    top: '50%',
    left: 32,
    right: 24,
    height: 280,
    marginTop: -132,
    backgroundColor: 'rgba(165, 137, 193, 0.25)',
    borderRadius: colors.radius.lg,
  },
  
  // 卡片主体 - 毛玻璃
  card: {
    backgroundColor: colors.glass.bgStrong,
    borderRadius: colors.radius.lg,
    padding: 24,
    paddingTop: 20,
    width: '100%',
    maxWidth: 280,
    shadowColor: colors.blue.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 60,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  
  // 顶部高光线
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: colors.textMuted,
    fontWeight: '300',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    marginTop: 8,
  },
  cardEmoji: {
    fontSize: 36,
  },
  cardMeta: {
    flex: 1,
  },
  cardDay: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.blue.primary,
    marginBottom: 6,
  },
  categoryTag: {
    backgroundColor: 'rgba(165, 201, 232, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: colors.radius.sm,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    color: '#4A6A8A',
    fontWeight: '500',
  },
  
  // 卡片内容区 - 带左侧边框
  cardContent: {
    backgroundColor: 'rgba(165, 201, 232, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.blue.primary,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 1.8 * 15,
    color: colors.text,
    fontWeight: '500',
  },
  cardSource: {
    fontSize: 12,
    color: colors.blue.primary,
    textAlign: 'right',
    marginBottom: 20,
  },
  
  // 按钮
  acceptButton: {
    borderRadius: colors.radius.full,
    overflow: 'hidden',
    shadowColor: colors.shadow.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
    paddingVertical: 14,
    alignItems: 'center',
    shadowOpacity: 0,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
  acceptButtonTextDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});
