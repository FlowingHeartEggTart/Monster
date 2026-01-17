import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Image, Platform } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

/**
 * 怪兽动画状态类型
 * 基于设计文档的动画场景
 */
export type MonsterAnimationState = 
  | 'idle'              // 待机呼吸
  | 'eating'            // 吃蛋糕庆祝
  | 'touched'           // 被点击反应
  | 'listening'         // 倾听状态（SOS对话中）
  | 'empathy'           // 共情安慰
  | 'serious'           // 严肃提醒
  | 'company'           // 陪伴守护
  | 'regret';           // 后果展示

/**
 * 怪兽类型 1 或 2
 */
export type MonsterIndex = 1 | 2;

/**
 * 视频资源映射
 * 根据现有素材进行适配
 */
const getVideoSource = (monsterIndex: MonsterIndex, state: MonsterAnimationState) => {
  // 怪兽1的视频映射
  if (monsterIndex === 1) {
    switch (state) {
      case 'eating':
        return require('../../../assets/1_eating_cake.mp4');
      case 'touched':
        return require('../../../assets/1_being_touched.mp4');
      case 'regret':
        return require('../../../assets/1_regret_after_eating.mp4');
      case 'idle':
      case 'listening':
      default:
        return require('../../../assets/1_doing_sports.mp4');
    }
  }
  
  // 怪兽2的视频映射
  switch (state) {
    case 'eating':
      return require('../../../assets/2_eating_cake.mp4');
    case 'touched':
      return require('../../../assets/2_being_touched.mp4');
    case 'regret':
      return require('../../../assets/2_regret_after_eating.mp4');
    case 'idle':
    case 'listening':
    default:
      return require('../../../assets/2_being_look.mp4');
  }
};

/**
 * 静态图片资源
 */
const getStaticImage = (monsterIndex: MonsterIndex) => {
  return monsterIndex === 1 
    ? require('../../../assets/monster1.jpg')
    : require('../../../assets/monster2.jpg');
};

export interface MonsterVideoPlayerRef {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setAnimation: (state: MonsterAnimationState) => void;
}

interface MonsterVideoPlayerProps {
  monsterIndex: MonsterIndex;
  animationState?: MonsterAnimationState;
  size?: number;
  isLooping?: boolean;
  autoPlay?: boolean;
  showStatic?: boolean;  // 是否显示静态图片而非视频
  onAnimationEnd?: () => void;
  style?: any;
}

/**
 * 怪兽视频播放器组件
 * 根据不同状态播放对应的怪兽动画视频
 */
export const MonsterVideoPlayer = forwardRef<MonsterVideoPlayerRef, MonsterVideoPlayerProps>(({
  monsterIndex,
  animationState = 'idle',
  size = 240,
  isLooping = true,
  autoPlay = true,
  showStatic = false,
  onAnimationEnd,
  style,
}, ref) => {
  const videoRef = useRef<Video>(null);
  const [currentState, setCurrentState] = useState<MonsterAnimationState>(animationState);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    play: async () => {
      await videoRef.current?.playAsync();
    },
    pause: async () => {
      await videoRef.current?.pauseAsync();
    },
    stop: async () => {
      await videoRef.current?.stopAsync();
      await videoRef.current?.setPositionAsync(0);
    },
    setAnimation: (state: MonsterAnimationState) => {
      setCurrentState(state);
    },
  }));

  // 监听动画状态变化
  useEffect(() => {
    setCurrentState(animationState);
  }, [animationState]);

  // 处理视频播放状态
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (!isVideoReady) {
        setIsVideoReady(true);
      }
      if (status.didJustFinish && !isLooping) {
        onAnimationEnd?.();
      }
    }
  };

  // 如果明确指定显示静态图片
  if (showStatic) {
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
        <Image
          source={getStaticImage(monsterIndex)}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {!isVideoReady && (
        <Image
          source={getStaticImage(monsterIndex)}
          style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
        />
      )}
      <Video
        ref={videoRef}
        source={getVideoSource(monsterIndex, currentState)}
        style={{ width: '100%', height: '100%' }}
        videoStyle={{ width: size, height: size }}
        resizeMode={ResizeMode.COVER}
        shouldPlay={autoPlay}
        isLooping={isLooping}
        isMuted={true}
        useNativeControls={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  placeholder: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
});

export default MonsterVideoPlayer;
