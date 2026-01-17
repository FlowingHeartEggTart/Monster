import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Dimensions, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreatureStore, MONSTER_TYPES } from '@/store/creatureStore';
import { colors } from '@/theme/colors';
import { TopBar } from '@/components/shared/TopBar';
import { MindfulnessCard } from '@/components/creature/MindfulnessCard';
import { MonsterVideoPlayer, MonsterAnimationState } from '@/components/creature/MonsterVideoPlayer';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// 日常台词池
const DAILY_PHRASES = [
  '今天也辛苦了~',
  '我在这里陪你',
  '想和你待一会儿',
  '摸摸头~',
  '有你真好',
  '嗯，我在呢',
  '慢慢来，不着急',
  '你已经很棒了',
  '抱抱~',
  '想你了',
];

// 基于时间的问候语
const getTimeGreeting = (name: string): string => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return `早安~今天要加油哦！`;
  } else if (hour >= 12 && hour < 14) {
    return `午饭时间，吃得好一点~`;
  } else if (hour >= 14 && hour < 18) {
    return `下午好，我在这里陪你`;
  } else if (hour >= 18 && hour < 22) {
    return `晚上了，今天辛苦了`;
  } else {
    return `这么晚了，早点休息哦`;
  }
};

// 久未打开时的想念语
const getMissPhrase = (lastVisit: Date | null): string | null => {
  if (!lastVisit) return null;
  const hoursSinceLastVisit = (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60);
  if (hoursSinceLastVisit >= 24) {
    return '你好久没来了...我很想你';
  }
  return null;
};

// 心情状态
type MoodType = 'happy' | 'normal' | 'miss' | 'eating';

const MOOD_CONFIG: Record<MoodType, { label: string; color: string; emoji: string }> = {
  happy: { label: '开心', color: '#FFE5A0', emoji: '😊' },
  normal: { label: '一般', color: '#A5C9E8', emoji: '😌' },
  miss: { label: '想你了', color: '#FFCAD4', emoji: '🥺' },
  eating: { label: '在吃东西', color: '#C5A8E8', emoji: '😋' },
};

// 动画状态显示
const ANIMATION_STATE_LABEL: Record<MonsterAnimationState, string> = {
  idle: '',
  eating: '🍰 正在吃蛋糕...',
  touched: '💕 被摸了！',
  listening: '👂 在听...',
  empathy: '💝 感同身受',
  serious: '😐 认真脸',
  company: '🤝 陪伴中',
  regret: '😢 有点难过',
};

/**
 * 怪兽养成页（主页）
 * 怪兽大图居中 + 对话气泡 + 侧边功能入口
 */
export default function HomePage() {
  const router = useRouter();
  const { 
    monsterType, 
    monsterName, 
    cakeCount,
    resetDaily, 
    dailyMindfulnessCompleted, 
    dailyLighthouseCompleted,
  } = useCreatureStore();
  
  const [showMindfulnessModal, setShowMindfulnessModal] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [mood, setMood] = useState<MoodType>('normal');
  const [isAnimating, setIsAnimating] = useState(false);
  const [monsterAnimation, setMonsterAnimation] = useState<MonsterAnimationState>('idle');
  const [showCakeAnimation, setShowCakeAnimation] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  
  const monsterVideoRef = useRef<any>(null);
  const breathScale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const tapScale = useSharedValue(1);
  const bubbleOpacity = useSharedValue(1);
  const cakePosition = useSharedValue(300);
  const cakeOpacity = useSharedValue(0);
  
  // 每日重置检查 + 初始问候
  useEffect(() => {
    resetDaily();
    // 初始显示时间问候
    setCurrentPhrase(getTimeGreeting(monsterName || ''));
    // 随机初始心情
    const moods: MoodType[] = ['happy', 'normal', 'miss'];
    setMood(moods[Math.floor(Math.random() * moods.length)]);
  }, [monsterName]);
  
  // 呼吸浮动动画
  useEffect(() => {
    // 呼吸缩放
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    // 上下浮动
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);
  
  const monsterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: breathScale.value * tapScale.value },
      { translateY: floatY.value },
    ],
  }));
  
  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [{ translateY: floatY.value }],
  }));
  
  // 蛋糕飞入动画样式
  const cakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cakePosition.value }],
    opacity: cakeOpacity.value,
  }));
  
  // 点击怪兽交互（3秒冷却）
  const handleMonsterTap = () => {
    const now = Date.now();
    if (isAnimating || now - lastTapTime < 3000) return; // 3秒冷却
    
    setLastTapTime(now);
    setIsAnimating(true);
    
    // 切换到被点击动画
    setMonsterAnimation('touched');
    
    // 点击动画
    tapScale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    
    // 气泡淡出淡入
    bubbleOpacity.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 300 })
    );
    
    // 换一句台词
    setTimeout(() => {
      const newPhrase = DAILY_PHRASES[Math.floor(Math.random() * DAILY_PHRASES.length)];
      setCurrentPhrase(newPhrase);
    }, 200);
    
    // 1.5秒后恢复idle动画
    setTimeout(() => {
      setMonsterAnimation('idle');
      setIsAnimating(false);
    }, 1500);
  };
  
  // 吃蛋糕动画（4个阶段：蛋糕飞入 → 注意到 → 吃掉 → 满足）
  const playCakeAnimation = async () => {
    if (cakeCount <= 0) return;
    
    setShowCakeAnimation(true);
    setMood('eating');
    
    // 第1阶段：蛋糕飞入
    cakePosition.value = 300;
    cakeOpacity.value = 0;
    cakePosition.value = withSequence(
      withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    cakeOpacity.value = withTiming(1, { duration: 300 });
    setCurrentPhrase('咦，这是...？');
    
    // 第2阶段：注意到蛋糕（1秒后）
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentPhrase('是蛋糕！给我的吗～');
    
    // 第3阶段：切换到吃蛋糕动画（0.8秒后）
    await new Promise(resolve => setTimeout(resolve, 800));
    setMonsterAnimation('eating');
    cakeOpacity.value = withTiming(0, { duration: 300 });
    setCurrentPhrase('吃掉啦～好好吃！');
    
    // 第4阶段：满足表情（2秒后）
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowCakeAnimation(false);
    setMonsterAnimation('idle');
    setMood('happy');
    setCurrentPhrase('谢谢你～今天吃得好满足');
  };
  
  // 视频播放完成
  const handleAnimationEnd = () => {
    if (monsterAnimation === 'touched' || monsterAnimation === 'eating') {
      setMonsterAnimation('idle');
    }
  };
  
  if (!monsterType || !monsterName) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const monsterConfig = MONSTER_TYPES[monsterType];
  const moodConfig = MOOD_CONFIG[mood];
  const animStateLabel = ANIMATION_STATE_LABEL[monsterAnimation];
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      
      <View style={styles.container}>
        {/* 顶部状态面板 */}
        <View style={styles.statusPanel}>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Text style={styles.statusEmoji}>🍰</Text>
                <Text style={styles.statusValue}>{cakeCount}</Text>
                <Text style={styles.statusLabel}>蛋糕</Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={styles.statusEmoji}>{moodConfig.emoji}</Text>
                <Text style={[styles.statusValue, { color: moodConfig.color }]}>{moodConfig.label}</Text>
                <Text style={styles.statusLabel}>心情</Text>
              </View>
              <View style={styles.statusDivider} />
              <View style={styles.statusItem}>
                <Text style={styles.statusEmoji}>✨</Text>
                <Text style={styles.statusValue}>{monsterConfig.personality.slice(0, 2)}</Text>
                <Text style={styles.statusLabel}>性格</Text>
              </View>
            </View>
          </View>
          
          {/* 喂蛋糕按钮 */}
          {cakeCount > 0 && (
            <TouchableOpacity 
              style={styles.feedButton}
              onPress={playCakeAnimation}
              activeOpacity={0.8}
            >
              <Text style={styles.feedButtonText}>🧁 喂蛋糕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.monsterSection}>
          {/* 对话气泡 */}
          <Animated.View style={[styles.speechBubble, bubbleAnimatedStyle]}>
            <Text style={styles.speechText}>{currentPhrase}</Text>
          </Animated.View>
          
          {/* 怪兽区域 */}
          <TouchableOpacity 
            onPress={handleMonsterTap} 
            activeOpacity={1}
            style={styles.monsterTouchable}
          >
            <View style={styles.monsterContainer}>
              {/* 多层光晕效果 */}
              <View style={[styles.monsterGlowOuter, { backgroundColor: monsterConfig.color }]} />
              <View style={[styles.monsterGlow, { backgroundColor: monsterConfig.color }]} />
              <Animated.View style={[styles.monsterImageContainer, monsterAnimatedStyle]}>
                <MonsterVideoPlayer
                  ref={monsterVideoRef}
                  monsterIndex={monsterConfig.index}
                  animationState={monsterAnimation}
                  size={220}
                  isLooping={monsterAnimation === 'idle'}
                  autoPlay={true}
                  onAnimationEnd={handleAnimationEnd}
                />
              </Animated.View>
              {showCakeAnimation && (
                <Animated.View style={[styles.cakeAnimation, cakeAnimatedStyle]}>
                  <Text style={styles.cakeEmoji}>🧁</Text>
                </Animated.View>
              )}
            </View>
          </TouchableOpacity>
          
          {/* 怪兽信息 */}
          <View style={styles.monsterInfo}>
            <Text style={styles.monsterName}>{monsterName}</Text>
            {animStateLabel ? (
              <View style={styles.animStateBadge}>
                <Text style={styles.animStateText}>{animStateLabel}</Text>
              </View>
            ) : (
              <Text style={styles.tapHint}>点击{monsterName}互动</Text>
            )}
          </View>
          
          <View style={styles.sideButtons}>
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => setShowMindfulnessModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.sideButtonGlass}>
                <View style={[styles.sideButtonIcon, styles.mindfulnessIcon]}>
                  <Text style={styles.sideIconText}>📖</Text>
                </View>
                <Text style={styles.sideButtonLabel}>正念</Text>
                {dailyMindfulnessCompleted && (
                  <View style={styles.sideCompletedDot}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => router.push('/breathe')}
              activeOpacity={0.7}
            >
              <View style={styles.sideButtonGlass}>
                <View style={[styles.sideButtonIcon, styles.breatheIcon]}>
                  <Text style={styles.sideIconText}>🌊</Text>
                </View>
                <Text style={styles.sideButtonLabel}>呼吸</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sideButton}
              onPress={() => router.push('/lighthouse')}
              activeOpacity={0.7}
            >
              <View style={styles.sideButtonGlass}>
                <View style={[styles.sideButtonIcon, styles.lighthouseIcon]}>
                  <Text style={styles.sideIconText}>🏠</Text>
                </View>
                <Text style={styles.sideButtonLabel}>灯塔</Text>
                {dailyLighthouseCompleted && (
                  <View style={styles.sideCompletedDot}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <MindfulnessCard
        visible={showMindfulnessModal}
        onClose={() => setShowMindfulnessModal(false)}
      />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  
  // 状态面板
  statusPanel: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: 'rgba(165, 201, 232, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  feedButton: {
    backgroundColor: colors.accent.yellow,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: colors.accent.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  feedButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  
  monsterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  
  speechBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 16,
    marginBottom: 24,
    maxWidth: SCREEN_WIDTH * 0.8,
    shadowColor: 'rgba(165, 201, 232, 0.3)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  speechText: {
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  
  monsterTouchable: {
    alignItems: 'center',
  },
  monsterContainer: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monsterGlowOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.15,
  },
  monsterGlow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.35,
  },
  monsterImageContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  
  cakeAnimation: {
    position: 'absolute',
    right: 10,
    top: '35%',
  },
  cakeEmoji: {
    fontSize: 40,
  },
  
  monsterInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  monsterName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 1,
  },
  animStateBadge: {
    backgroundColor: 'rgba(197, 168, 232, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 168, 232, 0.5)',
  },
  animStateText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  tapHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  
  sideButtons: {
    position: 'absolute',
    right: 12,
    top: '25%',
    gap: 12,
    alignItems: 'center',
  },
  sideButton: {
    alignItems: 'center',
  },
  sideButtonGlass: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: 'rgba(165, 201, 232, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 56,
  },
  sideButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  mindfulnessIcon: {
    backgroundColor: 'rgba(255, 202, 212, 0.6)',
  },
  breatheIcon: {
    backgroundColor: 'rgba(165, 201, 232, 0.6)',
  },
  lighthouseIcon: {
    backgroundColor: 'rgba(197, 168, 232, 0.6)',
  },
  sideIconText: {
    fontSize: 16,
  },
  sideButtonLabel: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sideCompletedDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },
});
