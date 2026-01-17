import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Dimensions, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { useCreatureStore, MONSTER_TYPES } from '@/store/creatureStore';
import { colors } from '@/theme/colors';
import { TopBar } from '@/components/shared/TopBar';
import { MindfulnessCard } from '@/components/creature/MindfulnessCard';
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

// 心情状态
type MoodType = 'happy' | 'normal' | 'miss' | 'eating';

const MOOD_CONFIG: Record<MoodType, { label: string; color: string }> = {
  happy: { label: '开心', color: '#FFE5A0' },
  normal: { label: '一般', color: '#A5C9E8' },
  miss: { label: '想你了', color: '#FFCAD4' },
  eating: { label: '在吃东西', color: '#C5A8E8' },
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
  const [currentPhrase, setCurrentPhrase] = useState(DAILY_PHRASES[0]);
  const [mood, setMood] = useState<MoodType>('normal');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const videoRef = useRef<Video>(null);
  const breathScale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const tapScale = useSharedValue(1);
  const bubbleOpacity = useSharedValue(1);
  
  // 每日重置检查
  useEffect(() => {
    resetDaily();
    // 随机初始心情
    const moods: MoodType[] = ['happy', 'normal', 'miss'];
    setMood(moods[Math.floor(Math.random() * moods.length)]);
  }, []);
  
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
  
  // 点击怪兽交互
  const handleMonsterTap = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // 播放视频
    setShowVideo(true);
    videoRef.current?.playAsync();
    
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
      setIsAnimating(false);
    }, 200);
  };
  
  // 视频播放完成
  const handleVideoEnd = () => {
    setShowVideo(false);
    videoRef.current?.stopAsync();
    videoRef.current?.setPositionAsync(0);
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
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar />
      
      <View style={styles.container}>
        {/* 中央主区域 - 怪兽 (占50%) */}
        <View style={styles.monsterSection}>
          {/* 装饰星星 */}
          <Text style={styles.sparkle1}>✨</Text>
          <Text style={styles.sparkle2}>✨</Text>
          <Text style={styles.sparkle3}>·</Text>
          
          {/* 对话气泡 */}
          <Animated.View style={[styles.speechBubble, bubbleAnimatedStyle]}>
            <Text style={styles.speechText}>"{currentPhrase}"</Text>
          </Animated.View>
          
          {/* 怪兽主体 */}
          <TouchableOpacity 
            onPress={handleMonsterTap} 
            activeOpacity={1}
            style={styles.monsterTouchable}
          >
            <View style={styles.monsterContainer}>
              {/* 光晕 */}
              <View style={[styles.monsterGlow, { backgroundColor: monsterConfig.color }]} />
              
              {/* 视频或静态图片 */}
              {showVideo ? (
                <View style={styles.monsterVideoContainer}>
                  <Video
                    ref={videoRef}
                    source={require('../assets/monster-eating.mp4')}
                    style={styles.monsterVideo}
                    resizeMode={ResizeMode.STRETCH}
                    shouldPlay={true}
                    isLooping={false}
                    useNativeControls={false}
                    videoStyle={{ width: 240, height: 240 }}
                    onPlaybackStatusUpdate={(status) => {
                      if (status.isLoaded && status.didJustFinish) {
                        handleVideoEnd();
                      }
                    }}
                  />
                </View>
              ) : (
                <Animated.View style={[styles.monsterImageContainer, monsterAnimatedStyle]}>
                  <Image 
                    source={require('../assets/monster.png')} 
                    style={styles.monsterImage}
                    resizeMode="contain"
                  />
                </Animated.View>
              )}
            </View>
          </TouchableOpacity>
          
          {/* 怪兽名字和状态 */}
          <View style={styles.monsterInfo}>
            <Text style={styles.monsterName}>{monsterName}</Text>
            <View style={[styles.moodBadge, { backgroundColor: moodConfig.color }]}>
              <Text style={styles.moodText}>{moodConfig.label}</Text>
            </View>
          </View>
          
          {/* 点击提示 */}
          <Text style={styles.tapHint}>点击{monsterName}换一句话</Text>
          
          {/* 右侧侧边栏按钮 */}
          <View style={styles.sideButtons}>
            {/* 正念学堂 */}
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
            
            {/* 点亮灯塔 */}
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
      
      {/* 正念学堂弹窗 */}
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
  
  // 中央怪兽区域 (占50%)
  monsterSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  
  // 装饰
  sparkle1: {
    position: 'absolute',
    top: 20,
    left: 30,
    fontSize: 18,
    opacity: 0.5,
  },
  sparkle2: {
    position: 'absolute',
    top: 60,
    right: 40,
    fontSize: 14,
    opacity: 0.4,
  },
  sparkle3: {
    position: 'absolute',
    bottom: 80,
    left: 50,
    fontSize: 20,
    opacity: 0.3,
  },
  
  // 对话气泡
  speechBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 24,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  speechText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // 怪兽
  monsterTouchable: {
    alignItems: 'center',
  },
  monsterContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monsterGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.4,
  },
  monsterBody: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 10,
  },
  monsterImageContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  monsterImage: {
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  // 视频容器（圆形）
  monsterVideoContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  monsterVideo: {
    width: 240,
    height: 240,
  },
  
  // 怪兽信息
  monsterInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  monsterName: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  moodBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  moodText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  
  // 点击提示
  tapHint: {
    marginTop: 16,
    fontSize: 12,
    color: colors.textMuted,
  },
  
  // 右侧侧边栏按钮
  sideButtons: {
    position: 'absolute',
    right: 12,
    top: '35%',
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
  lighthouseIcon: {
    backgroundColor: 'rgba(165, 201, 232, 0.6)',
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
