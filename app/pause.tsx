import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Modal, Dimensions, Image } from 'react-native';
import { usePauseStore } from '@/store/pauseStore';
import { useCreatureStore, MONSTER_TYPES } from '@/store/creatureStore';
import { colors } from '@/theme/colors';
import { TopBar } from '@/components/shared/TopBar';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 对话脚本
const CHAT_SCRIPT = [
  { from: 'monster', text: '你来了。怎么了？' },
  { from: 'user', text: '想吃东西...' },
  { from: 'monster', text: '嗯，我在。是很想吃，还是有一点想？' },
  { from: 'user', text: '很想' },
  { from: 'monster', text: '那我们就在这待一会儿。不用做什么，我陪你。' },
  { from: 'monster', text: '...' },
  { from: 'monster', text: '你现在在哪？' },
  { from: 'user', text: '在家' },
  { from: 'monster', text: '嗯。谢谢你告诉我。' },
  { from: 'monster', text: '你刚刚陪了我一小会儿。今天的蛋糕，要给我吗？', isEnding: true },
];

/**
 * SOS页面 - 情绪缓冲
 * 待机状态 → 对话模式 → 结算动画 → 守护卡片
 */
export default function PausePage() {
  const router = useRouter();
  const { activatePause, reset } = usePauseStore();
  const { monsterType, monsterName, incrementSOSSuccess, sosSuccessCount, addCake } = useCreatureStore();
  
  // 状态管理
  const [mode, setMode] = useState<'idle' | 'chatting' | 'ending' | 'card'>('idle');
  const [chatMessages, setChatMessages] = useState<typeof CHAT_SCRIPT>([]);
  const [chatStep, setChatStep] = useState(0);
  
  const breathScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.3);
  const bounceScale = useSharedValue(1);
  
  const monsterConfig = monsterType ? MONSTER_TYPES[monsterType] : null;
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 呼吸动画
  useEffect(() => {
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);
  
  // 结算动画
  useEffect(() => {
    if (mode === 'ending') {
      bounceScale.value = withRepeat(
        withSequence(
          withSpring(1.05, { damping: 8 }),
          withSpring(1, { damping: 8 })
        ),
        -1,
        false
      );
    }
  }, [mode]);
  
  const monsterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));
  
  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));
  
  const bounceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounceScale.value }],
  }));
  
  // 开始对话
  const startSOS = () => {
    setMode('chatting');
    setChatMessages([]);
    setChatStep(0);
    activatePause();
    
    // 延迟显示第一条消息
    setTimeout(() => {
      setChatMessages([CHAT_SCRIPT[0]]);
      setChatStep(1);
    }, 500);
  };
  
  // 继续对话
  const continueChat = () => {
    if (chatStep < CHAT_SCRIPT.length) {
      const nextMessage = CHAT_SCRIPT[chatStep];
      setChatMessages(prev => [...prev, nextMessage]);
      setChatStep(prev => prev + 1);
      
      // 自动滚动到底部
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // 如果下一条是怪兽的消息，自动显示
      if (chatStep + 1 < CHAT_SCRIPT.length && CHAT_SCRIPT[chatStep + 1].from === 'monster') {
        setTimeout(() => {
          setChatMessages(prev => [...prev, CHAT_SCRIPT[chatStep + 1]]);
          setChatStep(prev => prev + 1);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }, 1500);
      }
    }
  };
  
  // 给蛋糕
  const giveCake = () => {
    setMode('ending');
    addCake(1);
    incrementSOSSuccess();
    
    // 2秒后显示守护卡片
    setTimeout(() => {
      setMode('card');
    }, 2500);
  };
  
  // 关闭卡片回到首页
  const closeCard = () => {
    setMode('idle');
    reset();
  };
  
  // 保存卡片（暂时只是提示）
  const saveCard = () => {
    // TODO: 实现保存功能
  };
  
  // 获取当前日期
  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  };
  
  // 获取时间段
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 6) return '深夜';
    if (hour >= 6 && hour < 12) return '早晨';
    if (hour >= 12 && hour < 18) return '午后';
    return '傍晚';
  };
  
  // 如果没有怪兽，显示提示
  if (!monsterConfig || !monsterName) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar />
        <View style={styles.container}>
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // 对话模式
  if (mode === 'chatting') {
    const hasEnding = chatMessages.some(m => m.isEnding);
    
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* 顶部栏 */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setMode('idle')} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>与{monsterName}对话中</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        
        {/* 小怪兽头像 */}
        <View style={styles.chatMonsterContainer}>
          <View style={[styles.chatMonster, { backgroundColor: monsterConfig.color }]}>
            <Image 
              source={require('../assets/monster.png')} 
              style={styles.chatMonsterImage}
              resizeMode="contain"
            />
          </View>
        </View>
        
        {/* 对话区域 */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatScrollView}
          contentContainerStyle={styles.chatContent}
        >
          {chatMessages.map((msg, idx) => (
            <View 
              key={idx} 
              style={[
                styles.messageBubbleContainer,
                msg.from === 'user' ? styles.userMessage : styles.monsterMessage
              ]}
            >
              <View style={[
                styles.messageBubble,
                msg.from === 'user' ? styles.userBubble : styles.monsterBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  msg.from === 'user' && styles.userMessageText
                ]}>{msg.text}</Text>
              </View>
            </View>
          ))}
          
          {/* 结束选项 */}
          {hasEnding && (
            <View style={styles.endingOptions}>
              <TouchableOpacity onPress={giveCake} style={styles.giveCakeButton}>
                <Text style={styles.giveCakeButtonText}>给{monsterName} 🍰</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={continueChat} style={styles.stayButton}>
                <Text style={styles.stayButtonText}>再待一会儿</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        
        {/* 继续对话按钮 */}
        {!hasEnding && (
          <View style={styles.chatInputContainer}>
            <TouchableOpacity onPress={continueChat} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>点击继续对话...</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }
  
  // 结算动画
  if (mode === 'ending') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.endingContainer}>
          {/* 装饰 */}
          <Text style={styles.sparkle1}>✨</Text>
          <Text style={styles.sparkle2}>💕</Text>
          <Text style={styles.sparkle3}>✨</Text>
          
          {/* 开心的怪兽 */}
          <Animated.View style={[styles.endingMonster, bounceAnimatedStyle, { backgroundColor: monsterConfig.color }]}>
            <Image 
              source={require('../assets/monster.png')} 
              style={styles.endingMonsterImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          <Text style={styles.endingTitle}>谢谢你陪我</Text>
          <Text style={styles.endingSubtitle}>也谢谢你把蛋糕给我 🍰</Text>
          
          <View style={styles.cakeAddedBadge}>
            <Text style={styles.cakeAddedText}>+1 🍰 已存入</Text>
          </View>
          
          <Text style={styles.lighthouseHint}>灯塔上你的光亮起了 ✨</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // 守护卡片
  if (mode === 'card') {
    return (
      <SafeAreaView style={styles.cardSafeArea}>
        <View style={styles.cardContainer}>
          {/* 星星背景 */}
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.2,
                }
              ]}
            />
          ))}
          
          {/* 卡片 */}
          <View style={styles.guardCard}>
            <Text style={styles.cardMoonIcon}>🌙</Text>
            <Text style={styles.cardTitle}>今夜我守护了自己</Text>
            <Text style={styles.cardDate}>{getCurrentDate()} {getTimeOfDay()}</Text>
            
            <View style={styles.cardStats}>
              <Text style={styles.cardStatsNumber}>第 {sosSuccessCount} 次</Text>
              <Text style={styles.cardStatsLabel}>选择照顾自己</Text>
            </View>
            
            <Text style={styles.cardQuote}>
              "撑过那90秒，{'\n'}就是胜利"
            </Text>
            
            <Text style={styles.cardFooter}>—— 与{monsterName}一起 ——</Text>
          </View>
          
          {/* 按钮 */}
          <View style={styles.cardButtons}>
            <TouchableOpacity onPress={saveCard} style={styles.saveCardButton}>
              <Text style={styles.saveCardButtonText}>保存卡片 📷</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeCard} style={styles.backHomeButton}>
              <Text style={styles.backHomeButtonText}>回到首页</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // 待机状态
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      <View style={styles.container}>
        {/* 装饰星星 */}
        <Text style={styles.idleSparkle1}>✨</Text>
        <Text style={styles.idleSparkle2}>✨</Text>
        
        <View style={styles.monsterContainer}>
          {/* 光晕 */}
          <Animated.View 
            style={[
              styles.glow,
              { backgroundColor: monsterConfig.color },
              glowAnimatedStyle,
            ]} 
          />
          
          {/* 怪兽 */}
          <Animated.View style={[styles.monster, monsterAnimatedStyle]}>
            <Image 
              source={require('../assets/monster.png')} 
              style={styles.monsterImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>
        
        <Text style={styles.monsterNameText}>{monsterName}</Text>
        
        {/* 对话气泡 */}
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>💬 "我在这里，随时找我"</Text>
        </View>
        
        {/* SOS按钮 */}
        <TouchableOpacity
          style={styles.sosButton}
          onPress={startSOS}
          activeOpacity={0.8}
        >
          <Text style={styles.sosButtonTitle}>SOS</Text>
          <Text style={styles.sosButtonSubtitle}>我需要缓一缓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGradient[0],
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  
  // 待机状态
  idleSparkle1: {
    position: 'absolute',
    top: 120,
    left: 40,
    fontSize: 16,
    opacity: 0.5,
  },
  idleSparkle2: {
    position: 'absolute',
    top: 160,
    right: 50,
    fontSize: 12,
    opacity: 0.4,
  },
  monsterContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  monster: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  monsterImage: {
    width: 100,
    height: 100,
  },
  monsterNameText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  speechBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 60,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  speechText: {
    fontSize: 15,
    color: colors.text,
  },
  sosButton: {
    width: '100%',
    backgroundColor: colors.accent.blue,
    borderRadius: 28,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  sosButtonTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 3,
  },
  sosButtonSubtitle: {
    fontSize: 14,
    color: '#6A6A8A',
    marginTop: 6,
  },
  
  // 对话模式
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  chatHeaderTitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  headerPlaceholder: {
    width: 60,
  },
  chatMonsterContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  chatMonster: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  chatMonsterImage: {
    width: 65,
    height: 65,
  },
  chatScrollView: {
    flex: 1,
  },
  chatContent: {
    padding: 24,
    paddingBottom: 40,
  },
  messageBubbleContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  monsterMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: colors.accent.blue,
    borderBottomRightRadius: 4,
  },
  monsterBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  userMessageText: {
    color: colors.text,
  },
  endingOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  giveCakeButton: {
    backgroundColor: colors.accent.yellow,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: colors.accent.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  giveCakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  stayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  stayButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  chatInputContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 16,
    paddingLeft: 20,
  },
  continueButtonText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  
  // 结算动画
  endingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sparkle1: {
    position: 'absolute',
    top: 100,
    fontSize: 20,
    opacity: 0.6,
  },
  sparkle2: {
    position: 'absolute',
    top: 150,
    left: 80,
    fontSize: 16,
    opacity: 0.4,
  },
  sparkle3: {
    position: 'absolute',
    top: 130,
    right: 70,
    fontSize: 14,
    opacity: 0.5,
  },
  endingMonster: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
    overflow: 'hidden',
  },
  endingMonsterImage: {
    width: 120,
    height: 120,
  },
  endingTitle: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  endingSubtitle: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  cakeAddedBadge: {
    marginTop: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cakeAddedText: {
    fontSize: 14,
    color: colors.text,
  },
  lighthouseHint: {
    marginTop: 16,
    fontSize: 14,
    color: colors.accent.blue,
  },
  
  // 守护卡片
  cardSafeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  star: {
    position: 'absolute',
    backgroundColor: colors.accent.blue,
    borderRadius: 10,
  },
  guardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 16,
  },
  cardMoonIcon: {
    fontSize: 40,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  cardStats: {
    backgroundColor: colors.backgroundGradient[0],
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  cardStatsNumber: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
  },
  cardStatsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardQuote: {
    fontSize: 15,
    color: '#6A6A8A',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  cardFooter: {
    fontSize: 12,
    color: colors.accent.blue,
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  saveCardButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  saveCardButtonText: {
    fontSize: 14,
    color: 'white',
  },
  backHomeButton: {
    backgroundColor: colors.accent.yellow,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backHomeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
