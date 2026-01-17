/**
 * 主题色彩配置
 * UI美化规范 - 毛玻璃 + 渐变光晕 + 柔和阴影 + 极简圆角 + 治愈系
 * 参考App：Finch、OtterLife、蚂蚁庄园
 */
export const colors = {
  // ===== 主色 =====
  pink: {
    primary: '#FF9EC4',
    light: '#FFCAD4',
    accent: '#FF6B9D',
  },
  blue: {
    primary: '#A5C9E8',
    light: '#D4E5F7',
  },
  purple: {
    primary: '#C4B5E0',
    light: '#C5A8E8',
  },
  
  // ===== 背景渐变色 =====
  background: '#FFF5F8',
  backgroundGradient: ['#FFF5F8', '#F8F0FF', '#F0F4FF', '#E8F4FF'],
  bgPink: '#FFF5F8',
  bgPurple: '#F8F0FF',
  bgBlue: '#F0F4FF',
  bgLightBlue: '#E8F4FF',
  
  // ===== 文字颜色 =====
  text: '#2D2D3A',           // 主文字：深灰紫，不用纯黑
  textSecondary: '#8B8BA8',  // 次要文字：灰紫
  textAccent: '#FF6B9D',     // 强调文字：粉色
  textMuted: '#B8B8C8',      // 浅色文字
  textLight: '#9B9BB5',
  
  // ===== 边框/分割线 =====
  borderLight: 'rgba(255, 255, 255, 0.8)',
  borderCard: 'rgba(255, 255, 255, 0.9)',
  divider: 'rgba(0, 0, 0, 0.06)',
  
  // ===== 毛玻璃背景 =====
  glass: {
    bg: 'rgba(255, 255, 255, 0.7)',
    bgLight: 'rgba(255, 255, 255, 0.6)',
    bgStrong: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(255, 255, 255, 0.9)',
  },
  
  // ===== 光斑颜色 =====
  glow: {
    pink: 'rgba(255, 182, 193, 0.5)',
    blue: 'rgba(173, 216, 230, 0.5)',
    purple: 'rgba(200, 180, 255, 0.4)',
  },
  
  // 旧版兼容
  surface: '#D4E5F7',
  surfaceLight: '#FFFFFF',
  
  // SOS/暂停键主题（淡蓝）
  pause: {
    primary: '#A5C9E8',
    secondary: '#8BB4D9',
    overlay: 'rgba(74, 74, 106, 0.95)',
    accent: '#E8F4F8',
    light: '#D4E5F7',
  },
  
  // 怪兽养成主题（柔粉）
  creature: {
    background: '#FFF8F5',
    primary: '#FFCAD4',
    secondary: '#FFB5C2',
    accent: '#FFE5A0',
    light: '#FFF0F3',
  },
  
  // 灯塔主题（深蓝星空）
  lighthouse: {
    background: '#1A1A2E',
    backgroundDark: '#0F0F1E',
    light: '#FFE5A0',
    glow: 'rgba(255, 229, 160, 0.5)',
    blue: '#A5C9E8',
  },
  
  // 强调色
  accent: {
    yellow: '#FFE5A0',
    pink: '#FFCAD4',
    blue: '#A5C9E8',
    purple: '#C5A8E8',
  },
  
  // 功能色
  success: '#A8E6CF',
  warning: '#FFE5A0',
  error: '#FFB5C2',
  
  // 通用
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // 渐变（用于背景）
  gradients: {
    main: ['#FFF5F8', '#F8F0FF', '#F0F4FF', '#E8F4FF'],
    creature: ['#FFF8F5', '#FFE5F0'],
    lighthouse: ['#0F0F1E', '#1A1A2E'],
    card: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'],
    button: ['#FF9EC4', '#A5C9E8'],
  },
  
  // ===== 阴影 =====
  shadow: {
    sm: 'rgba(0, 0, 0, 0.04)',
    md: 'rgba(0, 0, 0, 0.06)',
    lg: 'rgba(0, 0, 0, 0.1)',
    pink: 'rgba(255, 158, 196, 0.3)',
    blue: 'rgba(165, 201, 232, 0.3)',
  },
  
  // ===== 圆角 =====
  radius: {
    sm: 12,   // 小元素：标签、小按钮、图标容器
    md: 20,   // 中元素：输入框、列表项、小卡片
    lg: 28,   // 大元素：主卡片、弹窗
    full: 50, // 全圆：主按钮、胶囊标签
  },
};
