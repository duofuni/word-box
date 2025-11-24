<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-2 overflow-x-hidden overflow-y-auto" :style="{ backgroundImage: `url(${baseUrl}word-stack-bg.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }">
    <!-- 游戏标题和统计信息 -->
    <div class="w-full max-w-6xl mb-4">
      <div class="flex items-center justify-between mb-4 pb-4">
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
          <h1 class="bubble-title">词了个词</h1>
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
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="w-full max-w-6xl mb-4">
      <div class="bg-red-900/50 border border-red-500 rounded-lg p-6 text-center">
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
      ref="gameContainer"
      id="game"
      class="relative w-full max-w-6xl overflow-hidden mx-auto mb-4"
      :class="{ 'locked': isLocked }"
      :style="gameStyle"
    >
      <!-- 游戏区域背景 -->
      <div class="absolute inset-0 rounded-lg" style="background: rgba(0,0,0,0.1);"></div>
      
      <!-- 游戏方块 -->
      <button
        v-for="tile in tiles"
        :key="tile.id"
        :ref="el => setTileRef(el, tile.id)"
        @click="handleTileClick(tile)"
        :class="[
          'tile',
          tile.selected ? 'selected' : '',
          tile.fadeOut ? 'fade-out' : '',
          tile.masked ? 'mask' : ''
        ]"
        :style="getTileStyle(tile)"
        :data-clickable="!tile.masked"
      >
        <div class="tile-content">
          <span v-if="tile.type === 'word'">{{ tile.word }}</span>
          <span v-else-if="tile.type === 'meaning'">{{ tile.meaning }}</span>
          <span v-else-if="tile.type === 'emoji'" class="emoji-display">{{ tile.emoji || tile.image || '❓' }}</span>
        </div>
      </button>
    </div>

    <!-- 存储区域 -->
    <div class="w-full max-w-6xl mb-4">
      <div class="bg-gray-700 rounded-lg px-1 py-2">
        <div 
          ref="storageContainer"
          class="flex justify-center items-center"
          style="flex-wrap: nowrap; overflow-x: auto; gap: 2px;"
        >
          <div
            v-for="(slot, index) in storageSlots"
            :key="index"
            class="storage-slot"
            :class="{ 'full': slot }"
            :style="getStorageSlotStyle(slot)"
          >
            <div v-if="slot" class="storage-content">
              <span v-if="slot.type === 'word'">{{ slot.word }}</span>
              <span v-else-if="slot.type === 'meaning'">{{ slot.meaning }}</span>
              <span v-else-if="slot.type === 'emoji'" class="emoji-display">{{ slot.emoji || slot.image || '❓' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="mt-4 flex gap-4">
      <button
        @click="restartGame"
        class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
      >
        重新开始
      </button>
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

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue'
import { useVocabulary } from '../composables/useVocabulary'
import { enhanceWordsWithEmoji } from '../composables/useEmoji'

const baseUrl = import.meta.env.BASE_URL
const { loadVocabularyData, getSelectedWords, hasSelectedVocabulary, loadSelectedVocabulary } = useVocabulary()

const R = Math.random
const isLocked = ref(false)
const tiles = ref([]) // 所有方块（包含层级信息）
const words = ref([])
const error = ref('')
const gameContainer = ref(null)
const tileRefs = ref({})
const selectedTile = ref(null)
const storageSlots = ref(Array(7).fill(null)) // 7个存储槽位
const showGameOver = ref(false)
const showLevelComplete = ref(false)
const level = ref(1) // 当前关卡
const storageContainer = ref(null)
const storageContainerWidth = ref(0) // 存储容器宽度，用于响应式计算
const tileObservers = ref([]) // IntersectionObserver实例数组

// 响应式网格大小
const isMobile = ref(window.innerWidth < 768)
const GRID_COLS = computed(() => 4) // 一行四列
const GRID_ROWS = computed(() => 5) // 一列五行
const GAP = computed(() => isMobile.value ? 4 : 8)
const TILE_SIZE = computed(() => {
  const maxContainerWidth = 1152
  const containerWidth = Math.min(window.innerWidth - 32, maxContainerWidth)
  return (containerWidth - (GRID_COLS.value + 1) * GAP.value) / GRID_COLS.value
})

const gameStyle = computed(() => {
  const totalHeight = GRID_ROWS.value * TILE_SIZE.value + (GRID_ROWS.value + 1) * GAP.value
  return {
    width: '100%',
    height: `${totalHeight}px`,
    position: 'relative',
    maxWidth: '100%'
  }
})

// 手动检测方块可见性（备用方法）
const checkTileVisibilityManually = (tile, element) => {
  if (!element) {
    tile.masked = false
    return
  }
  
  const rect = element.getBoundingClientRect()
  const containerRect = gameContainer.value?.getBoundingClientRect()
  
  if (!containerRect) {
    tile.masked = false
    return
  }
  
  // 检查是否在容器内
  if (rect.left < containerRect.left || 
      rect.right > containerRect.right ||
      rect.top < containerRect.top ||
      rect.bottom > containerRect.bottom) {
    tile.masked = true
    return
  }
  
  // 检查是否被其他方块遮挡（通过检查z-index和位置）
  const allElements = Array.from(gameContainer.value?.querySelectorAll('.tile') || [])
  const thisZIndex = parseInt(window.getComputedStyle(element).zIndex) || 0
  
  let isBlocked = false
  for (const otherEl of allElements) {
    if (otherEl === element) continue
    
    const otherRect = otherEl.getBoundingClientRect()
    const otherZIndex = parseInt(window.getComputedStyle(otherEl).zIndex) || 0
    
    // 如果其他方块z-index更高，且位置重叠，则被遮挡
    if (otherZIndex > thisZIndex &&
        rect.left < otherRect.right &&
        rect.right > otherRect.left &&
        rect.top < otherRect.bottom &&
        rect.bottom > otherRect.top) {
      // 检查重叠面积，如果重叠超过50%则认为被遮挡
      const overlapWidth = Math.min(rect.right, otherRect.right) - Math.max(rect.left, otherRect.left)
      const overlapHeight = Math.min(rect.bottom, otherRect.bottom) - Math.max(rect.top, otherRect.top)
      const overlapArea = overlapWidth * overlapHeight
      const tileArea = rect.width * rect.height
      
      if (overlapArea / tileArea > 0.5) {
        isBlocked = true
        break
      }
    }
  }
  
  tile.masked = isBlocked
}

// 为单个方块设置IntersectionObserver
const setupTileObserver = (tile) => {
  const element = tileRefs.value[tile.id]
  if (!element) {
    tile.masked = false
    return null
  }
  
  // 初始状态：默认可见（可点击）
  tile.masked = false
  
  try {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 使用 isVisible 属性检测是否被遮挡（参考羊了个羊源码）
        if (entry.isVisible === false) {
          tile.masked = true
        } else {
          tile.masked = false
        }
      },
      {
        threshold: [1.0], // 只有当元素完全可见时才触发
        delay: 1000, // 延迟1000ms，避免频繁触发（参考羊了个羊）
        trackVisibility: true, // 启用可见性跟踪
      }
    )
    
    observer.observe(element)
    return observer
  } catch (e) {
    // 如果 IntersectionObserver 不支持或出错，使用手动检测
    console.warn('IntersectionObserver not supported or error:', e)
    checkTileVisibilityManually(tile, element)
    return null
  }
}

// 使用IntersectionObserver检测方块可见性（只在初始化时调用一次）
const setupIntersectionObserver = () => {
  // 延迟设置，确保DOM完全渲染
  setTimeout(() => {
    nextTick(() => {
      tiles.value.forEach(tile => {
        // 如果已经有observer，跳过
        if (tile._observer) return
        
        const observer = setupTileObserver(tile)
        if (observer) {
          tile._observer = observer
          tileObservers.value.push(observer)
        }
      })
    })
  }, 500) // 延迟500ms确保所有方块都已渲染
}

// 创建方块（完全随机位置，类似羊了个羊）
const createTile = (wordData, type) => {
  const padding = 30
  const tileWidth = TILE_SIZE.value
  const tileHeight = TILE_SIZE.value
  
  // 获取游戏容器尺寸（使用计算出的游戏区域尺寸）
  const containerWidth = gameStyle.value.width === '100%' 
    ? Math.min(window.innerWidth - 32, 1152) 
    : parseInt(gameStyle.value.width)
  const containerHeight = parseInt(gameStyle.value.height) || 600
  
  // 完全随机位置，确保在容器内
  const maxLeft = containerWidth - tileWidth - padding
  const maxTop = containerHeight - tileHeight - padding
  
  const randomLeft = padding + R() * Math.max(0, maxLeft - padding)
  const randomTop = padding + R() * Math.max(0, maxTop - padding)
  
  return {
    id: `tile-${Date.now()}-${Math.random()}-${type}`,
    word: wordData.word,
    meaning: wordData.meaning,
    emoji: wordData.emoji || wordData.image || null,
    type: type, // 'word', 'meaning', or 'emoji'
    left: randomLeft,
    top: randomTop,
    selected: false,
    fadeOut: false,
    masked: false // 是否被遮挡
  }
}

// 获取方块样式（完全随机位置）
const getTileStyle = (tile) => {
  const baseFontSize = isMobile.value ? Math.min(TILE_SIZE.value * 0.3, 20) : Math.min(TILE_SIZE.value * 0.25, 24)
  
  return {
    position: 'absolute',
    borderRadius: '8px',
    transition: tile.fadeOut ? 'opacity 0.3s ease, transform 0.3s ease' : 'none', // 只在fade-out时使用transition
    textAlign: 'center',
    padding: isMobile.value ? '2px' : '4px',
    width: `${TILE_SIZE.value}px`,
    height: `${TILE_SIZE.value}px`,
    backgroundColor: tile.selected ? '#fff' : '#c2812e',
    color: tile.selected ? '#000' : '#fff',
    border: '2px solid rgba(255,255,255,0.3)',
    cursor: tile.masked ? 'not-allowed' : 'pointer',
    left: `${tile.left}px`,
    top: `${tile.top}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: tile.selected 
      ? '0 0 15px rgba(255,255,255,0.6), inset 0 0 20px rgba(0,0,0,0.1)' 
      : 'inset 0 0 20px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.3)',
    boxSizing: 'border-box',
    fontSize: `${baseFontSize}px`,
    fontWeight: 'bold',
    pointerEvents: tile.masked ? 'none' : 'auto',
    zIndex: tile.masked ? 1 : 10 // 被遮挡的方块z-index较低
  }
}

// 根据单词获取颜色（根据类型使用不同颜色方案）
const getColorForWord = (word, type) => {
  if (!word) return 'hsl(0, 40%, 35%)'
  
  // 根据类型使用不同的颜色范围
  let baseHue = 0
  if (type === 'word') {
    baseHue = 200 // 蓝色系
  } else if (type === 'meaning') {
    baseHue = 120 // 绿色系
  } else if (type === 'emoji') {
    baseHue = 300 // 紫色系
  }
  
  let hash = 0
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  hash = Math.abs(hash)
  const hue = (baseHue + hash % 60) % 360 // 在基础色调周围变化
  const saturation = 50 + (hash % 20)
  const lightness = 40 + (hash % 15)
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// 计算存储槽大小（确保7个槽能在一行显示）
const storageSlotSize = computed(() => {
  const containerWidth = storageContainerWidth.value || (window.innerWidth - 64) // 默认容器宽度（减去padding）
  const gap = 2 // 进一步缩小边距到 2px
  const padding = 4 // px-1 = 4px on each side
  const availableWidth = containerWidth - padding * 2
  const totalGaps = 6 * gap // 7个槽之间有6个gap
  const maxSlotSize = (availableWidth - totalGaps) / 7
  
  // 如果计算出的尺寸小于默认尺寸，使用计算出的尺寸；否则使用默认尺寸
  const defaultSize = TILE_SIZE.value * 0.8
  return Math.max(40, Math.min(maxSlotSize, defaultSize)) // 最小40px，确保可读性
})

// 更新存储容器宽度
const updateStorageContainerWidth = () => {
  if (storageContainer.value) {
    storageContainerWidth.value = storageContainer.value.offsetWidth
  }
}

// 获取存储槽样式
const getStorageSlotStyle = (slot) => {
  const size = storageSlotSize.value
  return {
    width: `${size}px`,
    height: `${size}px`,
    minWidth: `${size}px`,
    flexShrink: 0, // 防止缩小
    borderRadius: '6px',
    border: slot ? '2px solid rgba(255,255,255,0.5)' : '2px dashed rgba(255,255,255,0.3)',
    backgroundColor: slot ? '#c2812e' : 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px', // 减少内边距，让 emoji 占满块
    fontSize: `${Math.min(size * 0.25, 16)}px`,
    color: '#fff',
    fontWeight: 'bold',
    boxSizing: 'border-box'
  }
}

// 设置 tile 的 DOM 引用
const setTileRef = (el, id) => {
  if (el) {
    tileRefs.value[id] = el
  } else {
    delete tileRefs.value[id]
  }
}

// 检查方块是否可点击（通过masked属性判断）
const isTileClickable = (tile) => {
  return !tile.masked && !tile.fadeOut
}

// 处理方块点击
const handleTileClick = (tile) => {
  if (isLocked.value || !isTileClickable(tile)) return
  
  // 检查存储区是否已满
  const emptySlotIndex = storageSlots.value.findIndex(slot => !slot)
  if (emptySlotIndex === -1) {
    // 存储区已满，游戏结束
    gameOver(false)
    return
  }
  
  // 查找是否有相同单词的方块（通过word匹配，因为同一单词的不同类型应该归类）
  const sameWordSlots = storageSlots.value.filter(slot => 
    slot && slot.word === tile.word
  )
  
  // 如果找到了相同单词的方块，需要重新排列，让相同单词的方块聚集在一起
  if (sameWordSlots.length > 0) {
    // 收集所有相同单词的方块
    const sameWordGroup = []
    const otherSlots = []
    
    storageSlots.value.forEach((slot) => {
      if (slot) {
        if (slot.word === tile.word) {
          sameWordGroup.push(slot)
        } else {
          otherSlots.push(slot)
        }
      }
    })
    
    // 添加新方块到相同单词组
    sameWordGroup.push({
      word: tile.word,
      meaning: tile.meaning,
      emoji: tile.emoji,
      type: tile.type,
      originalId: tile.id
    })
    
    // 重新排列：先放相同单词的方块，再放其他方块
    const newStorageSlots = Array(7).fill(null)
    let currentIndex = 0
    
    // 先放置相同单词的方块
    sameWordGroup.forEach((slot) => {
      if (currentIndex < 7) {
        newStorageSlots[currentIndex] = slot
        currentIndex++
      }
    })
    
    // 再放置其他方块
    otherSlots.forEach((slot) => {
      if (currentIndex < 7) {
        newStorageSlots[currentIndex] = slot
        currentIndex++
      }
    })
    
    storageSlots.value = newStorageSlots
  } else {
    // 没有相同单词的方块，直接放在第一个空槽位
    storageSlots.value[emptySlotIndex] = {
      word: tile.word,
      meaning: tile.meaning,
      emoji: tile.emoji,
      type: tile.type, // 保存类型信息
      originalId: tile.id
    }
  }
  
  // 移除方块
  removeTile(tile)
  
  // 延迟检查匹配（参考羊了个羊，延迟100ms后统一处理）
  setTimeout(() => {
    checkAndRemoveMatches()
  }, 100)
}

// 检查并移除匹配（英文单词+中文含义+emoji组合）
const checkAndRemoveMatches = () => {
  // 按单词分组统计存储区中的类型
  const wordGroups = new Map()
  
  storageSlots.value.forEach((slot, index) => {
    if (slot) {
      if (!wordGroups.has(slot.word)) {
        wordGroups.set(slot.word, {
          word: null,      // 英文单词的位置
          meaning: null,   // 中文含义的位置
          emoji: null      // emoji的位置
        })
      }
      
      const group = wordGroups.get(slot.word)
      if (slot.type === 'word' && group.word === null) {
        group.word = index
      } else if (slot.type === 'meaning' && group.meaning === null) {
        group.meaning = index
      } else if (slot.type === 'emoji' && group.emoji === null) {
        group.emoji = index
      }
    }
  })
  
  // 找出完整的组合（word + meaning + emoji）
  const matchesToRemove = []
  wordGroups.forEach((group, word) => {
    if (group.word !== null && group.meaning !== null && group.emoji !== null) {
      matchesToRemove.push({
        word: word,
        indices: [group.word, group.meaning, group.emoji]
      })
    }
  })
  
  // 移除匹配的组合
  const removedIndices = new Set()
  matchesToRemove.forEach(match => {
    match.indices.forEach(index => {
      storageSlots.value[index] = null
      removedIndices.add(index)
    })
  })
  
  // 如果有方块被移除，重新排列存储区，让所有方块靠左排列
  if (removedIndices.size > 0) {
    const newStorageSlots = Array(7).fill(null)
    let currentIndex = 0
    
    // 将所有非空的方块移到左边
    storageSlots.value.forEach((slot) => {
      if (slot) {
        newStorageSlots[currentIndex] = slot
        currentIndex++
      }
    })
    
    storageSlots.value = newStorageSlots
  }
  
  // 延迟检查关卡是否完成（确保状态更新完成）
  // 增加延迟时间，确保所有动画和状态更新都完成
  setTimeout(() => {
    checkLevelComplete()
  }, 200)
}

// 移除方块
const removeTile = (tile) => {
  tile.fadeOut = true
  // 使用更长的动画时间，让移除更平滑
  setTimeout(() => {
    // 断开该方块的observer
    if (tile._observer) {
      tile._observer.disconnect()
      const observerIndex = tileObservers.value.indexOf(tile._observer)
      if (observerIndex !== -1) {
        tileObservers.value.splice(observerIndex, 1)
      }
      delete tile._observer
    }
    
    const index = tiles.value.findIndex(t => t.id === tile.id)
    if (index !== -1) {
      tiles.value.splice(index, 1)
    }
    
    // 方块移除后，其他方块的可见性可能改变，但不需要重新设置所有observer
    // IntersectionObserver会自动检测变化，只需要等待一下让浏览器更新
    // 方块移除后，检查关卡是否完成
    if (tiles.value.length === 0 && storageSlots.value.every(slot => !slot)) {
      setTimeout(() => {
        checkLevelComplete()
      }, 100)
    }
  }, 300) // 增加到300ms，让动画更平滑
}

// 检查关卡是否完成
const checkLevelComplete = () => {
  // 检查是否所有方块都已移除且存储区为空
  const allTilesRemoved = tiles.value.length === 0
  const storageEmpty = storageSlots.value.every(slot => !slot)
  
  // 调试日志
  console.log('检查关卡完成:', {
    tilesCount: tiles.value.length,
    allTilesRemoved,
    storageEmpty,
    storageSlots: storageSlots.value
  })
  
  if (allTilesRemoved && storageEmpty) {
    completeLevel()
  }
}

// 完成关卡
const completeLevel = () => {
  isLocked.value = true
  // 延迟显示弹窗，确保所有动画完成
  setTimeout(() => {
    showLevelComplete.value = true
  }, 300)
}

// 确认进入下一关
const confirmNextLevel = () => {
  showLevelComplete.value = false
  level.value++
  isLocked.value = false
  initGame()
}

// 处理关卡完成弹窗点击
const handleLevelCompleteClick = () => {
  // 点击背景不关闭，必须点击按钮
}

// 游戏结束
const gameOver = () => {
  showGameOver.value = true
  isLocked.value = true
}

// 确认重新开始
const confirmRestart = () => {
  showGameOver.value = false
  level.value = 1
  restartGame()
}

// 处理游戏结束弹窗点击
const handleGameOverClick = () => {
  // 点击背景不关闭，必须点击按钮
}

// 加载单词数据
const loadWords = async () => {
  try {
    error.value = ''
    // 确保选择的词汇已加载
    loadSelectedVocabulary()
    
    // 加载词汇数据
    await loadVocabularyData()
    
    // 检查是否有选择的词汇
    if (!hasSelectedVocabulary.value) {
      error.value = '请先选择词库'
      return
    }
    
    // 加载单词并增强emoji数据
    let wordData = await getSelectedWords({ withEmoji: true })
    
    console.log('WordStack - 加载的词汇数据:', {
      hasSelectedVocabulary: hasSelectedVocabulary.value,
      wordDataLength: wordData.length,
      firstFewWords: wordData.slice(0, 3)
    })
    
    // 如果没有emoji，尝试增强
    if (wordData.length > 0 && !wordData.some(w => w.emoji || w.image)) {
      wordData = await enhanceWordsWithEmoji(wordData)
    }
    
    // 过滤掉没有emoji的单词
    wordData = wordData.filter(w => w.emoji || w.image)
    
    if (wordData.length === 0) {
      error.value = '选择的词库中没有带emoji的单词，请选择其他词库'
      return
    }
    
    console.log('成功加载词汇，共', wordData.length, '个单词（已过滤无emoji的单词）')
    words.value = wordData
    initGame()
  } catch (err) {
    console.error('加载词汇数据失败:', err)
    error.value = '加载词汇数据失败，请重试或选择其他词库'
  }
}

// 根据关卡计算游戏参数
const getLevelConfig = (levelNum) => {
  // 关卡1-3: 简单（少量单词）
  // 关卡4-6: 中等（中等单词）
  // 关卡7+: 困难（大量单词）
  // 注意：每个单词需要3个方块（word, meaning, emoji）
  
  if (levelNum <= 3) {
    return {
      numWordTypes: 3 + levelNum // 3-6种单词类型（每种3个方块，共9-18个方块）
    }
  } else if (levelNum <= 6) {
    return {
      numWordTypes: 6 + (levelNum - 3) * 2 // 6-12种单词类型（每种3个方块，共18-36个方块）
    }
  } else {
    return {
      numWordTypes: 12 + (levelNum - 6) * 3 // 12+种单词类型（每种3个方块，共36+个方块）
    }
  }
}

// 初始化游戏
const initGame = () => {
  isLocked.value = false
  tiles.value = []
  selectedTile.value = null
  storageSlots.value = Array(7).fill(null)
  showGameOver.value = false
  showLevelComplete.value = false
  
  if (words.value.length === 0) {
    error.value = '词汇数据为空'
    return
  }
  
  // 根据关卡获取配置
  const config = getLevelConfig(level.value)
  const { numWordTypes } = config
  
  // 选择要使用的单词（每个单词创建3个方块：word, meaning, emoji）
  const selectedWords = []
  const usedWordIndices = new Set()
  
  // 随机选择不重复的单词
  for (let i = 0; i < numWordTypes && usedWordIndices.size < words.value.length; i++) {
    let randomIndex
    do {
      randomIndex = Math.floor(R() * words.value.length)
    } while (usedWordIndices.has(randomIndex))
    usedWordIndices.add(randomIndex)
    
    const word = words.value[randomIndex]
    // 每个单词创建3种类型的方块
    selectedWords.push(
      { wordData: word, type: 'word' },
      { wordData: word, type: 'meaning' },
      { wordData: word, type: 'emoji' }
    )
  }
  
  // 打乱顺序
  for (let i = selectedWords.length - 1; i > 0; i--) {
    const j = Math.floor(R() * (i + 1));
    [selectedWords[i], selectedWords[j]] = [selectedWords[j], selectedWords[i]]
  }
  
  // 创建方块（完全随机位置，类似羊了个羊）
  selectedWords.forEach(({ wordData, type }) => {
    const tile = createTile(wordData, type)
    // 初始状态：所有方块默认可见（可点击）
    tile.masked = false
    tiles.value.push(tile)
  })
  
  // 等待DOM渲染后设置IntersectionObserver
  // 延迟更长时间确保所有方块都已渲染
  setTimeout(() => {
    nextTick(() => {
      setupIntersectionObserver()
    })
  }, 800)
}

// 重新开始游戏
const restartGame = () => {
  level.value = 1
  initGame()
}

// 处理窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  updateStorageContainerWidth()
}

onMounted(() => {
  loadWords()
  window.addEventListener('resize', handleResize)
  
  // 等待DOM渲染后初始化存储容器宽度
  nextTick(() => {
    updateStorageContainerWidth()
    
    // 使用ResizeObserver监听容器大小变化
    if (storageContainer.value && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        updateStorageContainerWidth()
      })
      resizeObserver.observe(storageContainer.value)
      
      // 保存observer以便清理
      storageContainer.value._resizeObserver = resizeObserver
    }
  })
})

onUnmounted(() => {
  tileRefs.value = {}
  window.removeEventListener('resize', handleResize)
  
  // 清理IntersectionObserver
  if (tileObservers.value) {
    tileObservers.value.forEach(observer => observer.disconnect())
    tileObservers.value = []
  }
  
  // 清理所有方块的observer引用
  tiles.value.forEach(tile => {
    if (tile._observer) {
      delete tile._observer
    }
  })
  
  // 清理ResizeObserver
  if (storageContainer.value && storageContainer.value._resizeObserver) {
    storageContainer.value._resizeObserver.disconnect()
  }
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
  font-family: 'Inter', sans-serif;
  text-overflow: hidden;
  overflow: hidden;
}

.tile-content {
  font-size: 0.8em;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  line-height: 1.2;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
  max-width: 100%;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 当内容是文本时，使用多行截断 */
.tile-content > span:not(.emoji-display) {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  width: 100%;
}

.tile.selected {
  transform: scale(1.1);
  z-index: 100;
}

.tile {
  animation: slideIn 1s ease-out;
}

.tile.fade-out {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

@keyframes slideIn {
  0% {
    transform: translateX(300px);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

.tile.mask::before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 8px;
  z-index: 1;
}

.storage-slot {
  transition: all 0.2s ease;
  flex-shrink: 0; /* 防止缩小 */
}

.storage-slot.full {
  cursor: pointer;
}

.storage-content {
  font-size: 0.7em;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-display {
  font-size: 2.5em;
  line-height: 1;
  display: inline-block;
  min-width: 1em;
  min-height: 1em;
}

/* 在方块中的 emoji 显示 */
.tile-content .emoji-display {
  font-size: 4.5em;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 在存储区中的 emoji 显示 */
.storage-content .emoji-display {
  font-size: 5em;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  text-shadow: 
    0 3px 6px rgba(0,0,0,0.15),
    0 1px 3px rgba(0,0,0,0.1),
    0 0 0 3px rgba(107, 163, 216, 0.4),
    0 0 0 4px rgba(107, 163, 216, 0.2);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.bubble-title::before {
  content: '词了个词';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: rgba(255, 255, 255, 0.3);
  text-shadow: 
    2px 2px 0 rgba(107, 163, 216, 0.3),
    1px 1px 0 rgba(107, 163, 216, 0.2);
  z-index: -1;
  transform: translate(2px, 2px);
}

.bubble-title::after {
  content: '';
  position: absolute;
  top: 15%;
  left: 15%;
  width: 25%;
  height: 25%;
  background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
  filter: blur(3px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .bubble-title {
    font-size: 2rem;
  }
  
  .tile-content {
    font-size: 0.7em;
  }
  
  .tile-content .emoji-display {
    font-size: 4em;
  }
  
  .storage-content {
    font-size: 0.6em;
  }
  
  .storage-content .emoji-display {
    font-size: 4.5em;
  }
}
</style>

