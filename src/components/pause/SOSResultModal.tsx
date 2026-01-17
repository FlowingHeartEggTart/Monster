import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { useCreatureStore } from '@/store/creatureStore';

interface SOSResultModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * SOS结算弹窗
 * 二选一：回到怪兽 or 点亮灯塔
 */
export function SOSResultModal({ visible, onClose }: SOSResultModalProps) {
  const router = useRouter();
  const { incrementSOSSuccess } = useCreatureStore();
  
  const handleGoToCreature = () => {
    incrementSOSSuccess();
    onClose();
    router.push('/');
  };
  
  const handleGoToLighthouse = () => {
    incrementSOSSuccess();
    onClose();
    router.push('/lighthouse');
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 关闭按钮 */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          {/* 标题 */}
          <Text style={styles.title}>
            你刚刚为自己{'\n'}
            争取了一点时间
          </Text>
          
          <Text style={styles.subtitle}>
            接下来，你更想——
          </Text>
          
          {/* 选项一：回到怪兽 */}
          <TouchableOpacity
            style={[styles.optionButton, styles.creatureOption]}
            onPress={handleGoToCreature}
          >
            <Text style={styles.optionEmoji}>🌸</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>把这份宵夜给小怪兽</Text>
              <Text style={styles.optionSubtitle}>喂养它，也是在照顾你自己</Text>
            </View>
          </TouchableOpacity>
          
          {/* 选项二：点亮灯塔 */}
          <TouchableOpacity
            style={[styles.optionButton, styles.lighthouseOption]}
            onPress={handleGoToLighthouse}
          >
            <Text style={styles.optionEmoji}>💫</Text>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>去灯塔看看</Text>
              <Text style={styles.optionSubtitle}>你不是一个人在经历</Text>
            </View>
          </TouchableOpacity>
          
          {/* 兜底选项 */}
          <TouchableOpacity
            style={styles.exitOption}
            onPress={onClose}
          >
            <Text style={styles.exitText}>我想先退出</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 32,
    color: colors.textMuted,
    fontWeight: '300',
  },
  title: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  creatureOption: {
    backgroundColor: '#FFF8F5',
    borderWidth: 1.5,
    borderColor: colors.accent.pink,
  },
  lighthouseOption: {
    backgroundColor: '#F5F8FF',
    borderWidth: 1.5,
    borderColor: colors.accent.blue,
  },
  optionEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  exitOption: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  exitText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
