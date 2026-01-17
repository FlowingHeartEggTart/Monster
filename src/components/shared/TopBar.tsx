import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { useCreatureStore, MONSTER_TYPES } from '@/store/creatureStore';
import { usePauseStore } from '@/store/pauseStore';
import { useLighthouseStore } from '@/store/lighthouseStore';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * 全局顶部状态栏
 * 显示怪兽名字和蛋糕数量
 */
export function TopBar() {
  const router = useRouter();
  const { monsterType, monsterName, cakeCount, clear: clearCreature } = useCreatureStore();
  const { reset: resetPause } = usePauseStore();
  const { reset: resetLighthouse } = useLighthouseStore();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(0.7);
  
  const handleReset = () => {
    setShowConfirmModal(true);
  };
  
  const confirmReset = () => {
    // 重置所有 store
    clearCreature();
    resetPause();
    resetLighthouse();
    
    // 导航到 onboarding
    router.replace('/onboarding');
    setShowConfirmModal(false);
  };
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));
  
  const handlePressIn = () => {
    buttonScale.value = withSpring(0.92);
    buttonOpacity.value = withTiming(1, { duration: 150 });
  };
  
  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
    buttonOpacity.value = withTiming(0.7, { duration: 150 });
  };
  
  if (!monsterType || !monsterName) {
    return null;
  }
  
  const monsterConfig = MONSTER_TYPES[monsterType];
  
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.monsterText}>
          {monsterConfig.emoji} {monsterName}在陪你
        </Text>
        <View style={styles.rightSection}>
          <Text style={styles.cakeText}>
            🧁 × {cakeCount}
          </Text>
          <TouchableOpacity
            onPress={handleReset}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            <Animated.View style={[styles.resetButton, buttonAnimatedStyle]}>
              <Text style={styles.resetButtonText}>重新开始</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* 确认弹窗 */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>重新开始</Text>
            <Text style={styles.modalMessage}>
              确定要重新开始吗？{'\n'}
              这将清除所有数据，包括你的小伙伴和进度。
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmReset}
              >
                <Text style={styles.modalButtonConfirmText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  monsterText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cakeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'rgba(197, 168, 232, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(197, 168, 232, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetButtonText: {
    fontSize: 12,
    color: colors.accent.purple,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 74, 106, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(122, 122, 154, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(122, 122, 154, 0.2)',
  },
  modalButtonConfirm: {
    backgroundColor: colors.accent.purple,
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonCancelText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modalButtonConfirmText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '500',
  },
});
