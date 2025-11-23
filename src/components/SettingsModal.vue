<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      style="background-color: #FAF8F3;"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 rounded-t-2xl">
        <div class="flex items-center justify-between">
          <h2
            class="text-2xl font-bold"
            style="font-family: 'Playfair Display', serif; color: #5C4033;"
          >
            设置
          </h2>
          <button
            @click="close"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- 音效设置 -->
        <div>
          <h3
            class="text-lg font-semibold mb-4"
            style="font-family: 'Inter', sans-serif; color: #5C4033;"
          >
            音效设置
          </h3>
          
          <div class="space-y-4">
            <!-- 背景音乐开关 -->
            <div class="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-800" style="font-family: 'Inter', sans-serif;">
                    背景音乐
                  </div>
                  <div class="text-sm text-gray-500" style="font-family: 'Inter', sans-serif;">
                    播放/暂停背景音乐
                  </div>
                </div>
              </div>
              <button
                @click="toggleMusic"
                :class="[
                  'relative w-14 h-8 rounded-full transition-colors duration-200',
                  isPlaying ? 'bg-blue-500' : 'bg-gray-300'
                ]"
              >
                <span
                  :class="[
                    'absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200',
                    isPlaying ? 'translate-x-6' : 'translate-x-0'
                  ]"
                ></span>
              </button>
            </div>

            <!-- 音量控制 -->
            <div class="p-4 bg-white rounded-xl shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343L4.93 4.93A1 1 0 003.515 6.343L7.757 10.586H4a1 1 0 00-1 1v.828a1 1 0 001 1h3.757l4.243 4.243a1 1 0 001.415-1.415L6.343 6.343z" />
                    </svg>
                  </div>
                  <div>
                    <div class="font-medium text-gray-800" style="font-family: 'Inter', sans-serif;">
                      音量
                    </div>
                    <div class="text-sm text-gray-500" style="font-family: 'Inter', sans-serif;">
                      {{ Math.round(volume * 100) }}%
                    </div>
                  </div>
                </div>
                <button
                  @click="toggleMute"
                  class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  :title="isMuted ? '取消静音' : '静音'"
                >
                  <svg
                    v-if="!isMuted"
                    class="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M6.343 6.343L4.93 4.93A1 1 0 003.515 6.343L7.757 10.586H4a1 1 0 00-1 1v.828a1 1 0 001 1h3.757l4.243 4.243a1 1 0 001.415-1.415L6.343 6.343z"
                    />
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                :value="volume"
                @input="handleVolumeChange"
                class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style="accent-color: #5C4033;"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="px-6 pb-4 pt-2 border-t border-gray-200/50">
        <div class="text-xs text-gray-400 text-center" style="font-family: 'Inter', sans-serif;">
          背景音乐: "Arcade Puzzler" by Eric Matyas <a href="https://www.soundimage.org" target="_blank" rel="noopener noreferrer" class="text-gray-500 hover:text-gray-600 underline">www.soundimage.org</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useBackgroundMusic } from '../composables/useBackgroundMusic'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const { isPlaying, volume, isMuted, toggleMusic, setVolume, toggleMute, saveMusicSettings } = useBackgroundMusic()

const close = () => {
  emit('close')
}

const handleVolumeChange = (event) => {
  const newVolume = parseFloat(event.target.value)
  setVolume(newVolume)
  saveMusicSettings()
}

// 监听音量变化，自动保存
watch([volume, isMuted, isPlaying], () => {
  saveMusicSettings()
})
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #5C4033;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #5C4033;
  cursor: pointer;
  border: none;
}
</style>


