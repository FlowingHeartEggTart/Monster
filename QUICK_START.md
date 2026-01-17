# PauseLight 快速启动指南

## 前置要求

- Node.js 18+ 
- npm 或 yarn
- Expo CLI（可选，推荐全局安装）

## 安装步骤

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm start

# 3. 选择运行平台
# - 按 'i' 启动 iOS 模拟器
# - 按 'a' 启动 Android 模拟器
# - 按 'w' 启动 Web 浏览器
# - 扫描二维码在真机上运行
```

## 项目结构概览

```
app/              # 页面路由（Expo Router）
src/
  components/     # UI 组件
  store/          # 状态管理（Zustand）
  hooks/          # 自定义 Hooks
  services/       # API 服务
  theme/          # 主题配置
  utils/          # 工具函数
```

## 核心功能

### 1. 暂停键（Pause）
- 点击右下角悬浮按钮触发
- 进入 90 秒缓冲流程
- 支持呼吸节律交互（长按）
- 结束后显示 AI 情绪反问

### 2. 心象（Inner Creature）
- 默认首页
- 展示情绪形象
- 可选命名、抚摸交互

### 3. 灯塔（Lighthouse）
- 显示当前在线人数
- 光点动画效果
- 可点亮一盏灯

## 开发注意事项

1. **状态管理**：使用 Zustand，全局状态在 `src/store/` 目录
2. **路由**：使用 Expo Router，页面在 `app/` 目录
3. **动画**：使用 React Native Reanimated，确保 60fps
4. **触觉**：使用 Expo Haptics，遵循节律原则

## 环境变量

创建 `.env` 文件（可选）：

```env
EXPO_PUBLIC_API_URL=https://api.pauselight.com
```

## 常见问题

### Q: 如何添加新的页面？
A: 在 `app/` 目录下创建新的 `.tsx` 文件，Expo Router 会自动识别。

### Q: 如何修改主题颜色？
A: 编辑 `src/theme/colors.ts` 文件。

### Q: 如何连接后端 API？
A: 在 `src/services/api.ts` 中实现具体的 API 调用逻辑。

## 下一步

- [ ] 配置后端 API 地址
- [ ] 集成 WebSocket 连接（灯塔模块）
- [ ] 添加 Lottie 动画资源
- [ ] 实现语音和拍照功能

