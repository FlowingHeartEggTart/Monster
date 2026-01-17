import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Modal, TextInput, Animated as RNAnimated } from 'react-native';
import { colors } from '@/theme/colors';
import { TopBar } from '@/components/shared/TopBar';
import { useCreatureStore } from '@/store/creatureStore';
import { useLighthouseStore } from '@/store/lighthouseStore';
import { CakeRewardOverlay } from '@/components/creature/CakeRewardOverlay';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// 微光墙消息
const LIGHT_WALL_MESSAGES = [
  "今晚月亮很亮，你也是 🌙",
  "撑过去了，明天会更好",
  "抱抱你，也抱抱我自己",
  "深夜的你，辛苦了",
  "你已经很棒了，真的",
  "不是软弱，是在学着照顾自己",
  "这一刻，我们一起撑过去",
  "你值得被温柔对待",
  "无论多晚，你都不是一个人",
  "明天又是新的开始",
];

// 灯塔文案
const LIGHTHOUSE_TEXTS = [
  { main: "此刻有 {count} 人和你一样", sub: "正在努力守护自己" },
  { main: "在世界的某个角落", sub: "有 {count} 个人正在经历同样的时刻" },
  { main: "你不是一个人", sub: "此刻有 {count} 人，也在深夜里撑着" },
  { main: "{count} 盏微光", sub: "正在各自的角落闪烁" },
];

/**
 * 灯塔页面
 * 灯塔地图 + 守护记录 + 微光墙 + 送微光
 */
export default function LighthousePage() {
  const { dailyLighthouseCompleted, completeDailyLighthouse, sosSuccessCount } = useCreatureStore();
  const { userHasLit, lightUp, resetJustLit } = useLighthouseStore();
  
  const [onlineCount, setOnlineCount] = useState(47);
  const [textIndex, setTextIndex] = useState(0);
  const [showSendModal, setShowSendModal] = useState(false);
  const [lightMessage, setLightMessage] = useState('');
  const [sentLight, setSentLight] = useState(false);
  const [showCakeReward, setShowCakeReward] = useState(false);
  const [receivedLight, setReceivedLight] = useState<{ message: string } | null>(null);
  
  // 微光墙滚动动画
  const scrollAnim = useRef(new RNAnimated.Value(0)).current;
  
  const glowScale = useSharedValue(1);
  
  // 初始化
  useEffect(() => {
    // 模拟在线人数变化
    const interval = setInterval(() => {
      setOnlineCount(prev => Math.max(30, prev + Math.floor(Math.random() * 5) - 2));
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 文案轮换
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % LIGHTHOUSE_TEXTS.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // 微光墙滚动动画
  useEffect(() => {
    const animation = RNAnimated.loop(
      RNAnimated.timing(scrollAnim, {
        toValue: -200,
        duration: 20000,
        useNativeDriver: true,
      })
    );
    animation.start();
    
    return () => animation.stop();
  }, []);
  
  // 光晕动画
  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);
  
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));
  
  // 获取当前灯塔文案
  const getCurrentText = () => {
    const text = LIGHTHOUSE_TEXTS[textIndex];
    return {
      main: text.main.replace('{count}', String(onlineCount)),
      sub: text.sub.replace('{count}', String(onlineCount)),
    };
  };
  
  // 打开送微光弹窗
  const openSendModal = () => {
    setShowSendModal(true);
    setLightMessage('');
  };
  
  // 发送微光
  const sendLight = () => {
    setSentLight(true);
    setShowSendModal(false);
    
    if (!dailyLighthouseCompleted) {
      completeDailyLighthouse();
      lightUp();
      
      // 显示蛋糕奖励
      setTimeout(() => {
        setShowCakeReward(true);
      }, 500);
      
      // 3秒后重置
      setTimeout(() => {
        resetJustLit();
      }, 3000);
    }
    
    // 模拟收到微光
    setTimeout(() => {
      setReceivedLight({
        message: lightMessage || '今晚也辛苦了，你已经很棒了',
      });
    }, 5000);
  };
  
  // 关闭收到微光提示
  const closeReceivedLight = () => {
    setReceivedLight(null);
  };
  
  const currentText = getCurrentText();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* 灯塔地图 */}
          <View style={styles.mapSection}>
            {/* 星星背景 */}
            {Array.from({ length: 30 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.star,
                  {
                    width: Math.random() * 4 + 2,
                    height: Math.random() * 4 + 2,
                    top: `${Math.random() * 80 + 10}%`,
                    left: `${Math.random() * 80 + 10}%`,
                    opacity: Math.random() * 0.5 + 0.3,
                    backgroundColor: i === 0 ? colors.lighthouse.light : colors.accent.blue,
                  }
                ]}
              />
            ))}
            
            {/* 灯塔 */}
            <View style={styles.lighthouseContainer}>
              <Animated.View style={[styles.lighthouseGlow, glowAnimatedStyle]} />
              <Text style={styles.lighthouseEmoji}>🗼</Text>
            </View>
            
            {/* 文案 */}
            <Text style={styles.mapTextMain}>{currentText.main}</Text>
            <Text style={styles.mapTextSub}>{currentText.sub}</Text>
          </View>
          
          {/* 守护记录 */}
          <View style={styles.guardCard}>
            <Text style={styles.guardTitle}>你的守护记录</Text>
            <View style={styles.guardStats}>
              <View style={styles.guardStatItem}>
                <Text style={styles.guardStatNumber}>{Math.min(sosSuccessCount, 5)}</Text>
                <Text style={styles.guardStatLabel}>今日守护</Text>
              </View>
              <View style={styles.guardDivider} />
              <View style={styles.guardStatItem}>
                <Text style={styles.guardStatNumber}>{sosSuccessCount}</Text>
                <Text style={styles.guardStatLabel}>累计守护</Text>
              </View>
            </View>
          </View>
          
          {/* 微光墙 */}
          <View style={styles.lightWallCard}>
            <Text style={styles.lightWallTitle}>💫 微光墙</Text>
            <View style={styles.lightWallContainer}>
              <RNAnimated.View 
                style={[
                  styles.lightWallScroll,
                  { transform: [{ translateY: scrollAnim }] }
                ]}
              >
                {[...LIGHT_WALL_MESSAGES, ...LIGHT_WALL_MESSAGES].map((msg, idx) => (
                  <Text key={idx} style={styles.lightWallMessage}>"{msg}"</Text>
                ))}
              </RNAnimated.View>
            </View>
          </View>
          
          {/* 送微光按钮 */}
          <TouchableOpacity
            onPress={openSendModal}
            disabled={sentLight || dailyLighthouseCompleted}
            style={[
              styles.sendButton,
              (sentLight || dailyLighthouseCompleted) && styles.sendButtonDisabled
            ]}
          >
            <Text style={[
              styles.sendButtonText,
              (sentLight || dailyLighthouseCompleted) && styles.sendButtonTextDisabled
            ]}>
              {sentLight || dailyLighthouseCompleted ? '你的温暖已送达 💫' : '送一束微光给陌生人 💫'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* 送微光弹窗 */}
      <Modal
        visible={showSendModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sendModalContent}>
            <Text style={styles.sendModalTitle}>送一束微光 💫</Text>
            <Text style={styles.sendModalSubtitle}>想对ta说点什么吗？（选填）</Text>
            
            <TextInput
              style={styles.sendModalInput}
              value={lightMessage}
              onChangeText={setLightMessage}
              placeholder="今晚也辛苦了，你已经很棒了..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={100}
            />
            
            <View style={styles.sendModalButtons}>
              <TouchableOpacity
                onPress={() => setShowSendModal(false)}
                style={styles.sendModalCancelButton}
              >
                <Text style={styles.sendModalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={sendLight}
                style={styles.sendModalConfirmButton}
              >
                <Text style={styles.sendModalConfirmText}>发送 💫</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* 收到微光弹窗 */}
      <Modal
        visible={receivedLight !== null}
        transparent
        animationType="fade"
        onRequestClose={closeReceivedLight}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receivedModalContent}>
            <Text style={styles.receivedEmoji}>💫</Text>
            <Text style={styles.receivedTitle}>有人给你送了一束微光</Text>
            
            {receivedLight?.message && (
              <View style={styles.receivedMessageBox}>
                <Text style={styles.receivedMessageLabel}>ta说：</Text>
                <Text style={styles.receivedMessageText}>"{receivedLight.message}"</Text>
              </View>
            )}
            
            <Text style={styles.receivedSubtext}>在远方，有人正在想着你</Text>
            
            <TouchableOpacity onPress={closeReceivedLight} style={styles.receivedButton}>
              <Text style={styles.receivedButtonText}>收下这份温暖</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* 蛋糕奖励 */}
      <CakeRewardOverlay
        visible={showCakeReward}
        onComplete={() => setShowCakeReward(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGradient[0],
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // 灯塔地图
  mapSection: {
    height: 280,
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  star: {
    position: 'absolute',
    borderRadius: 10,
  },
  lighthouseContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lighthouseGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.lighthouse.light,
    opacity: 0.3,
  },
  lighthouseEmoji: {
    fontSize: 40,
  },
  mapTextMain: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  mapTextSub: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 6,
    textAlign: 'center',
  },
  
  // 守护记录
  guardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  guardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  guardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  guardStatItem: {
    alignItems: 'center',
  },
  guardStatNumber: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
  },
  guardStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  guardDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  
  // 微光墙
  lightWallCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    height: 160,
    overflow: 'hidden',
  },
  lightWallTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  lightWallContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  lightWallScroll: {
    
  },
  lightWallMessage: {
    fontSize: 13,
    color: '#6A6A8A',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  
  // 送微光按钮
  sendButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sendButtonTextDisabled: {
    color: '#999',
  },
  
  // 弹窗通用
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  
  // 送微光弹窗
  sendModalContent: {
    backgroundColor: colors.backgroundGradient[0],
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 320,
  },
  sendModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  sendModalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  sendModalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  sendModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sendModalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  sendModalCancelText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sendModalConfirmButton: {
    flex: 1,
    backgroundColor: colors.accent.blue,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  sendModalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  
  // 收到微光弹窗
  receivedModalContent: {
    backgroundColor: colors.backgroundGradient[0],
    borderRadius: 24,
    padding: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: 280,
  },
  receivedEmoji: {
    fontSize: 50,
    marginBottom: 20,
  },
  receivedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  receivedMessageBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    width: '100%',
  },
  receivedMessageLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  receivedMessageText: {
    fontSize: 15,
    color: colors.text,
  },
  receivedSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  receivedButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  receivedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
