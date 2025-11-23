<template>
  <div
    class="min-h-screen bg-gradient-to-r from-blue-50 via-white to-pink-50 py-4 md:py-8 px-4 relative overflow-hidden pattern-dots"
  >
    <!-- 装饰性背景元素 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl float-animation"></div>
      <div class="absolute bottom-20 right-10 w-56 h-56 bg-pink-400/10 rounded-full blur-3xl float-animation" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/5 rounded-full blur-3xl float-animation" style="animation-delay: 2s;"></div>
      <div class="absolute top-32 right-1/4 text-blue-300/20 text-4xl float-animation" style="animation-delay: 1.5s;">✦</div>
      <div class="absolute bottom-40 left-1/4 text-pink-300/20 text-5xl float-animation" style="animation-delay: 2.5s;">✦</div>
    </div>
    
    <div class="max-w-7xl mx-auto relative z-10">
      <!-- 游戏头部信息 -->
      <div class="glass-effect rounded-3xl shadow-xl p-2 md:p-3 mb-2 md:mb-3 border border-white/50">
        <div class="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
          <!-- 返回首页按钮 -->
          <router-link
            to="/"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 group hover:scale-110"
          >
            <svg 
              class="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </router-link>
          
          <!-- 标题和描述 -->
          <div class="flex-1 text-center px-4">
            <h2 class="text-lg md:text-xl font-bold text-gray-800 mb-0.5">
              单词连线
            </h2>
            <p class="text-xs md:text-sm text-gray-600">
              点击左边单词，然后点击右边中文进行连线匹配
            </p>
          </div>
          
          <!-- 占位元素，保持居中 -->
          <div class="w-10"></div>
        </div>
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3"
        >
          <div class="flex-1"></div>
          <div class="flex items-center gap-3 md:gap-4">
            <div class="text-center">
              <div class="text-xs text-gray-500 mb-0.5">关卡</div>
              <div class="text-xl md:text-2xl font-bold text-purple-600">
                {{ currentLevel }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-500 mb-0.5">得分</div>
              <div class="text-xl md:text-2xl font-bold text-blue-600">
                {{ score }}
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs text-gray-500 mb-0.5">进度</div>
              <div class="text-xl md:text-2xl font-bold text-green-600">
                {{ matchedCount }}/{{ totalWords }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div v-if="loading" class="text-center text-gray-500 py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
        <p class="mt-4">加载中...</p>
      </div>

      <div
        v-else-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center"
      >
        {{ error }}
      </div>

      <div v-else class="relative" ref="gameContainer">
        <!-- 闪电连线 SVG -->
        <svg
          v-if="lightningPath"
          ref="connectionSvg"
          class="absolute pointer-events-none z-20"
          :style="{
            width: '100%',
            height: '100%',
            top: '0',
            left: '0',
          }"
        >
          <!-- 外层发光效果 -->
          <path
            ref="lightningGlowRef"
            :d="lightningPath"
            class="lightning-glow"
            fill="none"
            stroke="url(#lightningGlowGradient)"
            stroke-width="8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- 主闪电路径 -->
          <path
            ref="lightningPathRef"
            :d="lightningPath"
            class="lightning-path"
            fill="none"
            stroke="url(#lightningGradient)"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- 内层高光 -->
          <path
            ref="lightningCoreRef"
            :d="lightningPath"
            class="lightning-core"
            fill="none"
            stroke="url(#lightningCoreGradient)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <defs>
            <linearGradient
              id="lightningGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" style="stop-color: #fef3c7; stop-opacity: 1" />
              <stop offset="30%" style="stop-color: #fbbf24; stop-opacity: 1" />
              <stop offset="70%" style="stop-color: #f59e0b; stop-opacity: 1" />
              <stop
                offset="100%"
                style="stop-color: #d97706; stop-opacity: 1"
              />
            </linearGradient>
            <linearGradient
              id="lightningGlowGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                style="stop-color: #fef3c7; stop-opacity: 0.4"
              />
              <stop
                offset="50%"
                style="stop-color: #fbbf24; stop-opacity: 0.5"
              />
              <stop
                offset="100%"
                style="stop-color: #f59e0b; stop-opacity: 0.4"
              />
            </linearGradient>
            <linearGradient
              id="lightningCoreGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" style="stop-color: #ffffff; stop-opacity: 1" />
              <stop offset="50%" style="stop-color: #fef3c7; stop-opacity: 1" />
              <stop
                offset="100%"
                style="stop-color: #fbbf24; stop-opacity: 1"
              />
            </linearGradient>
          </defs>
        </svg>

        <div class="grid grid-cols-2 gap-2 md:gap-8">
          <!-- 左侧：英文单词区 -->
          <div class="glass-effect rounded-3xl shadow-xl p-4 md:p-6 overflow-hidden border border-white/50">
            <div class="flex items-center mb-3 md:mb-4">
              <div
                class="text-xl md:text-3xl font-bold text-blue-600 mr-1 md:mr-2"
              >
                A
              </div>
              <h3 class="text-base md:text-2xl font-bold text-gray-800">
                单词区
              </h3>
              <div
                class="flex-1 border-b-2 border-dashed border-blue-400 ml-2 md:ml-4"
              ></div>
            </div>
            <div class="space-y-4 md:space-y-6 relative min-h-[400px] md:min-h-[500px]">
              <div
                v-for="(word, index) in leftWords"
                :key="`left-${word.id}`"
                :ref="(el) => setLeftCardRef(el, index)"
                @click="selectLeftWord(index)"
                :class="[
                  'word-card rounded-xl p-2 md:p-5 cursor-pointer',
                  word.selected
                    ? 'ring-2 md:ring-4 ring-blue-500 shadow-xl bg-blue-100'
                    : word.matched
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-gray-50 hover:bg-gray-100 shadow-md',
                ]"
              >
                <div class="text-center">
                  <div
                    class="text-sm md:text-xl font-bold text-blue-600 break-words"
                  >
                    {{ word.word }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：中文释义区 -->
          <div class="glass-effect rounded-3xl shadow-xl p-4 md:p-6 overflow-hidden border border-white/50">
            <div class="flex items-center mb-3 md:mb-4">
              <svg
                class="w-4 h-4 md:w-6 md:h-6 text-green-600 mr-1 md:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h3 class="text-base md:text-2xl font-bold text-gray-800">
                释义区
              </h3>
              <div
                class="flex-1 border-b-2 border-dashed border-green-400 ml-2 md:ml-4"
              ></div>
            </div>
            <div class="space-y-4 md:space-y-6 relative min-h-[400px] md:min-h-[500px]">
              <div
                v-for="(word, index) in rightWords"
                :key="`right-${word.id}`"
                :ref="(el) => setRightCardRef(el, index)"
                @click="selectRightWord(index)"
                :class="[
                  'word-card rounded-xl p-2 md:p-5 cursor-pointer',
                  word.selected
                    ? 'ring-2 md:ring-4 ring-green-500 shadow-xl bg-green-100'
                    : word.matched
                    ? 'opacity-0 pointer-events-none'
                    : 'bg-gray-50 hover:bg-gray-100 shadow-md',
                ]"
              >
                <div class="text-center">
                  <div
                    class="text-sm md:text-xl font-bold text-green-600 break-words"
                  >
                    {{ word.meaning }}
                  </div>
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
          @click="shuffleWords"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          :disabled="isProcessing"
        >
          打乱顺序
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { gsap } from "gsap";
import { useVocabulary } from '../composables/useVocabulary';

const { loadVocabularyData, getSelectedWords } = useVocabulary();

const words = ref([]);
const leftWords = ref([]);
const rightWords = ref([]);
const loading = ref(true);
const error = ref("");
const selectedLeftIndex = ref(null);
const selectedRightIndex = ref(null);
const score = ref(0);
const currentLevel = ref(1);
const isProcessing = ref(false);
const lightningPath = ref("");
const wordIdCounter = ref(0);
const leftCardRefs = ref([]);
const rightCardRefs = ref([]);
const lightningGlowRef = ref(null);
const lightningPathRef = ref(null);
const lightningCoreRef = ref(null);
const connectionSvg = ref(null);
const gameContainer = ref(null);
const matchedWords = ref(new Set()); // 记录已匹配的单词ID

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
    initGame();
  } catch (err) {
    error.value = "加载词汇数据失败，请检查 words.json 文件";
    console.error("加载词汇数据失败:", err);
  } finally {
    loading.value = false;
  }
};

const setLeftCardRef = (el, index) => {
  if (el) {
    leftCardRefs.value[index] = el;
  }
};

const setRightCardRef = (el, index) => {
  if (el) {
    rightCardRefs.value[index] = el;
  }
};

const initLevel = () => {
  selectedLeftIndex.value = null;
  selectedRightIndex.value = null;
  lightningPath.value = "";
  wordIdCounter.value = 0;
  matchedWords.value.clear();

  // 清理所有 GSAP 动画和样式
  gsap.killTweensOf("*");
  
  // 重置所有现有卡片的样式
  leftCardRefs.value.forEach((cardEl) => {
    if (cardEl) {
      gsap.set(cardEl, { clearProps: "all" });
    }
  });
  rightCardRefs.value.forEach((cardEl) => {
    if (cardEl) {
      gsap.set(cardEl, { clearProps: "all" });
    }
  });
  
  // 清空 refs 数组
  leftCardRefs.value = [];
  rightCardRefs.value = [];

  // 初始化单词列表（每边显示8个单词）
  const wordCount = 8;
  const shuffled = [...words.value]
    .sort(() => Math.random() - 0.5)
    .slice(0, wordCount);

  leftWords.value = shuffled.map((word, index) => ({
    id: wordIdCounter.value++,
    word: word.word,
    meaning: word.meaning,
    selected: false,
    removing: false,
    matched: false,
  }));

  // 右侧显示对应的中文，但顺序打乱
  const meanings = shuffled
    .map((w) => w.meaning)
    .sort(() => Math.random() - 0.5);
  rightWords.value = shuffled.map((word, index) => ({
    id: wordIdCounter.value++,
    word: word.word,
    meaning: meanings[index],
    selected: false,
    removing: false,
    matched: false,
  }));
};

const initGame = async () => {
  score.value = 0;
  currentLevel.value = 1;
  initLevel();
  
  // 等待 DOM 更新后执行掉落动画
  await nextTick();
  await nextTick();
  await animateWordsFalling();
};

const selectLeftWord = (index) => {
  if (isProcessing.value) return;

  const word = leftWords.value[index];
  if (word.removing || word.matched) return;

  const cardEl = leftCardRefs.value[index];
  if (!cardEl) return;

  // 如果点击的是已选中的单词，取消选择
  if (selectedLeftIndex.value === index) {
    word.selected = false;
    gsap.to(cardEl, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
    selectedLeftIndex.value = null;
    lightningPath.value = "";
    return;
  }

  // 取消之前的选择
  if (selectedLeftIndex.value !== null) {
    const prevWord = leftWords.value[selectedLeftIndex.value];
    prevWord.selected = false;
    const prevCardEl = leftCardRefs.value[selectedLeftIndex.value];
    if (prevCardEl) {
      gsap.to(prevCardEl, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }

  // 选择新的单词
  word.selected = true;
  selectedLeftIndex.value = index;
  gsap.to(cardEl, {
    scale: 1.05,
    duration: 0.3,
    ease: "power2.out",
  });

  // 更新连线路径
  setTimeout(() => {
    updateConnectionPath();
  }, 0);

  // 如果有选中的右侧单词，尝试匹配
  if (selectedRightIndex.value !== null) {
    setTimeout(() => {
      checkMatch();
    }, 100);
  }
};

const selectRightWord = (index) => {
  if (isProcessing.value) return;

  const word = rightWords.value[index];
  if (word.removing || word.matched) return;

  const cardEl = rightCardRefs.value[index];
  if (!cardEl) return;

  // 如果点击的是已选中的单词，取消选择
  if (selectedRightIndex.value === index) {
    word.selected = false;
    gsap.to(cardEl, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
    selectedRightIndex.value = null;
    lightningPath.value = "";
    return;
  }

  // 取消之前的选择
  if (selectedRightIndex.value !== null) {
    const prevWord = rightWords.value[selectedRightIndex.value];
    prevWord.selected = false;
    const prevCardEl = rightCardRefs.value[selectedRightIndex.value];
    if (prevCardEl) {
      gsap.to(prevCardEl, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }

  // 选择新的单词
  word.selected = true;
  selectedRightIndex.value = index;
  gsap.to(cardEl, {
    scale: 1.05,
    duration: 0.3,
    ease: "power2.out",
  });

  // 更新连线路径
  setTimeout(() => {
    updateConnectionPath();
  }, 0);

  // 如果有选中的左侧单词，尝试匹配
  if (selectedLeftIndex.value !== null) {
    setTimeout(() => {
      checkMatch();
    }, 100);
  }
};

const getElementPosition = (element) => {
  if (!element) return { x: 0, y: 0 };
  
  // 获取游戏容器（SVG 的父容器）
  const container = gameContainer.value;
  if (!container) return { x: 0, y: 0 };
  
  const rect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  // 计算相对于游戏容器的位置
  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2,
  };
};

const createLightningPath = (start, end) => {
  // 创建更真实的闪电路径，使用锯齿状的折线
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  const segments = Math.max(6, Math.floor(distance / 25)); // 更多分段，让闪电更曲折

  let path = `M ${start.x} ${start.y}`;

  // 生成锯齿状的闪电路径，使用直线段而不是平滑曲线
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const baseX = start.x + (end.x - start.x) * t;
    const baseY = start.y + (end.y - start.y) * t;

    // 添加更大的随机偏移，形成明显的锯齿效果
    const offsetX = (Math.random() - 0.5) * Math.min(50, distance * 0.2);
    const offsetY = (Math.random() - 0.5) * Math.min(50, distance * 0.2);

    path += ` L ${baseX + offsetX} ${baseY + offsetY}`;
  }

  path += ` L ${end.x} ${end.y}`;

  return path;
};

const updateConnectionPath = async () => {
  if (selectedLeftIndex.value === null || selectedRightIndex.value === null) {
    lightningPath.value = "";
    // 清除闪电动画
    if (lightningGlowRef.value) gsap.killTweensOf(lightningGlowRef.value);
    if (lightningPathRef.value) gsap.killTweensOf(lightningPathRef.value);
    if (lightningCoreRef.value) gsap.killTweensOf(lightningCoreRef.value);
    return;
  }

  // 等待 DOM 更新，确保元素位置已更新
  await nextTick();
  await new Promise(resolve => requestAnimationFrame(resolve));

  const leftCard = leftCardRefs.value[selectedLeftIndex.value];
  const rightCard = rightCardRefs.value[selectedRightIndex.value];

  if (leftCard && rightCard && gameContainer.value) {
    const start = getElementPosition(leftCard);
    const end = getElementPosition(rightCard);
    lightningPath.value = createLightningPath(start, end);
    
    // 使用 GSAP 实现闪电动画
    await nextTick();
    animateLightning();
  }
};

const animateLightning = () => {
  if (!lightningGlowRef.value || !lightningPathRef.value || !lightningCoreRef.value) return;

  // 设置初始状态
  gsap.set([lightningGlowRef.value, lightningPathRef.value, lightningCoreRef.value], {
    opacity: 0,
    attr: { "stroke-dasharray": "0, 2000" },
  });

  // 创建时间线动画
  const tl = gsap.timeline();

  // 外层发光动画
  tl.to(lightningGlowRef.value, {
    opacity: 0.8,
    duration: 0.05,
    attr: { "stroke-dasharray": "200, 1800" },
  })
    .to(lightningGlowRef.value, {
      opacity: 1,
      duration: 0.1,
    })
    .to(lightningGlowRef.value, {
      opacity: 0.3,
      duration: 0.05,
    })
    .to(lightningGlowRef.value, {
      opacity: 1,
      duration: 0.05,
    })
    .to(lightningGlowRef.value, {
      opacity: 0.4,
      duration: 0.05,
    })
    .to(lightningGlowRef.value, {
      opacity: 1,
      duration: 0.05,
    })
    .to(lightningGlowRef.value, {
      opacity: 0.6,
      duration: 0.1,
    })
    .to(lightningGlowRef.value, {
      opacity: 0.3,
      duration: 0.1,
    })
    .to(lightningGlowRef.value, {
      opacity: 0,
      duration: 0.2,
      attr: { "stroke-dasharray": "2000, 0" },
    });

  // 主闪电路径动画
  const mainTl = gsap.timeline();
  mainTl.to(lightningPathRef.value, {
    opacity: 1,
    duration: 0.02,
    attr: { "stroke-dasharray": "200, 1800" },
  })
    .to(lightningPathRef.value, {
      opacity: 0.2,
      duration: 0.06,
    })
    .to(lightningPathRef.value, {
      opacity: 1,
      duration: 0.04,
    })
    .to(lightningPathRef.value, {
      opacity: 0.3,
      duration: 0.06,
    })
    .to(lightningPathRef.value, {
      opacity: 1,
      duration: 0.04,
    })
    .to(lightningPathRef.value, {
      opacity: 0.8,
      duration: 0.1,
    })
    .to(lightningPathRef.value, {
      opacity: 0.4,
      duration: 0.1,
    })
    .to(lightningPathRef.value, {
      opacity: 0.2,
      duration: 0.1,
    })
    .to(lightningPathRef.value, {
      opacity: 0,
      duration: 0.2,
      attr: { "stroke-dasharray": "2000, 0" },
    });

  // 内层高光动画
  const coreTl = gsap.timeline();
  coreTl.to(lightningCoreRef.value, {
    opacity: 1,
    duration: 0.03,
    attr: { "stroke-dasharray": "200, 1800" },
  })
    .to(lightningCoreRef.value, {
      opacity: 0.1,
      duration: 0.07,
    })
    .to(lightningCoreRef.value, {
      opacity: 1,
      duration: 0.05,
    })
    .to(lightningCoreRef.value, {
      opacity: 0.2,
      duration: 0.05,
    })
    .to(lightningCoreRef.value, {
      opacity: 1,
      duration: 0.05,
    })
    .to(lightningCoreRef.value, {
      opacity: 0.7,
      duration: 0.1,
    })
    .to(lightningCoreRef.value, {
      opacity: 0.3,
      duration: 0.1,
    })
    .to(lightningCoreRef.value, {
      opacity: 0,
      duration: 0.25,
      attr: { "stroke-dasharray": "2000, 0" },
    });
};

const checkMatch = async () => {
  if (selectedLeftIndex.value === null || selectedRightIndex.value === null) {
    return;
  }

  const leftWord = leftWords.value[selectedLeftIndex.value];
  const rightWord = rightWords.value[selectedRightIndex.value];

  // 如果已经匹配过，忽略
  if (leftWord.matched || rightWord.matched) {
    return;
  }

  // 更新连线路径
  await new Promise((resolve) => requestAnimationFrame(resolve));
  updateConnectionPath();

  // 检查是否匹配（左侧英文单词的 meaning 应该等于右侧中文的 meaning）
  if (leftWord.meaning === rightWord.meaning) {
    // 匹配成功
    isProcessing.value = true;

    // 等待一下让用户看到连线
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 增加得分
    score.value += 10 * currentLevel.value;

    // 标记为已匹配
    leftWord.matched = true;
    rightWord.matched = true;
    matchedWords.value.add(leftWord.id);
    matchedWords.value.add(rightWord.id);

    // 使用 GSAP 实现移除动画
    const leftCardEl = leftCardRefs.value[selectedLeftIndex.value];
    const rightCardEl = rightCardRefs.value[selectedRightIndex.value];

    if (leftCardEl && rightCardEl) {
      const removeTl = gsap.timeline();
      removeTl.to([leftCardEl, rightCardEl], {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
      await removeTl;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // 清除连线
    lightningPath.value = "";

    // 清除选择
    selectedLeftIndex.value = null;
    selectedRightIndex.value = null;

    // 等待状态更新
    await nextTick();

    // 检查是否所有单词都匹配完成
    const leftMatched = leftWords.value.every((w) => w.matched);
    const rightMatched = rightWords.value.every((w) => w.matched);
    const allMatched = leftMatched && rightMatched;
    
    if (allMatched) {
      // 所有单词匹配完成，进入下一关
      isProcessing.value = false; // 先释放处理锁
      await nextLevel();
      return; // 提前返回，避免再次设置 isProcessing
    }

    isProcessing.value = false;
  } else {
    // 不匹配，清除选择
    await new Promise((resolve) => setTimeout(resolve, 500));
    leftWord.selected = false;
    rightWord.selected = false;
    selectedLeftIndex.value = null;
    selectedRightIndex.value = null;
    lightningPath.value = "";
  }
};

const animateWordsFalling = async () => {
  // 等待 DOM 渲染完成
  await nextTick();
  await nextTick();
  
  // 立即设置所有卡片的初始样式，防止闪现
  const leftContainer = document.querySelector(".grid > div:first-child .space-y-2");
  let startY = -300; // 默认起始位置
  if (leftContainer) {
    const containerRect = leftContainer.getBoundingClientRect();
    startY = -containerRect.height - 150;
  }

  // 立即隐藏所有卡片，防止闪现
  leftCardRefs.value.forEach((cardEl) => {
    if (cardEl) {
      gsap.set(cardEl, {
        y: startY,
        opacity: 0,
        scale: 0.8,
        rotation: -5 + Math.random() * 10,
      });
    }
  });
  rightCardRefs.value.forEach((cardEl) => {
    if (cardEl) {
      gsap.set(cardEl, {
        y: startY,
        opacity: 0,
        scale: 0.8,
        rotation: -5 + Math.random() * 10,
      });
    }
  });

  // 等待一帧确保样式已应用
  await new Promise((resolve) => requestAnimationFrame(resolve));

  // 为所有左侧单词添加掉落动画
  const leftAnimations = [];
  leftCardRefs.value.forEach((cardEl, index) => {
    if (cardEl) {
      // 创建掉落动画，错开时间
      const delay = index * 0.08; // 每个单词延迟 0.08 秒
      const tl = gsap.to(cardEl, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.7,
        delay: delay,
        ease: "back.out(1.5)", // 弹性效果
      });
      leftAnimations.push(tl);
    }
  });

  // 为所有右侧单词添加掉落动画
  const rightAnimations = [];
  rightCardRefs.value.forEach((cardEl, index) => {
    if (cardEl) {
      // 创建掉落动画，错开时间
      const delay = index * 0.08; // 每个单词延迟 0.08 秒
      const tl = gsap.to(cardEl, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.7,
        delay: delay,
        ease: "back.out(1.5)", // 弹性效果
      });
      rightAnimations.push(tl);
    }
  });

  // 等待所有动画完成
  const maxDelay = Math.max(leftCardRefs.value.length, rightCardRefs.value.length) * 0.08;
  await new Promise((resolve) => setTimeout(resolve, (maxDelay + 0.7) * 1000));
};

const nextLevel = async () => {
  // 显示完成提示，等待动画完成
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // 清理所有 GSAP 动画
  gsap.killTweensOf("*");
  
  // 重置所有卡片的 GSAP 样式
  leftCardRefs.value.forEach((cardEl) => {
    if (cardEl) {
      gsap.set(cardEl, { clearProps: "all" });
    }
  });
  rightCardRefs.value.forEach((cardEl) => {
    if (cardEl) {
      gsap.set(cardEl, { clearProps: "all" });
    }
  });
  
  // 进入下一关
  currentLevel.value++;
  
  // 等待一帧确保状态更新
  await nextTick();
  
  // 初始化新关卡
  initLevel();
  
  // 立即执行掉落动画（会在动画函数内部处理初始隐藏）
  await animateWordsFalling();
};

const matchedCount = computed(() => {
  return matchedWords.value.size / 2; // 每对匹配包含2个单词
});

const totalWords = computed(() => {
  return leftWords.value.length;
});

const shuffleWords = () => {
  if (isProcessing.value) return;

  // 打乱右侧单词的顺序
  const meanings = rightWords.value.map((w) => w.meaning);
  meanings.sort(() => Math.random() - 0.5);

  rightWords.value.forEach((word, index) => {
    word.meaning = meanings[index];
    word.selected = false;
  });

  // 清除选择
  selectedLeftIndex.value = null;
  selectedRightIndex.value = null;
  lightningPath.value = "";
};

const restartGame = async () => {
  // 清理所有 GSAP 动画
  gsap.killTweensOf("*");
  
  score.value = 0;
  currentLevel.value = 1;
  initLevel();
  
  // 等待 DOM 更新后执行掉落动画
  await nextTick();
  await nextTick();
  await animateWordsFalling();
};

// 监听窗口大小变化，更新连线路径
const handleResize = () => {
  if (selectedLeftIndex.value !== null && selectedRightIndex.value !== null) {
    updateConnectionPath();
  }
};

onMounted(() => {
  loadWords();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  // 清理所有 GSAP 动画
  gsap.killTweensOf("*");
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.word-card {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  will-change: transform, opacity;
}


/* 闪电 SVG 样式 */
.lightning-glow {
  filter: blur(5px);
}

.lightning-path {
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 1))
    drop-shadow(0 0 8px rgba(251, 191, 36, 0.9));
}

.lightning-core {
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 1));
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .word-card {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
