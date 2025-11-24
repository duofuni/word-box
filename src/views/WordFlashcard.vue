<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden pattern-dots">
    <!-- 装饰性背景元素 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-10 right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl float-animation"></div>
      <div class="absolute bottom-10 left-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl float-animation" style="animation-delay: 1.5s;"></div>
      <div class="absolute top-1/2 left-1/4 text-blue-300/20 text-4xl float-animation" style="animation-delay: 2s;">✦</div>
    </div>
    
    <div class="max-w-[400px] mx-auto my-5 p-4 glass-effect rounded-3xl shadow-xl relative z-10 border border-white/50">
      <!-- 头部区域 -->
      <div class="flex items-center justify-center mb-6 pb-4 border-b border-gray-100">
        <!-- 标题和描述 -->
        <div class="text-center px-4">
          <h2 class="text-2xl font-bold text-gray-800 mb-1">单词闪卡</h2>
          <p class="text-xs text-gray-500">点击单词查看中文含义</p>
        </div>
      </div>
      
      <div v-if="loading" class="text-center text-gray-500 py-8">加载中...</div>
      <div v-else-if="error" class="text-red-500 text-center py-8">{{ error }}</div>
      <div v-else>
        <div
          v-for="(word, index) in words"
          :key="index"
          class="pb-[10px] relative group"
        >
          <div class="text-xl font-bold text-[#333] mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
            <span v-if="word.emoji || word.image" class="text-2xl">{{ word.emoji || word.image }}</span>
            <span class="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">✦</span>
            {{ word.word }}
          </div>
          <div
            :class="[
              'word-chinese absolute top-[35px] left-0 w-full h-6 leading-6 rounded transition-all duration-300 ease-in-out text-[#666]',
              showMeaning[index] ? 'opacity-100 visible' : 'opacity-0 invisible'
            ]"
            @click="toggleMeaning(index)"
          >
            {{ word.meaning }}
          </div>
          <div
            :class="[
              'mask absolute top-[34px] left-0 w-full h-6 leading-6 rounded bg-[#e9ecef] cursor-pointer transition-all duration-300 ease-in-out',
              showMeaning[index] ? 'opacity-0 invisible' : 'opacity-100 visible'
            ]"
            @click="toggleMeaning(index)"
          ></div>
          <div
            v-if="index < words.length - 1"
            class="h-px bg-[#f0f0f0] mb-[5px] mt-[42px]"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVocabulary } from '../composables/useVocabulary'

const { loadVocabularyData, getSelectedWords } = useVocabulary()

const words = ref([])
const loading = ref(true)
const error = ref('')
const showMeaning = ref({})

const toggleMeaning = (index) => {
  showMeaning.value[index] = !showMeaning.value[index]
}

const loadWords = async () => {
  try {
    loading.value = true
    await loadVocabularyData()
    // Load words with emoji enhancement
    const wordData = await getSelectedWords({ withEmoji: true })
    
    if (wordData.length === 0) {
      error.value = '请先选择词库'
      return
    }
    
    words.value = wordData
    // 初始化所有单词的显示状态为隐藏
    wordData.forEach((_, index) => {
      showMeaning.value[index] = false
    })
  } catch (err) {
    error.value = '加载词汇数据失败，请检查 words.json 文件'
    console.error('加载词汇数据失败:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWords()
})
</script>

