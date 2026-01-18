import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreatureStore, MonsterType, MONSTER_TYPES } from '@/store/creatureStore';
import { colors } from '@/theme/colors';
import { matchMonster, MatchResult, OnboardingAnswers, getMatchScoreText } from '@/utils/monsterMatcher';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

// Onboarding数据
const ONBOARDING_DATA = [
  {
    type: 'welcome',
    title: '在这里，你不需要假装没事',
    subtitle: '让我们为你找一个专属的小伙伴',
    button: '开始'
  },
  {
    type: 'question',
    question: '你通常什么时候会想靠吃来缓解情绪？',
    key: 'triggerTiming',
    options: [
      { emoji: '🌙', text: '深夜，睡不着的时候', value: 'midnight' },
      { emoji: '🏠', text: '下班/放学回家后', value: 'afterWork' },
      { emoji: '😰', text: '压力很大的时候', value: 'stressed' },
      { emoji: '😶', text: '没什么特别原因，就是空虚', value: 'empty' }
    ]
  },
  {
    type: 'question',
    question: '那个瞬间，你更希望有人...',
    key: 'companionStyle',
    options: [
      { emoji: '🤫', text: '什么都不说，就安静陪着', value: 'silent' },
      { emoji: '💬', text: '跟我聊几句，转移注意力', value: 'chat' },
      { emoji: '🫂', text: '让我感觉被理解就好', value: 'understand' }
    ]
  },
  {
    type: 'question',
    question: '你希望你的小伙伴是什么性格？',
    key: 'preferredPersonality',
    options: [
      { emoji: '🧸', text: '软萌治愈，会撒娇', value: 'healing' },
      { emoji: '🌙', text: '安静内敛，话不多但很稳', value: 'quiet' },
      { emoji: '🖤', text: '有点丧丧的，但很懂我', value: 'empathy' }
    ]
  },
  {
    type: 'question',
    question: '面对情绪时，你通常...',
    key: 'emotionExpression',
    options: [
      { emoji: '🤐', text: '习惯压抑，不太表达出来', value: 'suppress' },
      { emoji: '💭', text: '想说但说不清楚', value: 'confused' },
      { emoji: '🗣️', text: '喜欢找人倾诉', value: 'express' },
      { emoji: '🏃', text: '倾向于逃避和转移注意力', value: 'avoid' }
    ]
  },
  {
    type: 'matching',
    title: 'AI 正在为你匹配最合适的小伙伴...'
  },
  {
    type: 'matchResult',
    title: '为你找到了...'
  },
  {
    type: 'name',
    question: '给你的小伙伴起个名字吧',
    placeholder: '糯糯'
  },
  {
    type: 'result',
    title: '遇见你的专属小伙伴'
  }
];

/**
 * Onboarding流程
 * 欢迎页 → 问题1-4 → AI匹配 → 匹配结果 → 起名字 → 首次见面
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { setMonster, completeOnboarding } = useCreatureStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [monsterName, setMonsterName] = useState('');
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechText, setSpeechText] = useState('');

  const scale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const monsterY = useSharedValue(500); // 怪兽从底部升起
  const monsterOpacity = useSharedValue(0);
  const bubbleOpacity = useSharedValue(0);
  const bubbleScale = useSharedValue(0.8);
  const cardScale = useSharedValue(0.3); // 卡片缩放动画
  const cardOpacity = useSharedValue(0); // 卡片透明度
  const loadingRotate = useSharedValue(0); // 加载动画

  // 浮动动画
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  // 加载旋转动画
  useEffect(() => {
    if (step === 5) {
      loadingRotate.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [step]);

  // 卡片出现动画
  useEffect(() => {
    if (step === 6 && matchResult) {
      // 先淡入，再放大
      cardOpacity.value = withTiming(1, { duration: 400 });
      cardScale.value = withSequence(
        withSpring(1.05, { damping: 10 }),
        withSpring(1, { damping: 12 })
      );
    }
  }, [step, matchResult]);
  
  const floatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 怪兽入场动画样式
  const monsterEntranceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: monsterY.value },
      { scale: scale.value },
    ],
    opacity: monsterOpacity.value,
  }));

  // 对话气泡动画样式
  const bubbleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bubbleOpacity.value,
    transform: [{ scale: bubbleScale.value }],
  }));

  // 加载动画样式
  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotate.value}deg` }],
  }));

  // 卡片出现样式（缩放 + 淡入）
  const cardAppearStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  // 打字机效果
  const [typingText, setTypingText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  
  const typeText = (text: string, onComplete?: () => void) => {
    setTypingText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
        onComplete?.();
      }
    }, 80); // 每个字符 80ms
    return interval;
  };
  
  // 统一的 useEffect，在 step === 8 时执行（最终见面页）
  useEffect(() => {
    if (step === 8 && matchResult) {
      const finalName = answers.name;

      // 怪兽从底部升起动画
      monsterOpacity.value = withTiming(1, { duration: 500 });
      monsterY.value = withSequence(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.cubic) }),
        withSpring(-10, { damping: 8 }), // 轻微弹跳
        withSpring(0, { damping: 10 })
      );

      // 缩放动画
      scale.value = withDelay(1500, withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 10 })
      ));

      // 2秒后显示对话气泡并开始打字机效果（使用个性化开场白）
      const bubbleTimer = setTimeout(() => {
        setShowSpeechBubble(true);
        bubbleOpacity.value = withTiming(1, { duration: 400 });
        bubbleScale.value = withSpring(1, { damping: 12 });

        // 打字机效果：使用 AI 生成的开场白
        const typingInterval = typeText(matchResult.greeting, () => {
          // 第一句话完成后，过1秒显示第二句
          setTimeout(() => {
            setIsTypingComplete(false);
            typeText('以后，我陪你。');
          }, 1000);
        });

        return () => clearInterval(typingInterval);
      }, 2000);

      // 6秒后自动进入主页
      const timer = setTimeout(() => {
        setMonster(matchResult.monsterType, finalName, {
          score: matchResult.matchScore,
          reason: matchResult.matchReason,
          traits: matchResult.traits,
        });
        completeOnboarding();
        router.replace('/');
      }, 6000);

      return () => {
        clearTimeout(timer);
        clearTimeout(bubbleTimer);
      };
    }
  }, [step, matchResult, answers, scale, setMonster, completeOnboarding, router]);

  // 处理选择
  const handleSelect = (value: string, key?: string) => {
    if (key) {
      setAnswers({ ...answers, [key]: value });
    }

    // 如果是第4个问题（step 4），触发 AI 匹配
    if (step === 4) {
      const updatedAnswers = { ...answers, [key!]: value };
      setStep(5); // 进入匹配页

      // 2.5秒后执行 AI 匹配
      setTimeout(() => {
        const result = matchMonster(updatedAnswers as OnboardingAnswers);
        setMatchResult(result);
        setStep(6); // 显示匹配结果
      }, 2500);
    } else {
      setStep(prev => prev + 1);
    }
  };

  // 处理起名
  const handleNameSubmit = () => {
    if (!matchResult) return;

    const finalName = monsterName.trim() || MONSTER_TYPES[matchResult.monsterType].defaultName;
    setAnswers({ ...answers, name: finalName });
    setStep(8); // 进入最终见面页
  };

  // 完成Onboarding
  const finishOnboarding = () => {
    if (!matchResult) return;

    const finalName = answers.name;
    setMonster(matchResult.monsterType, finalName, {
      score: matchResult.matchScore,
      reason: matchResult.matchReason,
      traits: matchResult.traits,
    });
    completeOnboarding();
    router.replace('/');
  };

  const currentStep = ONBOARDING_DATA[step];

  // 欢迎页
  if (currentStep.type === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* 装饰 */}
          <Text style={styles.sparkle1}>✨</Text>
          <Text style={styles.sparkle2}>✨</Text>
          <Text style={styles.sparkle3}>·</Text>
          
          <Animated.View style={floatAnimatedStyle}>
            <Text style={styles.welcomeEmoji}>🐾</Text>
          </Animated.View>
          
          <Text style={styles.welcomeTitle}>{currentStep.title}</Text>
          <Text style={styles.welcomeSubtitle}>{currentStep.subtitle}</Text>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setStep(1)}
          >
            <Text style={styles.primaryButtonText}>{currentStep.button}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 问题页
  if (currentStep.type === 'question') {
    const questionNumber = step;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionNumber}>问题 {questionNumber}/4</Text>
            <Text style={styles.questionTitle}>{currentStep.question}</Text>

            <View style={styles.optionsContainer}>
              {currentStep.options?.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.optionButton}
                  onPress={() => handleSelect(option.value, currentStep.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={styles.optionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // AI 匹配加载页
  if (currentStep.type === 'matching') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.matchingContent}>
          {/* 装饰星星 */}
          <Text style={styles.matchingSparkle1}>✨</Text>
          <Text style={styles.matchingSparkle2}>·</Text>
          <Text style={styles.matchingSparkle3}>✨</Text>

          {/* 旋转加载动画 */}
          <Animated.View style={[styles.matchingLoader, loadingAnimatedStyle]}>
            <View style={styles.matchingLoaderRing1} />
            <View style={styles.matchingLoaderRing2} />
            <View style={styles.matchingLoaderRing3} />
          </Animated.View>

          {/* 文案 */}
          <Text style={styles.matchingTitle}>正在为你寻找...</Text>
          <Text style={styles.matchingSubtitle}>最懂你的那个小伙伴</Text>

          {/* 点点点动画 */}
          <View style={styles.matchingDots}>
            <Text style={styles.matchingDot}>·</Text>
            <Text style={styles.matchingDot}>·</Text>
            <Text style={styles.matchingDot}>·</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 匹配结果展示页
  if (currentStep.type === 'matchResult' && matchResult) {
    const monsterConfig = MONSTER_TYPES[matchResult.monsterType];

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.matchResultScrollContent}>
          <View style={styles.matchResultContent}>
            {/* 装饰 */}
            <Text style={styles.matchResultSparkle1}>✨</Text>
            <Text style={styles.matchResultSparkle2}>·</Text>

            {/* 顶部文案 */}
            <Text style={styles.matchResultTitle}>{currentStep.title}</Text>

            {/* 怪兽卡片 */}
            <Animated.View style={[styles.matchResultCard, cardAppearStyle]}>
              {/* 怪兽头像 */}
              <View style={[styles.matchResultMonsterCircle, { backgroundColor: monsterConfig.color }]}>
                <Image
                  source={monsterConfig.index === 1
                    ? require('../assets/monster1.jpg')
                    : require('../assets/monster2.jpg')
                  }
                  style={styles.matchResultMonsterImage}
                  resizeMode="cover"
                />
              </View>

              {/* 怪兽信息 */}
              <View style={styles.matchResultInfo}>
                <Text style={styles.matchResultMonsterEmoji}>{monsterConfig.emoji}</Text>
                <Text style={styles.matchResultMonsterName}>{monsterConfig.defaultName}</Text>
                <View style={[styles.matchResultScoreBadge, { backgroundColor: `${monsterConfig.color}20`, borderColor: monsterConfig.color }]}>
                  <Text style={[styles.matchResultScoreText, { color: monsterConfig.color }]}>
                    {getMatchScoreText(matchResult.matchScore)} {matchResult.matchScore}%
                  </Text>
                </View>
              </View>

              {/* 匹配理由 */}
              <View style={styles.matchResultReasonBox}>
                <Text style={styles.matchResultReasonLabel}>为什么选Ta</Text>
                <Text style={styles.matchResultReasonText}>{matchResult.matchReason}</Text>
              </View>

              {/* 特质标签 */}
              <View style={styles.matchResultTraits}>
                <Text style={styles.matchResultTraitsLabel}>Ta 的特质</Text>
                <View style={styles.matchResultTraitsList}>
                  {matchResult.traits.map((trait, idx) => (
                    <View
                      key={idx}
                      style={[styles.matchResultTraitTag, { backgroundColor: `${monsterConfig.color}15`, borderColor: `${monsterConfig.color}40` }]}
                    >
                      <Text style={[styles.matchResultTraitText, { color: monsterConfig.color }]}>
                        {trait}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* 继续按钮 */}
            <TouchableOpacity
              style={[styles.matchResultContinueButton, { backgroundColor: monsterConfig.color }]}
              onPress={() => setStep(7)}
              activeOpacity={0.8}
            >
              <Text style={styles.matchResultContinueText}>就是Ta了！</Text>
            </TouchableOpacity>

            {/* 提示 */}
            <Text style={styles.matchResultHint}>点击继续为Ta起个名字</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 起名字 - 重新设计的梦幻界面
  if (currentStep.type === 'name') {
    if (!matchResult) return null;
    const monsterConfig = MONSTER_TYPES[matchResult.monsterType];
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.nameContent}>
          {/* 装饰星星 */}
          <Text style={styles.nameSparkle1}>✨</Text>
          <Text style={styles.nameSparkle2}>·</Text>
          <Text style={styles.nameSparkle3}>✨</Text>
          <Text style={styles.nameSparkle4}>·</Text>
          
          {/* 顶部光晕装饰 */}
          <Animated.View style={[styles.nameGlowTop, floatAnimatedStyle]}>
            <View style={[styles.nameGlowCircle, { backgroundColor: monsterConfig.color }]} />
          </Animated.View>
          
          {/* 标题区域 */}
          <View style={styles.nameTitleSection}>
            <Text style={styles.nameLabel}>最后一步</Text>
            <Text style={styles.nameTitle}>{currentStep.question}</Text>
            <Text style={styles.nameSubtitle}>给ta一个专属的称呼吧</Text>
          </View>
          
          {/* 输入卡片 */}
          <View style={styles.nameInputCard}>
            {/* 卡片顶部装饰 */}
            <View style={styles.nameCardDecoration}>
              <View style={[styles.nameCardDot, { backgroundColor: colors.accent.pink }]} />
              <View style={[styles.nameCardDot, { backgroundColor: colors.accent.yellow }]} />
              <View style={[styles.nameCardDot, { backgroundColor: colors.accent.blue }]} />
            </View>
            
            {/* 输入框 */}
            <View style={styles.nameInputWrapper}>
              <TextInput
                style={styles.nameInput}
                value={monsterName}
                onChangeText={setMonsterName}
                placeholder={monsterConfig.defaultName}
                placeholderTextColor={colors.textMuted}
                maxLength={10}
                autoFocus
              />
              <View style={[styles.nameInputUnderline, { backgroundColor: monsterConfig.color }]} />
            </View>
            
            {/* 提示文字 */}
            <Text style={styles.nameCharCount}>{monsterName.length}/10</Text>
          </View>
          
          {/* 性格预览标签 */}
          <View style={[styles.personalityTag, { backgroundColor: `${monsterConfig.color}30`, borderColor: monsterConfig.color }]}>
            <Text style={[styles.personalityTagText, { color: monsterConfig.color }]}>
              {monsterConfig.personality}
            </Text>
          </View>
          
          {/* 提示 */}
          <Text style={styles.nameHint}>💡 之后也可以改哦</Text>
          
          {/* 确定按钮 */}
          <TouchableOpacity
            style={[styles.nameConfirmButton, { backgroundColor: monsterConfig.color }]}
            onPress={handleNameSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.nameConfirmText}>就叫这个名字</Text>
          </TouchableOpacity>
          
          {/* 跳过按钮 */}
          <TouchableOpacity
            style={styles.nameSkipButton}
            onPress={() => {
              setMonsterName('');
              handleNameSubmit();
            }}
          >
            <Text style={styles.nameSkipText}>用默认名字「{monsterConfig.defaultName}」</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 匹配结果 - 怪兽出场动画
  if (currentStep.type === 'result' && matchResult) {
    const finalName = answers.name;
    const monsterConfig = MONSTER_TYPES[matchResult.monsterType];

    const personalityMap = {
      healing: '软萌治愈型',
      quiet: '安静陪伴型',
      empathy: '共情理解型',
    };
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContent}>
          {/* 装饰粒子 */}
          <Text style={styles.particle1}>✨</Text>
          <Text style={styles.particle2}>·</Text>
          <Text style={styles.particle3}>✨</Text>
          <Text style={styles.particle4}>·</Text>
          
          {/* 对话气泡 */}
          {showSpeechBubble && (
            <Animated.View style={[styles.entranceBubble, bubbleAnimatedStyle]}>
              <Text style={styles.entranceBubbleText}>「{typingText || '...'}」</Text>
            </Animated.View>
          )}
          
          {/* 怪兽从底部升起 */}
          <Animated.View style={[styles.monsterEntrance, monsterEntranceStyle]}>
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
          
          {/* 怪兽名字 */}
          <Text style={styles.resultName}>{finalName}</Text>
          <Text style={styles.resultPersonality}>{personalityMap[matchResult.monsterType]}</Text>
          
          {/* 点击进入按钮 */}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: monsterConfig.color }]}
            onPress={finishOnboarding}
          >
            <Text style={styles.startButtonText}>一起开始</Text>
          </TouchableOpacity>
          
          <Text style={styles.skipHint}>点击任意位置或等待自动进入</Text>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGradient[0],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  
  // 装饰
  sparkle1: {
    position: 'absolute',
    top: 80,
    left: 40,
    fontSize: 20,
    opacity: 0.5,
  },
  sparkle2: {
    position: 'absolute',
    top: 120,
    right: 60,
    fontSize: 14,
    opacity: 0.4,
  },
  sparkle3: {
    position: 'absolute',
    bottom: 150,
    left: 50,
    fontSize: 16,
    opacity: 0.3,
  },
  
  // 欢迎页
  welcomeEmoji: {
    fontSize: 80,
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 60,
  },
  primaryButton: {
    backgroundColor: colors.accent.blue,
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  
  // 问题页
  questionContainer: {
    padding: 32,
    paddingTop: 80,
  },
  questionNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 40,
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  
  // 起名页 - 重新设计
  nameContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  nameSparkle1: {
    position: 'absolute',
    top: 80,
    left: 30,
    fontSize: 18,
    opacity: 0.5,
  },
  nameSparkle2: {
    position: 'absolute',
    top: 120,
    right: 40,
    fontSize: 24,
    opacity: 0.3,
  },
  nameSparkle3: {
    position: 'absolute',
    bottom: 180,
    left: 50,
    fontSize: 14,
    opacity: 0.4,
  },
  nameSparkle4: {
    position: 'absolute',
    bottom: 220,
    right: 60,
    fontSize: 20,
    opacity: 0.3,
  },
  nameGlowTop: {
    position: 'absolute',
    top: 60,
  },
  nameGlowCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.15,
  },
  nameTitleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  nameLabel: {
    fontSize: 13,
    color: colors.accent.purple,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 12,
  },
  nameTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  nameSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  nameInputCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 28,
    paddingTop: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 20,
  },
  nameCardDecoration: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  nameCardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.6,
  },
  nameInputWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  nameInput: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  nameInputUnderline: {
    width: 120,
    height: 3,
    borderRadius: 2,
    marginTop: 4,
  },
  nameCharCount: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 16,
  },
  personalityTag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  personalityTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  nameHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 32,
  },
  nameConfirmButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  nameConfirmText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  nameSkipButton: {
    paddingVertical: 12,
  },
  nameSkipText: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  
  // 结果页
  resultSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  resultMonster: {
    marginBottom: 24,
  },
  resultMonsterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  resultMonsterEmoji: {
    fontSize: 70,
  },
  
  // 新的结果页样式
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  particle1: {
    position: 'absolute',
    top: 100,
    left: 40,
    fontSize: 20,
    opacity: 0.6,
  },
  particle2: {
    position: 'absolute',
    top: 150,
    right: 50,
    fontSize: 28,
    opacity: 0.4,
  },
  particle3: {
    position: 'absolute',
    bottom: 200,
    left: 60,
    fontSize: 16,
    opacity: 0.5,
  },
  particle4: {
    position: 'absolute',
    bottom: 250,
    right: 40,
    fontSize: 24,
    opacity: 0.3,
  },
  entranceBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 16,
    marginBottom: 30,
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  entranceBubbleText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 26,
  },
  monsterEntrance: {
    marginBottom: 24,
  },
  monsterCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
    overflow: 'hidden',
  },
  monsterImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  skipHint: {
    marginTop: 20,
    fontSize: 12,
    color: colors.textMuted,
  },
  
  resultName: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  resultPersonality: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  resultSpeechBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 40,
  },
  resultSpeechText: {
    fontSize: 15,
    color: colors.text,
  },
  startButton: {
    backgroundColor: colors.accent.yellow,
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: colors.accent.yellow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  startButtonText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },

  // AI 匹配加载页样式
  matchingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  matchingSparkle1: {
    position: 'absolute',
    top: 100,
    left: 40,
    fontSize: 24,
    opacity: 0.6,
  },
  matchingSparkle2: {
    position: 'absolute',
    top: 150,
    right: 50,
    fontSize: 30,
    opacity: 0.4,
  },
  matchingSparkle3: {
    position: 'absolute',
    bottom: 200,
    left: 60,
    fontSize: 20,
    opacity: 0.5,
  },
  matchingLoader: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  matchingLoaderRing1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: colors.accent.pink,
    opacity: 0.3,
  },
  matchingLoaderRing2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.accent.blue,
    opacity: 0.4,
  },
  matchingLoaderRing3: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.accent.purple,
    opacity: 0.5,
  },
  matchingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  matchingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  matchingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  matchingDot: {
    fontSize: 24,
    color: colors.accent.purple,
    opacity: 0.6,
  },

  // 匹配结果页样式
  matchResultScrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  matchResultContent: {
    flex: 1,
    alignItems: 'center',
    padding: 32,
    paddingTop: 60,
  },
  matchResultSparkle1: {
    position: 'absolute',
    top: 30,
    left: 30,
    fontSize: 20,
    opacity: 0.5,
  },
  matchResultSparkle2: {
    position: 'absolute',
    top: 50,
    right: 40,
    fontSize: 16,
    opacity: 0.4,
  },
  matchResultTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 32,
    textAlign: 'center',
  },
  matchResultCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: colors.radius.lg,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 28,
  },
  matchResultMonsterCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  matchResultMonsterImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  matchResultInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  matchResultMonsterEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  matchResultMonsterName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  matchResultScoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  matchResultScoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  matchResultReasonBox: {
    width: '100%',
    backgroundColor: colors.backgroundGradient[0],
    borderRadius: colors.radius.md,
    padding: 20,
    marginBottom: 20,
  },
  matchResultReasonLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
  matchResultReasonText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  matchResultTraits: {
    width: '100%',
  },
  matchResultTraitsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 1,
  },
  matchResultTraitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  matchResultTraitTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  matchResultTraitText: {
    fontSize: 13,
    fontWeight: '500',
  },
  matchResultContinueButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 12,
  },
  matchResultContinueText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  matchResultHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
