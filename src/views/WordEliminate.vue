<template>
  <div class="min-h-screen bg-black flex flex-col items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
    <!-- 游戏标题和统计信息 -->
    <div class="w-full max-w-6xl mb-4">
      <div class="flex items-center justify-between mb-4 pb-4 border-b border-gray-600">
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </router-link>
        
        <!-- 标题 -->
        <div class="flex-1 text-center px-4">
          <h1 class="text-2xl md:text-3xl font-bold text-white">单词消除</h1>
        </div>
        
        <!-- 占位元素，保持居中 -->
        <div class="w-10"></div>
      </div>
      <div class="flex justify-end items-center text-white">
        <div class="flex gap-4 md:gap-6">
          <div class="text-center">
            <div class="text-xs md:text-sm text-gray-400 mb-1">关卡</div>
            <div class="text-xl md:text-2xl font-bold text-blue-400">{{ level }}</div>
          </div>
          <div class="text-center">
            <div class="text-xs md:text-sm text-gray-400 mb-1">步数</div>
            <div class="text-xl md:text-2xl font-bold text-blue-400">{{ moves }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏区域 -->
    <div 
      ref="gameContainer"
      id="game"
      class="relative w-full max-w-6xl overflow-hidden mx-auto"
      :class="{ 'locked': isLocked }"
      :style="gameStyle"
    >
      <button
        v-for="tile in tiles"
        :key="tile.id"
        :ref="el => setTileRef(el, tile.id)"
        @click="handleTileClick(tile)"
        :class="[
          'tile',
          tile.selected ? 'sel' : '',
          tile.fadeOut ? 'fade-out' : ''
        ]"
        :style="getTileStyle(tile)"
        :data-selected="tile.selected"
      >
        <div v-if="tile.type === 'word'" class="tile-content">{{ tile.word }}</div>
        <div v-else class="tile-content">{{ tile.meaning }}</div>
      </button>
    </div>

    <!-- 控制按钮 -->
    <div class="mt-6 flex gap-4">
      <button
        @click="restartGame"
        class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
      >
        重新开始
      </button>
    </div>


    <!-- 关卡完成提示弹窗 -->
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
        <div class="mb-6 text-gray-400">
          <p>本关步数：{{ levelMoves }}</p>
        </div>
        <button
          @click="confirmNextLevel"
          class="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          进入下一关
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useVocabulary } from '../composables/useVocabulary'

const { loadVocabularyData, getSelectedWords, hasSelectedVocabulary, loadSelectedVocabulary } = useVocabulary()

const R = Math.random
const moves = ref(0)
const level = ref(1) // 当前关卡
const levelMoves = ref(0) // 当前关卡步数
const isLocked = ref(false)
const tiles = ref([])
const words = ref([])
const gameContainer = ref(null)
const tileRefs = ref({})
const tileAnimations = ref({}) // 存储每个tile的动画实例
const selectedTile = ref(null) // 当前选中的方块
const eliminatedPairs = ref(0) // 当前关卡已消除的组数
const createdPairs = ref(0) // 当前关卡已创建的组数（初始6组）
const showLevelComplete = ref(false) // 是否显示关卡完成提示
const INITIAL_PAIRS = 6 // 初始组数
const MAX_PAIRS_PER_LEVEL = 12 // 每关最多组数
const PAIRS_TO_ELIMINATE_BEFORE_NEW = 2 // 消除多少组后创建新的
const MIN_NEW_PAIRS = 2 // 每次创建最少组数

// 响应式网格大小
const isMobile = ref(window.innerWidth < 768)
const GRID_COLS = computed(() => 3) // 一行三列
const GRID_ROWS = computed(() => 4) // 一列四排
// 使用统一的间距值（px单位）
const GAP = computed(() => isMobile.value ? 4 : 8) // 方块之间的间距（px）
const TILE_SIZE = computed(() => {
  // 计算方块大小（基于容器宽度）
  const maxContainerWidth = 1152
  const containerWidth = Math.min(window.innerWidth - 32, maxContainerWidth) // 减去 padding
  // 总宽度 = 所有方块宽度 + 所有间距
  // containerWidth = GRID_COLS * TILE_SIZE + (GRID_COLS - 1) * GAP + 2 * GAP (左右各一个GAP)
  // containerWidth = GRID_COLS * TILE_SIZE + (GRID_COLS + 1) * GAP
  // TILE_SIZE = (containerWidth - (GRID_COLS + 1) * GAP) / GRID_COLS
  return (containerWidth - (GRID_COLS.value + 1) * GAP.value) / GRID_COLS.value
})

const gameStyle = computed(() => {
  // 计算总高度（方块是正方形的，使用 TILE_SIZE）
  // 总高度 = 所有方块高度 + 所有间距 + 上下各一个GAP
  const totalHeight = GRID_ROWS.value * TILE_SIZE.value + (GRID_ROWS.value + 1) * GAP.value
  
  return {
    width: '100%',
    height: `${totalHeight}px`,
    position: 'relative',
    maxWidth: '100%'
  }
})

// 存储每个 tile 的调整状态，避免重复调整
const tileAdjustingFlags = ref(new Set())

// 调整文本大小以适应容器（整体缩放）
const adjustTextSize = (tileElement, tileId) => {
  if (!tileElement) return
  
  // 如果正在调整，跳过
  if (tileAdjustingFlags.value.has(tileElement)) return
  tileAdjustingFlags.value.add(tileElement)
  
  const contentElement = tileElement.querySelector('.tile-content')
  
  if (!contentElement) {
    tileAdjustingFlags.value.delete(tileElement)
    return
  }
  
  // 通过 tileId 查找对应的 tile 对象，获取类型
  const tile = tiles.value.find(t => t.id === tileId)
  const isChinese = tile && tile.type === 'meaning'
  
  // 获取容器的可用宽度（减去 padding）
  const containerWidth = tileElement.offsetWidth
  if (containerWidth === 0) {
    // 如果容器还没有渲染完成，延迟执行
    tileAdjustingFlags.value.delete(tileElement)
    setTimeout(() => adjustTextSize(tileElement, tileId), 50)
    return
  }
  
  const padding = isMobile.value ? 8 : 16 // 左右 padding 总和
  const availableWidth = containerWidth - padding
  
  // 获取基础字体大小（从内联样式或计算样式，如果没有则从 getTileStyle 中获取）
  let baseFontSize = parseFloat(tileElement.style.fontSize)
  if (!baseFontSize || isNaN(baseFontSize)) {
    const computedFontSize = parseFloat(window.getComputedStyle(tileElement).fontSize)
    baseFontSize = computedFontSize || (isMobile.value ? Math.min(TILE_SIZE.value * 1.2, 40) : Math.min(TILE_SIZE.value * 1.0, 80))
  }
  
  // 如果是中文，只设置换行样式，不缩放
  if (isChinese) {
    contentElement.style.display = '-webkit-box'
    contentElement.style.webkitBoxOrient = 'vertical'
    contentElement.style.webkitLineClamp = '2'
    contentElement.style.lineClamp = '2'
    contentElement.style.overflow = 'hidden'
    contentElement.style.textOverflow = 'ellipsis'
    contentElement.style.whiteSpace = 'normal'
    contentElement.style.wordBreak = 'break-word'
    tileElement.style.fontSize = `${baseFontSize}px`
    tileAdjustingFlags.value.delete(tileElement)
    return
  }
  
  // 英文单词：需要测量并缩放
  // 创建一个隐藏的测量元素来测量实际宽度，避免影响显示
  const measureText = document.createElement('span')
  measureText.style.cssText = `
    position: absolute;
    visibility: hidden;
    white-space: nowrap;
    font-size: ${baseFontSize * 0.5}px;
    font-weight: bold;
    font-family: 'Julius Sans One', sans-serif;
  `
  measureText.textContent = contentElement.textContent
  document.body.appendChild(measureText)
  
  // 等待一下让元素渲染
  requestAnimationFrame(() => {
    const textWidth = measureText.offsetWidth
    document.body.removeChild(measureText)
    
    // 确保内容的 line-clamp 样式正确设置
    contentElement.style.display = '-webkit-box'
    contentElement.style.webkitBoxOrient = 'vertical'
    contentElement.style.webkitLineClamp = '2'
    contentElement.style.lineClamp = '2'
    contentElement.style.overflow = 'hidden'
    contentElement.style.textOverflow = 'ellipsis'
    contentElement.style.whiteSpace = 'normal'
    contentElement.style.wordBreak = 'break-word'
    
    // 只有当文本宽度超过容器宽度时才缩放
    if (textWidth > availableWidth) {
      // 计算缩放比例（只基于宽度）
      const scale = (availableWidth / textWidth) * 0.95 // 留一点边距
      
      // 调整整个 tile 的字体大小（这样所有使用 em 的子元素都会一起缩放）
      tileElement.style.fontSize = `${baseFontSize * scale}px`
      tileAdjustingFlags.value.delete(tileElement)
    } else {
      // 如果内容宽度没有超出，保持基础字体大小
      tileElement.style.fontSize = `${baseFontSize}px`
      tileAdjustingFlags.value.delete(tileElement)
    }
  })
}

// 设置 tile 的 DOM 引用
const setTileRef = (el, id) => {
  if (el) {
    tileRefs.value[id] = el
    // 在下一个 tick 调整文本大小，确保 DOM 已渲染
    nextTick(() => {
      adjustTextSize(el, id)
    })
  } else {
    // 清理动画
    if (tileAnimations.value[id]) {
      tileAnimations.value[id].kill()
      delete tileAnimations.value[id]
    }
    delete tileRefs.value[id]
  }
}

// 根据单词和含义获取颜色（降低饱和度，让背景更柔和）
const getColorForWord = (word, meaning, type) => {
  if (!word) return 'hsl(0, 40%, 35%)'
  
  // 使用单词和含义的哈希值来确定颜色
  let hash = 0
  const combined = word + (meaning || '')
  
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // 确保哈希值为正数
  hash = Math.abs(hash)
  
  // 返回HSL颜色，降低饱和度和亮度，让背景更柔和
  const hue = hash % 360
  const saturation = 40 + (hash % 20) // 40-60之间的饱和度，更柔和
  const lightness = type === 'word' ? 35 + (hash % 15) : 25 + (hash % 15) // 英文稍亮，中文稍暗
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// 创建方块
const createTile = (x, y, wordData, type) => {
  return {
    id: `${x}-${y}-${Date.now()}-${Math.random()}`,
    x,
    y,
    word: wordData.word,
    meaning: wordData.meaning,
    type: type, // 'word' 或 'meaning'
    selected: false,
    fadeOut: false
  }
}

// 获取方块样式（使用CSS transition，与demo保持一致）
const getTileStyle = (tile) => {
  // 计算位置时加上间距
  // 每个方块的位置 = 方块索引 * (方块大小 + 间距) + 起始间距
  const left = tile.x * (TILE_SIZE.value + GAP.value) + GAP.value
  const top = tile.y < 0 
    ? -TILE_SIZE.value - GAP.value 
    : tile.y * (TILE_SIZE.value + GAP.value) + GAP.value
  
  // 计算基础字体大小（基于方块大小，让文字足够大）
  const baseFontSize = isMobile.value ? Math.min(TILE_SIZE.value * 1.2, 40) : Math.min(TILE_SIZE.value * 1.0, 80)
  
  return {
    position: 'absolute',
    borderRadius: '5px',
    transition: 'top 0.3s linear, left 0.1s linear, opacity 0.1s linear, background-color 0.3s ease',
    textAlign: 'center',
    padding: isMobile.value ? '4px' : '8px',
    width: `${TILE_SIZE.value}px`,
    height: `${TILE_SIZE.value}px`,
    backgroundColor: tile.selected ? '#fff' : getColorForWord(tile.word, tile.meaning, tile.type),
    color: tile.selected ? '#000' : '#fff',
    border: '1px solid rgba(0,0,0,0.3)',
    cursor: 'pointer',
    left: `${left}px`,
    top: `${top}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: tile.selected ? '0 0 10px rgba(255,255,255,0.5), inset 0 0 20px rgba(0,0,0,0.1)' : 'inset 0 0 20px rgba(0,0,0,0.3)', // 选中时添加外发光
    boxSizing: 'border-box',
    fontSize: `${baseFontSize}px` // 设置基础字体大小，子元素使用 em 会相对此缩放
  }
}

// 获取指定位置的方块
const getTileAt = (x, y) => {
  return tiles.value.find(t => t.x === x && t.y === y)
}


// 移除方块（使用CSS transition，与demo保持一致）
const removeTile = (tile, callback) => {
  tile.fadeOut = true
  // CSS transition会自动处理fade-out效果
  setTimeout(() => {
    const index = tiles.value.findIndex(t => t.id === tile.id)
    if (index !== -1) {
      tiles.value.splice(index, 1)
    }
    if (callback) callback()
  }, 100)
}

// 处理方块点击
const handleTileClick = (tile) => {
  if (isLocked.value || tile.fadeOut) return
  
  // 如果点击的是已选中的方块，取消选中
  if (tile.selected) {
    tile.selected = false
    selectedTile.value = null
    return
  }
  
  // 如果当前没有选中的方块
  if (!selectedTile.value) {
    // 允许选中任何类型的方块（中文或英文）
    const tileIndex = tiles.value.findIndex(t => t.id === tile.id)
    if (tileIndex !== -1) {
      tiles.value[tileIndex].selected = true
      selectedTile.value = tile
    }
    return
  }
  
  // 如果已经选中了一个方块，检查是否匹配
  // 支持两种顺序：先中文后英文，或先英文后中文
  const isMatch = (selectedTile.value.word === tile.word && selectedTile.value.meaning === tile.meaning)
  
  // 如果两个方块类型不同（一个是中文，一个是英文），检查是否匹配
  if (selectedTile.value.type !== tile.type && isMatch) {
    // 匹配成功，显示选中效果
    const tileIndex = tiles.value.findIndex(t => t.id === tile.id)
    if (tileIndex !== -1) {
      tiles.value[tileIndex].selected = true
    }
    
    // 使用 nextTick 确保 DOM 更新后再处理匹配
    nextTick(() => {
      // 短暂显示后消除两个方块
      setTimeout(() => {
        moves.value++
        isLocked.value = true
        eliminatedPairs.value++ // 增加已消除组数
        
        const firstTile = selectedTile.value
        const secondTile = tiles.value.find(t => t.id === tile.id)
        
        // 取消选中状态
        if (firstTile) {
          const firstIndex = tiles.value.findIndex(t => t.id === firstTile.id)
          if (firstIndex !== -1) tiles.value[firstIndex].selected = false
        }
        if (secondTile) {
          const secondIndex = tiles.value.findIndex(t => t.id === secondTile.id)
          if (secondIndex !== -1) tiles.value[secondIndex].selected = false
        }
        selectedTile.value = null
        
        // 移除两个方块
        removeTile(firstTile, () => {
          removeTile(secondTile, () => {
            // 方块下落
            fallTiles()
          })
        })
      }, 300) // 短暂延迟让用户看到匹配效果
    })
  } else if (selectedTile.value.type !== tile.type && !isMatch) {
    // 类型不同但不匹配，显示选中效果后取消
    const tileIndex = tiles.value.findIndex(t => t.id === tile.id)
    if (tileIndex !== -1) {
      tiles.value[tileIndex].selected = true
    }
    
    // 不匹配，短暂显示后取消选中
    setTimeout(() => {
      if (selectedTile.value) {
        const firstIndex = tiles.value.findIndex(t => t.id === selectedTile.value.id)
        if (firstIndex !== -1) tiles.value[firstIndex].selected = false
      }
      const tileIndex = tiles.value.findIndex(t => t.id === tile.id)
      if (tileIndex !== -1) tiles.value[tileIndex].selected = false
      selectedTile.value = null
    }, 500) // 延迟取消，让用户看到不匹配的效果
  } else {
    // 类型相同，替换选中的方块
    if (selectedTile.value) {
      const prevIndex = tiles.value.findIndex(t => t.id === selectedTile.value.id)
      if (prevIndex !== -1) {
        tiles.value[prevIndex].selected = false
      }
    }
    const tileIndex = tiles.value.findIndex(t => t.id === tile.id)
    if (tileIndex !== -1) {
      tiles.value[tileIndex].selected = true
      selectedTile.value = tile
    }
  }
}

// 方块下落（参考demo的fall函数逻辑，使用CSS transition）
const fallTiles = (round = 1) => {
  let hasFallen = false
  const gridCols = GRID_COLS.value
  const gridRows = GRID_ROWS.value
  
  // 从y=gridRows-2到y=-1，从x=gridCols-1到x=0（与demo保持一致）
  for (let y = gridRows - 2; y >= -1; y--) {
    for (let x = gridCols - 1; x >= 0; x--) {
      const tile = getTileAt(x, y)
      if (tile) {
        const nextY = y + 1
        // 如果下方位置有效且没有方块，就下移一格
        if (nextY >= 0 && nextY < gridRows && !getTileAt(x, nextY)) {
          tile.y = nextY
          hasFallen = true
        }
      }
    }
  }
  
  if (hasFallen) {
    // 如果有方块下落，继续递归（CSS transition会自动处理动画）
    setTimeout(() => {
      fallTiles(round)
    }, 200)
  } else {
      // 方块下落完成，检查是否需要创建新词或进入下一关
      checkAndCreateNewPairs()
  }
}

// 检查并创建新词
const checkAndCreateNewPairs = () => {
  // 检查是否所有词都消除了
  if (tiles.value.length === 0) {
    // 进入下一关
    nextLevel()
    return
  }
  
  // 检查是否需要创建新词
  // 条件：已消除超过2组，且已创建的组数小于最大组数
  const remainingPairs = Math.floor(tiles.value.length / 2)
  const totalPairsInLevel = eliminatedPairs.value + remainingPairs
  
  if (eliminatedPairs.value > PAIRS_TO_ELIMINATE_BEFORE_NEW && 
      createdPairs.value < MAX_PAIRS_PER_LEVEL) {
    // 计算需要创建多少组
    const maxCanCreate = MAX_PAIRS_PER_LEVEL - createdPairs.value
    // 每次至少创建2组，但不能超过还能创建的最大数量
    const pairsToCreate = Math.min(maxCanCreate, MIN_NEW_PAIRS)
    
    if (pairsToCreate > 0) {
      createNewPairs(pairsToCreate)
    } else {
      // 不需要创建新词，解锁
      isLocked.value = false
      setTimeout(() => {
        nextTick(() => {
          Object.entries(tileRefs.value).forEach(([id, tileEl]) => {
            if (tileEl) adjustTextSize(tileEl, id)
          })
        })
      }, 100)
    }
  } else {
    // 不需要创建新词，解锁
    isLocked.value = false
    setTimeout(() => {
      nextTick(() => {
        Object.entries(tileRefs.value).forEach(([id, tileEl]) => {
          if (tileEl) adjustTextSize(tileEl, id)
        })
      })
    }, 100)
  }
}

// 创建新词（从上方落下）
const createNewPairs = (numPairs) => {
  if (words.value.length === 0) return
  
  const gridCols = GRID_COLS.value
  const newTiles = []
  
  // 随机选择单词
  const selectedWords = []
  for (let i = 0; i < numPairs; i++) {
    const randomWord = words.value[Math.floor(R() * words.value.length)]
    selectedWords.push(randomWord)
  }
  
  // 为每个单词创建一对（英文和中文）
  selectedWords.forEach(wordData => {
    // 为英文和中文分别随机选择列（可能相同，但会通过下落自动调整）
    const x1 = Math.floor(R() * gridCols)
    const x2 = Math.floor(R() * gridCols)
    
    // 创建英文方块（从上方 y=-1 开始）
    newTiles.push(createTile(x1, -1, wordData, 'word'))
    // 创建中文方块（从上方 y=-1 开始）
    newTiles.push(createTile(x2, -1, wordData, 'meaning'))
  })
  
  // 添加到 tiles
  tiles.value.push(...newTiles)
  createdPairs.value += numPairs
  
  // 让新方块下落
  setTimeout(() => {
    fallTiles()
  }, 200)
}

// 进入下一关（显示提示）
const nextLevel = () => {
  // 保存当前关卡的步数
  levelMoves.value = moves.value
  // 显示关卡完成提示
  showLevelComplete.value = true
  isLocked.value = true // 锁定游戏，防止继续操作
}

// 确认进入下一关
const confirmNextLevel = () => {
  showLevelComplete.value = false
  level.value++
  eliminatedPairs.value = 0
  createdPairs.value = 0
  isLocked.value = false
  initGame()
}

// 处理关卡完成弹窗点击（点击背景不关闭）
const handleLevelCompleteClick = () => {
  // 点击背景不关闭，必须点击按钮
}

// 加载单词数据
const loadWords = async () => {
  try {
    // 确保选择的词汇已加载
    loadSelectedVocabulary()
    
    // 加载词汇数据
    await loadVocabularyData()
    
    // 检查是否有选择的词汇
    if (!hasSelectedVocabulary.value) {
      console.error('请先选择词库')
      // 使用默认词汇
      words.value = [
        { word: 'hello', meaning: '你好' },
        { word: 'world', meaning: '世界' },
        { word: 'apple', meaning: '苹果' },
        { word: 'book', meaning: '书' },
        { word: 'cat', meaning: '猫' },
        { word: 'dog', meaning: '狗' },
        { word: 'house', meaning: '房子' },
        { word: 'car', meaning: '汽车' },
      ]
      initGame()
      return
    }
    
    // 获取选中的词库单词
    const allWords = await getSelectedWords()
    
    if (allWords.length === 0) {
      console.error('选中的词库中没有单词')
      // 使用默认词汇
      words.value = [
        { word: 'hello', meaning: '你好' },
        { word: 'world', meaning: '世界' },
        { word: 'apple', meaning: '苹果' },
        { word: 'book', meaning: '书' },
        { word: 'cat', meaning: '猫' },
        { word: 'dog', meaning: '狗' },
        { word: 'house', meaning: '房子' },
        { word: 'car', meaning: '汽车' },
      ]
      initGame()
      return
    }
    
    words.value = allWords
    initGame()
  } catch (err) {
    console.error('加载词汇数据失败:', err)
    // 使用默认词汇
    words.value = [
      { word: 'hello', meaning: '你好' },
      { word: 'world', meaning: '世界' },
      { word: 'apple', meaning: '苹果' },
      { word: 'book', meaning: '书' },
      { word: 'cat', meaning: '猫' },
      { word: 'dog', meaning: '狗' },
      { word: 'house', meaning: '房子' },
      { word: 'car', meaning: '汽车' },
    ]
    initGame()
  }
}

// 初始化游戏
const initGame = () => {
  // 清理所有动画
  Object.values(tileAnimations.value).forEach(anim => {
    if (anim && anim.kill) anim.kill()
  })
  tileAnimations.value = {}
  tileRefs.value = {}
  
  moves.value = 0
  levelMoves.value = 0
  isLocked.value = false
  tiles.value = []
  selectedTile.value = null
  eliminatedPairs.value = 0
  showLevelComplete.value = false
  
  if (words.value.length === 0) return
  
  const gridCols = GRID_COLS.value
  const gridRows = GRID_ROWS.value
  
  // 初始化6组词（12个方块）
  const selectedWords = []
  
  // 随机选择6个单词
  const usedIndices = new Set()
  for (let i = 0; i < INITIAL_PAIRS; i++) {
    let randomIndex
    do {
      randomIndex = Math.floor(R() * words.value.length)
    } while (usedIndices.has(randomIndex) && usedIndices.size < words.value.length)
    usedIndices.add(randomIndex)
    selectedWords.push(words.value[randomIndex])
  }
  
  // 创建方块池，每个单词创建一对（英文和中文）
  const tilePool = []
  selectedWords.forEach(wordData => {
    tilePool.push({ wordData, type: 'word' })
    tilePool.push({ wordData, type: 'meaning' })
  })
  
  // 打乱顺序
  for (let i = tilePool.length - 1; i > 0; i--) {
    const j = Math.floor(R() * (i + 1));
    [tilePool[i], tilePool[j]] = [tilePool[j], tilePool[i]]
  }
  
  // 填充网格：将12个方块随机分布在网格中
  // 生成所有可用位置
  const availablePositions = []
  for (let i = 0; i < gridCols; i++) {
    for (let j = 0; j < gridRows; j++) {
      availablePositions.push([i, j])
    }
  }
  
  // 随机打乱位置
  for (let i = availablePositions.length - 1; i > 0; i--) {
    const j = Math.floor(R() * (i + 1));
    [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]]
  }
  
  // 将方块分配到随机位置
  tilePool.forEach((tileData, index) => {
    if (index < availablePositions.length) {
      const [x, y] = availablePositions[index]
      const { wordData, type } = tileData
      tiles.value.push(createTile(x, y, wordData, type))
    }
  })
  
  // 重置关卡计数
  createdPairs.value = INITIAL_PAIRS
  
  // 在 DOM 更新后调整所有文本大小
  nextTick(() => {
    Object.entries(tileRefs.value).forEach(([id, tileEl]) => {
      if (tileEl) adjustTextSize(tileEl, id)
    })
  })
}

// 处理窗口大小变化
const handleResize = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth < 768
  
  // 如果移动端状态改变，重新初始化游戏
  if (wasMobile !== isMobile.value && words.value.length > 0) {
    initGame()
  } else {
    // 否则只调整文本大小
    nextTick(() => {
      Object.entries(tileRefs.value).forEach(([id, tileEl]) => {
        if (tileEl) adjustTextSize(tileEl, id)
      })
    })
  }
}

// 重新开始游戏
const restartGame = () => {
  initGame()
}

onMounted(() => {
  loadWords()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 清理所有GSAP动画
  Object.values(tileAnimations.value).forEach(anim => {
    if (anim && anim.kill) anim.kill()
  })
  tileAnimations.value = {}
  tileRefs.value = {}
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
#game {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

#game.locked {
  pointer-events: none;
}

.tile {
  font-family: 'Julius Sans One', sans-serif;
  text-overflow: hidden;
  overflow: hidden;
}

.tile-content {
  font-size: 0.5em;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5), 0 0 3px rgba(128,128,128,0.3);
  line-height: 1.2;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  max-width: 100%;
  width: 100%;
  text-align: center;
}

/* 移动端字体更小 */
@media (max-width: 768px) {
  .tile-content {
    font-size: 0.45em;
  }
}

.tile.sel {
  /* 选中状态通过内联样式处理，这里保留作为备用 */
  transform: scale(1.05);
  z-index: 5;
}

.tile.fade-out {
  opacity: 0;
}

.tile:focus-visible {
  z-index: 10;
  outline: 4px solid #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tile {
    font-size: 6vh;
    line-height: 6vh;
  }
}
</style>

