<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col items-center justify-center p-4 relative overflow-hidden pattern-dots">
    <!-- 装饰性背景元素 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-20 w-56 h-56 bg-purple-400/10 rounded-full blur-3xl float-animation"></div>
      <div class="absolute bottom-20 right-20 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl float-animation" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/4 w-48 h-48 bg-orange-400/10 rounded-full blur-3xl float-animation" style="animation-delay: 2s;"></div>
      <div class="absolute top-32 right-1/4 text-purple-300/20 text-5xl float-animation" style="animation-delay: 1.5s;">✦</div>
      <div class="absolute bottom-40 left-1/3 text-pink-300/20 text-4xl float-animation" style="animation-delay: 2.5s;">✦</div>
      <div class="absolute top-1/2 right-1/3 text-orange-300/20 text-3xl float-animation" style="animation-delay: 0.8s;">✦</div>
    </div>
    
    <!-- 头部区域 -->
    <div class="w-full max-w-2xl mb-8 relative z-10">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
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
        
        <!-- 标题 -->
        <div class="flex-1 text-center px-4">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800">单词测验挑战</h1>
        </div>
        
        <!-- 占位元素，保持居中 -->
        <div class="w-10"></div>
      </div>
    </div>

    <!-- 数字显示区域 -->
    <div class="mb-12">
      <div 
        ref="numberElement"
        class="text-9xl md:text-[12rem] font-bold transition-all duration-500 ease-out"
        :class="{
          'text-purple-600': count > 10,
          'text-pink-600': count > 5 && count <= 10,
          'text-orange-600': count > 0 && count <= 5,
          'text-green-600': count === 0
        }"
        :style="{ 
          textShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }"
      >
        {{ count }}
      </div>
    </div>

    <!-- 游戏区域 -->
    <div v-if="count > 0" class="w-full max-w-2xl relative z-10">
      <!-- 当前单词卡片 -->
      <div ref="questionCard" class="glass-effect rounded-3xl shadow-xl p-8 mb-6 transform transition-all duration-300 hover:scale-105 border border-white/50">
        <div class="text-center mb-6">
          <p class="text-sm text-gray-500 mb-2">请选择正确的中文含义</p>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-800 mb-2">{{ currentWord.word }}</h2>
        </div>

        <!-- 选项按钮 -->
        <div ref="optionsContainer" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            v-for="(option, index) in options"
            :key="`${currentWord.word}-${index}`"
            :ref="el => setOptionRef(el, index)"
            @click="selectAnswer(option)"
            :disabled="isAnswered"
            :class="[
              'px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform',
              'hover:scale-105 active:scale-95',
              isAnswered && option === currentWord.meaning
                ? 'bg-green-500 text-white shadow-lg'
                : isAnswered && option !== currentWord.meaning && selectedAnswer === option
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gradient-to-r from-purple-100 to-pink-100 text-gray-800 hover:from-purple-200 hover:to-pink-200 shadow-md'
            ]"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <!-- 提示信息 -->
      <div v-if="isAnswered" class="text-center">
        <p 
          :class="[
            'text-lg font-semibold mb-2',
            isCorrect ? 'text-green-600' : 'text-red-600'
          ]"
        >
          {{ isCorrect ? '✓ 回答正确！' : '✗ 回答错误，正确答案是：' + currentWord.meaning }}
        </p>
        <p class="text-sm text-gray-500 mt-2">自动进入下一题...</p>
      </div>
    </div>

    <!-- 完成界面 -->
    <div v-else class="text-center relative z-10">
      <div class="glass-effect rounded-3xl shadow-xl p-12 max-w-md border border-white/50">
        <div class="text-6xl mb-6">🎉</div>
        <h2 class="text-3xl font-bold text-gray-800 mb-4">恭喜完成！</h2>
        <p class="text-gray-600 mb-6">你已经成功完成所有单词测验！</p>
        <button
          @click="restartGame"
          class="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          再来一次
        </button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="mt-8 flex gap-6 text-center relative z-10">
      <div class="glass-effect rounded-2xl shadow-lg px-6 py-4 border border-white/50">
        <div class="text-2xl font-bold text-purple-600">{{ correctCount }}</div>
        <div class="text-sm text-gray-600">正确</div>
      </div>
      <div class="glass-effect rounded-2xl shadow-lg px-6 py-4 border border-white/50">
        <div class="text-2xl font-bold text-pink-600">{{ totalAnswered }}</div>
        <div class="text-sm text-gray-600">已答</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

const words = ref([])
const count = ref(20) // 初始数字
const currentWordIndex = ref(0)
const options = ref([])
const isAnswered = ref(false)
const selectedAnswer = ref('')
const isCorrect = ref(false)
const correctCount = ref(0)
const totalAnswered = ref(0)
const usedWords = ref(new Set())
const numberElement = ref(null)
const questionCard = ref(null)
const optionsContainer = ref(null)
const optionRefs = ref({})
let animationTimeline = null

const currentWord = computed(() => {
  if (words.value.length === 0) return { word: '', meaning: '' }
  return words.value[currentWordIndex.value] || { word: '', meaning: '' }
})

const setOptionRef = (el, index) => {
  if (el) {
    optionRefs.value[index] = el
  } else {
    delete optionRefs.value[index]
  }
}

const loadWords = async () => {
  try {
    const response = await fetch('/words.json')
    if (!response.ok) {
      throw new Error('加载词汇数据失败')
    }
    const wordData = await response.json()
    // 打乱顺序
    words.value = wordData.sort(() => Math.random() - 0.5)
    initQuestion()
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
    initQuestion()
  }
}

const initQuestion = () => {
  if (words.value.length === 0) return
  
  // 找到未使用的单词
  let availableWords = words.value.filter((_, index) => !usedWords.value.has(index))
  if (availableWords.length === 0) {
    // 如果所有单词都用过了，重置
    usedWords.value.clear()
    availableWords = words.value
  }
  
  // 随机选择一个单词
  const randomIndex = Math.floor(Math.random() * availableWords.length)
  const wordIndex = words.value.indexOf(availableWords[randomIndex])
  currentWordIndex.value = wordIndex
  usedWords.value.add(wordIndex)
  
  // 生成选项（1个正确答案 + 3个错误答案）
  const correctAnswer = words.value[wordIndex].meaning
  const wrongAnswers = words.value
    .filter((w, i) => i !== wordIndex && w.meaning !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(w => w.meaning)
  
  // 合并并打乱选项
  options.value = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)
  isAnswered.value = false
  selectedAnswer.value = ''
  
  // 如果卡片存在，确保可见，并添加选项按钮的入场动画
  nextTick(() => {
    if (questionCard.value) {
      gsap.set(questionCard.value, { opacity: 1, y: 0 })
      
      // 为选项按钮添加依次出现的动画
      Object.values(optionRefs.value).forEach((button, index) => {
        if (button) {
          gsap.fromTo(button, 
            { opacity: 0, y: 20 },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.4, 
              delay: index * 0.1,
              ease: 'power2.out' 
            }
          )
        }
      })
    }
  })
}

const selectAnswer = (answer) => {
  if (isAnswered.value) return
  
  // 清除之前的动画时间线
  if (animationTimeline) {
    animationTimeline.kill()
    animationTimeline = null
  }
  
  isAnswered.value = true
  selectedAnswer.value = answer
  isCorrect.value = answer === currentWord.value.meaning
  totalAnswered.value++
  
  // 创建 GSAP 时间线
  animationTimeline = gsap.timeline()
  
  if (isCorrect.value) {
    correctCount.value++
    // 数字减1，带动画效果
    decreaseCount(() => {
      // 数字动画完成后，延迟1秒自动进入下一题
      animationTimeline = gsap.timeline({
        delay: 1,
        onComplete: () => {
          if (count.value > 0) {
            nextQuestion()
          }
        }
      })
    })
  } else {
    // 答错了，延迟1.5秒后自动进入下一题（给用户更多时间看正确答案）
    animationTimeline = gsap.timeline({
      delay: 1.5,
      onComplete: () => {
        if (count.value > 0) {
          nextQuestion()
        }
      }
    })
  }
}

const decreaseCount = (callback) => {
  if (count.value > 0) {
    // 数字变化时的视觉反馈动画
    if (numberElement.value) {
      // 先放大再缩小，创造弹跳效果
      gsap.to(numberElement.value, {
        scale: 1.3,
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          // 更新数字
          count.value--
          // 然后缩小回正常大小
          gsap.to(numberElement.value, {
            scale: 1,
            duration: 0.3,
            ease: 'back.out(1.7)',
            onComplete: () => {
              // 动画完成后执行回调
              if (callback) callback()
            }
          })
        }
      })
    } else {
      // 如果没有找到元素，直接更新数字
      count.value--
      if (callback) callback()
    }
  } else {
    if (callback) callback()
  }
}

const nextQuestion = () => {
  // 清除动画时间线
  if (animationTimeline) {
    animationTimeline.kill()
    animationTimeline = null
  }
  
  if (count.value > 0 && questionCard.value) {
    // 使用 GSAP 创建淡出动画，然后切换题目，再淡入
    animationTimeline = gsap.timeline({
      onComplete: () => {
        // 淡出完成后切换题目
        initQuestion()
        // 使用 nextTick 确保 DOM 更新后再执行淡入动画
        nextTick(() => {
          if (questionCard.value) {
            // 重置透明度，准备淡入
            gsap.set(questionCard.value, { opacity: 0, y: 20 })
            // 淡入新题目
            gsap.to(questionCard.value, {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out'
            })
          }
        })
      }
    })
    
    // 淡出当前题目
    animationTimeline.to(questionCard.value, {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: 'power2.in'
    })
  } else if (count.value > 0) {
    // 如果没有卡片元素，直接切换
    initQuestion()
  }
}

const restartGame = () => {
  // 清理动画时间线
  if (animationTimeline) {
    animationTimeline.kill()
    animationTimeline = null
  }
  
  count.value = 20
  correctCount.value = 0
  totalAnswered.value = 0
  usedWords.value.clear()
  isAnswered.value = false
  selectedAnswer.value = ''
  
  // 重置卡片动画状态
  if (questionCard.value) {
    gsap.set(questionCard.value, { opacity: 1, y: 0 })
  }
  
  initQuestion()
}

onMounted(() => {
  loadWords()
})

onUnmounted(() => {
  // 清理动画时间线
  if (animationTimeline) {
    animationTimeline.kill()
    animationTimeline = null
  }
})
</script>

<style scoped>
/* 数字动画效果 */
.text-9xl,
.text-\[12rem\] {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>

