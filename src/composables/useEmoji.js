import { ref } from 'vue'

// Cache for emoji data
const emojiCache = ref({})

/**
 * Fetch emoji data from bbyingyu.com
 * @param {string} word - The word to get emoji for
 * @returns {Promise<string|null>} - Emoji string or null if not found
 */
export const fetchEmojiFromBbyingyu = async (word) => {
  // Check cache first
  if (emojiCache.value[word]) {
    return emojiCache.value[word]
  }

  try {
    // Try multiple possible API endpoints
    const endpoints = [
      `https://www.bbyingyu.com/api/emoji?word=${encodeURIComponent(word)}`,
      `https://www.bbyingyu.com/api/word/${encodeURIComponent(word)}/emoji`,
      `https://www.bbyingyu.com/emoji/${encodeURIComponent(word)}`,
    ]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        })

        if (response.ok) {
          const data = await response.json()
          const emoji = data.emoji || data.image || data.emojiUrl || null
          
          // Cache the result
          if (emoji) {
            emojiCache.value[word] = emoji
            return emoji
          }
        }
      } catch (endpointError) {
        // Continue to next endpoint
        continue
      }
    }

    // Try alternative approach: fetch the main page and parse emoji
    // Note: This may have CORS issues, so we'll handle it gracefully
    try {
      const pageResponse = await fetch(`https://www.bbyingyu.com/?word=${encodeURIComponent(word)}`, {
        mode: 'cors',
      })
      if (pageResponse.ok) {
        const html = await pageResponse.text()
        // Try to extract emoji from the page using various patterns
        const patterns = [
          /emoji["']?\s*[:=]\s*["']?([^"']+)/i,
          /data-emoji=["']?([^"']+)/i,
          /<img[^>]*emoji[^>]*src=["']?([^"']+)/i,
          /emoji["']?\s*:\s*["']?([^"']+)/i,
        ]

        for (const pattern of patterns) {
          const match = html.match(pattern)
          if (match && match[1]) {
            const emoji = match[1]
            emojiCache.value[word] = emoji
            return emoji
          }
        }
      }
    } catch (pageError) {
      // CORS or other errors - this is expected for cross-origin requests
      console.debug(`Could not fetch emoji from bbyingyu.com page for "${word}" (CORS or network issue):`, pageError.message)
    }
  } catch (error) {
    console.warn(`Failed to fetch emoji for "${word}" from bbyingyu.com:`, error)
  }

  return null
}

/**
 * Batch fetch emojis for multiple words
 * @param {string[]} words - Array of words to get emojis for
 * @returns {Promise<Object>} - Object mapping words to emojis
 */
export const batchFetchEmojis = async (words) => {
  const results = {}
  const promises = words.map(async (word) => {
    const emoji = await fetchEmojiFromBbyingyu(word)
    if (emoji) {
      results[word] = emoji
    }
  })
  
  await Promise.all(promises)
  return results
}

/**
 * Get emoji for a word (with fallback to common emoji mapping)
 * @param {string} word - The word to get emoji for
 * @returns {Promise<string|null>} - Emoji string or null
 */
export const getEmojiForWord = async (word) => {
  if (!word) return null
  
  // Try to fetch from bbyingyu.com first
  const emoji = await fetchEmojiFromBbyingyu(word.toLowerCase())
  if (emoji) {
    return emoji
  }

  // Fallback: simple word-to-emoji mapping for common words
  // This can be expanded or replaced with a more comprehensive mapping
  const commonEmojiMap = {
    'dog': '🐕',
    'cat': '🐱',
    'bird': '🐦',
    'fish': '🐟',
    'horse': '🐴',
    'cow': '🐄',
    'pig': '🐷',
    'sheep': '🐑',
    'rabbit': '🐰',
    'mouse': '🐭',
    'apple': '🍎',
    'book': '📖',
    'house': '🏠',
    'car': '🚗',
  }

  return commonEmojiMap[word.toLowerCase()] || null
}

/**
 * Enhance word objects with emoji data
 * @param {Array} words - Array of word objects with {word, meaning}
 * @returns {Promise<Array>} - Array of word objects with emoji field added
 */
export const enhanceWordsWithEmoji = async (words) => {
  if (!Array.isArray(words)) return words

  const enhancedWords = await Promise.all(
    words.map(async (wordObj) => {
      if (wordObj.emoji || wordObj.image) {
        // Already has emoji/image, return as is
        return wordObj
      }

      const emoji = await getEmojiForWord(wordObj.word)
      return {
        ...wordObj,
        emoji: emoji || undefined,
      }
    })
  )

  return enhancedWords
}

