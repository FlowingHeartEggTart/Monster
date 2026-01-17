import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { useCreatureStore } from '@/store/creatureStore';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withSpring,
  withDelay,
  Easing,
  cancelAnimation,
  FadeIn,
  FadeInUp,
  FadeInDown,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 呼吸模式配置
const BREATH_MODES = {
  relax: {
    name: '放松呼吸',
    desc: '4-7-8 呼吸法',
    subDesc: '帮助放松身心，释放压力',
    icon: '🌙',
    inhale: 4,
    hold: 7,
    exhale: 8,
    colors: ['#1a1a3e', '#2d2d5a', '#3d3d7a'] as const,
    accentColor: '#a5c9e8',
    glowColor: 'rgba(165, 201, 232, 0.6)',
  },
  calm: {
    name: '平静呼吸',
    desc: '4-4-4-4 方形呼吸',
    subDesc: '平复焦虑，找回内心平静',
    icon: '☁️',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    colors: ['#1e1a3a', '#3a2d5a', '#5a3d7a'] as const,
    accentColor: '#c5a8e8',
    glowColor: 'rgba(197, 168, 232, 0.6)',
  },
  energy: {
    name: '活力呼吸',
    desc: '快速呼吸法',
    subDesc: '提升能量，唤醒身心',
    icon: '✨',
    inhale: 2,
    hold: 0,
    exhale: 2,
    colors: ['#1a2a3e', '#2a3a5a', '#3a5a7a'] as const,
    accentColor: '#ffe5a0',
    glowColor: 'rgba(255, 229, 160, 0.6)',
  },
};

type BreathMode = keyof typeof BREATH_MODES;
type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'holdAfter' | 'complete';

const PHASE_LABELS: Record<BreathPhase, string> = {
  idle: '准备开始',
  inhale: '吸气',
  hold: '屏息',
  exhale: '呼气',
  holdAfter: '屏息',
  complete: '完成',
};

// 浮动粒子组件
const FloatingParticle = ({ delay, size, left, duration, color }: { 
  delay: number; 
  size: number; 
  left: number; 
  duration: number;
  color: string;
}) => {
  const translateY = useSharedValue(SCREEN_HEIGHT + 50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-100, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: duration * 0.3 }),
          withTiming(0.8, { duration: duration * 0.4 }),
          withTiming(0, { duration: duration * 0.3 })
        ),
        -1,
        false
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration * 0.5 }),
          withTiming(0.5, { duration: duration * 0.5 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: `${left}%`,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: size,
        },
        animatedStyle,
      ]}
    />
  );
};

// 星星组件
const Star = ({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: `${x}%`,
          top: `${y}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

/**
 * 呼吸练习页面 - 梦幻版
 * 引导式呼吸放松工具
 */
export default function BreathePage() {
  const router = useRouter();
  const { addCake } = useCreatureStore();
  
  const [selectedMode, setSelectedMode] = useState<BreathMode>('relax');
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [countdown, setCountdown] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalCycles] = useState(3);
  
  const circleScale = useSharedValue(0.5);
  const circleOpacity = useSharedValue(0.4);
  const innerGlow = useSharedValue(0.3);
  const outerRingRotation = useSharedValue(0);
  const innerRingRotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const breathGlow = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  
  const mode = BREATH_MODES[selectedMode];
  
  // 生成星星位置
  const stars = React.useMemo(() => 
    Array.from({ length: 40 }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3000,
    })), []
  );

  // 生成浮动粒子
  const particles = React.useMemo(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      delay: i * 800,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      duration: 8000 + Math.random() * 4000,
    })), []
  );
  
  // 装饰动画
  useEffect(() => {
    outerRingRotation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );
    
    innerRingRotation.value = withRepeat(
      withTiming(-360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
    
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    breathGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);
  
  // 呼吸动画
  const animatePhase = useCallback((newPhase: BreathPhase, duration: number) => {
    setPhase(newPhase);
    setCountdown(duration);
    
    if (newPhase === 'inhale') {
      circleScale.value = withTiming(1, { duration: duration * 1000, easing: Easing.inOut(Easing.ease) });
      circleOpacity.value = withTiming(0.9, { duration: duration * 1000 });
      innerGlow.value = withTiming(1, { duration: duration * 1000 });
    } else if (newPhase === 'exhale') {
      circleScale.value = withTiming(0.5, { duration: duration * 1000, easing: Easing.inOut(Easing.ease) });
      circleOpacity.value = withTiming(0.4, { duration: duration * 1000 });
      innerGlow.value = withTiming(0.3, { duration: duration * 1000 });
    } else if (newPhase === 'hold' || newPhase === 'holdAfter') {
      // 保持当前状态，添加轻微脉动
      innerGlow.value = withRepeat(
        withSequence(
          withTiming(innerGlow.value + 0.1, { duration: 500 }),
          withTiming(innerGlow.value, { duration: 500 })
        ),
        duration,
        true
      );
    }
  }, [circleScale, circleOpacity, innerGlow]);
  
  // 倒计时
  useEffect(() => {
    if (!isActive || phase === 'idle' || phase === 'complete') return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    if (phase === 'inhale') {
      if (mode.hold > 0) {
        animatePhase('hold', mode.hold);
      } else {
        animatePhase('exhale', mode.exhale);
      }
    } else if (phase === 'hold') {
      animatePhase('exhale', mode.exhale);
    } else if (phase === 'exhale') {
      if (mode.holdAfter && mode.holdAfter > 0) {
        animatePhase('holdAfter', mode.holdAfter);
      } else {
        const newCycle = cycleCount + 1;
        setCycleCount(newCycle);
        
        if (newCycle >= totalCycles) {
          setPhase('complete');
          setIsActive(false);
          addCake(1);
        } else {
          animatePhase('inhale', mode.inhale);
        }
      }
    } else if (phase === 'holdAfter') {
      const newCycle = cycleCount + 1;
      setCycleCount(newCycle);
      
      if (newCycle >= totalCycles) {
        setPhase('complete');
        setIsActive(false);
        addCake(1);
      } else {
        animatePhase('inhale', mode.inhale);
      }
    }
  }, [countdown, isActive, phase, mode, cycleCount, totalCycles, animatePhase, addCake]);
  
  const startBreathing = () => {
    setIsActive(true);
    setCycleCount(0);
    animatePhase('inhale', mode.inhale);
  };
  
  const stopBreathing = () => {
    setIsActive(false);
    setPhase('idle');
    setCycleCount(0);
    cancelAnimation(circleScale);
    cancelAnimation(circleOpacity);
    cancelAnimation(innerGlow);
    circleScale.value = withTiming(0.5, { duration: 500 });
    circleOpacity.value = withTiming(0.4, { duration: 500 });
    innerGlow.value = withTiming(0.3, { duration: 500 });
  };
  
  const restart = () => {
    setPhase('idle');
    setCycleCount(0);
    circleScale.value = withTiming(0.5, { duration: 500 });
    circleOpacity.value = withTiming(0.4, { duration: 500 });
    innerGlow.value = withTiming(0.3, { duration: 500 });
  };
  
  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: innerGlow.value,
    transform: [{ scale: 1 + innerGlow.value * 0.2 }],
  }));
  
  const outerRingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${outerRingRotation.value}deg` }],
  }));

  const innerRingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${innerRingRotation.value}deg` }],
  }));
  
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const breathGlowStyle = useAnimatedStyle(() => ({
    opacity: breathGlow.value * 0.5,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  return (
    <View style={styles.container}>
      {/* 渐变背景 */}
      <LinearGradient
        colors={mode.colors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* 星空背景 */}
      <View style={styles.starsContainer}>
        {stars.map((star, i) => (
          <Star key={i} {...star} />
        ))}
      </View>

      {/* 浮动粒子 */}
      <View style={styles.particlesContainer}>
        {particles.map((particle, i) => (
          <FloatingParticle key={i} {...particle} color={mode.accentColor} />
        ))}
      </View>

      {/* 背景光晕 */}
      <Animated.View style={[styles.backgroundGlow, breathGlowStyle]}>
        <View style={[styles.glowCircle, { backgroundColor: mode.glowColor }]} />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        {/* 返回按钮 */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.backButtonInner}>
            <Text style={styles.backButtonText}>←</Text>
          </View>
        </TouchableOpacity>

        {/* 标题 */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.title}>呼吸冥想</Text>
          <Text style={styles.subtitle}>跟随节奏，放松身心</Text>
        </Animated.View>
        
        <View style={styles.content}>
          {/* 模式选择 */}
          {phase === 'idle' && (
            <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.modeSelector}>
              {Object.entries(BREATH_MODES).map(([key, m]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.modeButton,
                    selectedMode === key && styles.modeButtonActive,
                  ]}
                  onPress={() => setSelectedMode(key as BreathMode)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.modeButtonGlow,
                    selectedMode === key && { 
                      backgroundColor: m.accentColor,
                      shadowColor: m.accentColor,
                    }
                  ]} />
                  <Text style={styles.modeIcon}>{m.icon}</Text>
                  <Text style={[
                    styles.modeName,
                    selectedMode === key && { color: '#fff' }
                  ]}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
          
          {/* 呼吸圆环 */}
          <View style={styles.breathContainer}>
            {/* 外层装饰环 */}
            <Animated.View style={[styles.outerRing, outerRingAnimatedStyle]}>
              {Array.from({ length: 24 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ringDot,
                    {
                      transform: [
                        { rotate: `${i * 15}deg` },
                        { translateY: -125 },
                      ],
                      backgroundColor: mode.accentColor,
                      opacity: 0.2 + (i % 4) * 0.15,
                    }
                  ]}
                />
              ))}
            </Animated.View>

            {/* 内层装饰环 */}
            <Animated.View style={[styles.innerRing, innerRingAnimatedStyle]}>
              {Array.from({ length: 16 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ringDotSmall,
                    {
                      transform: [
                        { rotate: `${i * 22.5}deg` },
                        { translateY: -105 },
                      ],
                      backgroundColor: mode.accentColor,
                      opacity: 0.3 + (i % 3) * 0.2,
                    }
                  ]}
                />
              ))}
            </Animated.View>

            {/* 外发光 */}
            <Animated.View style={[styles.breathGlow, glowAnimatedStyle]}>
              <View style={[styles.glowLayer1, { backgroundColor: mode.glowColor }]} />
              <View style={[styles.glowLayer2, { backgroundColor: mode.glowColor }]} />
            </Animated.View>
            
            {/* 呼吸主圆 */}
            <Animated.View style={[styles.breathCircle, circleAnimatedStyle]}>
              <LinearGradient
                colors={[
                  mode.accentColor,
                  `${mode.accentColor}99`,
                  `${mode.accentColor}66`,
                ]}
                style={styles.breathCircleGradient}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.7, y: 1 }}
              >
                {/* 玻璃高光 */}
                <View style={styles.glassHighlight} />
                
                <View style={styles.breathInner}>
                  {phase !== 'idle' && phase !== 'complete' ? (
                    <>
                      <Text style={styles.phaseLabel}>{PHASE_LABELS[phase]}</Text>
                      <Text style={styles.countdown}>{countdown}</Text>
                    </>
                  ) : phase === 'complete' ? (
                    <>
                      <Text style={styles.completeIcon}>🌟</Text>
                      <Text style={styles.completeText}>太棒了</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.idleIcon}>{mode.icon}</Text>
                      <Text style={styles.idleText}>点击开始</Text>
                    </>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
          
          {/* 进度指示 */}
          {isActive && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.progressContainer}>
              <Text style={styles.progressText}>
                第 {cycleCount + 1} 轮 / 共 {totalCycles} 轮
              </Text>
              <View style={styles.progressBar}>
                <View style={styles.progressBarBg} />
                <View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: `${((cycleCount + (phase !== 'idle' ? 0.5 : 0)) / totalCycles) * 100}%`,
                      backgroundColor: mode.accentColor,
                    }
                  ]} 
                />
                <View style={styles.progressBarGlow} />
              </View>
            </Animated.View>
          )}
          
          {/* 模式描述 */}
          {phase === 'idle' && (
            <Animated.View style={[styles.modeDesc, pulseAnimatedStyle]}>
              <Text style={styles.modeDescText}>{mode.desc}</Text>
              <Text style={styles.modeSubDesc}>{mode.subDesc}</Text>
              <View style={styles.modePatternContainer}>
                <View style={[styles.patternDot, { backgroundColor: mode.accentColor }]} />
                <Text style={styles.modePattern}>
                  {mode.inhale}秒吸气 · {mode.hold > 0 ? `${mode.hold}秒屏息 · ` : ''}{mode.exhale}秒呼气
                  {mode.holdAfter ? ` · ${mode.holdAfter}秒屏息` : ''}
                </Text>
                <View style={[styles.patternDot, { backgroundColor: mode.accentColor }]} />
              </View>
            </Animated.View>
          )}
          
          {/* 完成提示 */}
          {phase === 'complete' && (
            <Animated.View entering={FadeInUp.duration(600)} style={styles.completeContainer}>
              <Text style={styles.completeMessage}>
                你完成了 {totalCycles} 个呼吸循环
              </Text>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardText}>+1 🧁</Text>
              </View>
            </Animated.View>
          )}
          
          {/* 控制按钮 */}
          <View style={styles.controls}>
            {phase === 'idle' ? (
              <TouchableOpacity
                onPress={startBreathing}
                onPressIn={() => buttonScale.value = withSpring(0.95)}
                onPressOut={() => buttonScale.value = withSpring(1)}
                activeOpacity={1}
              >
                <Animated.View style={[styles.startButton, buttonAnimatedStyle]}>
                  <LinearGradient
                    colors={[mode.accentColor, `${mode.accentColor}cc`]}
                    style={styles.startButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.startButtonHighlight} />
                    <Text style={styles.startButtonText}>开始练习</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            ) : phase === 'complete' ? (
              <View style={styles.completeButtons}>
                <TouchableOpacity
                  style={[styles.againButton, { borderColor: mode.accentColor }]}
                  onPress={restart}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.againButtonText, { color: mode.accentColor }]}>再来一次</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[mode.accentColor, `${mode.accentColor}cc`]}
                    style={styles.doneButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.doneButtonText}>完成</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopBreathing}
                activeOpacity={0.7}
              >
                <Text style={styles.stopButtonText}>停止</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  
  // 星空背景
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  
  // 浮动粒子
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
  },

  // 背景光晕
  backgroundGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 300,
  },
  glowCircle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.3,
  },
  
  // 返回按钮
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // 标题
  header: {
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
  },
  
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  
  // 模式选择
  modeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  modeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 85,
    overflow: 'hidden',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modeButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  modeIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  modeName: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  
  // 呼吸圆环
  breathContainer: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  ringDotSmall: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  breathGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowLayer1: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.3,
  },
  glowLayer2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.15,
  },
  breathCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 10,
  },
  breathCircleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassHighlight: {
    position: 'absolute',
    top: 10,
    left: '15%',
    right: '15%',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    opacity: 0.5,
  },
  breathInner: {
    alignItems: 'center',
  },
  phaseLabel: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 2,
  },
  countdown: {
    fontSize: 44,
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '200',
  },
  idleIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  idleText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  completeIcon: {
    fontSize: 40,
    marginBottom: 6,
  },
  completeText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.6)',
    fontWeight: '500',
  },
  
  // 进度
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '70%',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 10,
    letterSpacing: 1,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressBarGlow: {
    position: 'absolute',
    top: -2,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'transparent',
  },
  
  // 模式描述
  modeDesc: {
    marginTop: 20,
    alignItems: 'center',
  },
  modeDescText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  modeSubDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 10,
  },
  modePatternContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patternDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.6,
  },
  modePattern: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.5,
  },
  
  // 完成
  completeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  completeMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  rewardBadge: {
    backgroundColor: 'rgba(255, 229, 160, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 229, 160, 0.3)',
  },
  rewardText: {
    fontSize: 16,
    color: '#ffe5a0',
    fontWeight: '600',
  },
  
  // 控制按钮
  controls: {
    marginTop: 20,
    marginBottom: 10,
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  startButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    position: 'relative',
    overflow: 'hidden',
  },
  startButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  startButtonText: {
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '600',
    letterSpacing: 2,
  },
  stopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  stopButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  completeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  againButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  againButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  doneButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 20,
  },
  doneButtonText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '600',
  },
});
