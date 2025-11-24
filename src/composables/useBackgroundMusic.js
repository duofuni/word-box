import { ref } from 'vue'

const audio = ref(null)
const isPlaying = ref(false)
const volume = ref(0.5) // 默认音量 50%
const isMuted = ref(false)

// 初始化音频
export const initAudio = () => {
  if (audio.value) return
  
  const audioPath = `${import.meta.env.BASE_URL}arcade_puzzler.ogg`
  console.log('Initializing audio from:', audioPath)
  
  audio.value = new Audio(audioPath)
  audio.value.loop = true
  audio.value.volume = volume.value
  audio.value.preload = 'auto'
  
  // 监听播放结束事件
  audio.value.addEventListener('ended', () => {
    isPlaying.value = false
  })
  
  // 监听播放错误
  audio.value.addEventListener('error', (e) => {
    console.error('Audio error:', e, audio.value?.error)
    isPlaying.value = false
  })
  
  // 监听可以播放事件
  audio.value.addEventListener('canplaythrough', () => {
    console.log('Audio can play through')
  })
  
  // 监听加载完成
  audio.value.addEventListener('loadeddata', () => {
    console.log('Audio loaded')
  })
}

// 播放音乐
export const playMusic = async () => {
  if (!audio.value) {
    initAudio()
  }
  
  if (audio.value && !isPlaying.value) {
    try {
      await audio.value.play()
      isPlaying.value = true
      console.log('Music started playing')
    } catch (err) {
      // 检查是否是预期的自动播放限制错误
      const isAutoplayError = err.name === 'NotAllowedError' || 
                             err.message?.includes('user didn\'t interact') ||
                             err.message?.includes('play() failed')
      
      if (isAutoplayError) {
        // 这是预期的浏览器安全限制，不记录为错误
        // 用户交互后会重试播放
        return false
      } else {
        // 其他错误才记录
        console.error('Failed to play audio:', err)
      }
      // 不设置 isPlaying 为 true，这样用户点击时可以重试
      return false
    }
  }
  return true
}

// 暂停音乐
export const pauseMusic = () => {
  if (audio.value && isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
  }
}

// 切换播放/暂停
export const toggleMusic = () => {
  if (isPlaying.value) {
    pauseMusic()
  } else {
    playMusic()
  }
}

// 设置音量
export const setVolume = (newVolume) => {
  volume.value = Math.max(0, Math.min(1, newVolume))
  if (audio.value) {
    audio.value.volume = volume.value
  }
}

// 静音/取消静音
export const toggleMute = () => {
  isMuted.value = !isMuted.value
  if (audio.value) {
    audio.value.volume = isMuted.value ? 0 : volume.value
  }
}

// 清理资源
export const cleanupAudio = () => {
  if (audio.value) {
    audio.value.pause()
    audio.value = null
    isPlaying.value = false
  }
}

// 从 localStorage 加载设置
export const loadMusicSettings = async () => {
  try {
    const saved = localStorage.getItem('musicSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      volume.value = settings.volume ?? 0.5
      isMuted.value = settings.isMuted ?? false
      
      if (audio.value) {
        audio.value.volume = isMuted.value ? 0 : volume.value
      }
      
      // 如果之前是播放状态或没有保存过设置，自动播放
      if ((settings.isPlaying !== false) && !isMuted.value) {
        await playMusic()
      }
    } else {
      // 首次访问，没有保存的设置，自动播放
      if (!isMuted.value) {
        await playMusic()
      }
    }
  } catch (err) {
    console.error('Failed to load music settings:', err)
    // 出错时也尝试自动播放
    if (!isMuted.value) {
      await playMusic()
    }
  }
}

// 用户交互后尝试播放（用于绕过浏览器自动播放限制）
let userInteracted = false
export const tryPlayOnUserInteraction = async () => {
  if (!isPlaying.value && !isMuted.value && audio.value) {
    const success = await playMusic()
    if (success) {
      userInteracted = true
      console.log('Music started after user interaction')
    }
    // 如果失败（可能是其他错误），不记录，因为 playMusic 内部已处理
  }
}

// 保存设置到 localStorage
export const saveMusicSettings = () => {
  try {
    localStorage.setItem('musicSettings', JSON.stringify({
      volume: volume.value,
      isMuted: isMuted.value,
      isPlaying: isPlaying.value
    }))
  } catch (err) {
    console.error('Failed to save music settings:', err)
  }
}

export const useBackgroundMusic = () => {
  return {
    isPlaying,
    volume,
    isMuted,
    playMusic,
    pauseMusic,
    toggleMusic,
    setVolume,
    toggleMute,
    initAudio,
    loadMusicSettings,
    saveMusicSettings,
    tryPlayOnUserInteraction
  }
}

