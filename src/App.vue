<template>
  <router-view />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useBackgroundMusic } from './composables/useBackgroundMusic'
import { useVocabulary } from './composables/useVocabulary'

// 初始化背景音乐
const { initAudio, loadMusicSettings, tryPlayOnUserInteraction } = useBackgroundMusic()

// 自动选择默认词库
const { autoSelectDefaultVocabulary } = useVocabulary()

// 处理用户交互，尝试播放音乐（绕过浏览器自动播放限制）
const handleUserInteraction = () => {
  tryPlayOnUserInteraction()
}

onMounted(async () => {
  initAudio()
  // 等待一小段时间确保音频已初始化
  await new Promise(resolve => setTimeout(resolve, 200))
  await loadMusicSettings()
  
  // 自动选择默认词库（如果还没有选择）
  await autoSelectDefaultVocabulary()
  
  // 添加全局事件监听，在用户第一次交互时尝试播放
  document.addEventListener('click', handleUserInteraction, { once: true, passive: true })
  document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true })
  document.addEventListener('keydown', handleUserInteraction, { once: true, passive: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleUserInteraction)
  document.removeEventListener('touchstart', handleUserInteraction)
  document.removeEventListener('keydown', handleUserInteraction)
})
</script>

