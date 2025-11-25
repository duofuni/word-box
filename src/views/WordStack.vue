<template>
  <div
    v-if="step !== 2 || !win"
    class="box"
    :style="{
      backgroundImage: `url(${baseUrl}word-stack-bg.jpg)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
    }"
  >
    <!-- 游戏标题和统计信息 -->
    <div class="w-full max-w-6xl mb-4 mx-auto px-4 pt-4">
      <div class="flex items-center justify-between mb-2">
        <!-- 返回首页按钮 -->
        <router-link
          to="/"
          class="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200 group"
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

        <!-- 标题 -->
        <div class="flex-1 text-center px-4">
          <h1 class="bubble-title">词了个词</h1>
        </div>

        <!-- 占位元素，保持居中 -->
        <div class="w-10"></div>
      </div>
      <div class="flex justify-end items-center text-white">
        <div class="flex gap-4 md:gap-6">
          <div class="text-center">
            <div class="text-xs md:text-sm text-gray-400 mb-1">关卡</div>
            <div class="text-xl md:text-2xl font-bold text-blue-400">
              {{ level }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="w-full max-w-6xl mb-4 mx-auto px-4">
      <div
        class="bg-red-900/50 border border-red-500 rounded-lg p-6 text-center"
      >
        <div class="text-red-400 text-lg font-semibold mb-2">{{ error }}</div>
        <router-link
          to="/word-select"
          class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          去选择词库
        </router-link>
      </div>
    </div>

    <!-- 游戏区域 -->
    <div
      v-else
      class="card-wrap"
      :class="{ locked: isLocked }"
      :style="cardWrapStyle"
    >
      <div
        v-for="item in cardItemList"
        :key="item.key"
        :class="{ 'item-cover': item.cover }"
        class="card-item"
        :style="item.style"
        @click="clickCard(item)"
      >
        <div class="card-content">
          <span v-if="item.type === 'word'">{{ item.word }}</span>
          <span v-else-if="item.type === 'meaning'">{{ item.meaning }}</span>
          <span v-else-if="item.type === 'emoji'" class="emoji-display">{{
            item.emoji || item.image || "❓"
          }}</span>
        </div>
      </div>
      
      <!-- 选中块的背景容器 - 显示7个空槽位 -->
      <div 
        class="selected-cards-background"
        :style="selectedCardsBackgroundStyle"
      >
        <div class="selected-slots-container">
          <div
            v-for="index in 7"
            :key="index"
            class="selected-slot"
            :style="getSelectedSlotStyle(false)"
          ></div>
        </div>
      </div>
      
      <div
        v-for="item in penddingList"
        :key="item.key"
        class="card-item selected-card"
        :style="item.style"
      >
        <div class="card-content">
          <span v-if="item.type === 'word'">{{ item.word }}</span>
          <span v-else-if="item.type === 'meaning'">{{ item.meaning }}</span>
          <span v-else-if="item.type === 'emoji'" class="emoji-display">{{
            item.emoji || item.image || "❓"
          }}</span>
        </div>
      </div>
      <div
        v-for="item in clearList"
        :key="item.key"
        class="card-item clear-item selected-card"
        :style="item.style"
      >
        <div class="card-content">
          <span v-if="item.type === 'word'">{{ item.word }}</span>
          <span v-else-if="item.type === 'meaning'">{{ item.meaning }}</span>
          <span v-else-if="item.type === 'emoji'" class="emoji-display">{{
            item.emoji || item.image || "❓"
          }}</span>
        </div>
      </div>
      <div
        v-for="item in saveList"
        :key="item.key"
        class="card-item selected-card"
        :style="item.style"
        @click="clickSaveCard(item)"
      >
        <div class="card-content">
          <span v-if="item.type === 'word'">{{ item.word }}</span>
          <span v-else-if="item.type === 'meaning'">{{ item.meaning }}</span>
          <span v-else-if="item.type === 'emoji'" class="emoji-display">{{
            item.emoji || item.image || "❓"
          }}</span>
        </div>
      </div>
    </div>
    <div class="tools">
      道具：
      <button :disabled="!tools.save" @click="saveCard">取出3个卡片</button>
      <button :disabled="!tools.rand" @click="randCard">随机</button>
      <button @click="rePlay">再来一轮</button>
    </div>

    <!-- 关卡完成弹窗 -->
    <div
      v-if="showLevelComplete"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="handleLevelCompleteClick"
    >
      <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-3xl font-bold text-white mb-2">关卡完成！</h2>
          <p class="text-gray-300 text-lg">恭喜完成第 {{ level }} 关</p>
        </div>
        <button
          @click="confirmNextLevel"
          class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          进入下一关
        </button>
      </div>
    </div>

    <!-- 游戏结束弹窗 -->
    <div
      v-if="showGameOver"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="handleGameOverClick"
    >
      <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div class="mb-6">
          <div class="text-6xl mb-4">😢</div>
          <h2 class="text-3xl font-bold text-white mb-2">游戏结束</h2>
          <p class="text-gray-300 text-lg">存储区已满，游戏失败</p>
        </div>
        <button
          @click="confirmRestart"
          class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          重新开始
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useVocabulary } from "../composables/useVocabulary";
import { enhanceWordsWithEmoji } from "../composables/useEmoji";

// CardItem类 - 管理卡片的基本属性和样式
class CardItem {
  static x = 41;
  static y = 41;

  constructor({ x, y, z, key, wordData, type }) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.key = key;
    this.word = wordData.word;
    this.meaning = wordData.meaning;
    this.emoji = wordData.emoji || wordData.image || null;
    this.type = type; // 'word', 'meaning', or 'emoji'
    const offset = z * 0;
    // 统一为正方形，使用 width 的值作为边长
    // 缩小8像素：CardItem.x * 2 - 2 - 8 = CardItem.x * 2 - 10
    const cardSize = CardItem.x * 2 - 10;
    this.style = {
      top: y * CardItem.y + offset + "px",
      left: x * CardItem.x + offset + "px",
      width: cardSize + "px",
      height: cardSize + "px",
    };
    // 颜色统一由 CSS 中的 .card-item 类控制
  }
}

export default {
  data() {
    return {
      baseUrl: import.meta.env.BASE_URL,
      option: {
        x: 4,
        y: 5,
        z: 8,
        cardRandom: 0.2,
      },
      step: 0,
      win: false,
      cardMap: [],
      cardItemList: [],
      penddingList: [],
      clearList: [],
      saveList: [],
      calcValueList: [],
      xUnit: 0,
      yUnit: 0,
      tools: {
        save: true,
        rand: true,
      },
      timer: 0,
      words: [],
      error: "",
      level: 1,
      showGameOver: false,
      showLevelComplete: false,
      vocabulary: null,
      isLocked: false,
    };
  },
  computed: {
    cardWrapStyle() {
      const calculatedWidth = (this.xUnit + 2) * CardItem.x;
      // 限制最大宽度为视口宽度，防止超出屏幕
      // 使用 rem 基准（16px）来计算，确保在不同设备上一致
      let actualWidth = calculatedWidth;
      if (typeof window !== "undefined") {
        const isMobile = window.innerWidth <= 768;
        // 移动端使用 2rem (32px) 的边距，桌面端也使用 2rem
        const baseFontSize = 16; // rem 基准值
        const padding = 2 * baseFontSize; // 2rem = 32px
        const maxAllowedWidth = isMobile
          ? window.innerWidth - padding
          : Math.min(calculatedWidth, window.innerWidth - padding);
        actualWidth = Math.min(calculatedWidth, maxAllowedWidth);
      }
      return {
        width: actualWidth + "px",
        height: (this.yUnit + 1) * CardItem.y + "px",
      };
    },
    // 选中块的间距（基于选中块尺寸，间距更紧凑）
    selectedCardSpacing() {
      const originalSize = CardItem.x * 2 - 10; // 原始尺寸
      const selectedSize = originalSize - 27; // 选中块尺寸（调大1像素）
      // 间距 = 选中块宽度 + 小间隙，让间距更紧凑
      return selectedSize + 4; // 选中块宽度 + 4px 间隙
    },
    leftOffset() {
      // 使用实际容器宽度（考虑 max-width 限制），而不是计算宽度
      const calculatedWidth = (this.xUnit + 2) * CardItem.x;
      let actualWidth = calculatedWidth;
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth <= 768;
        const baseFontSize = 16; // rem 基准值
        const padding = 2 * baseFontSize; // 2rem = 32px
        const maxAllowedWidth = isMobile 
          ? window.innerWidth - padding 
          : Math.min(calculatedWidth, window.innerWidth - padding);
        actualWidth = Math.min(calculatedWidth, maxAllowedWidth);
      }
      // 计算居中偏移：基于槽位的实际总宽度
      const originalSize = CardItem.x * 2 - 10;
      const selectedSize = originalSize - 27;
      const gap = 8; // gap-2 = 8px
      const backgroundPadding = 4; // px-1 = 4px (左右各4px)
      const totalSlotWidth = backgroundPadding * 2 + 7 * selectedSize + 6 * gap;
      return (actualWidth - totalSlotWidth) / 2;
    },
    selectedCardsBackgroundStyle() {
      // 计算背景容器的样式，与槽位对齐
      const originalSize = CardItem.x * 2 - 10;
      const selectedSize = originalSize - 27;
      const gap = 8; // gap-2 = 8px
      const backgroundPadding = 4; // px-1 = 4px (左右各4px)
      // 总宽度 = 左右padding + 7个槽位宽度 + 6个gap
      const totalWidth = backgroundPadding * 2 + 7 * selectedSize + 6 * gap;
      return {
        width: totalWidth + 'px',
        height: selectedSize + 16 + 'px', // 选中块高度 + padding
        left: this.leftOffset + 'px',
      };
    },
  },
  created() {
    this.loadWords();
  },
  methods: {
    // 计算选中块在槽位中的位置
    getSelectedCardPosition(slotIndex) {
      const originalSize = CardItem.x * 2 - 10;
      const selectedSize = originalSize - 27;
      const gap = 8; // gap-2 = 8px
      const backgroundPadding = 4; // px-1 = 4px
      return this.leftOffset + backgroundPadding + slotIndex * (selectedSize + gap);
    },
    // 获取选中槽位的样式
    getSelectedSlotStyle(isFull) {
      const originalSize = CardItem.x * 2 - 10;
      const selectedSize = originalSize - 27;
      return {
        width: `${selectedSize}px`,
        height: `${selectedSize}px`,
        minWidth: `${selectedSize}px`,
        borderRadius: '0.375rem', // 6px
        border: isFull 
          ? '0.125rem solid rgba(255,255,255,0.5)' 
          : '0.125rem dashed rgba(255,255,255,0.3)',
        backgroundColor: isFull 
          ? '#c2812e' 
          : 'rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.min(selectedSize * 0.25, 16)}px`,
        color: '#fff',
        fontWeight: 'bold',
      };
    },
    // 加载单词数据
    async loadWords() {
      try {
        this.error = "";
        const {
          loadVocabularyData,
          getSelectedWords,
          hasSelectedVocabulary,
          loadSelectedVocabulary,
        } = useVocabulary();

        // 确保选择的词汇已加载
        loadSelectedVocabulary();

        // 加载词汇数据
        await loadVocabularyData();

        // 检查是否有选择的词汇
        if (!hasSelectedVocabulary.value) {
          this.error = "请先选择词库";
          return;
        }

        // 加载单词并增强emoji数据
        let wordData = await getSelectedWords({ withEmoji: true });

        // 如果没有emoji，尝试增强
        if (wordData.length > 0 && !wordData.some((w) => w.emoji || w.image)) {
          wordData = await enhanceWordsWithEmoji(wordData);
        }

        if (wordData.length === 0) {
          this.error = "选择的词库为空，请选择其他词库";
          return;
        }

        this.words = wordData;
        this.startGame();
      } catch (err) {
        console.error("加载词汇数据失败:", err);
        this.error = "加载词汇数据失败，请重试或选择其他词库";
      }
    },

    // 根据关卡计算游戏参数 - 前期简单，后期逐渐增加难度
    getLevelConfig(levelNum) {
      if (levelNum === 1) {
        // 第1关：最简单，让玩家熟悉游戏
        return {
          x: 2,
          y: 2,
          z: 2,
          cardRandom: 0.5,
        };
      } else if (levelNum <= 3) {
        // 第2-3关：稍微增加难度
        return {
          x: 3,
          y: 2,
          z: 2 + levelNum - 1,
          cardRandom: 0.45,
        };
      } else if (levelNum <= 6) {
        // 第4-6关：中等难度
        return {
          x: 3,
          y: 3,
          z: 4 + (levelNum - 3) * 1,
          cardRandom: 0.4,
        };
      } else if (levelNum <= 10) {
        // 第7-10关：逐渐增加难度
        return {
          x: 4,
          y: 3,
          z: 7 + (levelNum - 6) * 1,
          cardRandom: 0.35,
        };
      } else if (levelNum <= 15) {
        // 第11-15关：较高难度
        return {
          x: 4,
          y: 4,
          z: 11 + (levelNum - 10) * 2,
          cardRandom: 0.3,
        };
      } else if (levelNum <= 20) {
        // 第16-20关：高难度
        return {
          x: 5,
          y: 4,
          z: 21 + (levelNum - 15) * 2,
          cardRandom: 0.25,
        };
      } else {
        // 第21关及以上：超高难度
        return {
          x: 6,
          y: 4,
          z: 31 + (levelNum - 20) * 3,
          cardRandom: 0.2,
        };
      }
    },

    // 初始化游戏
    initGame() {
      this.step = 1;
      this.isLocked = false;
      const config = this.getLevelConfig(this.level);
      // 优先使用option中的值，如果option中没有则使用config中的值
      this.option = { ...config, ...this.option };
      this.getMap(this.option);
      this.penddingList = [];
      this.clearList = [];
      this.saveList = [];
      this.tools.save = true;
      this.tools.rand = true;
      this.setCardValue();
      this.calcCover();
    },

    // 初始化游戏地图
    initGameMap({ x, y, z }) {
      this.xUnit = x * 2;
      this.yUnit = y * 2;
      const cardMap = new Array(z);
      // 地图初始化
      for (let k = 0; k < z; k++) {
        cardMap[k] = new Array(this.yUnit);
        for (let i = 0; i < this.yUnit; i++) {
          cardMap[k][i] = new Array(this.xUnit).fill(0);
        }
      }
      return cardMap;
    },

    // 生成地图和卡片
    getMap({ x, y, z, cardRandom } = {}) {
      const cardMap = this.initGameMap({ x, y, z });
      const cardItemList = [];
      let key = 0;

      // 根据关卡选择单词（使用传入的参数，而不是重新获取配置）
      const numWordTypes = Math.floor((z * x * y) / 3); // 每个单词需要3个卡片
      const selectedWords = [];
      const usedWordIndices = new Set();

      // 随机选择不重复的单词
      for (
        let i = 0;
        i < numWordTypes && usedWordIndices.size < this.words.length;
        i++
      ) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * this.words.length);
        } while (usedWordIndices.has(randomIndex));
        usedWordIndices.add(randomIndex);

        const word = this.words[randomIndex];
        // 每个单词创建3种类型的卡片
        selectedWords.push(
          { wordData: word, type: "word" },
          { wordData: word, type: "meaning" },
          { wordData: word, type: "emoji" }
        );
      }

      // 打乱顺序
      for (let i = selectedWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selectedWords[i], selectedWords[j]] = [
          selectedWords[j],
          selectedWords[i],
        ];
      }

      let wordIndex = 0;

      for (let k = 0; k < z; k++) {
        const shrinkSpeed = 3;
        const shrink = Math.floor((z - k - 1) / shrinkSpeed);
        const shrinkX = Math.min(Math.floor(this.xUnit / 2) - 2, shrink);
        const shrinkY = Math.min(Math.floor(this.yUnit / 2) - 2, shrink);
        // 行
        for (let i = shrinkY; i < this.yUnit - 1 - shrinkY; i++) {
          // 列
          for (let j = shrinkX; j < Math.ceil((this.xUnit - 1) / 2); j++) {
            let canSetCard = true;
            if (j > 0 && cardMap[k][i][j - 1]) {
              canSetCard = false;
            } else if (i > 0 && cardMap[k][i - 1][j]) {
              canSetCard = false;
            } else if (i > 0 && j > 0 && cardMap[k][i - 1][j - 1]) {
              canSetCard = false;
            } else if (i > 0 && cardMap[k][i - 1][j + 1]) {
              canSetCard = false;
            } else if (k > 0 && cardMap[k - 1][i][j]) {
              canSetCard = false;
            } else if (Math.random() >= cardRandom) {
              canSetCard = false;
            }
            if (canSetCard && wordIndex < selectedWords.length) {
              key++;
              const wordInfo = selectedWords[wordIndex++];
              const cardItem = new CardItem({
                x: j,
                y: i,
                z: k,
                key,
                wordData: wordInfo.wordData,
                type: wordInfo.type,
              });
              cardMap[k][i][j] = cardItem;
              cardItemList.push(cardItem);
              // 对称放置
              const mirrorX = this.xUnit - 2 - j;
              if (mirrorX > j && wordIndex < selectedWords.length) {
                key++;
                const wordInfo2 = selectedWords[wordIndex++];
                const cardItem = new CardItem({
                  x: mirrorX,
                  y: i,
                  z: k,
                  key,
                  wordData: wordInfo2.wordData,
                  type: wordInfo2.type,
                });
                cardMap[k][i][mirrorX] = cardItem;
                cardItemList.push(cardItem);
              }
            }
          }
        }
      }
      cardItemList.reverse();
      // 确保卡片数量是3的倍数
      while (cardItemList.length % 3 !== 0 && cardItemList.length > 0) {
        const clearItem = cardItemList.pop();
        cardMap[clearItem.z][clearItem.y][clearItem.x] = 0;
      }
      cardItemList.reverse();

      // 计算卡片水平居中偏移量
      if (cardItemList.length > 0) {
        const leftValues = cardItemList.map((card) => {
          return parseFloat(card.style.left) || 0;
        });
        const rightValues = cardItemList.map((card) => {
          const left = parseFloat(card.style.left) || 0;
          const width = parseFloat(card.style.width) || CardItem.x * 2 - 10; // 已缩小8像素
          return left + width;
        });

        const minLeft = Math.min(...leftValues);
        const maxRight = Math.max(...rightValues);
        const contentWidth = maxRight - minLeft;

        // 使用 cardWrapStyle 中计算的实际宽度（已经考虑了 max-width 限制）
        const calculatedWidth = (this.xUnit + 2) * CardItem.x;
        let actualWidth = calculatedWidth;
        if (typeof window !== "undefined") {
          const isMobile = window.innerWidth <= 768;
          const maxAllowedWidth = isMobile
            ? window.innerWidth - 32
            : Math.min(calculatedWidth, window.innerWidth - 32);
          actualWidth = Math.min(calculatedWidth, maxAllowedWidth);
        }

        const offset = (actualWidth - contentWidth) / 2 - minLeft;

        // 调整所有卡片的 left 值以实现居中
        cardItemList.forEach((card) => {
          const currentLeft = parseFloat(card.style.left) || 0;
          card.style.left = currentLeft + offset + "px";
        });
      }

      this.cardMap = cardMap;
      this.cardItemList = cardItemList;
    },

    // 设置卡片值（用于统计）
    setCardValue() {
      this.calcValueList = {};
      this.cardItemList.forEach((item) => {
        const wordKey = item.word;
        if (!this.calcValueList[wordKey]) {
          this.calcValueList[wordKey] = { word: 0, meaning: 0, emoji: 0 };
        }
        this.calcValueList[wordKey][item.type]++;
      });
    },

    // 计算遮挡关系
    calcCover() {
      const coverMap = new Array(this.yUnit);
      for (let i = 0; i <= this.yUnit; i++) {
        coverMap[i] = new Array(this.xUnit).fill(false);
      }

      for (let i = this.cardItemList.length - 1; i >= 0; i--) {
        const item = this.cardItemList[i];
        const { x, y, z } = item;
        if (coverMap[y][x]) {
          item.cover = true;
        } else if (coverMap[y][x + 1]) {
          item.cover = true;
        } else if (coverMap[y + 1][x]) {
          item.cover = true;
        } else if (coverMap[y + 1][x + 1]) {
          item.cover = true;
        } else {
          item.cover = false;
        }
        coverMap[y][x] = true;
        coverMap[y + 1][x] = true;
        coverMap[y][x + 1] = true;
        coverMap[y + 1][x + 1] = true;
      }
    },

    // 点击卡片
    clickCard(item) {
      if (this.isLocked || item.cover) return;
      clearTimeout(this.timer);
      this.removeThree();

      // 检查添加后是否会超过7个，如果会超过则不允许添加
      if (this.penddingList.length >= 7) {
        return;
      }

      this.penddingList.push(item);
      const index = this.cardItemList.indexOf(item);
      this.cardItemList = this.cardItemList
        .slice(0, index)
        .concat(this.cardItemList.slice(index + 1));
      this.calcCover();
      const wordKey = item.word;
      if (this.calcValueList[wordKey]) {
        this.calcValueList[wordKey][item.type]--;
      }

      // 减小选中块的尺寸（减小27像素），保持正方形
      const originalSize = CardItem.x * 2 - 10; // 原始正方形边长（已缩小8像素）
      const selectedSize = originalSize - 27; // 选中后的正方形边长（调大1像素）
      item.style.width = selectedSize + "px";
      item.style.height = selectedSize + "px";

      setTimeout(() => {
        item.style.top = "110%";
        // 计算槽位位置，使选中块对齐到槽位中心
        const slotIndex = this.penddingList.length - 1;
        item.style.left = `${this.getSelectedCardPosition(slotIndex)}px`;
      }, 0);

      // 添加新卡片后立即检查是否达到7个，触发游戏结束
      if (this.penddingList.length >= 7) {
        this.isLocked = true;
        this.win = false;
        setTimeout(() => {
          this.showGameOver = true;
        }, 500);
      }

      this.timer = setTimeout(() => {
        this.removeThree();
      }, 500);
    },

    // 移除三个匹配的卡片
    removeThree() {
      // 按单词分组统计
      const wordGroups = {};
      this.penddingList.forEach((item, index) => {
        if (!wordGroups[item.word]) {
          wordGroups[item.word] = {
            word: null,
            meaning: null,
            emoji: null,
            indices: [],
          };
        }
        const group = wordGroups[item.word];
        if (item.type === "word" && group.word === null) {
          group.word = index;
        } else if (item.type === "meaning" && group.meaning === null) {
          group.meaning = index;
        } else if (item.type === "emoji" && group.emoji === null) {
          group.emoji = index;
        }
      });

      // 找出完整的组合
      Object.keys(wordGroups).forEach((word) => {
        const group = wordGroups[word];
        if (
          group.word !== null &&
          group.meaning !== null &&
          group.emoji !== null
        ) {
          // 找到完整组合，移除
          const indices = [group.word, group.meaning, group.emoji].sort(
            (a, b) => b - a
          );
          indices.forEach((index) => {
            const item = this.penddingList[index];
            this.clearList.push(item);
          });
          setTimeout(() => {
            // 使用相对计算，60px ≈ 3.75rem，但保持 px 以便精确控制
            const clearOffset = 60; // 清除列表的偏移量
            this.clearList.forEach((item, idx) => {
              item.style.left = this.leftOffset - clearOffset + "px";
            });
          }, 300);

          // 从penddingList中移除
          indices.forEach((index) => {
            this.penddingList.splice(index, 1);
          });

          // 重新排列penddingList，对齐到槽位
          this.penddingList.forEach((item, index) => {
            item.style.top = "110%";
            item.style.left = `${this.getSelectedCardPosition(index)}px`;
          });

          // 更新统计
          if (this.calcValueList[word]) {
            this.calcValueList[word] = { word: 0, meaning: 0, emoji: 0 };
          }

          // 检查是否完成
          if (
            this.cardItemList.length === 0 &&
            this.penddingList.length === 0
          ) {
            this.step = 2;
            this.win = true;
            setTimeout(() => {
              this.showLevelComplete = true;
            }, 500);
          }
        }
      });

      if (this.penddingList.length >= 7) {
        this.isLocked = true;
        this.win = false;
        setTimeout(() => {
          this.showGameOver = true;
        }, 500);
      }
    },

    // 保存卡片（取出3个）
    saveCard() {
      if (this.isLocked || !this.tools.save) return false;
      this.tools.save = false;
      this.saveList = this.penddingList.slice(0, 3);
      setTimeout(() => {
        this.saveList.forEach((item, index) => {
          item.style.top = "110%";
          item.style.left = `${this.getSelectedCardPosition(index)}px`;
          const wordKey = item.word;
          if (this.calcValueList[wordKey]) {
            this.calcValueList[wordKey][item.type]--;
          }
        });
      }, 0);
      this.penddingList = this.penddingList.slice(3);
      this.penddingList.forEach((item, index) => {
        item.style.top = "110%";
        item.style.left = `${this.getSelectedCardPosition(index)}px`;
      });
    },

    // 点击保存的卡片
    clickSaveCard(item) {
      if (this.isLocked) return;
      // 恢复原始尺寸（因为卡片从 saveList 回到 cardItemList 时应该显示正常尺寸，保持正方形）
      const originalSize = CardItem.x * 2 - 10; // 原始正方形边长（已缩小8像素）
      item.style.width = originalSize + "px";
      item.style.height = originalSize + "px";

      this.cardItemList.push(item);
      const index = this.saveList.indexOf(item);
      this.saveList = this.saveList
        .slice(0, index)
        .concat(this.saveList.slice(index + 1));
      this.clickCard(item);
    },

    // 随机打乱
    randCard() {
      if (this.isLocked || !this.tools.rand) return;
      this.tools.rand = false;
      const length = this.cardItemList.length;
      this.cardItemList.forEach((item) => {
        const randNum = Math.floor(length * Math.random());
        const newItem = this.cardItemList[randNum];
        let temp;
        temp = item.style.left;
        item.style.left = newItem.style.left;
        newItem.style.left = temp;
        temp = item.style.top;
        item.style.top = newItem.style.top;
        newItem.style.top = temp;
        temp = item.x;
        item.x = newItem.x;
        newItem.x = temp;
        temp = item.y;
        item.y = newItem.y;
        newItem.y = temp;
        temp = item.z;
        item.z = newItem.z;
        newItem.z = temp;
      });
      this.cardItemList.sort((a, b) => a.z - b.z);
      this.calcCover();
    },

    // 开始游戏
    startGame() {
      this.initGame();
    },

    // 重新开始
    rePlay() {
      this.level = 1;
      this.initGame();
    },

    // 确认进入下一关
    confirmNextLevel() {
      this.showLevelComplete = false;
      this.level++;
      this.step = 0;
      this.initGame();
    },

    // 确认重新开始
    confirmRestart() {
      this.showGameOver = false;
      this.isLocked = false;
      this.level = 1;
      this.step = 0;
      this.rePlay();
    },

    // 处理关卡完成弹窗点击
    handleLevelCompleteClick() {
      // 点击背景不关闭
    },

    // 处理游戏结束弹窗点击
    handleGameOverClick() {
      // 点击背景不关闭
    },
  },
};
</script>

<style scoped>
.box {
  position: relative;
  width: 100%;
  overflow-x: hidden;
  /* 不设置 overflow-y，让页面自然滚动 */
}

.card-wrap {
  position: relative;
  margin: 0 auto;
  max-width: 100%;
  /* 不设置 overflow，因为内容都是绝对定位，不需要滚动条 */
}

.card-wrap.locked {
  pointer-events: none;
}

.card-item {
  position: absolute;
  opacity: 1;
  transition: all 0.3s;
  overflow: hidden;

  border-radius: 0.5rem; /* 8px */
  text-align: center;
  padding: 0.125rem; /* 2px */
  /* width 和 height 由 JavaScript 动态设置，保持 px */
  background-color: rgb(194, 129, 46);
  color: rgb(255, 255, 255);
  border: 0.125rem solid rgba(255, 255, 255, 0.3); /* 2px */
  cursor: pointer;
  /* left 和 top 由 JavaScript 动态设置，保持 px */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 3px 0 inset #c2812e, 0 0.5rem 0 0 #666666,
    0 0.5rem 0 0.125rem #333, 0 0 0 0.125rem #333;
  box-sizing: border-box;
  font-size: clamp(0.875rem, 2.5vw, 1.25rem); /* 响应式字体，14px-20px */
  font-weight: bold;
  pointer-events: auto;
  z-index: 10;
}

.card-item:hover {
  transform: scale3d(1.1, 1.1, 1.1);
  z-index: 1;
}

.item-cover {
  pointer-events: none;
  box-shadow: 0px 0.1875rem 0 0 #999, 0 0.5rem 0 0 #666,
    0 0.5rem 0 0.125rem #000, 0 0 0 0.125rem #000;
}

.item-cover:after {
  border-radius: 0.125rem; /* 2px */
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background: #000;
  opacity: 0.55;
}

.card-content {
  padding: 0.25rem; /* 4px */
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.tools {
  position: absolute;
  top: 100%;
  width: 100%;
  left: 0;
  text-align: center;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.tools button {
  padding: 0.5rem 1rem; /* 8px 16px */
  background: rgba(107, 163, 216, 0.8);
  color: white;
  border: none;
  border-radius: 0.25rem; /* 4px */
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  font-size: clamp(0.75rem, 2vw, 0.875rem); /* 响应式字体 */
}

.tools button:hover:not(:disabled) {
  background: rgba(107, 163, 216, 1);
  transform: scale(1.05);
}

.tools button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-item {
  pointer-events: none;
}

.emoji-display {
  font-size: clamp(3.2em, 3vw, 1.5em); /* 响应式 emoji 大小 */
  line-height: 1;
  display: inline-block;
}

/* 选中块的背景容器 - 参考 WordStackOld 的存储区域 */
.selected-cards-background {
  position: absolute;
  top: 110%;
  background-color: rgba(55, 65, 81, 0.9); /* bg-gray-700 的近似值 */
  border-radius: 0.5rem; /* rounded-lg */
  padding: 0.5rem 0.25rem; /* py-2 px-1 */
  z-index: 5;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.selected-slots-container {
  display: flex;
  gap: 0.5rem; /* gap-2 = 8px */
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
}

.selected-slot {
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* 选中块的样式 - 字体和 emoji 变小 */
/* 使用 rem 单位，确保在不同设备上一致 */
.selected-card {
  font-size: 0.575rem; /* 14px，统一使用 rem */
  z-index: 6; /* 确保在背景槽位之上 */
}

.selected-card .emoji-display {
  font-size: 3em; /* 相对于 selected-card 的字体大小 */
}

/* 3D 气泡标题样式 */
.bubble-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #6ba3d8;
  letter-spacing: 0.15em;
  position: relative;
  display: inline-block;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1),
    0 0 0 3px rgba(107, 163, 216, 0.4), 0 0 0 4px rgba(107, 163, 216, 0.2);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.bubble-title::before {
  content: "词了个词";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
  text-shadow: 2px 2px 0 rgba(107, 163, 216, 0.3),
    1px 1px 0 rgba(107, 163, 216, 0.2);
  z-index: -1;
  transform: translate(2px, 2px);
}

.bubble-title::after {
  content: "";
  position: absolute;
  top: 15%;
  left: 15%;
  width: 25%;
  height: 25%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
  filter: blur(3px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .bubble-title {
    font-size: clamp(1.5rem, 8vw, 2rem); /* 响应式标题 */
  }

  .card-content {
    padding: 0.125rem; /* 2px */
  }

  .card-wrap {
    max-width: calc(100vw - 2rem); /* 使用 rem 替代 32px */
  }

  .tools {
    flex-direction: column;
    align-items: center;
  }

  .tools button {
    width: 80%;
    max-width: 12.5rem; /* 200px */
  }
}
</style>

