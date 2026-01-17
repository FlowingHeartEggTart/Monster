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
 * 显示怪兽名字、蛋糕数量和个人中心入口
 */
export function TopBar() {
  const router = useRouter();
  const { monsterType, monsterName, cakeCount, clear: clearCreature } = useCreatureStore();
  const { reset: resetPause } = usePauseStore();
  const { reset: resetLighthouse } = useLighthouseStore();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const buttonScale = useSharedValue(1);
  const profileScale = useSharedValue(1);
  
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
  
  const handleGoToProfile = () => {
    router.push('/profile');
  };
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  const profileAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileScale.value }],
  }));
  
  const handlePressIn = () => {
    buttonScale.value = withSpring(0.92);
  };
  
  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };
  
  const handleProfilePressIn = () => {
    profileScale.value = withSpring(0.9);
  };
  
  const handleProfilePressOut = () => {
    profileScale.value = withSpring(1);
  };
  
  if (!monsterType || !monsterName) {
    return null;
  }
  
  const monsterConfig = MONSTER_TYPES[monsterType];
  
  return (
    <>
      <View style={styles.container}>
        {/* 左侧：怪兽信息 */}
        <TouchableOpacity 
          onPress={handleGoToProfile}
          onPressIn={handleProfilePressIn}
          onPressOut={handleProfilePressOut}
          activeOpacity={1}
          style={styles.leftSection}
        >
          <Animated.View style={[styles.avatarContainer, profileAnimatedStyle]}>
            <View style={[styles.miniAvatar, { backgroundColor: monsterConfig.color }]}>
              <Text style={styles.miniAvatarEmoji}>{monsterConfig.emoji}</Text>
            </View>
            <View style={styles.monsterInfo}>
              <Text style={styles.monsterName}>{monsterName}</Text>
              <Text style={styles.monsterHint}>点击查看成长</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
        
        {/* 右侧：蛋糕数量 */}
        <View style={styles.rightSection}>
          <View style={styles.cakeContainer}>
            <Text style={styles.cakeEmoji}>🍰</Text>
            <Text style={styles.cakeCount}>{cakeCount}</Text>
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240, 240, 240, 0.8)',
  },
  leftSection: {
    flex: 1,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  miniAvatarEmoji: {
    fontSize: 18,
  },
  monsterInfo: {
    gap: 1,
  },
  monsterName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  monsterHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cakeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 229, 160, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cakeEmoji: {
    fontSize: 16,
  },
  cakeCount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
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
