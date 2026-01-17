import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCreatureStore, MONSTER_TYPES } from '@/store/creatureStore';
import { usePauseStore } from '@/store/pauseStore';
import { useLighthouseStore } from '@/store/lighthouseStore';
import { colors } from '@/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 成就配置
const ACHIEVEMENTS = [
  { id: 'first_sos', icon: '🌟', title: '初次求助', desc: '第一次使用SOS功能', requirement: 1 },
  { id: 'sos_5', icon: '💪', title: '坚持的力量', desc: '成功使用SOS 5次', requirement: 5 },
  { id: 'sos_10', icon: '🏆', title: '情绪管理者', desc: '成功使用SOS 10次', requirement: 10 },
  { id: 'sos_30', icon: '👑', title: '自我守护者', desc: '成功使用SOS 30次', requirement: 30 },
  { id: 'cake_10', icon: '🍰', title: '蛋糕收集家', desc: '累计获得10个蛋糕', requirement: 10 },
  { id: 'cake_50', icon: '🎂', title: '甜蜜大师', desc: '累计获得50个蛋糕', requirement: 50 },
  { id: 'days_7', icon: '📅', title: '一周陪伴', desc: '使用App满7天', requirement: 7 },
  { id: 'days_30', icon: '🌙', title: '月光守护', desc: '使用App满30天', requirement: 30 },
];

// 鼓励语
const ENCOURAGEMENTS = [
  '每一次暂停，都是对自己的温柔',
  '你比想象中更强大',
  '慢慢来，不着急',
  '今天也辛苦了',
  '你值得被好好对待',
];

/**
 * 我的成长页面
 * 展示用户成就、统计数据、怪兽信息
 */
export default function ProfilePage() {
  const router = useRouter();
  const { 
    monsterType, 
    monsterName, 
    cakeCount, 
    sosSuccessCount, 
    totalDays,
    dailyMindfulnessCompleted,
    dailyLighthouseCompleted,
    clear: clearCreature,
  } = useCreatureStore();
  const { reset: resetPause } = usePauseStore();
  const { reset: resetLighthouse } = useLighthouseStore();
  
  const [encouragement] = useState(
    ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  );
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const floatY = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const resetButtonScale = useSharedValue(1);
  const resetButtonRotate = useSharedValue(0);
  
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    // 重置按钮的梦幻旋转动画
    resetButtonRotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);
  
  // 重置按钮动画
  const resetButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: resetButtonScale.value },
    ],
  }));
  
  const resetButtonGlowStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${resetButtonRotate.value}deg` },
    ],
  }));
  
  // 处理重置
  const handleReset = async () => {
    setIsResetting(true);
    
    // 清除所有数据
    clearCreature();
    resetPause();
    resetLighthouse();
    
    // 清除心情日记数据
    try {
      await AsyncStorage.removeItem('@pauselight:mood_entries');
    } catch (error) {
      console.error('Failed to clear mood entries:', error);
    }
    
    // 延迟跳转，让用户看到动画
    setTimeout(() => {
      setShowResetModal(false);
      setIsResetting(false);
      router.replace('/onboarding');
    }, 1000);
  };
  
  const handleResetButtonPress = () => {
    resetButtonScale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    setShowResetModal(true);
  };
  
  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));
  
  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));
  
  const monsterConfig = monsterType ? MONSTER_TYPES[monsterType] : null;
  
  // 计算已解锁的成就
  const unlockedAchievements = ACHIEVEMENTS.filter(achievement => {
    if (achievement.id.startsWith('sos_') || achievement.id === 'first_sos') {
      return sosSuccessCount >= achievement.requirement;
    }
    if (achievement.id.startsWith('cake_')) {
      return cakeCount >= achievement.requirement;
    }
    if (achievement.id.startsWith('days_')) {
      return totalDays >= achievement.requirement;
    }
    return false;
  });
  
  // 计算今日完成度
  const todayProgress = [
    dailyMindfulnessCompleted,
    dailyLighthouseCompleted,
  ].filter(Boolean).length;
  
  if (!monsterConfig || !monsterName) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部装饰 */}
        <View style={styles.headerDecoration}>
          <Text style={styles.sparkle1}>✨</Text>
          <Text style={styles.sparkle2}>·</Text>
          <Text style={styles.sparkle3}>✨</Text>
        </View>
        
        {/* 怪兽卡片 */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(100)}
          style={styles.monsterCard}
        >
          <Animated.View style={[styles.monsterGlow, { backgroundColor: monsterConfig.color }, glowStyle]} />
          
          <Animated.View style={[styles.monsterAvatar, floatStyle]}>
            <View style={[styles.monsterCircle, { backgroundColor: monsterConfig.color }]}>
              <Image 
                source={monsterConfig.index === 1 
                  ? require('../assets/monster1.jpg')
                  : require('../assets/monster2.jpg')
                } 
                style={styles.monsterImage}
                resizeMode="cover"
              />
            </View>
          </Animated.View>
          
          <Text style={styles.monsterName}>{monsterName}</Text>
          <Text style={styles.monsterPersonality}>{monsterConfig.personality}</Text>
          
          {/* 鼓励语 */}
          <View style={styles.encouragementBubble}>
            <Text style={styles.encouragementText}>💬 "{encouragement}"</Text>
          </View>
        </Animated.View>
        
        {/* 统计卡片 */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
          style={styles.statsSection}
        >
          <Text style={styles.sectionTitle}>📊 我的数据</Text>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.statCardPink]}>
              <Text style={styles.statNumber}>{sosSuccessCount}</Text>
              <Text style={styles.statLabel}>成功暂停</Text>
              <Text style={styles.statIcon}>⏸️</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardYellow]}>
              <Text style={styles.statNumber}>{cakeCount}</Text>
              <Text style={styles.statLabel}>蛋糕收集</Text>
              <Text style={styles.statIcon}>🍰</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardBlue]}>
              <Text style={styles.statNumber}>{totalDays}</Text>
              <Text style={styles.statLabel}>陪伴天数</Text>
              <Text style={styles.statIcon}>📅</Text>
            </View>
            
            <View style={[styles.statCard, styles.statCardPurple]}>
              <Text style={styles.statNumber}>{todayProgress}/2</Text>
              <Text style={styles.statLabel}>今日任务</Text>
              <Text style={styles.statIcon}>✅</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* 成就墙 */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.achievementsSection}
        >
          <Text style={styles.sectionTitle}>🏅 成就墙</Text>
          <Text style={styles.achievementSubtitle}>
            已解锁 {unlockedAchievements.length}/{ACHIEVEMENTS.length}
          </Text>
          
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((achievement, index) => {
              const isUnlocked = unlockedAchievements.some(a => a.id === achievement.id);
              return (
                <View 
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    !isUnlocked && styles.achievementLocked
                  ]}
                >
                  <Text style={[
                    styles.achievementIcon,
                    !isUnlocked && styles.achievementIconLocked
                  ]}>
                    {isUnlocked ? achievement.icon : '🔒'}
                  </Text>
                  <Text style={[
                    styles.achievementTitle,
                    !isUnlocked && styles.achievementTitleLocked
                  ]}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDesc}>
                    {isUnlocked ? achievement.desc : '???'}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
        
        {/* 梦幻重置按钮 */}
        <Animated.View 
          entering={FadeInUp.duration(600).delay(400)}
          style={styles.resetSection}
        >
          <TouchableOpacity
            onPress={handleResetButtonPress}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.resetButton, resetButtonStyle]}>
              {/* 旋转光晕 */}
              <Animated.View style={[styles.resetButtonGlow, resetButtonGlowStyle]}>
                <View style={styles.resetGlowDot1} />
                <View style={styles.resetGlowDot2} />
                <View style={styles.resetGlowDot3} />
              </Animated.View>
              
              {/* 按钮主体 */}
              <View style={styles.resetButtonInner}>
                <View style={styles.resetButtonGlass}>
                  <Text style={styles.resetButtonEmoji}>🔄</Text>
                  <Text style={styles.resetButtonText}>重新开始</Text>
                </View>
              </View>
              
              {/* 顶部高光 */}
              <View style={styles.resetButtonHighlight} />
            </Animated.View>
          </TouchableOpacity>
          
          <Text style={styles.resetHint}>重置所有数据，重新认识一个小伙伴</Text>
        </Animated.View>
        
        {/* 底部留白 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      {/* 重置确认弹窗 */}
      <Modal visible={showResetModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.resetModal} entering={ZoomIn.duration(300)}>
            {/* 装饰 */}
            <View style={styles.modalDecoration}>
              <Text style={styles.modalSparkle1}>✨</Text>
              <Text style={styles.modalSparkle2}>·</Text>
              <Text style={styles.modalSparkle3}>✨</Text>
            </View>
            
            <Text style={styles.modalEmoji}>🌙</Text>
            <Text style={styles.modalTitle}>确定要重新开始吗？</Text>
            <Text style={styles.modalMessage}>
              这将清除所有数据{'\n'}
              包括你和{monsterName}的回忆...
            </Text>
            
            {isResetting ? (
              <View style={styles.resettingContainer}>
                <Text style={styles.resettingEmoji}>🌟</Text>
                <Text style={styles.resettingText}>正在准备新的旅程...</Text>
              </View>
            ) : (
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setShowResetModal(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>再想想</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReset}
                  style={styles.modalConfirmButton}
                >
                  <Text style={styles.modalConfirmText}>确定重置</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  
  // 顶部装饰
  headerDecoration: {
    height: 40,
    position: 'relative',
  },
  sparkle1: {
    position: 'absolute',
    left: 20,
    top: 10,
    fontSize: 16,
    opacity: 0.5,
  },
  sparkle2: {
    position: 'absolute',
    right: 60,
    top: 20,
    fontSize: 20,
    opacity: 0.3,
  },
  sparkle3: {
    position: 'absolute',
    right: 30,
    top: 5,
    fontSize: 12,
    opacity: 0.4,
  },
  
  // 怪兽卡片
  monsterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  monsterGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    opacity: 0.3,
  },
  monsterAvatar: {
    marginBottom: 16,
  },
  monsterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  monsterImage: {
    width: 85,
    height: 85,
  },
  monsterName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  monsterPersonality: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  encouragementBubble: {
    backgroundColor: colors.backgroundGradient[0],
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  encouragementText: {
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  
  // 统计区域
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardPink: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.pink,
  },
  statCardYellow: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.yellow,
  },
  statCardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.blue,
  },
  statCardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent.purple,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 24,
    opacity: 0.3,
  },
  
  // 成就区域
  achievementsSection: {
    marginBottom: 20,
  },
  achievementSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -10,
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementLocked: {
    backgroundColor: 'rgba(245, 240, 250, 0.6)',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementIconLocked: {
    opacity: 0.5,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: colors.textMuted,
  },
  achievementDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  bottomSpacer: {
    height: 100,
  },
  
  // 重置按钮区域
  resetSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  resetButton: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
  },
  resetGlowDot1: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.purple,
    opacity: 0.6,
    top: 10,
    left: '50%',
    marginLeft: -4,
  },
  resetGlowDot2: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.pink,
    opacity: 0.5,
    bottom: 20,
    left: 20,
  },
  resetGlowDot3: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.blue,
    opacity: 0.5,
    bottom: 25,
    right: 15,
  },
  resetButtonInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(197, 168, 232, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(197, 168, 232, 0.3)',
  },
  resetButtonGlass: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  resetButtonHighlight: {
    position: 'absolute',
    top: 32,
    width: 40,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  resetButtonEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  resetButtonText: {
    fontSize: 11,
    color: colors.accent.purple,
    fontWeight: '600',
  },
  resetHint: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  
  // 重置弹窗
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 74, 106, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resetModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 16,
    overflow: 'hidden',
  },
  modalDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  modalSparkle1: {
    position: 'absolute',
    top: 15,
    left: 30,
    fontSize: 14,
    opacity: 0.4,
  },
  modalSparkle2: {
    position: 'absolute',
    top: 25,
    right: 50,
    fontSize: 18,
    opacity: 0.3,
  },
  modalSparkle3: {
    position: 'absolute',
    top: 10,
    right: 25,
    fontSize: 12,
    opacity: 0.5,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(197, 168, 232, 0.15)',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 168, 232, 0.3)',
  },
  modalCancelText: {
    fontSize: 15,
    color: colors.accent.purple,
    fontWeight: '500',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: colors.accent.purple,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalConfirmText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  resettingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resettingEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  resettingText: {
    fontSize: 14,
    color: colors.accent.purple,
  },
});
