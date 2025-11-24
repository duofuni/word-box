<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4">
    <!-- Header -->
    <div class="max-w-4xl mx-auto px-4 mb-6">
      <div class="flex items-center justify-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">选择词库</h1>
      </div>

      <!-- Category Tabs -->
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="[
            'px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200',
            selectedCategoryId === category.id
              ? 'bg-gray-800 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          ]"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- Vocabulary Cards -->
    <div class="max-w-4xl mx-auto px-4">
      <div v-if="loading" class="text-center text-gray-500 py-12">
        加载中...
      </div>
      <div v-else-if="error" class="text-center text-red-500 py-12">
        {{ error }}
      </div>
      <div v-else class="space-y-4">
        <div v-if="loadingVocabularies" class="text-center text-gray-500 py-8">
          加载词库中...
        </div>
        <div
          v-else
          v-for="vocab in currentVocabularies"
          :key="vocab.id"
          @click="selectVocabulary(vocab)"
          class="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div class="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            <!-- Content -->
            <div class="flex-1">
              <h3 class="text-xl font-bold text-gray-800 mb-1">{{ vocab.name }}</h3>
              <p class="text-sm text-gray-600 mb-4">{{ vocab.description }}</p>
              
              <!-- Stats -->
              <div class="flex gap-2 flex-wrap">
                <span class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {{ vocab.wordCount || vocab.words?.length || 0 }}个单词
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="currentVocabularies.length === 0" class="text-center text-gray-500 py-12">
          该分类下暂无词库
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVocabulary } from '../composables/useVocabulary'

const router = useRouter()
const { vocabularyData, loadVocabularyData, setSelectedVocabulary, getCategoryVocabularies, loadCategories } = useVocabulary()

const loading = ref(true)
const error = ref(null)
const selectedCategoryId = ref('daily')
const categories = ref([])
const currentVocabularies = ref([])
const loadingVocabularies = ref(false)

const selectCategory = async (categoryId) => {
  selectedCategoryId.value = categoryId
  await loadVocabulariesForCategory(categoryId)
}

const loadVocabulariesForCategory = async (categoryId) => {
  try {
    loadingVocabularies.value = true
    currentVocabularies.value = await getCategoryVocabularies(categoryId)
  } catch (err) {
    console.error('Failed to load vocabularies:', err)
    currentVocabularies.value = []
  } finally {
    loadingVocabularies.value = false
  }
}

const selectVocabulary = (vocab) => {
  setSelectedVocabulary(selectedCategoryId.value, vocab.id)
  router.push('/')
}

onMounted(async () => {
  try {
    loading.value = true
    // Load categories list
    categories.value = await loadCategories()
    
    // Set default category if exists
    if (categories.value.length > 0 && !categories.value.find(c => c.id === selectedCategoryId.value)) {
      selectedCategoryId.value = categories.value[0].id
    }
    
    // Load vocabularies for the selected category
    if (selectedCategoryId.value) {
      await loadVocabulariesForCategory(selectedCategoryId.value)
    }
  } catch (err) {
    error.value = '加载词库数据失败，请检查文件'
    console.error('Failed to load vocabulary data:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>

