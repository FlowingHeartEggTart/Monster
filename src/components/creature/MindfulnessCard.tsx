import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { colors } from '@/theme/colors';
import { useCreatureStore } from '@/store/creatureStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

interface MindfulnessCardProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 正念卡片弹窗 - 简化版
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
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          {/* 顶部彩色条 */}
          <View style={styles.topBar} />
          
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
          
          {/* 卡片内容 */}
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>
              情绪性进食不是意志力的问题，{'\n'}
              而是大脑在寻找快速的安慰剂。{'\n\n'}
              这是本能，不是你的错。
            </Text>
          </View>
          
          {/* 来源 */}
          <Text style={styles.cardSource}>—— 《直觉饮食》</Text>
          
          {/* 按钮 */}
          <TouchableOpacity
            style={[
              styles.acceptButton,
              dailyMindfulnessCompleted && styles.acceptButtonDisabled
            ]}
            onPress={handleAccept}
            activeOpacity={0.8}
          >
            <Text style={styles.acceptButtonText}>
              {dailyMindfulnessCompleted ? '今日已领取' : '收下了 🍰 +1'}
            </Text>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 74, 106, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#A5C9E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#A5C9E8',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 28,
    color: '#8B7BA8',
    fontWeight: '300',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
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
    color: '#A5C9E8',
    marginBottom: 6,
  },
  categoryTag: {
    backgroundColor: '#D4E5F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 11,
    color: '#4A6A8A',
    fontWeight: '500',
  },
  cardContent: {
    backgroundColor: 'rgba(248, 245, 252, 0.8)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#A5C9E8',
  },
  cardText: {
    fontSize: 17,
    lineHeight: 28,
    color: '#4A4A6A',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  cardSource: {
    fontSize: 13,
    color: '#8B7BA8',
    textAlign: 'right',
    marginBottom: 24,
  },
  acceptButton: {
    backgroundColor: '#A5C9E8',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#A5C9E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  acceptButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
});
