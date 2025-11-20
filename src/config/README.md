# 颜色配置说明

## 概述

项目使用统一的颜色管理系统，所有颜色定义在 `src/config/colors.js` 文件中。

## 使用方法

### 1. 导入颜色配置

```javascript
import { getGradientClass, getModuleColors, colors } from '../config/colors'
```

### 2. 获取模块颜色

```javascript
const moduleColors = getModuleColors('learning') // 获取单词学习模块的颜色
```

### 3. 获取渐变色类名

```javascript
const gradientClass = computed(() => getGradientClass('home'))
```

### 4. 在模板中使用

```vue
<template>
  <!-- 使用内联样式 -->
  <div :style="{ backgroundColor: moduleColors.primary }">
    内容
  </div>
  
  <!-- 使用渐变色 -->
  <div 
    :style="{ background: `linear-gradient(to right, ${moduleColors.gradientFrom}, ${moduleColors.gradientTo})` }"
  >
    内容
  </div>
</template>
```

## 颜色结构

### 主题色
- `primary`: 主色调（蓝色系）
- `secondary`: 辅助色（紫色系）
- `success`: 成功色（绿色系）
- `warning`: 警告色（橙色系）
- `error`: 错误色（红色系）
- `gray`: 中性色（灰色系）

### 模块颜色
每个模块都有独立的颜色配置：
- `learning`: 单词学习模块
- `match`: 单词消消乐模块
- `connect`: 单词连线模块
- `colorBlind`: 测色盲游戏模块

### 通用颜色
- `common.white`: 白色
- `common.black`: 黑色
- `common.text`: 文本颜色
- `common.border`: 边框颜色
- `common.shadow`: 阴影样式

## 修改颜色

如需修改颜色，请编辑 `src/config/colors.js` 文件，所有模块的颜色会自动更新。

