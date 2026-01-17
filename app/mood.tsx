import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { useCreatureStore } from '@/store/creatureStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  SlideInRight,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 心情配置 - 更精致的设计
const MOODS = [
  { 
    id: 'great', 
    emoji: '😊', 
    label: '很棒', 
    color: '#4ADE80', 
    bgColor: 'rgba(74, 222, 128, 0.15)',
    desc: '今天心情超好！',
    gradient: ['#4ADE80', '#22C55E']
  },
  { 
    id: 'good', 
    emoji: '🙂', 
    label: '还行', 
    color: '#FFE5A0', 
    bgColor: 'rgba(255, 229, 160, 0.15)',
    desc: '普普通通的一天',
    gradient: ['#FFE5A0', '#FCD34D']
  },
  { 
    id: 'meh', 
    emoji: '😐', 
    label: '一般', 
    color: '#A5C9E8', 
    bgColor: 'rgba(165, 201, 232, 0.15)',
    desc: '有点平淡...',
    gradient: ['#A5C9E8', '#7DD3FC']
  },
  { 
    id: 'down', 
    emoji: '😔', 
    label: '低落', 
    color: '#FFCAD4', 
    bgColor: 'rgba(255, 202, 212, 0.15)',
    desc: '有些不开心',
    gradient: ['#FFCAD4', '#FDA4AF']
  },
  { 
    id: 'bad', 
    emoji: '😢', 
    label: '很差', 
    color: '#C5A8E8', 
    bgColor: 'rgba(197, 168, 232, 0.15)',
    desc: '今天很难熬',
    gradient: ['#C5A8E8', '#A78BFA']
  },
];

// 触发因素
const TRIGGERS = [
  { id: 'work', label: '工作学习', emoji: '💼', color: '#A5C9E8' },
  { id: 'relationship', label: '人际关系', emoji: '👥', color: '#FFCAD4' },
  { id: 'health', label: '身体状况', emoji: '🏥', color: '#4ADE80' },
  { id: 'sleep', label: '睡眠质量', emoji: '😴', color: '#C5A8E8' },
  { id: 'food', label: '饮食相关', emoji: '🍽️', color: '#FFE5A0' },
  { id: 'weather', label: '天气影响', emoji: '🌤️', color: '#7DD3FC' },
];

interface MoodEntry {
  id: string;
  date: string;
  time: string;
  mood: string;
  triggers: string[];
  note: string;
}

const STORAGE_KEY = '@pauselight:mood_entries';

/**
 * 心情日记页面 - 重新设计
 * 更有交互感和视觉吸引力
 */
export default function MoodPage() {
  const router = useRouter();
  const { monsterName } = useCreatureStore();
  
  const [mode, setMode] = useState<'home' | 'record' | 'history'>('home');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // 动画值
  const headerScale = useSharedValue(1);
  const selectedMoodScale = useSharedValue(1);
  
  useEffect(() => {
    loadEntries();
  }, []);
  
  // 心情选中动画
  useEffect(() => {
    if (selectedMood) {
      selectedMoodScale.value = withSequence(
        withSpring(1.15, { damping: 8 }),
        withSpring(1, { damping: 8 })
      );
    }
  }, [selectedMood]);
  
  const loadEntries = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) setEntries(JSON.parse(data));
    } catch (error) {
      console.error('Failed to load mood entries:', error);
    }
  };
  
  const saveEntry = async () => {
    if (!selectedMood) return;
    
    const now = new Date();
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      mood: selectedMood,
      triggers: selectedTriggers,
      note: note.trim(),
    };
    
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Failed to save mood entry:', error);
    }
    
    // 显示成功动画
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedMood(null);
      setSelectedTriggers([]);
      setNote('');
      setMode('home');
    }, 1500);
  };
  
  const toggleTrigger = (triggerId: string) => {
    setSelectedTriggers(prev => 
      prev.includes(triggerId) 
        ? prev.filter(t => t !== triggerId)
        : [...prev, triggerId]
    );
  };
  
  // 获取今日心情
  const todayMood = entries.find(e => e.date === new Date().toISOString().split('T')[0]);
  const todayMoodConfig = todayMood ? MOODS.find(m => m.id === todayMood.mood) : null;
  
  // 获取本周心情统计
  const weekEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });
  
  const moodAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: selectedMoodScale.value }],
  }));
  
  // 成功弹窗
  if (showSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <Animated.View entering={ZoomIn.duration(400)} style={styles.successContent}>
            <Text style={styles.successEmoji}>✨</Text>
            <Text style={styles.successTitle}>记录成功</Text>
            <Text style={styles.successSubtitle}>感谢你与自己对话</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }
  
  // 记录模式
  if (mode === 'record') {
    const currentMood = MOODS.find(m => m.id === selectedMood);
    
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.recordContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 顶部 */}
          <View style={styles.recordHeader}>
            <TouchableOpacity onPress={() => setMode('home')} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.recordTitle}>记录心情</Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* 心情选择 */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.moodSection}>
            <Text style={styles.sectionLabel}>现在感觉如何？</Text>
            
            <View style={styles.moodGrid}>
              {MOODS.map((mood, index) => (
                <Animated.View
                  key={mood.id}
                  entering={FadeInUp.delay(150 + index * 50)}
                >
                  <TouchableOpacity
                    style={[
                      styles.moodOption,
                      selectedMood === mood.id && [
                        styles.moodOptionActive,
                        { backgroundColor: mood.bgColor, borderColor: mood.color }
                      ]
                    ]}
                    onPress={() => setSelectedMood(mood.id)}
                    activeOpacity={0.7}
                  >
                    <Animated.Text 
                      style={[
                        styles.moodEmoji,
                        selectedMood === mood.id && moodAnimStyle
                      ]}
                    >
                      {mood.emoji}
                    </Animated.Text>
                    <Text style={[
                      styles.moodLabel,
                      selectedMood === mood.id && { color: mood.color, fontWeight: '600' }
                    ]}>
                      {mood.label}
                    </Text>
                    {selectedMood === mood.id && (
                      <View style={[styles.moodCheckmark, { backgroundColor: mood.color }]}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
            
            {currentMood && (
              <Animated.View 
                entering={FadeIn.duration(300)}
                style={[styles.moodHint, { backgroundColor: currentMood.bgColor }]}
              >
                <Text style={[styles.moodHintText, { color: currentMood.color }]}>
                  {currentMood.desc}
                </Text>
              </Animated.View>
            )}
          </Animated.View>
          
          {/* 触发因素 */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.triggerSection}>
            <Text style={styles.sectionLabel}>可能的原因？</Text>
            <Text style={styles.sectionHint}>选填，可多选</Text>
            
            <View style={styles.triggerGrid}>
              {TRIGGERS.map((trigger, index) => (
                <Animated.View
                  key={trigger.id}
                  entering={SlideInRight.delay(350 + index * 50)}
                >
                  <TouchableOpacity
                    style={[
                      styles.triggerTag,
                      selectedTriggers.includes(trigger.id) && [
                        styles.triggerTagActive,
                        { backgroundColor: `${trigger.color}20`, borderColor: trigger.color }
                      ]
                    ]}
                    onPress={() => toggleTrigger(trigger.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.triggerEmoji}>{trigger.emoji}</Text>
                    <Text style={[
                      styles.triggerLabel,
                      selectedTriggers.includes(trigger.id) && { color: trigger.color }
                    ]}>
                      {trigger.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
          
          {/* 备注 */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.noteSection}>
            <Text style={styles.sectionLabel}>想说点什么？</Text>
            <View style={styles.noteInputWrapper}>
              <TextInput
                style={styles.noteInput}
                placeholder={`跟${monsterName || '自己'}说说...`}
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
                multiline
                maxLength={200}
              />
              <Text style={styles.charCount}>{note.length}/200</Text>
            </View>
          </Animated.View>
          
          {/* 保存按钮 */}
          <Animated.View entering={FadeInUp.delay(600)}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !selectedMood && styles.saveButtonDisabled
              ]}
              onPress={saveEntry}
              disabled={!selectedMood}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                {selectedMood ? '保存这一刻 ✨' : '请先选择心情'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // 历史记录模式
  if (mode === 'history') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.historyHeader}>
          <TouchableOpacity onPress={() => setMode('home')} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.historyTitle}>历史记录</Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.historyContent}>
            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📔</Text>
                <Text style={styles.emptyText}>还没有记录</Text>
                <Text style={styles.emptyHint}>开始记录你的心情吧</Text>
              </View>
            ) : (
              entries.map((entry, index) => {
                const mood = MOODS.find(m => m.id === entry.mood);
                const entryTriggers = TRIGGERS.filter(t => entry.triggers.includes(t.id));
                
                return (
                  <Animated.View
                    key={entry.id}
                    entering={FadeInDown.delay(index * 80)}
                    style={styles.historyCard}
                  >
                    <View style={[styles.historyMoodBar, { backgroundColor: mood?.color }]} />
                    <View style={styles.historyCardContent}>
                      <View style={styles.historyCardHeader}>
                        <View style={styles.historyMoodInfo}>
                          <Text style={styles.historyEmoji}>{mood?.emoji}</Text>
                          <View>
                            <Text style={styles.historyMoodLabel}>{mood?.label}</Text>
                            <Text style={styles.historyTime}>{entry.date} {entry.time}</Text>
                          </View>
                        </View>
                      </View>
                      
                      {entryTriggers.length > 0 && (
                        <View style={styles.historyTriggers}>
                          {entryTriggers.map(t => (
                            <View key={t.id} style={styles.historyTriggerTag}>
                              <Text style={styles.historyTriggerText}>{t.emoji} {t.label}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      
                      {entry.note && (
                        <Text style={styles.historyNote}>"{entry.note}"</Text>
                      )}
                    </View>
                  </Animated.View>
                );
              })
            )}
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // 首页
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.homeContent}>
          {/* 顶部问候 */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.greeting}>
            <Text style={styles.greetingText}>
              {new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好'} ☀️
            </Text>
            <Text style={styles.greetingSubtext}>今天感觉怎么样？</Text>
          </Animated.View>
          
          {/* 今日心情卡片 */}
          <Animated.View entering={FadeInUp.delay(200)} style={styles.todayCard}>
            {todayMoodConfig ? (
              <>
                <View style={[styles.todayMoodBg, { backgroundColor: todayMoodConfig.bgColor }]} />
                <Text style={styles.todayLabel}>今日心情</Text>
                <Text style={styles.todayEmoji}>{todayMoodConfig.emoji}</Text>
                <Text style={[styles.todayMoodText, { color: todayMoodConfig.color }]}>
                  {todayMoodConfig.label}
                </Text>
                <TouchableOpacity 
                  style={styles.todayEditButton}
                  onPress={() => setMode('record')}
                >
                  <Text style={styles.todayEditText}>再记一笔</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.todayLabel}>今日心情</Text>
                <Text style={styles.todayEmptyEmoji}>🌙</Text>
                <Text style={styles.todayEmptyText}>还没有记录</Text>
                <TouchableOpacity 
                  style={styles.todayRecordButton}
                  onPress={() => setMode('record')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.todayRecordText}>记录此刻心情</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
          
          {/* 快速记录按钮 */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.quickRecord}>
            <Text style={styles.quickLabel}>快速记录</Text>
            <View style={styles.quickMoods}>
              {MOODS.map((mood, index) => (
                <Animated.View
                  key={mood.id}
                  entering={FadeInUp.delay(350 + index * 50)}
                >
                  <TouchableOpacity
                    style={[styles.quickMoodButton, { backgroundColor: mood.bgColor }]}
                    onPress={() => {
                      setSelectedMood(mood.id);
                      setMode('record');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickMoodEmoji}>{mood.emoji}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
          
          {/* 本周统计 */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.weekStats}>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>📊 本周心情</Text>
              <TouchableOpacity onPress={() => setMode('history')}>
                <Text style={styles.viewAllText}>查看全部 →</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.weekGrid}>
              {MOODS.map(mood => {
                const count = weekEntries.filter(e => e.mood === mood.id).length;
                return (
                  <View key={mood.id} style={styles.weekItem}>
                    <Text style={styles.weekItemEmoji}>{mood.emoji}</Text>
                    <View style={[styles.weekItemBar, { backgroundColor: mood.bgColor }]}>
                      <View 
                        style={[
                          styles.weekItemFill, 
                          { 
                            backgroundColor: mood.color,
                            height: count > 0 ? Math.min(count * 20, 60) : 4,
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.weekItemCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
          
          {/* 最近记录预览 */}
          {entries.length > 0 && (
            <Animated.View entering={FadeInUp.delay(500)} style={styles.recentSection}>
              <Text style={styles.recentTitle}>最近记录</Text>
              {entries.slice(0, 3).map((entry, index) => {
                const mood = MOODS.find(m => m.id === entry.mood);
                return (
                  <TouchableOpacity 
                    key={entry.id}
                    style={styles.recentCard}
                    onPress={() => setMode('history')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.recentDot, { backgroundColor: mood?.color }]} />
                    <Text style={styles.recentEmoji}>{mood?.emoji}</Text>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentMood}>{mood?.label}</Text>
                      <Text style={styles.recentTime}>{entry.date} {entry.time}</Text>
                    </View>
                    {entry.note && (
                      <Text style={styles.recentNote} numberOfLines={1}>
                        "{entry.note}"
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  
  // 首页
  homeContent: {
    padding: 20,
  },
  greeting: {
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  
  // 今日卡片
  todayCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  todayMoodBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  todayLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  todayEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  todayMoodText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  todayEditButton: {
    backgroundColor: 'rgba(165, 201, 232, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  todayEditText: {
    fontSize: 14,
    color: colors.accent.blue,
    fontWeight: '500',
  },
  todayEmptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
    opacity: 0.5,
  },
  todayEmptyText: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 16,
  },
  todayRecordButton: {
    backgroundColor: colors.accent.pink,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: colors.accent.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  todayRecordText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  
  // 快速记录
  quickRecord: {
    marginBottom: 24,
  },
  quickLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  quickMoods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickMoodButton: {
    width: (SCREEN_WIDTH - 80) / 5,
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  quickMoodEmoji: {
    fontSize: 28,
  },
  
  // 本周统计
  weekStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 13,
    color: colors.accent.blue,
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekItem: {
    alignItems: 'center',
  },
  weekItemEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  weekItemBar: {
    width: 24,
    height: 60,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekItemFill: {
    width: '100%',
    borderRadius: 12,
  },
  weekItemCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  
  // 最近记录
  recentSection: {
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  recentDot: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  recentEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentMood: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  recentTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  recentNote: {
    fontSize: 12,
    color: colors.textSecondary,
    maxWidth: 100,
  },
  
  // 记录页
  recordContent: {
    padding: 20,
    paddingBottom: 40,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.text,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  
  // 心情选择
  moodSection: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -12,
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodOption: {
    width: (SCREEN_WIDTH - 80) / 5,
    aspectRatio: 0.85,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodOptionActive: {
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  moodCheckmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  moodHint: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  moodHintText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // 触发因素
  triggerSection: {
    marginBottom: 28,
  },
  triggerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  triggerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  triggerTagActive: {
    borderWidth: 1.5,
  },
  triggerEmoji: {
    fontSize: 16,
  },
  triggerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  
  // 备注
  noteSection: {
    marginBottom: 28,
  },
  noteInputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  noteInput: {
    padding: 16,
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    paddingRight: 16,
    paddingBottom: 12,
  },
  
  // 保存按钮
  saveButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: colors.accent.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(165, 201, 232, 0.4)',
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  
  // 成功页
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  
  // 历史页
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  historyContent: {
    padding: 20,
    paddingTop: 0,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
  },
  historyMoodBar: {
    width: 5,
  },
  historyCardContent: {
    flex: 1,
    padding: 16,
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyMoodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyEmoji: {
    fontSize: 28,
  },
  historyMoodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  historyTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  historyTriggers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  historyTriggerTag: {
    backgroundColor: colors.backgroundGradient[0],
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  historyTriggerText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  historyNote: {
    marginTop: 12,
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  
  // 空状态
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: colors.textMuted,
  },
  
  bottomSpacer: {
    height: 100,
  },
});
