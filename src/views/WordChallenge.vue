<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative"
    style="background-color: #f7f8fc"
  >
    <!-- 顶部导航栏 -->
    <div class="w-full max-w-4xl mb-4 relative z-10">
      <div class="flex items-center justify-between mb-4">
        <!-- 返回首页按钮 -->
        <router-link
          to="/"
          class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 transition-all duration-200 group"
        >
          <svg
            class="w-5 h-5 text-white group-hover:text-gray-200 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </router-link>

        <!-- 进度条和倒计时 -->
        <div class="flex-1 mx-4">
          <div class="flex items-center gap-3 mb-2">
            <div class="flex-1 h-6 bg-gray-300 rounded-full overflow-hidden shadow-inner">
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-linear rounded-full"
                :style="{ width: countdownProgress + '%' }"
              ></div>
            </div>
            <div
              class="text-gray-800 text-base font-bold min-w-[3.5rem] text-right"
            >
              {{ currentWordIndex }}/{{ totalWords }}
            </div>
          </div>
          <div class="text-center text-sm text-gray-700 font-semibold">
            倒计时: {{ formatTime(timeLeft) }}
          </div>
        </div>

        <!-- 得分 -->
        <div class="text-center min-w-[4rem]">
          <div class="text-sm text-gray-700 mb-1 font-semibold">得分</div>
          <div class="text-2xl font-bold text-indigo-600">{{ score }}</div>
        </div>
      </div>
    </div>

    <!-- 游戏区域 -->
    <div
      ref="gameArea"
      class="relative w-full max-w-4xl flex-1 overflow-hidden"
      :style="{ height: gameAreaHeight + 'px' }"
    >
      <!-- 单词块组 -->
      <div
        v-for="(wordBlock, index) in wordBlocks"
        :key="wordBlock.id"
        :ref="(el) => setWordBlockRef(el, wordBlock.id)"
        class="absolute word-block"
        :class="{
          'word-block-active': isWordBlockActive(wordBlock, index),
          'word-block-masked': !isWordBlockActive(wordBlock, index),
        }"
        :style="getWordBlockStyle(wordBlock, index)"
      >
        <div class="word-block-content">
          {{ wordBlock.word }}
        </div>
      </div>

      <!-- 底部边界线 -->
      <div
        class="absolute bottom-0 left-0 right-0 h-1 bg-red-500 opacity-80"
        style="z-index: 100"
      ></div>
    </div>

    <!-- 底部选项区域 -->
    <div
      class="w-full max-w-4xl mt-4 relative z-10"
      v-if="!isGameOver && currentActiveWordBlock"
    >
      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="(option, index) in meaningOptions"
          :key="index"
          :ref="(el) => setOptionRef(el, index)"
          @click="handleOptionClick(option, index)"
          :disabled="isProcessing"
          :class="[
            'px-4 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform',
            'hover:scale-105 active:scale-95',
            wrongOptionIndex === index ? 'bg-red-50 text-gray-800 ring-2 md:ring-4 ring-red-500 animate-shake' : 'bg-white text-gray-800 shadow-lg hover:shadow-xl',
            isProcessing && 'opacity-50 cursor-not-allowed',
          ]"
        >
          <div class="text-xs text-gray-500 mb-1">
            {{ option.partOfSpeech }}
          </div>
          <div class="text-sm">{{ option.meaning }}</div>
        </button>
      </div>

      <!-- 工具按钮 -->
      <div class="flex justify-center gap-4 mt-4">
        <button
          @click="togglePause"
          class="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg"
          :title="isPaused ? '继续' : '暂停'"
        >
          <svg
            v-if="!isPaused"
            class="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <svg
            v-else
            class="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button
          class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors"
        >
          <svg
            class="w-5 h-5 text-yellow-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.448-.859a4.97 4.97 0 001.428-1.4 4.98 4.98 0 002.197-6.343 4.98 4.98 0 00-6.343-2.197 4.975 4.975 0 00-1.4 1.428c-.21.24-.518.433-.859.448a2 2 0 00-1.857 1.857c-.015.34-.208.646-.448.859a4.97 4.97 0 00-1.4 1.428 4.98 4.98 0 00-2.197 6.343 4.98 4.98 0 006.343 2.197 4.975 4.975 0 001.428-1.4c.24-.21.433-.518.448-.859H12z"
            />
          </svg>
        </button>
        <button
          class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors"
        >
          <svg
            class="w-5 h-5 text-blue-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 游戏结束弹窗 -->
    <div
      v-if="isGameOver"
      class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      @click.self="handleGameOverClick"
    >
      <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">💥</div>
          <h2 class="text-3xl font-bold text-white mb-2">挑战失败</h2>
          <p class="text-gray-300 text-lg">单词块触底了！</p>
        </div>
        <div class="mb-6 text-gray-400">
          <p>最终得分：{{ score }}</p>
          <p>消除单词数：{{ eliminatedCount }}</p>
        </div>
        <div class="flex gap-4">
          <button
            @click="restartGame"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            重新开始
          </button>
          <button
            @click="goHome"
            class="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold text-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from "vue";
import { gsap } from "gsap";
import { useRouter } from "vue-router";
import { useVocabulary } from "../composables/useVocabulary";

const router = useRouter();
const {
  loadVocabularyData,
  getSelectedWords,
  hasSelectedVocabulary,
  loadSelectedVocabulary,
} = useVocabulary();

// 游戏状态
const gameArea = ref(null);
const gameAreaHeight = ref(600);
const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024
);
const timeLeft = ref(60); // 60秒倒计时
const initialTime = ref(60); // 初始时间
const score = ref(0);
const eliminatedCount = ref(0);
const isGameOver = ref(false);
const isProcessing = ref(false);
const isPaused = ref(false); // 暂停状态
const currentActiveWordBlock = ref(null); // 当前激活的单词块（最下面的）
const meaningOptions = ref([]);
const wrongOptionIndex = ref(null); // 错误选项的索引

// 单词块
const wordBlocks = ref([]);
const wordBlockRefs = ref({});
const optionRefs = ref({});
const fallAnimation = ref(null);
const fallSpeed = ref(0.3); // 像素/帧，初始速度
const maxFallSpeed = ref(2.0); // 最大速度限制
const speedIncrement = ref(0.02); // 每次消除增加的速度
const totalWords = ref(30); // 总单词数
const currentWordIndex = ref(1); // 当前单词索引

// 使用代理模式：统一的偏移量控制所有块的运动
const globalOffsetY = ref(0); // 全局Y轴偏移量

// 游戏循环
let gameLoop = null;
let countdownTimer = null;

// 计算游戏区域高度
const updateGameAreaHeight = () => {
  if (gameArea.value) {
    // 留出顶部（返回按钮+倒计时）和底部（选项区域）空间
    const topHeight = 120;
    const bottomHeight = 200;
    const calculatedHeight = Math.max(
      400,
      window.innerHeight - topHeight - bottomHeight
    );
    gameAreaHeight.value = calculatedHeight;
  } else {
    // 如果gameArea还没准备好，使用默认值
    gameAreaHeight.value = 600;
  }
};

// 格式化时间
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

// 计算倒计时进度
const countdownProgress = computed(() => {
  if (initialTime.value === 0) return 0;
  return (timeLeft.value / initialTime.value) * 100;
});

// 设置单词块引用
const setWordBlockRef = (el, id) => {
  if (el) {
    wordBlockRefs.value[id] = el;
  } else {
    delete wordBlockRefs.value[id];
  }
};

// 设置选项引用
const setOptionRef = (el, index) => {
  if (el) {
    optionRefs.value[index] = el;
  } else {
    delete optionRefs.value[index];
  }
};

// 常量定义（在所有函数外部定义，确保一致性）
const BLOCK_HEIGHT = 90;
const BLOCK_SPACING = 5; // 减小间距
const TOTAL_SPACING = BLOCK_HEIGHT + BLOCK_SPACING; // 95

// 判断单词块是否应该是激活状态
const isWordBlockActive = (wordBlock, index) => {
  if (isGameOver.value) return false;
  
  const lastBlockIndex = wordBlocks.value.length - 1;
  
  // 如果最后一个块正在 shattering
  if (lastBlockIndex >= 0 && wordBlocks.value[lastBlockIndex].shattering) {
    // 正在 shattering 的最后一个块保持激活样式
    if (index === lastBlockIndex) return true;
    // 倒数第二个块也应该是激活的（下一个块）
    if (index === lastBlockIndex - 1 && lastBlockIndex > 0) return true;
    return false;
  }
  
  // 正常情况下，最后一个块是激活的
  return index === lastBlockIndex;
};

// 获取单词块样式
const getWordBlockStyle = (wordBlock, index) => {
  // 使用响应式宽度，在移动端和桌面端都更宽
  const blockWidth =
    windowWidth.value < 768 ? Math.min(windowWidth.value - 40, 380) : 420;

  // 实际位置 = 基础位置 + 全局偏移量
  const actualY = wordBlock.baseY + globalOffsetY.value;

  return {
    left: "50%",
    transform: "translateX(-50%)",
    top: `${actualY}px`,
    width: `${blockWidth}px`,
    height: `${BLOCK_HEIGHT}px`,
    // 最下面的单词块（最后一个）应该有最高的z-index
    zIndex: index + 1,
  };
};

// 创建单词块
const createWordBlock = (wordData, baseY = -100) => {
  // 尝试从meaning中提取词性，格式如 "n. 危险" 或 "adj. 口渴的"
  let partOfSpeech = "n.";
  let meaning = wordData.meaning;

  // 检查meaning是否包含词性前缀
  const posMatch = meaning.match(/^([a-z]+\.)\s*(.+)$/i);
  if (posMatch) {
    partOfSpeech = posMatch[1];
    meaning = posMatch[2];
  } else if (wordData.partOfSpeech) {
    partOfSpeech = wordData.partOfSpeech;
  }

  return {
    id: `word-${Date.now()}-${Math.random()}`,
    word: wordData.word,
    meaning: meaning,
    partOfSpeech: partOfSpeech,
    baseY: baseY, // 基础Y位置（固定不变）
    eliminated: false,
    shattering: false,
  };
};

// 生成错误选项
const generateWrongOptions = (correctWord, allWords) => {
  const wrongWords = allWords
    .filter((w) => {
      // 提取纯含义进行比较（去掉词性前缀）
      const wMeaning = w.meaning.replace(/^[a-z]+\.\s*/i, "");
      const correctMeaning = correctWord.meaning.replace(/^[a-z]+\.\s*/i, "");
      return wMeaning !== correctMeaning;
    })
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((w) => {
      // 提取词性和含义
      let partOfSpeech = "n.";
      let meaning = w.meaning;
      const posMatch = w.meaning.match(/^([a-z]+\.)\s*(.+)$/i);
      if (posMatch) {
        partOfSpeech = posMatch[1];
        meaning = posMatch[2];
      } else if (w.partOfSpeech) {
        partOfSpeech = w.partOfSpeech;
      }
      return {
        meaning: meaning,
        partOfSpeech: partOfSpeech,
      };
    });

  return wrongWords;
};

// 单词块选项缓存
const wordBlockOptionsCache = ref(new Map());

// 更新当前激活单词块的选项
const updateActiveWordOptions = () => {
  if (wordBlocks.value.length === 0) {
    currentActiveWordBlock.value = null;
    meaningOptions.value = [];
    return;
  }

  // 找到最下面的非消除中的单词块（从后往前找）
  let activeBlock = null;
  for (let i = wordBlocks.value.length - 1; i >= 0; i--) {
    if (!wordBlocks.value[i].shattering) {
      activeBlock = wordBlocks.value[i];
      break;
    }
  }

  if (!activeBlock) {
    currentActiveWordBlock.value = null;
    meaningOptions.value = [];
    return;
  }

  // 只有当激活的单词块改变时才更新选项
  if (
    currentActiveWordBlock.value &&
    currentActiveWordBlock.value.id === activeBlock.id
  ) {
    // 激活的单词块没有改变，不需要更新选项
    return;
  }

  currentActiveWordBlock.value = activeBlock;

  // 检查缓存中是否已有该单词块的选项
  const cacheKey = activeBlock.id;
  if (wordBlockOptionsCache.value.has(cacheKey)) {
    // 使用缓存的选项
    meaningOptions.value = wordBlockOptionsCache.value.get(cacheKey);
    return;
  }

  // 生成选项（1个正确答案 + 2个错误答案）
  const allWords = words.value;
  const wrongOptions = generateWrongOptions(activeBlock, allWords);
  const correctOption = {
    meaning: activeBlock.meaning,
    partOfSpeech: activeBlock.partOfSpeech,
  };

  // 打乱选项顺序（只生成一次）
  const options = [correctOption, ...wrongOptions].sort(
    () => Math.random() - 0.5
  );

  // 缓存选项
  wordBlockOptionsCache.value.set(cacheKey, options);
  meaningOptions.value = options;
};

// 处理选项点击（直接使用当前激活的单词块）
const handleOptionClick = async (option, optionIndex) => {
  if (isProcessing.value || !currentActiveWordBlock.value) return;

  isProcessing.value = true;

  // 比较含义（去掉词性前缀）
  const optionMeaning = option.meaning.trim();
  const correctMeaning = currentActiveWordBlock.value.meaning.trim();
  const isCorrect = optionMeaning === correctMeaning;

  if (isCorrect) {
    // 保存要消除的单词块引用
    const blockToEliminate = currentActiveWordBlock.value;
    
    // 标记为正在消除，这样游戏循环会跳过它
    blockToEliminate.shattering = true;
    
    // 更新分数和计数
    score.value += 10;
    eliminatedCount.value++;
    currentWordIndex.value++; // 增加当前单词索引

    // 提升下落速度（随着消除的块增多，速度逐渐增加）
    if (fallSpeed.value < maxFallSpeed.value) {
      fallSpeed.value = Math.min(
        fallSpeed.value + speedIncrement.value,
        maxFallSpeed.value
      );
    }

    // 立即重置处理状态，不阻塞游戏循环
    isProcessing.value = false;

    // 更新选项以匹配新的激活单词块（会跳过正在消除的块）
    updateActiveWordOptions();

    // 检查是否完成所有单词
    if (currentWordIndex.value > totalWords.value) {
      // 游戏胜利
      isGameOver.value = true;
      stopGame();
    }

    // 启动消除动画（不等待完成，让它在后台播放）
    // 动画完成后从数组中移除块
    eliminateWordBlock(blockToEliminate)
      .then(() => {
        // 动画完成后移除块
        const index = wordBlocks.value.findIndex(
          (wb) => wb.id === blockToEliminate.id
        );
        if (index !== -1) {
          wordBlocks.value.splice(index, 1);
        }
      })
      .catch(() => {
        // 如果动画出错，也要移除块
        const index = wordBlocks.value.findIndex(
          (wb) => wb.id === blockToEliminate.id
        );
        if (index !== -1) {
          wordBlocks.value.splice(index, 1);
        }
      });
  } else {
    // 匹配失败，显示错误动画
    wrongOptionIndex.value = optionIndex;
    setTimeout(() => {
      wrongOptionIndex.value = null;
      isProcessing.value = false;
    }, 500);
  }
};

// 生成随机数
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 消除单词块（破碎效果 - 参考破碎动画目录）
const eliminateWordBlock = (wordBlock) => {
  return new Promise((resolve) => {
    const blockEl = wordBlockRefs.value[wordBlock.id];
    if (!blockEl) {
      resolve();
      return;
    }

    wordBlock.shattering = true;

    // 获取块的实际位置和尺寸
    const rect = blockEl.getBoundingClientRect();
    const blockWidth = rect.width;
    const blockHeight = rect.height;

    // 获取块的内容元素
    const contentEl = blockEl.querySelector(".word-block-content");

    // 使用图片背景，碎片也使用相同的背景图片
    const backgroundImage = "url(/wall.png)";

    // 隐藏原始内容
    if (contentEl) {
      contentEl.style.display = "none";
    }

    // 创建碎片容器
    const fragmentContainer = document.createElement("div");
    fragmentContainer.className = "fragment-container";
    fragmentContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10000;
    `;
    blockEl.appendChild(fragmentContainer);

    // 碎片网格参数（参考破碎动画：5x5网格）
    const gridSize = 5;
    const fragmentWidth = blockWidth / gridSize;
    const fragmentHeight = blockHeight / gridSize;
    const totalFragments = gridSize * gridSize;

    // 创建所有碎片
    const fragments = [];
    let fragmentIndex = 0;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const fragment = document.createElement("div");
        fragment.className = "word-fragment";

        // 使用CSS clip属性创建碎片（参考破碎动画）
        const clipTop = row * fragmentHeight;
        const clipRight = (col + 1) * fragmentWidth;
        const clipBottom = (row + 1) * fragmentHeight;
        const clipLeft = col * fragmentWidth;

        // 计算背景图片的位置，使每个碎片显示对应的图片区域
        const bgX = -clipLeft;
        const bgY = -clipTop;

        fragment.style.cssText = `
          position: absolute;
          top: auto;
          left: 0;
          bottom: 0;
          width: ${blockWidth}px;
          height: ${blockHeight}px;
          background-image: ${backgroundImage};
          background-size: ${blockWidth}px ${blockHeight}px;
          background-position: ${bgX}px ${bgY}px;
          background-repeat: no-repeat;
          clip: rect(${clipTop}px, ${clipRight}px, ${clipBottom}px, ${clipLeft}px);
          color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 900;
          text-shadow: 
            0 2px 0 rgba(0, 0, 0, 0.8),
            0 4px 0 rgba(0, 0, 0, 0.7),
            0 6px 0 rgba(0, 0, 0, 0.6),
            0 8px 0 rgba(0, 0, 0, 0.5),
            0 10px 20px rgba(0, 0, 0, 0.6),
            0 15px 30px rgba(0, 0, 0, 0.5),
            2px 2px 4px rgba(0, 0, 0, 0.8),
            -1px -1px 2px rgba(0, 0, 0, 0.6);
          box-sizing: border-box;
          border-radius: 4px;
        `;

        // 添加文字内容（只显示在对应的碎片区域）
        fragment.textContent = wordBlock.word;

        fragmentContainer.appendChild(fragment);
        fragments.push(fragment);
        fragmentIndex++;
      }
    }

    // 动画所有碎片（参考破碎动画的物理效果）
    let completedFragments = 0;
    const totalFragmentsToAnimate = fragments.length;
    const animationIntervals = [];

    fragments.forEach((fragment, index) => {
      // 随机参数（参考破碎动画）
      const velocity = randomInt(90, 120); // 初始速度
      const angle = (randomInt(80, 89) * Math.PI) / 180; // 角度
      const gravity = 9.8; // 重力加速度
      const direction = [1, -1, 0][Math.floor(Math.random() * 3)]; // 方向
      const scale = randomInt(90, 110) / 100; // 缩放
      // 移除旋转，避免看起来像倾斜

      // 应用初始变换（只保留缩放，不旋转不倾斜）
      fragment.style.transform = `scale(${scale})`;

      // 动画参数（参考破碎动画：使用setInterval，每10ms更新一次）
      let time = 0;
      const maxTime = 1.5; // 最大动画时间（秒）
      const intervalTime = 10; // 10ms间隔，与参考代码一致

      const intervalId = setInterval(() => {
        if (time >= maxTime) {
          // 动画完成，移除碎片
          clearInterval(intervalId);
          if (fragment.parentNode) {
            fragment.parentNode.removeChild(fragment);
          }
          completedFragments++;
          if (completedFragments >= totalFragmentsToAnimate) {
            // 所有碎片动画完成
            if (fragmentContainer.parentNode) {
              fragmentContainer.parentNode.removeChild(fragmentContainer);
            }
            resolve();
          }
          return;
        }

        // 计算物理运动（参考破碎动画的公式）
        const horizontalVelocity = Math.cos(angle) * velocity * direction;
        const verticalVelocity =
          Math.sin(angle) * velocity - gravity * time * 10;

        // 位置计算（参考破碎动画）
        const x = horizontalVelocity * time;
        const y = verticalVelocity * time + 0.5 * gravity * time * time;

        // 应用位置（使用bottom和left，与参考代码一致）
        fragment.style.left = `${x}px`;
        fragment.style.bottom = `${y}px`;
        fragment.style.opacity = Math.max(0, 1 - time / maxTime);

        time += intervalTime / 1000; // 转换为秒
      }, intervalTime);

      animationIntervals.push(intervalId);
    });
  });
};

// 单词块下落（使用代理模式：只更新全局偏移量）
const updateWordBlocks = () => {
  if (isGameOver.value || isProcessing.value || isPaused.value) return;

  // 确保游戏区域高度有效
  if (gameAreaHeight.value <= 0) {
    updateGameAreaHeight();
    return;
  }

  // 找到之前最下面的非消除中的块ID
  let previousActiveBlockId = null;
  for (let i = wordBlocks.value.length - 1; i >= 0; i--) {
    if (!wordBlocks.value[i].shattering) {
      previousActiveBlockId = wordBlocks.value[i].id;
      break;
    }
  }

  // 只更新全局偏移量，所有块会作为一个整体一起下落
  globalOffsetY.value += fallSpeed.value;

  // 检查最下面的非消除中的单词块（最后一个）是否触底
  // 从后往前找第一个非消除中的块
  let lastBlock = null;
  for (let i = wordBlocks.value.length - 1; i >= 0; i--) {
    if (!wordBlocks.value[i].shattering) {
      lastBlock = wordBlocks.value[i];
      break;
    }
  }

  if (lastBlock) {
    const actualY = lastBlock.baseY + globalOffsetY.value;

    // 使用实际的DOM高度，而不是计算的高度
    let actualGameAreaHeight = gameAreaHeight.value;
    if (gameArea.value) {
      actualGameAreaHeight = gameArea.value.offsetHeight;
    }

    // 触底条件：单词块的底部（actualY + BLOCK_HEIGHT）到达或超过游戏区域的底部
    // 只有当单词块的底部完全到达底部边界线时才判定为触底
    // 添加一个小的容差，确保单词块真正触底
    if (actualY + BLOCK_HEIGHT >= actualGameAreaHeight - 2) {
      // 触底时播放破碎动画
      if (!lastBlock.shattering) {
        lastBlock.shattering = true;
        eliminateWordBlock(lastBlock).then(() => {
          // 动画完成后结束游戏
          isGameOver.value = true;
          stopGame();
        });
      }
    }
  }

  // 只有当激活的单词块改变时才更新选项（避免闪烁）
  // 找到当前最下面的非消除中的块
  let currentActiveBlockId = null;
  for (let i = wordBlocks.value.length - 1; i >= 0; i--) {
    if (!wordBlocks.value[i].shattering) {
      currentActiveBlockId = wordBlocks.value[i].id;
      break;
    }
  }
  if (previousActiveBlockId !== currentActiveBlockId) {
    updateActiveWordOptions();
  }
};

// 添加新单词块
const addNewWordBlock = () => {
  if (isGameOver.value || words.value.length === 0) return;

  // 随机选择一个单词
  const randomWord =
    words.value[Math.floor(Math.random() * words.value.length)];

  // 使用全局定义的常量，与初始化时保持一致

  // 计算新单词块的初始位置（在队列顶部，y值最小）
  // 新单词块应该添加在数组开头，这样它会显示在最上面
  const firstBlock = wordBlocks.value[0];

  // 使用固定的 TOTAL_SPACING 确保新块与第一个块之间的距离一致
  // 使用 baseY（基础位置），不考虑全局偏移量，因为新块会随着全局偏移一起运动
  const initialBaseY = firstBlock ? firstBlock.baseY - TOTAL_SPACING : -100;

  const newBlock = createWordBlock(randomWord, initialBaseY);
  // 添加到数组开头，这样最下面的仍然是最后一个元素（激活的）
  wordBlocks.value.unshift(newBlock);
};

// 游戏主循环
const startGameLoop = () => {
  gameLoop = setInterval(() => {
    updateWordBlocks();

    // 每隔一段时间添加新单词块
    if (Math.random() < 0.02 && wordBlocks.value.length < 5) {
      addNewWordBlock();
    }
  }, 16); // 约60fps
};

// 停止游戏
const stopGame = () => {
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

// 倒计时
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    if (isPaused.value) return; // 暂停时不减少时间
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      // 时间到，游戏结束
      isGameOver.value = true;
      stopGame();
    }
  }, 1000);
};

// 切换暂停状态
const togglePause = () => {
  if (isGameOver.value) return;
  isPaused.value = !isPaused.value;
};

// 加载单词
const words = ref([]);
const loadWords = async () => {
  try {
    loadSelectedVocabulary();
    await loadVocabularyData();

    if (!hasSelectedVocabulary.value) {
      console.error("请先选择词库");
      words.value = [
        { word: "hello", meaning: "你好", partOfSpeech: "int." },
        { word: "world", meaning: "世界", partOfSpeech: "n." },
        { word: "apple", meaning: "苹果", partOfSpeech: "n." },
        { word: "book", meaning: "书", partOfSpeech: "n." },
        { word: "cat", meaning: "猫", partOfSpeech: "n." },
        { word: "dog", meaning: "狗", partOfSpeech: "n." },
        { word: "house", meaning: "房子", partOfSpeech: "n." },
        { word: "car", meaning: "汽车", partOfSpeech: "n." },
      ];
      initGame();
      return;
    }

    const allWords = await getSelectedWords();

    if (allWords.length === 0) {
      console.error("选中的词库中没有单词");
      words.value = [
        { word: "hello", meaning: "你好", partOfSpeech: "int." },
        { word: "world", meaning: "世界", partOfSpeech: "n." },
        { word: "apple", meaning: "苹果", partOfSpeech: "n." },
        { word: "book", meaning: "书", partOfSpeech: "n." },
      ];
      initGame();
      return;
    }

    words.value = allWords;
    initGame();
  } catch (err) {
    console.error("加载词汇数据失败:", err);
    words.value = [
      { word: "hello", meaning: "你好", partOfSpeech: "int." },
      { word: "world", meaning: "世界", partOfSpeech: "n." },
      { word: "apple", meaning: "苹果", partOfSpeech: "n." },
      { word: "book", meaning: "书", partOfSpeech: "n." },
    ];
    initGame();
  }
};

// 初始化游戏
const initGame = () => {
  // 重置状态
  timeLeft.value = 60;
  initialTime.value = 60;
  score.value = 0;
  eliminatedCount.value = 0;
  currentWordIndex.value = 1;
  isGameOver.value = false;
  isProcessing.value = false;
  isPaused.value = false; // 重置暂停状态
  currentActiveWordBlock.value = null;
  meaningOptions.value = [];
  wrongOptionIndex.value = null; // 重置错误选项索引
  wordBlocks.value = [];
  wordBlockRefs.value = {};
  wordBlockOptionsCache.value.clear();
  globalOffsetY.value = 0; // 重置全局偏移量
  fallSpeed.value = 0.3; // 重置下落速度

  // 确保游戏区域高度已计算
  updateGameAreaHeight();

  // 创建初始单词块（3个）
  // 从底部向上排列，最下面的（y值最大）应该是最后一个元素（激活的）
  // 使用全局定义的常量，确保所有地方使用相同的值

  // 确保游戏区域高度有效
  if (gameAreaHeight.value <= 0) {
    gameAreaHeight.value = 600; // 使用默认值
  }

  // 重置全局偏移量（先重置，再创建）
  globalOffsetY.value = 0;

  // 最下面的单词块应该从底部上方一定距离开始，给玩家反应时间
  // 确保初始位置不会立即触底
  const safeBottomMargin = 120; // 安全边距，确保不会立即触底
  const bottomBaseY = Math.max(
    gameAreaHeight.value - BLOCK_HEIGHT - safeBottomMargin,
    BLOCK_HEIGHT + 50 // 至少距离顶部50px
  );

  // 从下往上创建单词块，确保排列正确
  // 使用固定的 TOTAL_SPACING 确保间距一致
  for (let i = 0; i < 3; i++) {
    if (words.value.length > 0) {
      const randomWord =
        words.value[Math.floor(Math.random() * words.value.length)];
      // 最下面的单词块（i=2）baseY值最大，在数组最后
      // 从底部向上排列：最下面的是 bottomBaseY，上面的是 bottomBaseY - TOTAL_SPACING, bottomBaseY - 2*TOTAL_SPACING
      const baseY = bottomBaseY - (2 - i) * TOTAL_SPACING;

      const block = createWordBlock(randomWord, baseY);
      wordBlocks.value.push(block);
    }
  }

  // 验证初始位置：确保最下面的单词块不会立即触底
  if (wordBlocks.value.length > 0) {
    const lastBlock = wordBlocks.value[wordBlocks.value.length - 1];
    const actualY = lastBlock.baseY + globalOffsetY.value;

    // 使用实际的DOM高度
    let actualGameAreaHeight = gameAreaHeight.value;
    if (gameArea.value) {
      actualGameAreaHeight = gameArea.value.offsetHeight;
    }

    // 如果初始位置就触底，调整所有块的基础位置（baseY）
    if (actualY + BLOCK_HEIGHT >= actualGameAreaHeight) {
      const adjustment = actualGameAreaHeight - (actualY + BLOCK_HEIGHT) - 50;
      // 调整所有块的基础位置，而不是全局偏移量
      wordBlocks.value.forEach((block) => {
        block.baseY += adjustment;
      });
    }
  }

  // 清空选项缓存
  wordBlockOptionsCache.value.clear();

  // 启动游戏循环和倒计时
  startGameLoop();
  startCountdown();

  // 初始化选项
  updateActiveWordOptions();
};

// 重新开始游戏
const restartGame = () => {
  stopGame();
  initGame();
};

// 返回首页
const goHome = () => {
  router.push("/");
};

// 处理游戏结束弹窗点击
const handleGameOverClick = () => {
  // 点击背景不关闭，必须点击按钮
};

// 处理窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth;
  updateGameAreaHeight();
  // 更新选项，因为单词块宽度可能改变了
  updateActiveWordOptions();
};

onMounted(() => {
  // 先更新游戏区域高度
  updateGameAreaHeight();
  // 等待DOM渲染完成后再加载单词
  nextTick(() => {
    updateGameAreaHeight();
    loadWords();
  });
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  stopGame();
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.word-block {
  transition: transform 0.1s ease-out, filter 0.4s ease-in-out, opacity 0.4s ease-in-out;
  user-select: none;
  pointer-events: none; /* 禁用点击，因为不需要点击单词块 */
}

.word-block-active {
  filter: brightness(2.4);
  opacity: 1;
}

.word-block-masked {
  cursor: not-allowed;
  filter: brightness(0.4) grayscale(0.8);
  opacity: 0.6;
}

.word-block-content {
  width: 100%;
  height: 100%;
  background-image: url("/wall.png");
  background-size: contain;
  background-position: center;
  background-repeat: repeat;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 900;
  color: #f5f5f5;
  text-shadow: 
    0 2px 0 rgba(0, 0, 0, 0.8),
    0 4px 0 rgba(0, 0, 0, 0.7),
    0 6px 0 rgba(0, 0, 0, 0.6),
    0 8px 0 rgba(0, 0, 0, 0.5),
    0 10px 20px rgba(0, 0, 0, 0.6),
    0 15px 30px rgba(0, 0, 0, 0.5),
    2px 2px 4px rgba(0, 0, 0, 0.8),
    -1px -1px 2px rgba(0, 0, 0, 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 12px;
  box-sizing: border-box;
  transition: background-color 0.4s ease-in-out, color 0.4s ease-in-out, background-image 0.4s ease-in-out;
}

.word-block-masked .word-block-content {
  background: #000000 !important;
  background-image: none !important;
  color: transparent !important;
}

.particle {
  z-index: 1000;
}

.fragment-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10000;
}

.word-fragment {
  position: absolute;
  /* 移除transition，使用JavaScript直接控制动画，避免倾斜效果 */
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

