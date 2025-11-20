<template>
  <div class="min-h-screen bg-black py-4 md:py-8 px-4 relative overflow-hidden">
    <!-- 装饰性背景元素 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl float-animation"></div>
      <div class="absolute bottom-20 right-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl float-animation" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl float-animation" style="animation-delay: 2s;"></div>
      <div class="absolute top-32 right-1/4 text-purple-400/20 text-5xl float-animation" style="animation-delay: 1.5s;">✦</div>
      <div class="absolute bottom-40 left-1/4 text-pink-400/20 text-4xl float-animation" style="animation-delay: 2.5s;">✦</div>
    </div>
    
    <div class="max-w-6xl mx-auto relative z-10">
      <!-- 游戏头部信息 -->
      <div class="glass-effect rounded-3xl shadow-xl p-4 md:p-6 mb-4 md:mb-6 border border-white/20">
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
          <!-- 返回首页按钮 -->
          <router-link
            to="/"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all duration-200 group hover:scale-110"
          >
            <svg 
              class="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </router-link>
          
          <!-- 标题和描述 -->
          <div class="flex-1 text-center px-4">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-1">单词记忆</h2>
            <p class="text-sm md:text-base text-gray-600">匹配单词和中文，消除所有卡片</p>
          </div>
          
          <!-- 占位元素，保持居中 -->
          <div class="w-10"></div>
        </div>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="flex-1"></div>
          <div class="flex items-center gap-4 md:gap-6">
            <div class="text-center">
              <div class="text-xs md:text-sm text-gray-500 mb-1">关卡</div>
              <div class="text-2xl md:text-3xl font-bold text-blue-600">{{ currentLevel }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs md:text-sm text-gray-500 mb-1">得分</div>
              <div class="text-2xl md:text-3xl font-bold text-purple-600">{{ totalScore }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs md:text-sm text-gray-500 mb-1">步数</div>
              <div class="text-2xl md:text-3xl font-bold text-pink-600">{{ moves }}</div>
            </div>
            <div class="text-center">
              <div class="text-xs md:text-sm text-gray-500 mb-1">用时</div>
              <div class="text-lg md:text-xl font-bold text-gray-700">{{ formatTime(gameTime) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 游戏区域 -->
      <div v-if="loading" class="text-center text-white py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p class="mt-4">加载中...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
        {{ error }}
      </div>

      <!-- 关卡完成弹窗 -->
      <div
        v-if="levelComplete"
        ref="levelCompleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="closeLevelComplete"
      >
        <div 
          ref="levelCompleteContent"
          class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full mx-4 text-center"
        >
          <div class="text-6xl md:text-8xl mb-4">🎉</div>
          <h3 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">关卡 {{ currentLevel }} 完成！</h3>
          <p class="text-gray-600 mb-6">恭喜你完成了这一关</p>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-purple-50 rounded-lg p-3">
              <div class="text-sm text-gray-600 mb-1">本关得分</div>
              <div class="text-xl font-bold text-purple-600">{{ levelScore }}</div>
            </div>
            <div class="bg-pink-50 rounded-lg p-3">
              <div class="text-sm text-gray-600 mb-1">本关步数</div>
              <div class="text-xl font-bold text-pink-600">{{ levelMoves }}</div>
            </div>
          </div>
          <div class="mb-6">
            <div class="text-sm text-gray-600 mb-1">累计得分</div>
            <div class="text-2xl font-bold text-blue-600">{{ totalScore }}</div>
          </div>
          <button
            @click="nextLevel"
            class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold text-lg shadow-lg transform hover:scale-105"
          >
            {{ currentLevel >= levelConfigs.length ? '重新开始' : '下一关' }}
          </button>
        </div>
      </div>

      <div v-else class="rounded-3xl shadow-xl md:p-4 relative overflow-hidden glass-effect border border-white/20">
        <!-- 游戏网格容器 -->
        <div 
          ref="gridContainer"
          class="relative w-full"
          :style="{
            paddingTop: gridPadding,
            paddingBottom: gridPadding,
            paddingLeft: gridPadding,
            paddingRight: gridPadding,
            boxSizing: 'border-box'
          }"
        >
          <!-- 连线效果 SVG -->
          <svg
            v-if="lightningPath"
            class="absolute pointer-events-none z-20"
            :style="{
              width: gridContainerWidth + 'px',
              height: gridContainerHeight + 'px',
              top: '0',
              left: '0'
            }"
          >
            <!-- 外层发光效果 -->
            <path
              ref="lightningGlowRef"
              :d="lightningPath"
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
              fill="none"
              stroke="url(#lightningCoreGradient)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <defs>
              <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:1" />
                <stop offset="30%" style="stop-color:#fbbf24;stop-opacity:1" />
                <stop offset="70%" style="stop-color:#f59e0b;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="lightningGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#fef3c7;stop-opacity:0.4" />
                <stop offset="50%" style="stop-color:#fbbf24;stop-opacity:0.5" />
                <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:0.4" />
              </linearGradient>
              <linearGradient id="lightningCoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                <stop offset="50%" style="stop-color:#fef3c7;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:1" />
              </linearGradient>
            </defs>
          </svg>
          
          <!-- 混合网格：单词和含义混合在一起 -->
          <div
            ref="gridElement"
            class="flex flex-wrap gap-1.5 md:gap-2"
            :style="{
              position: 'relative',
              boxSizing: 'border-box'
            }"
          >
            <div
              v-for="(cell, index) in mixedGrid"
              :key="'cell-' + index"
              :ref="el => { if (el) cellRefs[index] = el }"
              @click="handleCellClick(index)"
              :class="[
                'cell relative rounded-lg shadow-sm cursor-pointer transform touch-manipulation select-none overflow-hidden',
                cell.selected ? 'ring-2 ring-purple-500 z-50 shadow-lg' : '',
                cell.matched ? 'opacity-50' : '',
                getCellColorClass(cell)
              ]"
              :style="{
                transformOrigin: 'center center',
                flexShrink: 0,
                ...(cell.wordWidth ? { width: (cell.wordWidth + 12) + 'px', minWidth: (cell.wordWidth + 12) + 'px', maxWidth: (cell.wordWidth + 12) + 'px' } : {})
              }"
            >
              <div class="cell-content">
                <!-- 如果是单词类型，显示单词 -->
                <div 
                  v-if="cell.type === 'word'"
                  :ref="el => { if (el && cell.type === 'word') wordRefs[cell.originalIndex] = el }"
                  class="cell-word"
                >
                  {{ cell.word }}
                </div>
                <!-- 如果是含义类型，显示含义 -->
                <div 
                  v-else
                  class="cell-meaning"
                  :style="cell.wordWidth ? { width: cell.wordWidth + 'px', maxWidth: cell.wordWidth + 'px' } : {}"
                >
                  {{ cell.meaning }}
                </div>
              </div>
              
              <!-- 消除动画 -->
              <div
                v-if="cell.removing"
                class="absolute inset-0 flex items-center justify-center bg-white/20 rounded-lg"
              >
                <div class="text-3xl md:text-4xl animate-pulse">✨</div>
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
            @click="shuffleGrid"
            class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            :disabled="isProcessing"
          >
            打乱顺序
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

const words = ref([])
const mixedGrid = ref([])
const loading = ref(true)
const error = ref('')
const selectedIndex1 = ref(null)
const selectedIndex2 = ref(null)
const score = ref(0)
const moves = ref(0)
const gameTime = ref(0)
const gameTimer = ref(null)
const isProcessing = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const lightningPath = ref('')
const gridContainer = ref(null)
const gridElement = ref(null)
const gridContainerWidth = ref(0)
const gridContainerHeight = ref(0)
const cellRefs = ref([])
const wordRefs = ref([])
const lightningGlowRef = ref(null)
const lightningPathRef = ref(null)
const lightningCoreRef = ref(null)
const levelCompleteModal = ref(null)
const levelCompleteContent = ref(null)

// 关卡系统
const currentLevel = ref(1)
const levelComplete = ref(false)
const levelScore = ref(0)
const levelMoves = ref(0)
const totalScore = ref(0)

// 关卡配置：每关的卡片数量
const levelConfigs = [
  { level: 1, count: 24 },
  { level: 2, count: 30 },
  { level: 3, count: 36 },
  { level: 4, count: 42 },
  { level: 5, count: 48 },
  { level: 6, count: 54 },
  { level: 7, count: 60 },
  { level: 8, count: 66 },
  { level: 9, count: 72 },
  { level: 10, count: 80 }
]

const levelCardCount = computed(() => {
  const config = levelConfigs.find(c => c.level === currentLevel.value)
  return config ? config.count : 12
})

const gridPadding = computed(() => {
  // 计算网格容器的左右 padding
  const width = windowWidth.value
  if (width < 640) {
    return '8px'
  } else if (width < 768) {
    return '16px'
  } else {
    return '16px'
  }
})

const handleResize = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
  }
}

const loadWords = async () => {
  try {
    loading.value = true
    const response = await fetch('/words.json')
    if (!response.ok) {
      throw new Error('加载词汇数据失败')
    }
    const wordData = await response.json()
    words.value = wordData
    initGame()
  } catch (err) {
    error.value = '加载词汇数据失败，请检查 words.json 文件'
    console.error('加载词汇数据失败:', err)
  } finally {
    loading.value = false
  }
}

const initGame = async () => {
  // 重置关卡相关状态
  levelComplete.value = false
  levelScore.value = 0
  levelMoves.value = 0
  moves.value = 0
  gameTime.value = 0
  selectedIndex1.value = null
  selectedIndex2.value = null
  isProcessing.value = false
  
  // 重置所有 GSAP 动画状态
  if (cellRefs.value.length > 0) {
    cellRefs.value.forEach(cellElement => {
      if (cellElement) {
        gsap.killTweensOf(cellElement)
        gsap.set(cellElement, {
          scale: 1,
          opacity: 1,
          y: 0,
          x: 0
        })
      }
    })
  }
  
  // 创建游戏网格
  createGrid()
  
  // 等待 DOM 更新后重置 refs
  await nextTick()
  
  // 不需要检查初始匹配，因为现在是点击匹配模式
  
  startTimer()
}

const createGrid = () => {
  mixedGrid.value = []
  const totalCells = levelCardCount.value
  const pairsNeeded = Math.floor(totalCells / 2) // 需要多少对单词
  
  // 创建单词对池
  const wordPairs = []
  
  // 从单词列表中随机选择单词
  const availableWords = [...words.value]
  
  // 如果需要的对数大于可用单词数，需要重复使用
  for (let i = 0; i < pairsNeeded; i++) {
    const randomIndex = Math.floor(Math.random() * availableWords.length)
    const word = { ...availableWords[randomIndex] }
    wordPairs.push(word)
  }
  
  // 如果总数是奇数，随机添加一个单词
  if (totalCells % 2 === 1) {
    const randomIndex = Math.floor(Math.random() * availableWords.length)
    wordPairs.push({ ...availableWords[randomIndex] })
  }
  
  // 创建混合网格：包含单词和含义
  const mixedCells = []
  
  // 添加单词卡片
  wordPairs.forEach((wordData, index) => {
    mixedCells.push({
      type: 'word',
      word: wordData.word,
      meaning: wordData.meaning,
      selected: false,
      removing: false,
      matched: false,
      wordWidth: null,
      originalIndex: index // 用于 wordRefs 索引
    })
  })
  
  // 添加含义卡片
  wordPairs.forEach((wordData, index) => {
    mixedCells.push({
      type: 'meaning',
      word: wordData.word,
      meaning: wordData.meaning,
      selected: false,
      removing: false,
      matched: false,
      wordWidth: null
    })
  })
  
  // 打乱混合网格
  for (let i = mixedCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mixedCells[i], mixedCells[j]] = [mixedCells[j], mixedCells[i]]
  }
  
  // 填充混合网格
  mixedGrid.value = mixedCells
  
  // 等待DOM更新后计算单词宽度
  nextTick(() => {
    calculateWordWidths()
  })
}

const calculateWordWidths = () => {
  // 使用双重 requestAnimationFrame 确保 DOM 已完全渲染
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 计算单词卡片的宽度
      wordRefs.value.forEach((wordEl, originalIndex) => {
        if (wordEl) {
          // 找到所有对应的单词卡片
          mixedGrid.value.forEach((cell, index) => {
            if (cell.type === 'word' && cell.originalIndex === originalIndex) {
              const rect = wordEl.getBoundingClientRect()
              const width = rect.width
              if (width > 0) {
                cell.wordWidth = Math.ceil(width)
              } else {
                // 如果宽度为 0，可能是还没渲染完成，延迟重试
                setTimeout(() => {
                  const retryRect = wordEl.getBoundingClientRect()
                  const retryWidth = retryRect.width
                  if (retryWidth > 0 && mixedGrid.value[index]) {
                    mixedGrid.value[index].wordWidth = Math.ceil(retryWidth)
                  }
                  // 延迟更新含义宽度
                  setTimeout(() => {
                    updateMeaningWidths()
                  }, 50)
                }, 100)
              }
            }
          })
        }
      })
      
      // 立即更新含义块的宽度（基于已计算的单词宽度）
      updateMeaningWidths()
      
      // 延迟再次更新，确保所有延迟计算的宽度也被应用
      setTimeout(() => {
        updateMeaningWidths()
      }, 200)
    })
  })
}

const updateMeaningWidths = () => {
  // 创建一个映射：word -> wordWidth
  const wordWidthMap = new Map()
  mixedGrid.value.forEach((cell) => {
    if (cell.type === 'word' && cell.word && cell.wordWidth) {
      // 如果同一个单词有多个，使用最大的宽度
      const existingWidth = wordWidthMap.get(cell.word)
      if (!existingWidth || cell.wordWidth > existingWidth) {
        wordWidthMap.set(cell.word, cell.wordWidth)
      }
    }
  })
  
  // 为每个含义块设置对应单词块的宽度
  mixedGrid.value.forEach((cell) => {
    if (cell.type === 'meaning' && cell.word && wordWidthMap.has(cell.word)) {
      const wordWidth = wordWidthMap.get(cell.word)
      if (wordWidth > 0) {
        cell.wordWidth = wordWidth
      }
    }
  })
}

const shuffleGrid = async () => {
  if (isProcessing.value) return
  isProcessing.value = true
  
  // 先停止所有正在进行的动画
  cellRefs.value.forEach((cellElement) => {
    if (cellElement) {
      gsap.killTweensOf(cellElement)
      gsap.set(cellElement, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        zIndex: 1
      })
    }
  })
  
  // 打乱混合网格
  const shuffled = [...mixedGrid.value]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  // 更新数据，保持类型和原始索引
  mixedGrid.value.forEach((cell, index) => {
    const newData = shuffled[index]
    cell.word = newData.word
    cell.meaning = newData.meaning
    cell.type = newData.type
    cell.originalIndex = newData.originalIndex
    cell.selected = false
    cell.removing = false
    cell.matched = false
    cell.wordWidth = null
  })
  
  selectedIndex1.value = null
  selectedIndex2.value = null
  
  // 等待DOM更新
  await nextTick()
  
  // 重新计算宽度
  calculateWordWidths()
  
  isProcessing.value = false
}

const getCellColorClass = (cell) => {
  // 根据单词内容生成颜色（使用hash）
  const str = cell.word
  const hash = str.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  // 使用更柔和、更美观的渐变色
  const colors = [
    'bg-gradient-to-br from-indigo-500 to-indigo-700',
    'bg-gradient-to-br from-purple-500 to-purple-700',
    'bg-gradient-to-br from-pink-500 to-pink-700',
    'bg-gradient-to-br from-rose-500 to-rose-700',
    'bg-gradient-to-br from-orange-500 to-orange-700',
    'bg-gradient-to-br from-amber-500 to-amber-700',
    'bg-gradient-to-br from-emerald-500 to-emerald-700',
    'bg-gradient-to-br from-teal-500 to-teal-700',
    'bg-gradient-to-br from-cyan-500 to-cyan-700',
    'bg-gradient-to-br from-blue-500 to-blue-700',
    'bg-gradient-to-br from-violet-500 to-violet-700',
    'bg-gradient-to-br from-fuchsia-500 to-fuchsia-700'
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

const handleCellClick = async (index) => {
  if (isProcessing.value) return
  
  const cell = mixedGrid.value[index]
  
  // 如果卡片已匹配，忽略点击
  if (cell.matched) return
  
  const cellElement = cellRefs.value[index]
  if (!cellElement) return
  
  // 如果已经选中了这个卡片，取消选择
  if (selectedIndex1.value === index || selectedIndex2.value === index) {
    cell.selected = false
    if (selectedIndex1.value === index) {
      selectedIndex1.value = null
    } else {
      selectedIndex2.value = null
    }
    gsap.to(cellElement, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out'
    })
    return
  }
  
  // 如果已经选中了两个卡片，先取消第一个
  if (selectedIndex1.value !== null && selectedIndex2.value !== null) {
    const prevCell1 = mixedGrid.value[selectedIndex1.value]
    const prevCellElement1 = cellRefs.value[selectedIndex1.value]
    if (prevCell1 && prevCellElement1) {
      prevCell1.selected = false
      gsap.to(prevCellElement1, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
    selectedIndex1.value = selectedIndex2.value
    selectedIndex2.value = null
  }
  
  // 如果已经选中了一个卡片，检查类型是否不同
  if (selectedIndex1.value !== null) {
    const selectedCell = mixedGrid.value[selectedIndex1.value]
    // 如果类型相同，取消之前的选择，选择新的
    if (selectedCell.type === cell.type) {
      selectedCell.selected = false
      const prevElement = cellRefs.value[selectedIndex1.value]
      if (prevElement) {
        gsap.to(prevElement, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        })
      }
      selectedIndex1.value = index
    } else {
      // 类型不同，选择第二个
      selectedIndex2.value = index
    }
  } else {
    // 没有选中的卡片，选择第一个
    selectedIndex1.value = index
  }
  
  // 选择当前卡片
  cell.selected = true
  gsap.to(cellElement, {
    scale: 1.05,
    duration: 0.3,
    ease: 'back.out(1.7)'
  })
  
  // 如果已经选中了两个不同类型的卡片，检查是否匹配
  if (selectedIndex1.value !== null && selectedIndex2.value !== null) {
    await checkMatch()
  }
}

const checkMatch = async () => {
  if (selectedIndex1.value === null || selectedIndex2.value === null) return
  
  const cell1 = mixedGrid.value[selectedIndex1.value]
  const cell2 = mixedGrid.value[selectedIndex2.value]
  
  // 确保一个是单词，一个是含义
  if (cell1.type === cell2.type) return
  
  // 确定哪个是单词，哪个是含义
  const wordCell = cell1.type === 'word' ? cell1 : cell2
  const meaningCell = cell1.type === 'word' ? cell2 : cell1
  const wordIndex = cell1.type === 'word' ? selectedIndex1.value : selectedIndex2.value
  const meaningIndex = cell1.type === 'word' ? selectedIndex2.value : selectedIndex1.value
  
  // 检查单词和含义是否匹配（通过单词匹配）
  if (wordCell.word === meaningCell.word) {
    // 匹配成功，消除
    await matchAndRemove(wordIndex, meaningIndex)
  } else {
    // 不匹配，取消选择
    cell1.selected = false
    cell2.selected = false
    const element1 = cellRefs.value[selectedIndex1.value]
    const element2 = cellRefs.value[selectedIndex2.value]
    
    if (element1) {
      gsap.to(element1, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
    if (element2) {
      gsap.to(element2, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
    
    selectedIndex1.value = null
    selectedIndex2.value = null
  }
}

const getCellPosition = (index) => {
  if (!gridElement.value) return { x: 0, y: 0 }
  
  const cell = gridElement.value.children[index]
  if (!cell) return { x: 0, y: 0 }
  
  const rect = cell.getBoundingClientRect()
  const containerRect = gridContainer.value ? gridContainer.value.getBoundingClientRect() : { left: 0, top: 0 }
  
  // 计算相对于容器的位置
  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2
  }
}

const createLightningPath = (start, end) => {
  // 创建更真实的闪电路径，使用锯齿状的折线
  const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
  const segments = Math.max(6, Math.floor(distance / 25)) // 更多分段，让闪电更曲折
  
  let path = `M ${start.x} ${start.y}`
  
  // 生成锯齿状的闪电路径，使用直线段而不是平滑曲线
  for (let i = 1; i < segments; i++) {
    const t = i / segments
    const baseX = start.x + (end.x - start.x) * t
    const baseY = start.y + (end.y - start.y) * t
    
    // 添加更大的随机偏移，形成明显的锯齿效果
    const offsetX = (Math.random() - 0.5) * Math.min(50, distance * 0.2)
    const offsetY = (Math.random() - 0.5) * Math.min(50, distance * 0.2)
    
    path += ` L ${baseX + offsetX} ${baseY + offsetY}`
  }
  
  path += ` L ${end.x} ${end.y}`
  
  return path
}

const animateLightning = async () => {
  if (!lightningGlowRef.value || !lightningPathRef.value || !lightningCoreRef.value) {
    await new Promise(resolve => setTimeout(resolve, 800))
    return
  }
  
  // 获取路径总长度
  const pathLength = lightningPathRef.value.getTotalLength()
  
  // 设置初始状态
  gsap.set([lightningGlowRef.value, lightningPathRef.value, lightningCoreRef.value], {
    opacity: 0,
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength
  })
  
  // 创建闪电动画时间线
  const lightningTimeline = gsap.timeline()
  
  // 外层发光效果
  lightningTimeline.to(lightningGlowRef.value, {
    opacity: 0.8,
    strokeDashoffset: 0,
    duration: 0.05,
    ease: 'none'
  }, 0)
  .to(lightningGlowRef.value, {
    opacity: [0.8, 1, 0.3, 1, 0.4, 1, 1, 0.6, 0.3, 0],
    duration: 0.5,
    ease: 'none'
  }, 0)
  
  // 主闪电路径
  lightningTimeline.to(lightningPathRef.value, {
    opacity: 1,
    strokeDashoffset: 0,
    duration: 0.02,
    ease: 'none'
  }, 0)
  .to(lightningPathRef.value, {
    opacity: [1, 0.2, 1, 0.3, 1, 1, 0.8, 0.4, 0.2, 0],
    duration: 0.5,
    ease: 'none'
  }, 0)
  
  // 内层高光
  lightningTimeline.to(lightningCoreRef.value, {
    opacity: 1,
    strokeDashoffset: 0,
    duration: 0.03,
    ease: 'none'
  }, 0)
  .to(lightningCoreRef.value, {
    opacity: [1, 0.1, 1, 0.2, 1, 1, 0.7, 0.3, 0],
    duration: 0.5,
    ease: 'none'
  }, 0)
  
  await lightningTimeline
}

const matchAndRemove = async (wordIndex, meaningIndex) => {
  isProcessing.value = true
  
  const wordCell = mixedGrid.value[wordIndex]
  const meaningCell = mixedGrid.value[meaningIndex]
  const wordElement = cellRefs.value[wordIndex]
  const meaningElement = cellRefs.value[meaningIndex]
  
  if (!wordElement || !meaningElement) {
    isProcessing.value = false
    return
  }
  
  // 标记为匹配
  wordCell.matched = true
  meaningCell.matched = true
  
  // 等待一下让用户看到选中效果
  await new Promise(resolve => setTimeout(resolve, 150))
  
  // 计算两个卡片的位置
  const pos1 = getCellPosition(wordIndex)
  const pos2 = getCellPosition(meaningIndex)
  
  // 更新容器尺寸和位置
  if (gridContainer.value) {
    const containerRect = gridContainer.value.getBoundingClientRect()
    gridContainerWidth.value = containerRect.width
    gridContainerHeight.value = containerRect.height
  }
  
  // 创建并显示闪电连线
  lightningPath.value = createLightningPath(pos1, pos2)
  
  // 等待 DOM 更新
  await nextTick()
  
  // 增加得分和步数
  const points = 20
  score.value += points
  totalScore.value += points
  levelScore.value += points
  moves.value++
  levelMoves.value++
  
  // 等待一小段时间让连线显示
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // 平滑取消选中状态
  wordCell.selected = false
  meaningCell.selected = false
  selectedIndex1.value = null
  selectedIndex2.value = null
  
  // GSAP 取消选中动画
  gsap.to([wordElement, meaningElement], {
    scale: 1,
    duration: 0.2,
    ease: 'power2.out'
  })
  
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // GSAP 闪电动画
  await animateLightning()
  
  // GSAP 消除动画
  const removeTimeline = gsap.timeline()
  removeTimeline.to([wordElement, meaningElement], {
    scale: 1.2,
    duration: 0.1,
    ease: 'power2.out'
  })
  .to([wordElement, meaningElement], {
    scale: 0,
    opacity: 0,
    duration: 0.2,
    ease: 'power2.in'
  })
  
  await removeTimeline
  
  // 清除连线
  lightningPath.value = ''
  
  // 先清除内容，但保持 removing 标记
  wordCell.word = ''
  wordCell.meaning = ''
  meaningCell.word = ''
  meaningCell.meaning = ''
  wordCell.matched = false
  meaningCell.matched = false
  wordCell.removing = true
  meaningCell.removing = true
  
  // 等待一小段时间确保内容已清除
  await new Promise(resolve => setTimeout(resolve, 30))
  
  // 清除 removing 标记
  wordCell.removing = false
  meaningCell.removing = false
  
  // 关卡制下不需要填充新块，直接检查关卡是否完成
  checkLevelComplete()
  
  isProcessing.value = false
}

const checkLevelComplete = () => {
  // 检查是否所有卡片都已匹配
  const hasRemainingCards = mixedGrid.value.some(cell => {
    if (cell.type === 'word') {
      return cell.word !== '' && !cell.removing && cell.word !== null
    } else {
      return cell.meaning !== '' && !cell.removing && cell.meaning !== null
    }
  })
  
  // 如果没有剩余的卡片了，关卡完成
  if (!hasRemainingCards && mixedGrid.value.length > 0) {
    // 关卡完成
    levelComplete.value = true
    stopTimer()
    
    // 等待DOM更新后执行动画
    nextTick(() => {
      // 关卡完成庆祝动画
      celebrateLevelComplete()
      // 弹窗入场动画
      animateLevelCompleteModal()
    })
  }
}

const animateLevelCompleteModal = () => {
  if (levelCompleteContent.value) {
    gsap.fromTo(levelCompleteContent.value,
      { scale: 0.8, opacity: 0, y: 50 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
      }
    )
  }
}

const celebrateLevelComplete = () => {
  // 庆祝效果：网格缩放动画
  if (gridContainer.value) {
    gsap.fromTo(gridContainer.value, 
      { scale: 1 },
      { 
        scale: 1.05, 
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      }
    )
  }
  
  // 为所有已匹配的卡片添加庆祝动画
  cellRefs.value.forEach((cellElement, index) => {
    if (cellElement && mixedGrid.value[index]) {
      const cell = mixedGrid.value[index]
      const isEmpty = (cell.type === 'word' && cell.word === '') || 
                      (cell.type === 'meaning' && cell.meaning === '')
      if (isEmpty) {
        gsap.fromTo(cellElement,
          { scale: 1, rotation: 0 },
          {
            scale: 1.2,
            rotation: 360,
            duration: 0.5,
            ease: 'back.out(1.7)',
            delay: index * 0.02
          }
        )
      }
    }
  })
}

const nextLevel = async () => {
  levelComplete.value = false
  currentLevel.value++
  
  // 如果超过最大关卡，重置到第一关
  const maxLevel = levelConfigs.length
  if (currentLevel.value > maxLevel) {
    currentLevel.value = 1
    totalScore.value = 0
    score.value = 0
  }
  
  // 初始化新关卡
  await initGame()
}

const closeLevelComplete = () => {
  // 不允许点击背景关闭，必须点击下一关按钮
}

const findMatches = () => {
  const matches = []
  const visited = new Set()
  
  // 检查水平匹配（3个相同的单词）
  for (let row = 0; row < gridRows.value; row++) {
    for (let col = 0; col < gridCols.value - 2; col++) {
      const index = row * gridCols.value + col
      const cell = grid.value[index]
      const key = `${cell.row}-${cell.col}`
      
      if (visited.has(key)) continue
      
      const matchKey = cell.word
      
      let count = 1
      const matchCells = [cell]
      
      // 向右检查
      for (let c = col + 1; c < gridCols.value; c++) {
        const nextIndex = row * gridCols.value + c
        const nextCell = grid.value[nextIndex]
        
        if (nextCell.word === matchKey) {
          count++
          matchCells.push(nextCell)
        } else {
          break
        }
      }
      
      if (count >= 2) {
        matchCells.forEach(c => {
          const k = `${c.row}-${c.col}`
          if (!visited.has(k)) {
            matches.push(c)
            visited.add(k)
          }
        })
      }
    }
  }
  
  // 检查垂直匹配（2个相同的单词）
  for (let col = 0; col < gridCols.value; col++) {
    for (let row = 0; row < gridRows.value - 1; row++) {
      const index = row * gridCols.value + col
      const cell = grid.value[index]
      const key = `${cell.row}-${cell.col}`
      
      if (visited.has(key)) continue
      
      const matchKey = cell.word
      
      let count = 1
      const matchCells = [cell]
      
      // 向下检查
      for (let r = row + 1; r < gridRows.value; r++) {
        const nextIndex = r * gridCols.value + col
        const nextCell = grid.value[nextIndex]
        
        if (nextCell.word === matchKey) {
          count++
          matchCells.push(nextCell)
        } else {
          break
        }
      }
      
      if (count >= 2) {
        matchCells.forEach(c => {
          const k = `${c.row}-${c.col}`
          if (!visited.has(k)) {
            matches.push(c)
            visited.add(k)
          }
        })
      }
    }
  }
  
  return matches
}

const removeMatches = async (matches) => {
  // 标记为移除
  matches.forEach(cell => {
    cell.removing = true
  })
  
  // 计算得分
  score.value += matches.length * 10
  
  // 等待动画
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 移除匹配的单元格
  matches.forEach(cell => {
    cell.word = ''
    cell.meaning = ''
    cell.removing = false
  })
  
  // 关卡制下不需要下落和填充，直接检查关卡是否完成
  checkLevelComplete()
}

// 关卡制下不再需要下落动画，此函数保留但不使用
// const fallDown = async () => {
//   // 计算每个块需要下落的距离（使用实际的单元格高度）
//   const cellHeightPx = parseFloat(cellHeight.value.replace('px', '')) || 100
//   const gapPx = 6 // gap-1.5 = 6px
//   const cellsToFall = []
//   
//   // ... 下落逻辑代码 ...
// }

// 关卡制下不再需要填充空位，此函数保留但不使用
// const fillEmptyCells = () => {
//   const wordPool = [...words.value]
//   let hasFilled = false
//   
//   grid.value.forEach(cell => {
//     // 只填充空块，但跳过正在移除的块
//     if (cell.word === '' && !cell.removing) {
//       const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)]
//       cell.word = randomWord.word
//       cell.meaning = randomWord.meaning
//       hasFilled = true
//     }
//   })
//   
//   // 如果填充后没有新卡片，检查关卡是否完成
//   if (!hasFilled) {
//     // 延迟检查，确保DOM已更新
//     setTimeout(() => {
//       checkLevelComplete()
//     }, 100)
//   }
// }

const startTimer = () => {
  gameTimer.value = setInterval(() => {
    gameTime.value++
  }, 1000)
}

const stopTimer = () => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value)
    gameTimer.value = null
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const restartGame = () => {
  stopTimer()
  currentLevel.value = 1
  totalScore.value = 0
  score.value = 0
  initGame()
}

onMounted(() => {
  loadWords()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  stopTimer()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.cell {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  /* 确保所有变换都有平滑过渡 */
  will-change: transform, opacity, box-shadow;
  box-sizing: border-box;
  overflow: hidden;
  /* 宽度由单词宽度决定（通过 JavaScript 动态设置） */
  width: fit-content;
  /* 最小宽度确保卡片不会太小 */
  min-width: 100px;
  /* 高度自适应内容 */
  height: auto;
  min-height: 80px;
  /* 参考 WordStack 的 .tile 布局 */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transform-origin: center;
}

/* 内容容器：完全参考 WordStack 的 .tile-content 布局方式，宽度自适应 */
.cell-content {
  text-align: center;
  color: white;
  font-weight: bold;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  padding: 0 6px;
}

/* 单词部分：英文单词不换行，不显示省略号 */
.cell-word {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 2px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  letter-spacing: 0.3px;
  white-space: nowrap;
  overflow: visible;
  max-width: 100%;
  line-height: 1.3;
  width: fit-content;
  min-width: 0;
  text-overflow: clip;
}

/* 中文含义部分：超过3行用...表示 */
.cell-meaning {
  font-size: 11px;
  opacity: 0.95;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  font-weight: 500;
  width: 100%;
  max-width: 100%;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  white-space: normal;
  box-sizing: border-box;
}

.cell.falling {
  z-index: 30;
  /* 下落时增强阴影效果，让块看起来有深度，像俄罗斯方块一样 */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25) !important;
}

/* 闪电路径样式 */
.lightning-glow {
  filter: blur(5px);
}

.lightning-path {
  filter: drop-shadow(0 0 15px rgba(251, 191, 36, 1)) drop-shadow(0 0 8px rgba(251, 191, 36, 0.9));
}

.lightning-core {
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 1));
}

/* 响应式设计：参考 WordStack */
@media (max-width: 768px) {
  .cell-word {
    font-size: 14px;
  }
  
  .cell-meaning {
    font-size: 10px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .cell {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
