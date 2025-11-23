/**
 * 项目统一颜色配置
 * 参考现代UI设计原则，使用柔和的配色方案
 */

export const colors = {
  // 主题色 - 使用柔和的渐变色
  primary: {
    50: '#f0f9ff',   // 极浅蓝
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // 主色
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // 辅助色 - 紫色系
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',  // 主色
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  
  // 成功色 - 绿色系
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // 主色
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // 警告色 - 橙色系
  warning: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // 主色
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // 错误色 - 红色系
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // 主色
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // 中性色 - 灰色系
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // 背景渐变色
  gradients: {
    // 首页背景
    home: 'from-blue-50 to-indigo-100',
    // 单词闪卡背景
    flashcard: 'from-blue-50 to-indigo-100',
    // 单词记忆背景
    memory: 'from-purple-50 to-pink-100',
    // 单词连线背景
    link: 'from-blue-50 via-white to-pink-50',
    // 单词找茬背景
    spot: 'from-blue-50 via-white to-pink-50',
    // 单词堆叠游戏背景
    stack: 'from-gray-900 to-black',
    // 单词测验背景
    quiz: 'from-purple-50 via-pink-50 to-orange-50',
    // GSAP 动画游戏背景
    gsap: 'from-purple-50 via-pink-50 to-orange-50',
    // 单词消除背景
    eliminate: 'from-gray-900 to-black',
    // 词了个词背景
    wordstack: 'from-gray-900 to-black',
  },
  
  // 模块主题色
  modules: {
    flashcard: {
      primary: '#0ea5e9',      // blue-500
      hover: '#0284c7',        // blue-600
      gradient: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-500',
      iconHover: 'bg-blue-600',
      gradientFrom: '#0ea5e9',
      gradientTo: '#6366f1',   // indigo-500
    },
    memory: {
      primary: '#a855f7',       // purple-500
      hover: '#9333ea',        // purple-600
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500',
      iconHover: 'bg-purple-600',
      score: '#9333ea',         // purple-600
      moves: '#ec4899',         // pink-500
      gradientFrom: '#a855f7',
      gradientTo: '#ec4899',    // pink-500
    },
    link: {
      primary: '#22c55e',       // green-500
      hover: '#16a34a',         // green-600
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500',
      iconHover: 'bg-green-600',
      score: '#0ea5e9',         // blue-500
      correct: '#22c55e',       // green-500
      gradientFrom: '#22c55e',
      gradientTo: '#10b981',    // emerald-500
    },
    spot: {
      primary: '#f97316',       // orange-500
      hover: '#ea580c',         // orange-600
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500',
      iconHover: 'bg-orange-600',
      level: '#16a34a',         // green-600
      score: '#0ea5e9',         // blue-500
      banner: 'from-green-500 to-emerald-500',
      gradientFrom: '#f97316',
      gradientTo: '#ef4444',    // red-500
      bannerFrom: '#22c55e',    // green-500
      bannerTo: '#10b981',      // emerald-500
    },
    stack: {
      primary: '#10b981',       // emerald-500
      hover: '#059669',         // emerald-600
      gradient: 'from-emerald-500 to-cyan-500',
      iconBg: 'bg-emerald-500',
      iconHover: 'bg-emerald-600',
      score: '#22c55e',         // green-500
      moves: '#3b82f6',         // blue-500
      gradientFrom: '#10b981',
      gradientTo: '#06b6d4',    // cyan-500
    },
    quiz: {
      primary: '#a855f7',       // purple-500
      hover: '#9333ea',         // purple-600
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      iconBg: 'bg-purple-500',
      iconHover: 'bg-purple-600',
      gradientFrom: '#a855f7',
      gradientTo: '#ec4899',    // pink-500
    },
    gsap: {
      primary: '#8b5cf6',       // violet-500
      hover: '#7c3aed',         // violet-600
      gradient: 'from-violet-500 to-purple-500',
      iconBg: 'bg-violet-500',
      iconHover: 'bg-violet-600',
      gradientFrom: '#8b5cf6',
      gradientTo: '#a855f7',    // purple-500
    },
    eliminate: {
      primary: '#3b82f6',       // blue-500
      hover: '#2563eb',         // blue-600
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500',
      iconHover: 'bg-blue-600',
      score: '#22c55e',         // green-500
      moves: '#3b82f6',         // blue-500
      gradientFrom: '#3b82f6',
      gradientTo: '#06b6d4',    // cyan-500
    },
    wordstack: {
      primary: '#ec4899',       // pink-500
      hover: '#db2777',         // pink-600
      gradient: 'from-pink-500 to-rose-500',
      iconBg: 'bg-pink-500',
      iconHover: 'bg-pink-600',
      score: '#22c55e',         // green-500
      moves: '#3b82f6',         // blue-500
      gradientFrom: '#ec4899',
      gradientTo: '#f43f5e',    // rose-500
    },
  },
  
  // 通用颜色
  common: {
    white: '#ffffff',
    black: '#000000',
    background: '#ffffff',
    text: {
      primary: '#1f2937',      // gray-800
      secondary: '#6b7280',    // gray-500
      tertiary: '#9ca3af',     // gray-400
      inverse: '#ffffff',
    },
    border: {
      light: '#e5e7eb',        // gray-200
      default: '#d1d5db',      // gray-300
      dark: '#9ca3af',         // gray-400
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
  },
}

// 导出颜色工具函数
export const getColor = (path) => {
  const keys = path.split('.')
  let value = colors
  for (const key of keys) {
    value = value[key]
    if (value === undefined) return null
  }
  return value
}

// 导出渐变色类名
export const getGradientClass = (module) => {
  return colors.gradients[module] || colors.gradients.home
}

// 导出模块主题色
export const getModuleColors = (module) => {
  return colors.modules[module] || colors.modules.flashcard
}

export default colors

