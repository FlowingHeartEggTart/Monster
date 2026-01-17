import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * 安全的触觉反馈工具函数
 * 在 Web 平台上自动跳过（Web 不支持触觉反馈）
 */
export async function safeHapticImpact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  // Web 平台不支持触觉反馈，直接返回
  if (Platform.OS === 'web') {
    return;
  }
  
  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    // 静默处理错误，不影响应用运行
    console.debug('Haptic feedback not available:', error);
  }
}
