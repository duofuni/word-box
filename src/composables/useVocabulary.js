import { ref, computed } from 'vue'
import { enhanceWordsWithEmoji } from './useEmoji'

// Vocabulary data structure
const vocabularyData = ref(null)
const selectedVocabularyId = ref(null)
const selectedCategory = ref(null)
// Cache for loaded vocabulary words
const vocabularyWordsCache = ref({})
// Cache for loaded categories
const categoryCache = ref({})

// Load categories list
const loadCategories = async () => {
  try {
    // Try new format first (categories.json)
    let response = await fetch(`${import.meta.env.BASE_URL}categories.json`)
    if (!response.ok) {
      // Fallback to old format (vocabularies.json or words.json)
      response = await fetch(`${import.meta.env.BASE_URL}vocabularies.json`)
      if (!response.ok) {
        response = await fetch(`${import.meta.env.BASE_URL}words.json`)
        if (!response.ok) {
          throw new Error('Failed to load categories')
        }
      }
      const data = await response.json()
      // If it's the old vocabularies.json format
      if (data.categories) {
        return data.categories.map(cat => ({ id: cat.id, name: cat.name }))
      }
      // If it's the old words.json format (array), return empty
      return []
    }
    return await response.json()
  } catch (err) {
    console.error('Failed to load categories:', err)
    throw err
  }
}

// Load vocabulary data for a specific category
const loadCategoryData = async (categoryId) => {
  // Check cache first
  if (categoryCache.value[categoryId]) {
    return categoryCache.value[categoryId]
  }
  
  try {
    // Try new format: vocabularies/{categoryId}.json
    let response = await fetch(`${import.meta.env.BASE_URL}vocabularies/${categoryId}.json`)
    if (!response.ok) {
      // Fallback: try to load from vocabularies.json
      if (!vocabularyData.value) {
        response = await fetch(`${import.meta.env.BASE_URL}vocabularies.json`)
        if (response.ok) {
          const data = await response.json()
          vocabularyData.value = data
        }
      }
      
      // If we have vocabularyData, find the category
      if (vocabularyData.value?.categories) {
        const category = vocabularyData.value.categories.find(c => c.id === categoryId)
        if (category) {
          categoryCache.value[categoryId] = category
          return category
        }
      }
      
      throw new Error(`Failed to load category: ${categoryId}`)
    }
    
    const categoryData = await response.json()
    categoryCache.value[categoryId] = categoryData
    return categoryData
  } catch (err) {
    console.error(`Failed to load category data for ${categoryId}:`, err)
    throw err
  }
}

// Load vocabulary index data (for backward compatibility)
export const loadVocabularyData = async () => {
  if (vocabularyData.value) {
    return vocabularyData.value
  }
  
  try {
    // Try new format: load categories and build structure
    const categories = await loadCategories()
    
    // Build the data structure
    const data = {
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        vocabularies: [] // Will be loaded on demand
      }))
    }
    
    vocabularyData.value = data
    return data
  } catch (err) {
    console.error('Failed to load vocabulary data:', err)
    throw err
  }
}

// Load words for a specific vocabulary
const loadVocabularyWords = async (categoryId, vocabularyId) => {
  const cacheKey = `${categoryId}_${vocabularyId}`
  
  // Check cache first
  if (vocabularyWordsCache.value[cacheKey]) {
    return vocabularyWordsCache.value[cacheKey]
  }
  
  // Load category data first
  const categoryData = await loadCategoryData(categoryId)
  
  // Find vocabulary info
  const vocab = categoryData.vocabularies?.find(v => v.id === vocabularyId)
  if (vocab) {
    // Check if it's new format (has file property)
    if (vocab.file) {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}${vocab.file}`)
        if (!response.ok) {
          throw new Error(`Failed to load vocabulary file: ${vocab.file}`)
        }
        const words = await response.json()
        // Cache the words
        vocabularyWordsCache.value[cacheKey] = words
        return words
      } catch (err) {
        console.error('Failed to load vocabulary words:', err)
        return []
      }
    } else {
      // Old format (words are in the vocab object)
      const words = vocab.words || []
      vocabularyWordsCache.value[cacheKey] = words
      return words
    }
  }
  
  return []
}

// Get selected vocabulary words
export const getSelectedWords = async (options = {}) => {
  const { withEmoji = false } = options
  
  if (!vocabularyData.value || !selectedVocabularyId.value || !selectedCategory.value) {
    return []
  }
  
  // Check if it's the old format (array of words)
  let words = []
  if (Array.isArray(vocabularyData.value)) {
    words = vocabularyData.value
  } else {
    // Load words for selected vocabulary
    words = await loadVocabularyWords(selectedCategory.value, selectedVocabularyId.value)
  }
  
  // Enhance with emoji if requested
  if (withEmoji) {
    return await enhanceWordsWithEmoji(words)
  }
  
  return words
}

// Set selected vocabulary
export const setSelectedVocabulary = (categoryId, vocabularyId) => {
  selectedCategory.value = categoryId
  selectedVocabularyId.value = vocabularyId
  // Save to localStorage
  localStorage.setItem('selectedVocabulary', JSON.stringify({
    categoryId,
    vocabularyId
  }))
}

// Get selected vocabulary info
export const getSelectedVocabularyInfo = async () => {
  if (!selectedVocabularyId.value || !selectedCategory.value) {
    return null
  }
  
  try {
    const categoryData = await loadCategoryData(selectedCategory.value)
    const vocab = categoryData.vocabularies?.find(v => v.id === selectedVocabularyId.value)
    if (vocab) {
      // Try to get actual word count from cache or load it
      let actualWordCount = vocab.wordCount
      
      // Check cache first
      const cacheKey = `${selectedCategory.value}_${vocab.id}`
      if (vocabularyWordsCache.value[cacheKey]) {
        actualWordCount = vocabularyWordsCache.value[cacheKey].length
      } else if (vocab.file) {
        // If not in cache, try to load and count
        try {
          const words = await loadVocabularyWords(selectedCategory.value, vocab.id)
          actualWordCount = words.length
        } catch (err) {
          console.warn('Failed to load words for count:', err)
          // Fall back to wordCount from vocab or 0
          actualWordCount = vocab.wordCount || 0
        }
      }
      
      return {
        category: categoryData.name,
        vocabulary: {
          ...vocab,
          wordCount: actualWordCount
        }
      }
    }
  } catch (err) {
    console.error('Failed to get vocabulary info:', err)
  }
  
  return null
}

// Load selected vocabulary from localStorage
export const loadSelectedVocabulary = () => {
  try {
    const saved = localStorage.getItem('selectedVocabulary')
    if (saved) {
      const { categoryId, vocabularyId } = JSON.parse(saved)
      selectedCategory.value = categoryId
      selectedVocabularyId.value = vocabularyId
    }
  } catch (err) {
    console.error('Failed to load selected vocabulary:', err)
  }
}

// Check if vocabulary is selected
export const hasSelectedVocabulary = computed(() => {
  return selectedVocabularyId.value !== null
})

// Initialize on module load
loadSelectedVocabulary()

// Get vocabularies for a specific category
export const getCategoryVocabularies = async (categoryId) => {
  try {
    const categoryData = await loadCategoryData(categoryId)
    return categoryData.vocabularies || []
  } catch (err) {
    console.error(`Failed to get vocabularies for category ${categoryId}:`, err)
    return []
  }
}

export const useVocabulary = () => {
  return {
    vocabularyData,
    selectedVocabularyId,
    selectedCategory,
    loadVocabularyData,
    getSelectedWords,
    setSelectedVocabulary,
    getSelectedVocabularyInfo,
    hasSelectedVocabulary,
    getCategoryVocabularies,
    loadCategories,
    loadSelectedVocabulary
  }
}

