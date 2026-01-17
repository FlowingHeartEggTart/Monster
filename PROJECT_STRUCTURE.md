# PauseLight 项目结构说明

## 目录结构

```
PAUSELIGHT/
├── app/                          # Expo Router 页面层
│   ├── _layout.tsx              # 根布局（注入 Pause 覆盖层和全局按钮）
│   ├── index.tsx                # 心象页面（默认入口）
│   └── lighthouse.tsx           # 灯塔页面
│
├── src/
│   ├── components/              # 组件目录
│   │   ├── pause/               # 暂停键模块组件
│   │   │   ├── PauseButton.tsx  # 全局悬浮暂停键
│   │   │   ├── PauseOverlay.tsx # 90秒缓冲全屏覆盖层
│   │   │   ├── Countdown.tsx    # 倒计时显示
│   │   │   ├── BreathHold.tsx   # 呼吸节律交互
│   │   │   └── ReflectionScreen.tsx # AI 情绪反问页
│   │   │
│   │   ├── creature/            # 心象模块组件
│   │   │   ├── CreatureView.tsx # 情绪形象主体
│   │   │   └── CreatureActions.tsx # 交互操作（命名、抚摸等）
│   │   │
│   │   └── lighthouse/          # 灯塔模块组件
│   │       └── LighthouseView.tsx # 灯塔视图（光点、人数显示）
│   │
│   ├── store/                   # Zustand 状态管理
│   │   ├── pauseStore.ts        # Pause 状态机
│   │   ├── creatureStore.ts     # 心象本地状态
│   │   └── lighthouseStore.ts   # 灯塔状态
│   │
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useCountdown.ts      # 90秒倒计时 Hook
│   │   └── useHaptics.ts        # 触觉反馈 Hook
│   │
│   ├── services/                # 服务层
│   │   └── api.ts               # API 调用（AI 反问、灯塔订阅等）
│   │
│   ├── theme/                   # 主题配置
│   │   └── colors.ts            # 色彩定义
│   │
│   ├── utils/                   # 工具函数
│   │   └── constants.ts         # 应用常量
│   │
│   └── types/                   # 类型定义
│       └── index.ts             # 全局类型
│
├── package.json                 # 项目依赖
├── tsconfig.json               # TypeScript 配置
├── app.json                    # Expo 配置
├── babel.config.js             # Babel 配置
├── .gitignore                  # Git 忽略文件
├── README.md                   # 项目说明
└── PROJECT_STRUCTURE.md        # 本文件
```

## 核心模块说明

### 1. Pause（暂停键）模块

**状态流转**：`IDLE → ACTIVE_90S → REFLECTION → IDLE`

- **PauseButton**: 全局悬浮按钮，任意页面可触发
- **PauseOverlay**: 90秒全屏覆盖层，禁止返回
- **Countdown**: 倒计时显示（极简）
- **BreathHold**: 呼吸节律交互（长按触发）
- **ReflectionScreen**: AI 情绪反问承接页

### 2. 心象（Inner Creature）模块

- **CreatureView**: 展示情绪形象（可替换为 Lottie 动画）
- **CreatureActions**: 可选交互（命名、抚摸、观察）

**状态存储**：本地优先（AsyncStorage），可随时清空

### 3. 灯塔（Lighthouse）模块

- **LighthouseView**: 显示在线人数、光点动画、点亮按钮

**数据来源**：WebSocket / Supabase Realtime（待实现）

## 设计原则

1. **低认知负荷**：界面极简，不堆叠信息
2. **可随时退出**：所有流程支持 0 操作完成
3. **无强制完成**：不诱导连续使用
4. **不评判**：不出现情绪评分、数值等

## 技术栈

- React Native + Expo
- Expo Router（文件路由）
- Zustand（状态管理）
- React Native Reanimated（动画）
- Expo Haptics（触觉反馈）
- TypeScript

## 待实现功能

- [ ] WebSocket / Supabase Realtime 集成
- [ ] AI 情绪反问 API 集成
- [ ] 语音输入功能
- [ ] 拍照功能
- [ ] Lottie 动画资源
- [ ] 完整的触觉反馈优化

