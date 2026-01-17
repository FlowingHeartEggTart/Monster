import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Modal, TextInput, Dimensions } from 'react-native';
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
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  FadeInUp,
  FadeInDown,
  ZoomIn,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 微光墙消息
const LIGHT_WALL_MESSAGES = [
  { text: "今晚月亮很亮，你也是", emoji: "🌙", color: "#FFE5A0" },
  { text: "撑过去了，明天会更好", emoji: "🌅", color: "#FFCAD4" },
  { text: "抱抱你，也抱抱我自己", emoji: "🫂", color: "#C5A8E8" },
  { text: "深夜的你，辛苦了", emoji: "🌃", color: "#A5C9E8" },
  { text: "你已经很棒了，真的", emoji: "⭐", color: "#FFE5A0" },
  { text: "不是软弱，是在学着照顾自己", emoji: "💪", color: "#A8E6CF" },
  { text: "这一刻，我们一起撑过去", emoji: "🤝", color: "#FFCAD4" },
  { text: "你值得被温柔对待", emoji: "🌸", color: "#FFCAD4" },
  { text: "无论多晚，你都不是一个人", emoji: "🏠", color: "#A5C9E8" },
  { text: "明天又是新的开始", emoji: "🌈", color: "#A8E6CF" },
];

/**
 * 灯塔页面 - 重新设计
 * 沉浸式星空 + 互动微光 + 温暖社区
 */
export default function LighthousePage() {
  const { dailyLighthouseCompleted, completeDailyLighthouse, sosSuccessCount } = useCreatureStore();
  const { userHasLit, lightUp, resetJustLit } = useLighthouseStore();
  
  const [onlineCount, setOnlineCount] = useState(47);
  const [showSendModal, setShowSendModal] = useState(false);
  const [lightMessage, setLightMessage] = useState('');
  const [sentLight, setSentLight] = useState(false);
  const [showCakeReward, setShowCakeReward] = useState(false);
  const [receivedLight, setReceivedLight] = useState<{ message: string } | null>(null);
  const [floatingLights, setFloatingLights] = useState<Array<{ id: number; x: number; delay: number }>>([]);
  
  // 动画值
  const lighthouseGlow = useSharedValue(0.3);
  const lighthouseScale = useSharedValue(1);
  const countScale = useSharedValue(1);
  
  // 生成漂浮的微光
  useEffect(() => {
    const lights = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * (SCREEN_WIDTH - 60) + 30,
      delay: Math.random() * 3000,
    }));
    setFloatingLights(lights);
  }, []);
  
  // 在线人数变化
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const newCount = Math.max(30, prev + Math.floor(Math.random() * 5) - 2);
        countScale.value = withSequence(
          withSpring(1.1, { damping: 8 }),
          withSpring(1, { damping: 8 })
        );
        return newCount;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  
  // 灯塔光晕动画
  useEffect(() => {
    lighthouseGlow.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);
  
  const glowStyle = useAnimatedStyle(() => ({
    opacity: lighthouseGlow.value,
    transform: [{ scale: 1 + lighthouseGlow.value * 0.3 }],
  }));
  
  const countStyle = useAnimatedStyle(() => ({
    transform: [{ scale: countScale.value }],
  }));
  
  // 点击灯塔
  const handleLighthouseTap = () => {
    lighthouseScale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1.05, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
  };
  
  const lighthouseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lighthouseScale.value }],
  }));
  
  // 发送微光
  const sendLight = () => {
    setSentLight(true);
    setShowSendModal(false);
    
    if (!dailyLighthouseCompleted) {
      completeDailyLighthouse();
      lightUp();
      setTimeout(() => setShowCakeReward(true), 500);
      setTimeout(() => resetJustLit(), 3000);
    }
    
    // 模拟收到微光
    setTimeout(() => {
      setReceivedLight({
        message: lightMessage || LIGHT_WALL_MESSAGES[Math.floor(Math.random() * LIGHT_WALL_MESSAGES.length)].text,
      });
    }, 4000);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 星空背景 */}
      <View style={styles.starryBackground}>
        {/* 静态星星 */}
        {Array.from({ length: 50 }).map((_, i) => (
          <View
            key={`star-${i}`}
            style={[
              styles.star,
              {
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.6 + 0.2,
              }
            ]}
          />
        ))}
        
        {/* 漂浮的微光 */}
        {floatingLights.map((light) => (
          <FloatingLight key={light.id} x={light.x} delay={light.delay} />
        ))}
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 灯塔主区域 */}
        <View style={styles.lighthouseSection}>
          <TouchableOpacity onPress={handleLighthouseTap} activeOpacity={1}>
            <Animated.View style={[styles.lighthouseWrapper, lighthouseStyle]}>
              {/* 多层光晕 */}
              <Animated.View style={[styles.glowOuter, glowStyle]} />
              <Animated.View style={[styles.glowMiddle, glowStyle]} />
              <Animated.View style={[styles.glowInner, glowStyle]} />
              
              {/* 灯塔本体 */}
              <View style={styles.lighthouse}>
                <Text style={styles.lighthouseIcon}>🗼</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
          
          {/* 在线人数 */}
          <Animated.View style={[styles.onlineContainer, countStyle]} entering={FadeInUp.delay(300)}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineCount}>{onlineCount}</Text>
            <Text style={styles.onlineLabel}>人正在守护自己</Text>
          </Animated.View>
          
          <Animated.Text style={styles.lighthouseQuote} entering={FadeIn.delay(500)}>
            "在最深的夜里，我们是彼此的光"
          </Animated.Text>
        </View>
        
        {/* 微光墙 */}
        <Animated.View style={styles.lightWallSection} entering={FadeInUp.delay(400)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ 微光墙</Text>
            <Text style={styles.sectionSubtitle}>来自陌生人的温暖</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lightWallScroll}
          >
            {LIGHT_WALL_MESSAGES.map((msg, idx) => (
              <Animated.View 
                key={idx}
                entering={FadeInUp.delay(500 + idx * 100)}
                style={[styles.lightCard, { borderLeftColor: msg.color }]}
              >
                <Text style={styles.lightCardEmoji}>{msg.emoji}</Text>
                <Text style={styles.lightCardText}>"{msg.text}"</Text>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
        
        {/* 我的守护 */}
        <Animated.View style={styles.statsSection} entering={FadeInUp.delay(600)}>
          <Text style={styles.sectionTitle}>🛡️ 我的守护</Text>
          
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(255, 229, 160, 0.3)' }]}>
                <Text style={styles.statIcon}>⭐</Text>
              </View>
              <Text style={styles.statNumber}>{sosSuccessCount}</Text>
              <Text style={styles.statLabel}>累计守护</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(165, 201, 232, 0.3)' }]}>
                <Text style={styles.statIcon}>🌙</Text>
              </View>
              <Text style={styles.statNumber}>{Math.min(sosSuccessCount, 5)}</Text>
              <Text style={styles.statLabel}>今日守护</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
              <View style={[styles.statIconBg, { backgroundColor: 'rgba(197, 168, 232, 0.3)' }]}>
                <Text style={styles.statIcon}>💫</Text>
              </View>
              <Text style={styles.statNumber}>{sentLight || dailyLighthouseCompleted ? 1 : 0}</Text>
              <Text style={styles.statLabel}>送出微光</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* 送微光按钮 */}
        <Animated.View entering={FadeInUp.delay(700)} style={styles.sendButtonContainer}>
          <TouchableOpacity
            onPress={() => setShowSendModal(true)}
            disabled={sentLight || dailyLighthouseCompleted}
            style={[
              styles.sendButton,
              (sentLight || dailyLighthouseCompleted) && styles.sendButtonDone
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.sendButtonInner}>
              <Text style={styles.sendButtonEmoji}>
                {sentLight || dailyLighthouseCompleted ? '✓' : '💫'}
              </Text>
              <Text style={[
                styles.sendButtonText,
                (sentLight || dailyLighthouseCompleted) && styles.sendButtonTextDone
              ]}>
                {sentLight || dailyLighthouseCompleted ? '今日微光已送达' : '送一束微光给陌生人'}
              </Text>
            </View>
            {!(sentLight || dailyLighthouseCompleted) && (
              <View style={styles.sendButtonGlow} />
            )}
          </TouchableOpacity>
        </Animated.View>
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* 送微光弹窗 */}
      <Modal visible={showSendModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.sendModal} entering={ZoomIn.duration(300)}>
            <View style={styles.sendModalHeader}>
              <Text style={styles.sendModalEmoji}>💫</Text>
              <Text style={styles.sendModalTitle}>送一束微光</Text>
              <Text style={styles.sendModalSubtitle}>你的温暖会传递给某个深夜里的人</Text>
            </View>
            
            <TextInput
              style={styles.sendModalInput}
              value={lightMessage}
              onChangeText={setLightMessage}
              placeholder="写点什么吧...（选填）"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={100}
            />
            
            <View style={styles.quickMessages}>
              {['加油！', '你很棒', '抱抱你', '会好的'].map((msg, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.quickMessageTag}
                  onPress={() => setLightMessage(msg)}
                >
                  <Text style={styles.quickMessageText}>{msg}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.sendModalButtons}>
              <TouchableOpacity
                onPress={() => setShowSendModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sendLight} style={styles.confirmButton}>
                <Text style={styles.confirmButtonText}>送出微光 ✨</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      
      {/* 收到微光弹窗 */}
      <Modal visible={receivedLight !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.receivedModal} entering={ZoomIn.duration(300)}>
            <View style={styles.receivedGlow} />
            <Text style={styles.receivedEmoji}>💫</Text>
            <Text style={styles.receivedTitle}>收到一束微光</Text>
            
            <View style={styles.receivedMessageBox}>
              <Text style={styles.receivedMessage}>"{receivedLight?.message}"</Text>
            </View>
            
            <Text style={styles.receivedHint}>在远方，有人正在想着你</Text>
            
            <TouchableOpacity 
              onPress={() => setReceivedLight(null)} 
              style={styles.receivedButton}
            >
              <Text style={styles.receivedButtonText}>收下这份温暖</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      
      <CakeRewardOverlay visible={showCakeReward} onComplete={() => setShowCakeReward(false)} />
    </SafeAreaView>
  );
}

// 漂浮微光组件
function FloatingLight({ x, delay }: { x: number; delay: number }) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-100, { duration: 8000 + Math.random() * 4000, easing: Easing.linear }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 2000 }),
          withTiming(0.3, { duration: 4000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        false
      )
    );
  }, []);
  
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
    left: x,
  }));
  
  return (
    <Animated.View style={[styles.floatingLight, style]}>
      <View style={styles.floatingLightInner} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  starryBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  floatingLight: {
    position: 'absolute',
    width: 8,
    height: 8,
  },
  floatingLightInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.yellow,
    shadowColor: colors.accent.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  
  // 灯塔区域
  lighthouseSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  lighthouseWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accent.yellow,
  },
  glowMiddle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent.yellow,
  },
  glowInner: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.yellow,
  },
  lighthouse: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 229, 160, 0.5)',
  },
  lighthouseIcon: {
    fontSize: 36,
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 8,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  onlineCount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent.yellow,
    marginRight: 6,
  },
  onlineLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  lighthouseQuote: {
    marginTop: 24,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
  
  // 微光墙
  lightWallSection: {
    paddingTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  lightWallScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  lightCard: {
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightCardEmoji: {
    fontSize: 24,
    marginBottom: 10,
  },
  lightCardText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  
  // 统计区域
  statsSection: {
    padding: 24,
    paddingTop: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 22,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  
  // 送微光按钮
  sendButtonContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  sendButton: {
    backgroundColor: 'rgba(255, 229, 160, 0.15)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 229, 160, 0.4)',
    overflow: 'hidden',
  },
  sendButtonDone: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  sendButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sendButtonEmoji: {
    fontSize: 20,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent.yellow,
  },
  sendButtonTextDone: {
    color: '#4ADE80',
  },
  sendButtonGlow: {
    position: 'absolute',
    top: -50,
    left: '30%',
    width: '40%',
    height: 100,
    backgroundColor: 'rgba(255, 229, 160, 0.1)',
    borderRadius: 50,
    transform: [{ rotate: '15deg' }],
  },
  
  bottomSpacer: {
    height: 100,
  },
  
  // 弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sendModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sendModalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  sendModalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  sendModalSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  sendModalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickMessages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  quickMessageTag: {
    backgroundColor: 'rgba(255, 229, 160, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 229, 160, 0.3)',
  },
  quickMessageText: {
    fontSize: 13,
    color: colors.accent.yellow,
  },
  sendModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  confirmButton: {
    flex: 1.5,
    backgroundColor: colors.accent.yellow,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  
  // 收到微光弹窗
  receivedModal: {
    backgroundColor: '#1a1a2e',
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    width: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 229, 160, 0.2)',
    overflow: 'hidden',
  },
  receivedGlow: {
    position: 'absolute',
    top: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 229, 160, 0.15)',
  },
  receivedEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  receivedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  receivedMessageBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  receivedMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  receivedHint: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 24,
  },
  receivedButton: {
    backgroundColor: colors.accent.yellow,
    borderRadius: 20,
    paddingHorizontal: 36,
    paddingVertical: 14,
  },
  receivedButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
});
