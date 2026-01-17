import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { colors } from '@/theme/colors';

interface SendMicrolightModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
}

/**
 * 送微光弹窗
 * 采用梦幻设计风格
 */
export function SendMicrolightModal({ visible, onClose, onSend }: SendMicrolightModalProps) {
  const [userMessage, setUserMessage] = useState('');
  
  const handleSend = () => {
    onSend(userMessage);
    setUserMessage('');
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
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
          <Text style={styles.title}>送一束微光</Text>
          <Text style={styles.subtitle}>留下一句匿名祝福（选填）</Text>
          
          {/* 输入框 */}
          <TextInput
            style={styles.messageInput}
            value={userMessage}
            onChangeText={setUserMessage}
            placeholder="今晚月亮很亮，你也是"
            placeholderTextColor="rgba(255, 229, 160, 0.3)"
            multiline
            maxLength={100}
          />
          
          {/* 发送按钮 */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleSend}
          >
            <View style={styles.buttonGlow} />
            <Text style={styles.confirmButtonText}>送出 ✨</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 229, 160, 0.15)',
    shadowColor: colors.lighthouse.light,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 32,
    color: 'rgba(255, 229, 160, 0.4)',
    fontWeight: '200',
  },
  title: {
    fontSize: 24,
    fontWeight: '300',
    color: colors.lighthouse.light,
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 229, 160, 0.6)',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  messageInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: colors.lighthouse.light,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 229, 160, 0.1)',
  },
  confirmButton: {
    position: 'relative',
    backgroundColor: colors.lighthouse.light,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.lighthouse.light,
    opacity: 0.3,
  },
  confirmButtonText: {
    fontSize: 17,
    color: colors.lighthouse.background,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
