import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCreatureStore, MonsterType, MONSTER_TYPES } from '@/store/creatureStore';
import { colors } from '@/theme/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withRepeat,
  withTiming,
  Easing,
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
    options: [
      { emoji: '🌙', text: '深夜，睡不着的时候' },
      { emoji: '🏠', text: '下班/放学回家后' },
      { emoji: '😰', text: '压力很大的时候' },
      { emoji: '😶', text: '没什么特别原因，就是空虚' }
    ]
  },
  {
    type: 'question',
    question: '那个瞬间，你更希望有人...',
    options: [
      { emoji: '🤫', text: '什么都不说，就安静陪着' },
      { emoji: '💬', text: '跟我聊几句，转移注意力' },
      { emoji: '🫂', text: '让我感觉被理解就好' }
    ]
  },
  {
    type: 'question',
    question: '你希望你的小伙伴是什么性格？',
    options: [
      { emoji: '🧸', text: '软萌治愈，会撒娇', value: 'healing' as MonsterType },
      { emoji: '🌙', text: '安静内敛，话不多但很稳', value: 'quiet' as MonsterType },
      { emoji: '🖤', text: '有点丧丧的，但很懂我', value: 'empathy' as MonsterType }
    ]
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
 * 欢迎页 → 问题1-3 → 起名字 → 匹配结果
 */
export default function OnboardingScreen() {
  const router = useRouter();
  const { setMonster, completeOnboarding } = useCreatureStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [monsterName, setMonsterName] = useState('');
  
  const scale = useSharedValue(1);
  const floatY = useSharedValue(0);
  
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
  
  const floatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // 统一的 useEffect，在 step === 5 时执行
  useEffect(() => {
    if (step === 5) {
      // 动画
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      
      // 3秒后自动进入主页
      const timer = setTimeout(() => {
        const selectedType = answers.monsterType as MonsterType;
        const finalName = answers.name;
        setMonster(selectedType, finalName);
        completeOnboarding();
        router.replace('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [step, answers, scale, setMonster, completeOnboarding, router]);

  // 处理选择
  const handleSelect = (value?: MonsterType) => {
    if (step === 3 && value) {
      setAnswers({ ...answers, monsterType: value });
    }
    setStep(prev => prev + 1);
  };

  // 处理起名
  const handleNameSubmit = () => {
    const selectedType = answers.monsterType as MonsterType;
    const monsterConfig = MONSTER_TYPES[selectedType];
    const finalName = monsterName.trim() || monsterConfig.defaultName;
    setAnswers({ ...answers, name: finalName });
    setStep(5);
  };

  // 完成Onboarding
  const finishOnboarding = () => {
    const selectedType = answers.monsterType as MonsterType;
    const finalName = answers.name;
    setMonster(selectedType, finalName);
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
            <Text style={styles.questionNumber}>问题 {questionNumber}/3</Text>
            <Text style={styles.questionTitle}>{currentStep.question}</Text>
            
            <View style={styles.optionsContainer}>
              {currentStep.options?.map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.optionButton}
                  onPress={() => handleSelect(option.value)}
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

  // 起名字
  if (currentStep.type === 'name') {
    const selectedType = answers.monsterType as MonsterType;
    const monsterConfig = MONSTER_TYPES[selectedType];
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.nameTitle}>{currentStep.question}</Text>
          
          <Animated.View style={[styles.monsterPreview, floatAnimatedStyle]}>
            <View style={[styles.monsterCircle, { backgroundColor: monsterConfig.color }]}>
              <Text style={styles.monsterEmoji}>{monsterConfig.emoji}</Text>
            </View>
          </Animated.View>
          
          <TextInput
            style={styles.nameInput}
            value={monsterName}
            onChangeText={setMonsterName}
            placeholder={currentStep.placeholder}
            placeholderTextColor={colors.textMuted}
            maxLength={10}
          />
          
          <Text style={styles.nameHint}>之后也可以改哦</Text>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNameSubmit}
          >
            <Text style={styles.primaryButtonText}>确定</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 匹配结果
  if (currentStep.type === 'result') {
    const selectedType = answers.monsterType as MonsterType;
    const finalName = answers.name;
    const monsterConfig = MONSTER_TYPES[selectedType];
    
    const personalityMap = {
      healing: '软萌治愈型',
      quiet: '安静陪伴型',
      empathy: '共情理解型',
    };
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.resultSubtitle}>{currentStep.title}</Text>
          
          <Animated.View style={[styles.resultMonster, scaleAnimatedStyle, floatAnimatedStyle]}>
            <View style={[styles.resultMonsterCircle, { backgroundColor: monsterConfig.color }]}>
              <Text style={styles.resultMonsterEmoji}>{monsterConfig.emoji}</Text>
            </View>
          </Animated.View>
          
          <Text style={styles.resultName}>{finalName}</Text>
          <Text style={styles.resultPersonality}>{personalityMap[selectedType]}</Text>
          
          <View style={styles.resultSpeechBubble}>
            <Text style={styles.resultSpeechText}>💬 "你好呀，以后我陪你。"</Text>
          </View>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={finishOnboarding}
          >
            <Text style={styles.startButtonText}>一起开始</Text>
          </TouchableOpacity>
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
  
  // 起名页
  nameTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  monsterPreview: {
    marginBottom: 40,
  },
  monsterCircle: {
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
  monsterEmoji: {
    fontSize: 60,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    width: 200,
    marginBottom: 16,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  nameHint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 40,
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
});
