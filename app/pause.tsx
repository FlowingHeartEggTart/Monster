import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Modal, Dimensions, Image, TextInput, ActivityIndicator, Platform } from 'react-native';
import { usePauseStore } from '@/store/pauseStore';
import { useCreatureStore, MONSTER_TYPES } from '@/store/creatureStore';
import { colors } from '@/theme/colors';
import { TopBar } from '@/components/shared/TopBar';
import { useRouter } from 'expo-router';
import { initIntervention, chatWithMonster, DialogueItem, VisualEffect, TEST_USER_ID } from '@/services/api';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// SOS选项类型
type SOSOptionType = 'empathy' | 'serious' | 'company' | 'distract' | 'goal';

// SOS选项配置
const SOS_OPTIONS = {
  gentle: [
    { type: 'empathy' as SOSOptionType, emoji: '💝', text: '帮我理解现在的感觉' },
    { type: 'company' as SOSOptionType, emoji: '🤝', text: '有人安静地陪着我' },
    { type: 'distract' as SOSOptionType, emoji: '🎯', text: '做点别的分散注意力' },
    { type: 'goal' as SOSOptionType, emoji: '🌱', text: '提醒我当初的目标' },
  ],
  strict: [
    { type: 'empathy' as SOSOptionType, emoji: '💝', text: '帮我理解现在的感觉' },
    { type: 'serious' as SOSOptionType, emoji: '⚠️', text: '清醒一下，想想后果' },
    { type: 'distract' as SOSOptionType, emoji: '🎯', text: '做点别的分散注意力' },
    { type: 'goal' as SOSOptionType, emoji: '💪', text: '提醒我当初的目标' },
  ],
};

// 视觉特效配置
const VISUAL_EFFECTS: Record<string, { overlay: string; label: string }> = {
  fat_growth: { overlay: 'rgba(255, 200, 100, 0.4)', label: '脂肪正在堆积...' },
  brain_fog: { overlay: 'rgba(150, 150, 180, 0.5)', label: '思维变得模糊...' },
  social_hide: { overlay: 'rgba(30, 30, 30, 0.6)', label: '世界变得灰暗...' },
  heavy_body: { overlay: 'rgba(80, 60, 40, 0.4)', label: '身体变得沉重...' },
  insomnia: { overlay: 'rgba(100, 50, 80, 0.4)', label: '焦虑正在蔓延...' },
};

// 待机状态的问候语（根据时间）
const getIdleGreeting = (name: string): string => {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    const nightGreetings = [
      '夜深了，还好吗？',
      '睡不着的话，我在。',
      '深夜的冲动，让我陪你度过。',
    ];
    return nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
  } else if (hour >= 6 && hour < 12) {
    const morningGreetings = [
      '早安，新的一天！',
      '今天也要照顾好自己哦。',
      '早起的你，真棒！',
    ];
    return morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
  } else if (hour >= 12 && hour < 18) {
    const afternoonGreetings = [
      '下午好呀～',
      '午后时光，需要陪伴吗？',
      '我在这里，随时找我。',
    ];
    return afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
  } else {
    const eveningGreetings = [
      '晚上好，辛苦了一天。',
      '傍晚了，今天还好吗？',
      '晚饭时间，要小心哦。',
    ];
    return eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
  }
};

// SOS开场白（根据时间段）
const getOpeningDialogue = (name: string): string[] => {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 6) {
    return [
      `${name}探出脑袋...`,
      '这么晚了，是睡不着吗？',
      '还是...又想吃点什么了？',
    ];
  } else if (hour >= 6 && hour < 12) {
    return [
      `${name}睁开眼睛...`,
      '早安。',
      '今天从想吃东西开始吗？',
    ];
  } else if (hour >= 12 && hour < 18) {
    return [
      `${name}转过身来...`,
      '下午了。',
      '我猜，你是来找我聊聊的？',
    ];
  } else {
    return [
      `${name}抬起头...`,
      '晚上好。',
      '今天辛苦了。想吃点什么吗？',
    ];
  }
};

// SOS选项对应的对话分支
const SOS_DIALOGUE_BRANCHES: Record<SOSOptionType, string[]> = {
  empathy: [
    '我能感受到你现在的感觉...',
    '当那种冲动来的时候，真的很难受对吧。',
    '不需要解释什么。我在这里。',
    '让我们一起，慢慢呼吸几下。',
  ],
  serious: [
    '好。让我们冷静地想一想。',
    '如果现在吃下去，5分钟后你会怎么想？',
    '1小时后呢？明天早上呢？',
    '你还记得上次的感觉吗？',
  ],
  company: [
    '...',
    '我在这里。',
    '不说话也没关系。',
    '我们就这样待一会儿。',
  ],
  distract: [
    '好！让我们做点别的。',
    '试试看，找一找你身边有什么蓝色的东西？',
    '找到了吗？',
    '很好。现在找找红色的。',
  ],
  goal: [
    '你还记得当初为什么想要改变吗？',
    '那个让你开始的理由...',
    '是为了健康？还是为了某个人？',
    '那个理由，现在还重要吗？',
  ],
};

// 等待环节的安慰语
const WAITING_PHRASES = [
  '就这样，不需要做什么...',
  '你已经很棒了，能来找我。',
  '时间会帮忙的。',
  '继续呼吸，我在。',
  '快过去了。',
];

// 备用对话脚本（网络失败时使用）
const FALLBACK_SCRIPT = [
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

// 兼容旧格式
const CHAT_SCRIPT = FALLBACK_SCRIPT;

/**
 * SOS页面 - 情绪缓冲
 * 待机状态 → 对话模式 → 结算动画 → 守护卡片
 */
export default function PausePage() {
  const router = useRouter();
  const { activatePause, reset } = usePauseStore();
  const { monsterType, monsterName, incrementSOSSuccess, sosSuccessCount, addCake } = useCreatureStore();
  
  // 状态管理
  const [mode, setMode] = useState<'idle' | 'chatting' | 'options' | 'waiting' | 'ending' | 'card'>('idle');
  const [chatMessages, setChatMessages] = useState<typeof CHAT_SCRIPT>([]);
  const [chatStep, setChatStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<SOSOptionType | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [waitingProgress, setWaitingProgress] = useState(0);
  const [monsterAnimState, setMonsterAnimState] = useState<'idle' | 'listening' | 'empathy' | 'serious' | 'company'>('idle');
  
  // API 相关状态
  const [isLoading, setIsLoading] = useState(false);
  const [useApiMode, setUseApiMode] = useState(true);
  const [dialogueQueue, setDialogueQueue] = useState<DialogueItem[]>([]);
  const [currentVisualEffect, setCurrentVisualEffect] = useState<VisualEffect>(null);
  const [userInput, setUserInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
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
  
  // 打字机效果
  const typeText = useCallback(async (text: string, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      setIsTyping(true);
      setTypingText('');
      const chars = text.split('');
      const interval = duration / chars.length;
      let index = 0;
      
      const timer = setInterval(() => {
        if (index < chars.length) {
          setTypingText(prev => prev + chars[index]);
          index++;
        } else {
          clearInterval(timer);
          setIsTyping(false);
          resolve();
        }
      }, interval);
    });
  }, []);
  
  // 播放对话队列
  const playDialogueQueue = useCallback(async (queue: DialogueItem[]) => {
    for (const item of queue) {
      // 设置视觉特效
      if (item.visual_effect) {
        setCurrentVisualEffect(item.visual_effect);
      }
      
      // 打字机效果
      await typeText(item.content, item.displayDuration);
      
      // 添加到消息列表
      setChatMessages(prev => [...prev, { from: 'monster', text: item.content }]);
      setTypingText('');
      
      // 滚动到底部
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // 等待
      await new Promise(resolve => setTimeout(resolve, item.waitDuration));
      
      // 清除视觉特效
      if (item.visual_effect) {
        setCurrentVisualEffect(null);
      }
    }
  }, [typeText]);
  
  // 开始对话 (API 模式)
  const startSOSWithApi = async () => {
    setMode('chatting');
    setChatMessages([]);
    setChatStep(0);
    setIsLoading(true);
    activatePause();
    
    try {
      const dialogues = await initIntervention(TEST_USER_ID);
      setIsLoading(false);
      
      if (dialogues && dialogues.length > 0) {
        await playDialogueQueue(dialogues);
        // 剧本播放完毕，显示输入框
        setShowInput(true);
      } else {
        // API 失败，回退到本地脚本
        setUseApiMode(false);
        startSOSLocal();
      }
    } catch (error) {
      console.error('API 调用失败:', error);
      setIsLoading(false);
      setUseApiMode(false);
      startSOSLocal();
    }
  };
  
  // 开始对话 (本地模式)
  const startSOSLocal = async () => {
    setMode('chatting');
    setChatMessages([]);
    setChatStep(0);
    setSelectedOption(null);
    setShowOptions(false);
    activatePause();
    
    // 播放开场白
    const openingLines = getOpeningDialogue(monsterName || '小怪兽');
    
    for (let i = 0; i < openingLines.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 500 : 1200));
      setChatMessages(prev => [...prev, { from: 'monster', text: openingLines[i] }]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    
    // 开场白播放完后显示选项
    await new Promise(resolve => setTimeout(resolve, 1500));
    setShowOptions(true);
  };
  
  // 开始对话入口
  const startSOS = () => {
    setMonsterAnimState('listening');
    if (useApiMode) {
      startSOSWithApi();
    } else {
      startSOSLocal();
    }
  };
  
  // 选择SOS选项
  const handleSelectOption = async (option: SOSOptionType) => {
    setSelectedOption(option);
    setShowOptions(false);
    
    // 根据选项切换怪兽状态
    switch (option) {
      case 'empathy':
        setMonsterAnimState('empathy');
        break;
      case 'serious':
        setMonsterAnimState('serious');
        break;
      case 'company':
        setMonsterAnimState('company');
        break;
      default:
        setMonsterAnimState('listening');
    }
    
    // 播放对应分支的对话
    const branchDialogues = SOS_DIALOGUE_BRANCHES[option];
    for (let i = 0; i < branchDialogues.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 800 : 1500));
      setChatMessages(prev => [...prev, { from: 'monster', text: branchDialogues[i] }]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    
    // 对话完成后进入等待环节
    await new Promise(resolve => setTimeout(resolve, 2000));
    setMode('waiting');
    startWaitingPhase();
  };
  
  // 等待环节（60-90秒陪伴）
  const startWaitingPhase = () => {
    setChatMessages(prev => [...prev, { from: 'monster', text: '我们就一起待一会儿，好吗？' }]);
    
    let progress = 0;
    let phraseIndex = 0;
    
    const timer = setInterval(async () => {
      progress += 1;
      setWaitingProgress(progress);
      
      // 每隔一段时间显示安慰语
      if (progress > 0 && progress % 15 === 0 && phraseIndex < WAITING_PHRASES.length) {
        setChatMessages(prev => [...prev, { from: 'monster', text: WAITING_PHRASES[phraseIndex] }]);
        phraseIndex++;
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      
      if (progress >= 60) { // 60秒后可以结束
        clearInterval(timer);
        showEndingOptions();
      }
    }, 1000);
  };
  
  // 显示结算选项
  const showEndingOptions = () => {
    setChatMessages(prev => [...prev, { 
      from: 'monster', 
      text: '你刚刚为自己争取了一点时间。\n接下来，你更想——',
      isEnding: true 
    }]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };
  
  // 发送用户消息 (API 模式)
  const sendUserMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const message = userInput.trim();
    setUserInput('');
    setShowInput(false);
    
    // 添加用户消息
    setChatMessages(prev => [...prev, { from: 'user', text: message }]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    setIsLoading(true);
    
    try {
      const dialogues = await chatWithMonster(message, TEST_USER_ID);
      setIsLoading(false);
      
      if (dialogues && dialogues.length > 0) {
        await playDialogueQueue(dialogues);
        // 继续显示输入框
        setShowInput(true);
      }
    } catch (error) {
      console.error('对话失败:', error);
      setIsLoading(false);
      setShowInput(true);
    }
  };
  
  // 继续对话 (本地模式)
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
        {/* 视觉特效覆盖层 */}
        {currentVisualEffect && VISUAL_EFFECTS[currentVisualEffect] && (
          <View style={[styles.visualEffectOverlay, { backgroundColor: VISUAL_EFFECTS[currentVisualEffect].overlay }]}>
            <Text style={styles.visualEffectText}>{VISUAL_EFFECTS[currentVisualEffect].label}</Text>
          </View>
        )}
        
        {/* 顶部栏 */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => { setMode('idle'); setShowInput(false); }} style={styles.backButton}>
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.chatHeaderTitle}>与{monsterName}对话中</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        
        {/* 小怪兽头像 */}
        <View style={styles.chatMonsterContainer}>
          <View style={[styles.chatMonster, { backgroundColor: monsterConfig.color }]}>
            <Image 
              source={monsterConfig.index === 1 
                ? require('../assets/monster1.jpg')
                : require('../assets/monster2.jpg')
              } 
              style={styles.chatMonsterImage}
              resizeMode="cover"
            />
          </View>
          {monsterAnimState !== 'idle' && (
            <Text style={styles.monsterStateLabel}>
              {monsterAnimState === 'listening' ? '👂 在听你说...' : 
               monsterAnimState === 'empathy' ? '💝 理解你的感受' : 
               monsterAnimState === 'serious' ? '⚠️ 认真地看着你' : 
               monsterAnimState === 'company' ? '🤝 安静地陪着你' : ''}
            </Text>
          )}
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
          
          {/* 打字机效果 - 正在输入的文字 */}
          {isTyping && typingText && (
            <View style={[styles.messageBubbleContainer, styles.monsterMessage]}>
              <View style={[styles.messageBubble, styles.monsterBubble]}>
                <Text style={styles.messageText}>{typingText}<Text style={styles.typingCursor}>|</Text></Text>
              </View>
            </View>
          )}
          
          {/* 加载中 */}
          {isLoading && (
            <View style={[styles.messageBubbleContainer, styles.monsterMessage]}>
              <View style={[styles.messageBubble, styles.monsterBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color={colors.accent.purple} />
                <Text style={styles.loadingText}>{monsterName}正在思考...</Text>
              </View>
            </View>
          )}
          
          {/* 结束选项 (本地模式) */}
          {!useApiMode && hasEnding && (
            <View style={styles.endingOptions}>
              <TouchableOpacity onPress={giveCake} style={styles.giveCakeButton}>
                <Text style={styles.giveCakeButtonText}>🧁 把这份宵夜给小怪兽</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/lighthouse')} style={styles.lighthouseButton}>
                <Text style={styles.lighthouseButtonText}>💫 去灯塔看看</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* SOS选项面板 */}
          {showOptions && (
            <View style={styles.sosOptionsPanel}>
              <Text style={styles.sosOptionsTitle}>你现在需要什么？</Text>
              {SOS_OPTIONS.gentle.map((option, idx) => (
                <TouchableOpacity 
                  key={idx}
                  style={styles.sosOptionButton}
                  onPress={() => handleSelectOption(option.type)}
                >
                  <Text style={styles.sosOptionEmoji}>{option.emoji}</Text>
                  <Text style={styles.sosOptionText}>{option.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* 等待环节进度条 */}
          {mode === 'waiting' && waitingProgress > 0 && waitingProgress < 60 && (
            <View style={styles.waitingProgressContainer}>
              <View style={styles.waitingProgressBar}>
                <View 
                  style={[
                    styles.waitingProgressFill, 
                    { width: `${(waitingProgress / 60) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.waitingProgressText}>
                {60 - waitingProgress}秒后可以结束
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* 用户输入框 (API 模式) */}
        {useApiMode && showInput && !isLoading && (
          <View style={styles.userInputContainer}>
            <TextInput
              style={styles.userInputField}
              placeholder="说点什么..."
              placeholderTextColor={colors.textMuted}
              value={userInput}
              onChangeText={setUserInput}
              onSubmitEditing={sendUserMessage}
              returnKeyType="send"
            />
            <TouchableOpacity 
              onPress={sendUserMessage} 
              style={[styles.sendButton, !userInput.trim() && styles.sendButtonDisabled]}
              disabled={!userInput.trim()}
            >
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
            
            {/* 结束对话按钮 */}
            <TouchableOpacity onPress={giveCake} style={styles.endChatButton}>
              <Text style={styles.endChatButtonText}>结束并送蛋糕 🍰</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* 继续对话按钮 (本地模式) */}
        {!useApiMode && !hasEnding && (
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
              source={monsterConfig.index === 1 
                ? require('../assets/monster1.jpg')
                : require('../assets/monster2.jpg')
              } 
              style={styles.endingMonsterImage}
              resizeMode="cover"
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
              source={monsterConfig.index === 1 
                ? require('../assets/monster1.jpg')
                : require('../assets/monster2.jpg')
              } 
              style={styles.monsterImage}
              resizeMode="cover"
            />
          </Animated.View>
        </View>
        
        <Text style={styles.monsterNameText}>{monsterName}</Text>
        
        {/* 对话气泡 - 根据时间显示问候 */}
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>💬 "{getIdleGreeting(monsterName || '')}"</Text>
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
    borderRadius: 32,
  },
  monsterStateLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
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
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  giveCakeButton: {
    backgroundColor: colors.accent.yellow,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: colors.accent.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  giveCakeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  lighthouseButton: {
    backgroundColor: 'rgba(197, 168, 232, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  lighthouseButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
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
  
  // SOS选项面板
  sosOptionsPanel: {
    marginTop: 20,
    gap: 10,
  },
  sosOptionsTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  sosOptionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sosOptionEmoji: {
    fontSize: 20,
  },
  sosOptionText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
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
  
  // 视觉特效覆盖层
  visualEffectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  visualEffectText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  
  // 打字机效果
  typingCursor: {
    color: colors.accent.purple,
    fontWeight: '300',
  },
  
  // 加载状态
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  // 用户输入框
  userInputContainer: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(165, 201, 232, 0.2)',
  },
  userInputField: {
    backgroundColor: 'rgba(245, 240, 250, 0.8)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(165, 201, 232, 0.4)',
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  endChatButton: {
    backgroundColor: colors.accent.yellow,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  endChatButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
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
  
  // 等待环节进度条
  waitingProgressContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  waitingProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  waitingProgressFill: {
    height: '100%',
    backgroundColor: colors.accent.purple,
    borderRadius: 4,
  },
  waitingProgressText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textMuted,
  },
});
