<template>
  <div
    :class="`min-h-screen bg-gradient-to-br ${gradientClass} py-4 md:py-8 px-4`"
  >
    <div class="max-w-md mx-auto">
      <!-- 游戏头部信息 -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500">
        <!-- 顶部装饰条 -->
        <div class="h-2 bg-gradient-to-r from-green-500 to-indigo-600"></div>
        
        <!-- 游戏标题区域 -->
        <div class="p-6 text-center">
          <h2 class="text-[clamp(1.8rem,5vw,2.5rem)] font-bold text-gray-800 mb-2">
            单词找茬
          </h2>
          <p class="text-gray-500 text-sm md:text-base italic">
            找到颜色不一样的方块，点击它进入下一关
          </p>
        </div>
        
        <!-- 关卡与得分信息区 -->
        <div class="bg-gray-50 rounded-xl mx-6 p-4 flex justify-between items-center mb-6">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <div>
              <p class="text-xs text-gray-500">当前关卡</p>
              <p class="text-xl font-bold text-indigo-600">第 {{ currentLevel }} 关</p>
            </div>
          </div>
          
          <div class="h-8 w-px bg-gray-200"></div>
          
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <div>
              <p class="text-xs text-gray-500">得分</p>
              <p class="text-xl font-bold text-yellow-500">{{ score }}</p>
            </div>
          </div>
        </div>
        
        <!-- 难度选择区域 -->
        <div class="px-6 pb-8">
          <p class="text-gray-600 font-medium mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            游戏难度
          </p>
          
          <div class="grid grid-cols-3 gap-3">
            <button
              @click="setDifficulty('easy')"
              :class="[
                'py-3 px-2 rounded-xl font-medium text-sm md:text-base shadow-md flex items-center justify-center gap-1 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                difficulty === 'easy'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              初级
            </button>
            <button
              @click="setDifficulty('medium')"
              :class="[
                'py-3 px-2 rounded-xl font-medium text-sm md:text-base shadow-md flex items-center justify-center gap-1 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                difficulty === 'medium'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              中级
            </button>
            <button
              @click="setDifficulty('hard')"
              :class="[
                'py-3 px-2 rounded-xl font-medium text-sm md:text-base shadow-md flex items-center justify-center gap-1 transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                difficulty === 'hard'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              ]"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              高级
            </button>
          </div>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div v-if="loading" class="text-center text-gray-500 py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
          :style="{ borderColor: moduleColors.primary }"
        ></div>
        <p class="mt-4">加载中...</p>
      </div>

      <div
        v-else-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center"
      >
        {{ error }}
      </div>

      <div v-else class="bg-white rounded-2xl shadow-lg p-4 md:p-8">
        <!-- 关卡横幅 -->
        <div class="relative mb-6 md:mb-8">
          <div
            class="rounded-lg px-6 py-3 text-center shadow-md"
            :style="{ background: `linear-gradient(to right, ${moduleColors.bannerFrom}, ${moduleColors.bannerTo})` }"
          >
            <div class="text-white text-xl md:text-2xl font-bold">
              第 {{ currentLevel }} 关
            </div>
          </div>
        </div>

        <!-- 游戏网格 -->
        <div
          class="grid"
          :style="{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gap: gridGap,
          }"
        >
          <div
            v-for="(tile, index) in tiles"
            :key="index"
            @click="handleTileClick(index)"
            :class="[
              'tile-card rounded-xl cursor-pointer transform transition-all duration-300 shadow-md hover:shadow-xl',
              tile.clicked && tile.isCorrect
                ? 'ring-2 md:ring-4 ring-green-500 scale-105'
                : 'hover:scale-105',
              tile.clicked && !tile.isCorrect
                ? 'ring-2 md:ring-4 ring-red-500 animate-shake'
                : '',
            ]"
            :style="{
              backgroundColor: tile.color,
              padding: tilePadding,
            }"
          >
            <div class="text-center w-full h-full flex items-center justify-center" style="min-height: 0;">
              <div class="flex flex-col items-center justify-center w-full px-1">
                <div
                  class="font-bold text-white w-full flex items-center justify-center"
                  :style="{ 
                    fontSize: wordFontSize,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    lineHeight: '1.2',
                  }"
                >
                  <span
                    :ref="el => setWordRef(el, index)"
                    :style="getWordScaleStyle(index)"
                  >
                    {{ tile.word }}
                  </span>
                </div>
                <div
                  class="text-white break-words leading-tight mt-1 w-full overflow-hidden"
                  :style="getMeaningStyle()"
                >
                  {{ tile.meaning }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏控制按钮 -->
      <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="restartGame"
          class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
        >
          重新开始
        </button>
        <button
          @click="nextLevel"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          :disabled="!canSkip"
        >
          跳过本关
        </button>
      </div>

    </div>

    <!-- 成功提示弹窗 -->
    <div
      v-if="showSuccess"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="hideSuccess"
    >
      <div
        class="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full mx-4 text-center transform transition-all"
        @click.stop
      >
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">恭喜过关！</h3>
        <p class="text-gray-600 mb-6">你找到了颜色不同的方块</p>
        <button
          @click="hideSuccess"
          class="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
        >
          继续下一关
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { getGradientClass, getModuleColors } from '../config/colors';
import { useVocabulary } from '../composables/useVocabulary';

const { loadVocabularyData, getSelectedWords } = useVocabulary();

const gradientClass = computed(() => getGradientClass('spot'));
const moduleColors = getModuleColors('spot');

const words = ref([]);
const tiles = ref([]);
const loading = ref(true);
const error = ref("");
const currentLevel = ref(1);
const score = ref(0);
const showSuccess = ref(false);
const canSkip = ref(false);
const wordRefs = ref({});
const wordScales = ref({});
const difficulty = ref('easy'); // 'easy', 'medium', 'hard'

// 根据关卡计算网格大小
const gridSize = computed(() => {
  if (currentLevel.value <= 3) return 2;
  if (currentLevel.value <= 8) return 3;
  if (currentLevel.value <= 15) return 4;
  if (currentLevel.value <= 25) return 5;
  return 6;
});

// 根据网格大小动态调整内边距
const tilePadding = computed(() => {
  const size = gridSize.value;
  if (size <= 2) return '1rem 1.25rem'; // p-4 p-5
  if (size <= 3) return '0.75rem 1rem'; // p-3 p-4
  if (size <= 4) return '0.5rem 0.75rem'; // p-2 p-3
  if (size <= 5) return '0.375rem 0.5rem'; // p-1.5 p-2
  return '0.25rem 0.375rem'; // p-1 p-1.5
});

// 根据网格大小动态调整单词字体大小
const wordFontSize = computed(() => {
  const size = gridSize.value;
  if (size <= 2) return '1.25rem'; // text-xl
  if (size <= 3) return '1rem'; // text-base
  if (size <= 4) return '0.875rem'; // text-sm
  if (size <= 5) return '0.75rem'; // text-xs
  return '0.625rem'; // 更小
});

// 根据网格大小动态调整中文含义字体大小
const meaningFontSize = computed(() => {
  const size = gridSize.value;
  if (size <= 2) return '0.875rem'; // text-sm
  if (size <= 3) return '0.75rem'; // text-xs
  if (size <= 4) return '0.625rem';
  if (size <= 5) return '0.5rem';
  return '0.4375rem'; // 更小
});

// 根据网格大小动态调整网格间距
const gridGap = computed(() => {
  const size = gridSize.value;
  if (size <= 2) return '0.75rem'; // gap-3
  if (size <= 3) return '0.5rem'; // gap-2
  if (size <= 4) return '0.375rem'; // gap-1.5
  if (size <= 5) return '0.25rem'; // gap-1
  return '0.125rem'; // gap-0.5
});

// 获取中文含义的样式
const getMeaningStyle = () => {
  const size = gridSize.value;
  const baseStyle = {
    fontSize: meaningFontSize.value,
  };
  
  // 根据网格大小决定显示的行数
  let maxLines = 3;
  if (size <= 2) {
    maxLines = 3; // 2x2网格显示3行
  } else if (size <= 3) {
    maxLines = 2; // 3x3网格显示2行
  } else if (size <= 4) {
    maxLines = 2; // 4x4网格显示2行
  } else {
    maxLines = 2; // 5x5及以上显示2行
  }
  
  return {
    ...baseStyle,
    display: '-webkit-box',
    WebkitLineClamp: maxLines.toString(),
    WebkitBoxOrient: 'vertical',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    lineHeight: '1.4',
    textAlign: 'center',
  };
};

// 设置单词元素的ref
const setWordRef = (el, index) => {
  if (el) {
    wordRefs.value[index] = el;
    // 计算缩放比例
    nextTick(() => {
      calculateWordScale(index);
    });
  }
};

// 计算单词的缩放比例
const calculateWordScale = (index) => {
  const wordEl = wordRefs.value[index];
  if (!wordEl) return;
  
  // 获取包含单词的div容器（直接父元素）
  const container = wordEl.parentElement;
  if (!container) return;
  
  // 获取容器的实际可用宽度（减去padding）
  const containerStyle = getComputedStyle(container);
  const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
  const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
  const containerWidth = container.clientWidth - paddingLeft - paddingRight;
  
  // 临时移除transform来获取真实宽度
  const originalTransform = wordEl.style.transform;
  wordEl.style.transform = 'scale(1)';
  wordEl.style.display = 'inline-block';
  const wordWidth = wordEl.scrollWidth;
  wordEl.style.transform = originalTransform;
  
  if (wordWidth > containerWidth && containerWidth > 0) {
    const scale = containerWidth / wordWidth;
    wordScales.value[index] = Math.min(1, Math.max(0.4, scale)); // 最小缩放到40%
  } else {
    wordScales.value[index] = 1;
  }
};

// 获取单词的缩放样式
const getWordScaleStyle = (index) => {
  const scale = wordScales.value[index] || 1;
  return {
    display: 'inline-block',
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    lineHeight: '1.2',
    verticalAlign: 'middle',
    textAlign: 'center',
  };
};


// 将RGB转换为HSL
const rgbToHsl = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
};

// 将HSL转换为RGB
const hslToRgb = (h, s, l) => {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// 将十六进制颜色转换为RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
};

// 将RGB转换为十六进制
const rgbToHex = (r, g, b) => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

// 生成细微颜色差异
const generateSubtleColor = (baseColor, level) => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return baseColor;
  
  const [h, s, l] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  
  // 根据难度和关卡调整差异程度
  let hueDiff, lightnessDiff;
  const diff = difficulty.value;
  
  // 根据难度设置基础差异值（已调低难度，增加颜色差异）
  let baseHueDiff, baseLightnessDiff;
  if (diff === 'easy') {
    // 初级：差异很大，非常容易识别
    baseHueDiff = 15;
    baseLightnessDiff = 10;
  } else if (diff === 'medium') {
    // 中级：中等差异，较容易识别
    baseHueDiff = 10;
    baseLightnessDiff = 6;
  } else {
    // 高级：差异较小，有一定挑战性
    baseHueDiff = 6;
    baseLightnessDiff = 4;
  }
  
  // 根据关卡进一步调整：关卡越高，差异越小（但保持最小差异）
  let levelMultiplier;
  if (level <= 10) {
    levelMultiplier = 1.0;
  } else if (level <= 20) {
    levelMultiplier = 0.85; // 从 0.7 提高到 0.85
  } else if (level <= 30) {
    levelMultiplier = 0.7; // 从 0.5 提高到 0.7
  } else {
    levelMultiplier = 0.5; // 从 0.3 提高到 0.5
  }
  
  hueDiff = baseHueDiff * levelMultiplier + Math.random() * (baseHueDiff * 0.3);
  lightnessDiff = baseLightnessDiff * levelMultiplier + Math.random() * (baseLightnessDiff * 0.3);
  
  // 随机选择是调整色相还是亮度
  const adjustHue = Math.random() > 0.5;
  
  let newH = h, newS = s, newL = l;
  if (adjustHue) {
    newH = (h + (Math.random() > 0.5 ? hueDiff : -hueDiff) + 360) % 360;
  } else {
    newL = Math.max(0, Math.min(100, l + (Math.random() > 0.5 ? lightnessDiff : -lightnessDiff)));
  }
  
  const [r, g, b] = hslToRgb(newH, newS, newL);
  return rgbToHex(r, g, b);
};

// 基础颜色（使用柔和的颜色）
const baseColors = [
  "#86efac", // 浅绿色
  "#a5b4fc", // 浅紫色
  "#fbbf24", // 浅黄色
  "#fb7185", // 浅粉色
  "#60a5fa", // 浅蓝色
  "#34d399", // 青绿色
  "#f472b6", // 粉红色
  "#a78bfa", // 淡紫色
  "#4ade80", // 绿色
  "#38bdf8", // 天蓝色
  "#f87171", // 浅红色
  "#c084fc", // 淡紫色
];

// 获取颜色方案（根据关卡动态生成）
const getColorScheme = (level) => {
  const baseColor = baseColors[Math.floor(Math.random() * baseColors.length)];
  const differentColor = generateSubtleColor(baseColor, level);
  return {
    normal: baseColor,
    different: differentColor,
  };
};

const loadWords = async () => {
  try {
    loading.value = true;
    await loadVocabularyData();
    const wordData = await getSelectedWords();
    
    if (wordData.length === 0) {
      error.value = "请先选择词库";
      return;
    }
    
    words.value = wordData;
    initLevel();
  } catch (err) {
    error.value = "加载词汇数据失败，请检查 words.json 文件";
    console.error("加载词汇数据失败:", err);
  } finally {
    loading.value = false;
  }
};

const initLevel = () => {
  const totalTiles = gridSize.value * gridSize.value;
  const correctIndex = Math.floor(Math.random() * totalTiles);
  
  // 随机选择一个单词
  const randomWord = words.value[Math.floor(Math.random() * words.value.length)];
  
  // 根据关卡获取颜色方案（难度越高，颜色差异越小）
  const colorScheme = getColorScheme(currentLevel.value);
  
  // 创建方块数组
  tiles.value = [];
  for (let i = 0; i < totalTiles; i++) {
    tiles.value.push({
      word: randomWord.word,
      meaning: randomWord.meaning,
      color: i === correctIndex ? colorScheme.different : colorScheme.normal,
      isCorrect: i === correctIndex,
      clicked: false,
    });
  }
  
  // 打乱顺序
  tiles.value.sort(() => Math.random() - 0.5);
  
  // 重置缩放
  wordScales.value = {};
  wordRefs.value = {};
  
  // 等待DOM更新后重新计算所有单词的缩放
  nextTick(() => {
    tiles.value.forEach((_, index) => {
      calculateWordScale(index);
    });
  });
  
  canSkip.value = false;
  setTimeout(() => {
    canSkip.value = true;
  }, 2000);
};

const handleTileClick = (index) => {
  if (showSuccess.value) return;
  
  const tile = tiles.value[index];
  tile.clicked = true;
  
  if (tile.isCorrect) {
    // 正确
    score.value += 10 * currentLevel.value;
    
    // 只在难度提升时显示弹窗提示
    // 难度提升关卡：4(3x3), 9(4x4), 16(5x5), 26(6x6)
    const nextGridSize = currentLevel.value + 1 <= 3 ? 2 :
                         currentLevel.value + 1 <= 8 ? 3 :
                         currentLevel.value + 1 <= 15 ? 4 :
                         currentLevel.value + 1 <= 25 ? 5 : 6;
    const currentGridSize = gridSize.value;
    const isDifficultyIncrease = nextGridSize > currentGridSize;
    
    const shouldShowPopup = isDifficultyIncrease; // 只在难度提升时显示
    
    if (shouldShowPopup) {
      showSuccess.value = true;
    } else {
      // 直接进入下一关，不显示弹窗
      setTimeout(() => {
        currentLevel.value++;
        initLevel();
      }, 300);
    }
  } else {
    // 错误，显示错误动画
    setTimeout(() => {
      tile.clicked = false;
    }, 500);
  }
};

const hideSuccess = () => {
  showSuccess.value = false;
  currentLevel.value++;
  initLevel();
};

const nextLevel = () => {
  if (!canSkip.value) return;
  currentLevel.value++;
  initLevel();
};

const restartGame = () => {
  currentLevel.value = 1;
  score.value = 0;
  showSuccess.value = false;
  initLevel();
};

// 设置游戏难度
const setDifficulty = (level) => {
  difficulty.value = level;
  // 重新初始化当前关卡，让新难度立即生效
  initLevel();
};

// 监听窗口大小变化，重新计算缩放
const handleResize = () => {
  tiles.value.forEach((_, index) => {
    calculateWordScale(index);
  });
};

onMounted(() => {
  loadWords();
  window.addEventListener('resize', handleResize);
});
</script>

<style scoped>
.tile-card {
  aspect-ratio: 1;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

.animate-shake {
  animation: shake 0.5s;
}

</style>

